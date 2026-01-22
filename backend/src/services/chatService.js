import { generateContentWithSystem } from './claude.js';
import pool from '../db/index.js';
import { config } from '../config/config.js';

/**
 * Chat Service
 * Handles General Chat and Client Chat conversations
 */

const DEFAULT_MODEL = 'claude-3-haiku-20240307';
const RECENT_MESSAGES_CONTEXT = 15; // Keep last 15 messages in full context
const SUMMARIZE_THRESHOLD = 20; // Summarize when conversation exceeds 20 messages

/**
 * Create a new conversation
 */
export async function createConversation(userId, chatType = 'general', clientId = null, title = null) {
  const result = await pool.query(`
    INSERT INTO chat_conversations (user_id, chat_type, client_id, title)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [userId, chatType, clientId, title || `New ${chatType === 'client' ? 'Client' : 'General'} Chat`]);

  return result.rows[0];
}

/**
 * Get conversations for a user
 */
export async function getConversations(userId, chatType = 'general', clientId = null) {
  let query = 'SELECT * FROM chat_conversations WHERE user_id = $1 AND chat_type = $2';
  const params = [userId, chatType];
  
  if (chatType === 'client' && clientId) {
    query += ' AND client_id = $3';
    params.push(clientId);
  }

  query += ' ORDER BY updated_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get conversation by ID
 */
export async function getConversationById(conversationId, userId) {
  const result = await pool.query(`
    SELECT * FROM chat_conversations 
    WHERE id = $1 AND user_id = $2
  `, [conversationId, userId]);

  return result.rows[0] || null;
}

/**
 * Get messages for a conversation with smart context management
 */
export async function getMessagesForContext(conversationId, includeSummaries = true) {
  // Get all messages
  const messagesResult = await pool.query(`
    SELECT * FROM chat_messages
    WHERE conversation_id = $1
    ORDER BY created_at ASC
  `, [conversationId]);

  const allMessages = messagesResult.rows;

  // If we have more than RECENT_MESSAGES_CONTEXT, use summaries for older messages
  if (allMessages.length > RECENT_MESSAGES_CONTEXT && includeSummaries) {
    // Get recent messages (full)
    const recentMessages = allMessages.slice(-RECENT_MESSAGES_CONTEXT);

    // Get summaries for older messages
    const summariesResult = await pool.query(`
      SELECT summary FROM chat_message_summaries
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `, [conversationId]);

    const summaries = summariesResult.rows;

    // Combine: summaries + recent messages
    return {
      summaries: summaries.map(s => s.summary),
      messages: recentMessages,
      totalMessages: allMessages.length,
    };
  }

  return {
    summaries: [],
    messages: allMessages,
    totalMessages: allMessages.length,
  };
}

/**
 * Add message to conversation
 */
export async function addMessage(conversationId, role, content, tokenCount = null) {
  const result = await pool.query(`
    INSERT INTO chat_messages (conversation_id, role, content, token_count)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [conversationId, role, content, tokenCount]);

  // Update conversation updated_at
  await pool.query(`
    UPDATE chat_conversations 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1
  `, [conversationId]);

  // Check if we need to create summaries
  const messageCount = await pool.query(`
    SELECT COUNT(*) as count FROM chat_messages WHERE conversation_id = $1
  `, [conversationId]);

  if (parseInt(messageCount.rows[0].count) >= SUMMARIZE_THRESHOLD) {
    // Trigger summarization in background (async)
    summarizeOldMessages(conversationId).catch(console.error);
  }

  return result.rows[0];
}

/**
 * Summarize old messages for context optimization
 */
async function summarizeOldMessages(conversationId) {
  try {
    // Get messages that haven't been summarized yet
    const messagesResult = await pool.query(`
      SELECT id, role, content, created_at
      FROM chat_messages
      WHERE conversation_id = $1
        AND is_summarized = FALSE
        AND id NOT IN (
          SELECT m.id FROM chat_messages m
          INNER JOIN chat_message_summaries s ON m.id BETWEEN s.start_message_id AND s.end_message_id
          WHERE m.conversation_id = $1
        )
      ORDER BY created_at ASC
      LIMIT 10
    `, [conversationId]);

    if (messagesResult.rows.length < 5) {
      return; // Not enough messages to summarize
    }

    const messages = messagesResult.rows;
    const startId = messages[0].id;
    const endId = messages[messages.length - 1].id;

    // Generate summary using AI
    const conversationText = messages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n\n');

    const summary = await generateContentWithSystem(
      'You are a conversation summarizer. Create a concise summary of the conversation context.',
      `Summarize this conversation excerpt in 2-3 sentences, focusing on key topics, decisions, and context:\n\n${conversationText}`,
      { maxTokens: 200 }
    );

    // Save summary
    await pool.query(`
      INSERT INTO chat_message_summaries (conversation_id, start_message_id, end_message_id, summary, message_count)
      VALUES ($1, $2, $3, $4, $5)
    `, [conversationId, startId, endId, summary, messages.length]);

    // Mark messages as summarized
    await pool.query(`
      UPDATE chat_messages
      SET is_summarized = TRUE
      WHERE id = ANY($1::UUID[])
    `, [[...messages.map(m => m.id)]]);
  } catch (error) {
    console.error('Error summarizing messages:', error);
  }
}

/**
 * Send message and get AI response
 */
export async function sendMessage(conversationId, userMessage, options = {}) {
  const {
    model = DEFAULT_MODEL,
    clientContext = null, // For client chat
    systemPrompt = null,
  } = options;

  // Get conversation
  const conversationResult = await pool.query(
    'SELECT * FROM chat_conversations WHERE id = $1',
    [conversationId]
  );

  if (conversationResult.rows.length === 0) {
    throw new Error('Conversation not found');
  }

  const conversation = conversationResult.rows[0];

  // Get client context if client chat
  let clientData = null;
  let clientKnowledge = [];
  if (conversation.chat_type === 'client' && conversation.client_id) {
    const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [conversation.client_id]);
    clientData = clientResult.rows[0] || null;

    // Get client knowledge base
    const knowledgeResult = await pool.query(`
      SELECT fact_type, fact_data FROM client_knowledge_base
      WHERE client_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `, [conversation.client_id]);
    clientKnowledge = knowledgeResult.rows;
  }

  // Get message context
  const context = await getMessagesForContext(conversationId);

  // Build system prompt
  let finalSystemPrompt = systemPrompt || 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.';

  if (clientData) {
    finalSystemPrompt += `\n\nYou are chatting about client: ${clientData.company_name} (${clientData.industry || 'N/A'}).`;
    if (clientKnowledge.length > 0) {
      finalSystemPrompt += `\n\nClient Context:\n${clientKnowledge.map(k => `- ${k.fact_type}: ${JSON.stringify(k.fact_data)}`).join('\n')}`;
    }
  }

  // Build messages array for Claude API
  const messages = [];

  // Add summaries as context
  if (context.summaries.length > 0) {
    messages.push({
      role: 'system',
      content: `Previous conversation context:\n${context.summaries.join('\n\n')}`,
    });
  }

  // Add recent messages
  for (const msg of context.messages) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage,
  });

  // Save user message
  await addMessage(conversationId, 'user', userMessage);

  // Get AI response
  const aiResponse = await generateContentWithSystem(
    finalSystemPrompt,
    userMessage,
    {
      model,
      maxTokens: 4096,
      messages: messages.slice(-10), // Last 10 messages for API (rest handled by summaries)
    }
  );

  // Save AI response
  await addMessage(conversationId, 'assistant', aiResponse);

  // Extract knowledge if client chat
  if (conversation.chat_type === 'client' && conversation.client_id) {
    extractClientKnowledge(conversation.client_id, userMessage, aiResponse, conversationId)
      .catch(console.error);
  }

  return {
    message: aiResponse,
    conversationId,
  };
}

/**
 * Extract client knowledge from conversation
 */
async function extractClientKnowledge(clientId, userMessage, aiResponse, conversationId) {
  try {
    const extractionPrompt = `Extract important facts, decisions, preferences, or insights from this conversation that should be remembered for future context about this client.

User: ${userMessage}
Assistant: ${aiResponse}

Extract as JSON array of facts:
[
  {
    "fact_type": "preference|decision|insight|requirement",
    "fact_data": {"key": "value", "description": "..."}
  }
]

Only extract if there are clear facts. Return empty array [] if nothing notable.`;

    const extraction = await generateContentWithSystem(
      'You are a knowledge extraction assistant. Extract structured facts from conversations.',
      extractionPrompt,
      { maxTokens: 500 }
    );

    const jsonMatch = extraction.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const facts = JSON.parse(jsonMatch[0]);
      
      for (const fact of facts) {
        // Get last message ID for reference
        const lastMsgResult = await pool.query(`
          SELECT id FROM chat_messages
          WHERE conversation_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        `, [conversationId]);

        await pool.query(`
          INSERT INTO client_knowledge_base (client_id, fact_type, fact_data, extracted_from_message_id)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
        `, [
          clientId,
          fact.fact_type,
          JSON.stringify(fact.fact_data),
          lastMsgResult.rows[0]?.id || null,
        ]);
      }
    }
  } catch (error) {
    console.error('Error extracting client knowledge:', error);
  }
}

/**
 * Delete conversation
 */
export async function deleteConversation(conversationId, userId) {
  const result = await pool.query(`
    DELETE FROM chat_conversations
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `, [conversationId, userId]);

  return result.rows.length > 0;
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(conversationId, title) {
  await pool.query(`
    UPDATE chat_conversations
    SET title = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `, [title, conversationId]);
}

export default {
  createConversation,
  getConversations,
  getConversationById,
  getMessagesForContext,
  addMessage,
  sendMessage,
  deleteConversation,
  updateConversationTitle,
};
