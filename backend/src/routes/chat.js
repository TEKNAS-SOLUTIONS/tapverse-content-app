import express from 'express';
import {
  createConversation,
  getConversations,
  getConversationById,
  getMessagesForContext,
  sendMessage,
  deleteConversation,
  updateConversationTitle,
} from '../services/chatService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/chat/conversations
 * Create a new conversation
 */
router.post('/conversations', authenticate, async (req, res) => {
  try {
    const { chatType = 'general', clientId = null, title = null } = req.body;

    if (chatType === 'client' && !clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required for client chat',
      });
    }

    const conversation = await createConversation(req.user.id, chatType, clientId, title);

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/chat/conversations
 * Get conversations for user
 */
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const { chatType = 'general', clientId = null } = req.query;
    const conversations = await getConversations(req.user.id, chatType, clientId);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/chat/conversations/:id
 * Get conversation by ID
 */
router.get('/conversations/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await getConversationById(id, req.user.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/chat/conversations/:id/messages
 * Get messages for a conversation
 */
router.get('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await getConversationById(id, req.user.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    const context = await getMessagesForContext(id);

    res.json({
      success: true,
      data: {
        conversation,
        messages: context.messages,
        summaries: context.summaries,
        totalMessages: context.totalMessages,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/chat/conversations/:id/messages
 * Send a message in a conversation
 */
router.post('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, model, clientContext } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    const conversation = await getConversationById(id, req.user.id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    const result = await sendMessage(id, message, {
      model: model || conversation.model,
      clientContext,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/chat/conversations/:id/title
 * Update conversation title
 */
router.put('/conversations/:id/title', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const conversation = await getConversationById(id, req.user.id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    await updateConversationTitle(id, title);

    res.json({
      success: true,
      message: 'Title updated',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/chat/conversations/:id
 * Delete a conversation
 */
router.delete('/conversations/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteConversation(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      });
    }

    res.json({
      success: true,
      message: 'Conversation deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
