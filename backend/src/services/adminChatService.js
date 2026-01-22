import { generateContentWithSystem } from './claude.js';
import pool from '../db/index.js';
import { getClientById, getAllClients } from '../db/queries.js';
import { getMessagesForContext, addMessage } from './chatService.js';

/**
 * Admin Chat Service
 * Handles admin chat with tool calling for data queries and recommendations
 */

const DEFAULT_MODEL = 'claude-3-haiku-20240307';

/**
 * Available tools/functions for admin chat
 */
const ADMIN_TOOLS = [
  {
    name: 'getClientStatus',
    description: 'Get comprehensive status of a client including projects, content, tasks, and rankings',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Client company name or ID' },
      },
      required: ['clientName'],
    },
  },
  {
    name: 'getClientKeywords',
    description: 'Get all keywords selected and tracked for a client',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Client company name or ID' },
      },
      required: ['clientName'],
    },
  },
  {
    name: 'getPortfolioOverview',
    description: 'Get overview of entire client portfolio - total clients, projects, content, metrics',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'getClientMetrics',
    description: 'Get metrics for a specific client - rankings, content, tasks over time',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Client company name or ID' },
        timeRange: { type: 'string', description: 'Time range: last_7_days, last_30_days, last_90_days' },
      },
      required: ['clientName'],
    },
  },
  {
    name: 'getClientRecommendations',
    description: 'Get smart recommendations for a specific client - content gaps, upsell opportunities, action items',
    parameters: {
      type: 'object',
      properties: {
        clientName: { type: 'string', description: 'Client company name or ID' },
      },
      required: ['clientName'],
    },
  },
  {
    name: 'searchClients',
    description: 'Search for clients by name, industry, or other criteria',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
      },
      required: ['query'],
    },
  },
  {
    name: 'getLowPerformingClients',
    description: 'Get list of clients with low activity, no recent projects, or declining metrics',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'getUpsellOpportunities',
    description: 'Get cross-client upsell opportunities - clients missing services that could benefit',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'getPortfolioRecommendations',
    description: 'Get portfolio-wide recommendations - resource allocation, at-risk clients, opportunities',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * Execute tool/function call
 */
async function executeTool(toolName, parameters) {
  switch (toolName) {
    case 'getClientStatus':
      return await toolGetClientStatus(parameters.clientName);

    case 'getClientKeywords':
      return await toolGetClientKeywords(parameters.clientName);

    case 'getPortfolioOverview':
      return await toolGetPortfolioOverview();

    case 'getClientMetrics':
      return await toolGetClientMetrics(parameters.clientName, parameters.timeRange || 'last_30_days');

    case 'getClientRecommendations':
      return await toolGetClientRecommendations(parameters.clientName);

    case 'searchClients':
      return await toolSearchClients(parameters.query);

    case 'getLowPerformingClients':
      return await toolGetLowPerformingClients();

    case 'getUpsellOpportunities':
      return await toolGetUpsellOpportunities();

    case 'getPortfolioRecommendations':
      return await toolGetPortfolioRecommendations();

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * Tool: Get client status
 */
async function toolGetClientStatus(clientName) {
  const client = await findClientByName(clientName);
  if (!client) {
    return { error: `Client "${clientName}" not found` };
  }

  // Get projects count
  const projectsResult = await pool.query(
    'SELECT COUNT(*) as count, COUNT(*) FILTER (WHERE status = $2) as active FROM projects WHERE client_id = $1',
    [client.id, 'active']
  );

  // Get content count
  const contentResult = await pool.query(`
    SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'published') as published
    FROM content c
    JOIN projects p ON c.project_id = p.id
    WHERE p.client_id = $1
  `, [client.id]);

  // Get tasks count
  const tasksResult = await pool.query(
    'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = $2) as pending FROM tasks WHERE client_id = $1',
    [client.id, 'pending']
  );

  // Get keywords count
  const keywordsResult = await pool.query(`
    SELECT COUNT(DISTINCT keyword) as count
    FROM keyword_rankings
    WHERE client_id = $1
  `, [client.id]);

  return {
    client: {
      name: client.company_name,
      industry: client.industry,
      status: client.is_active ? 'Active' : 'Inactive',
    },
    projects: {
      total: parseInt(projectsResult.rows[0].count),
      active: parseInt(projectsResult.rows[0].active),
    },
    content: {
      total: parseInt(contentResult.rows[0].total),
      published: parseInt(contentResult.rows[0].published),
    },
    tasks: {
      total: parseInt(tasksResult.rows[0].total),
      pending: parseInt(tasksResult.rows[0].pending),
    },
    keywords: {
      tracked: parseInt(keywordsResult.rows[0].count) || 0,
    },
  };
}

/**
 * Tool: Get client keywords
 */
async function toolGetClientKeywords(clientName) {
  const client = await findClientByName(clientName);
  if (!client) {
    return { error: `Client "${clientName}" not found` };
  }

  // Get keywords from projects
  const projectsResult = await pool.query(`
    SELECT DISTINCT unnest(keywords) as keyword
    FROM projects
    WHERE client_id = $1 AND keywords IS NOT NULL
  `, [client.id]);

  // Get keywords from keyword analyses
  const analysesResult = await pool.query(`
    SELECT keyword_opportunities, long_tail_opportunities, quick_wins
    FROM keyword_analyses
    WHERE client_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `, [client.id]);

  // Get tracked keywords
  const trackedResult = await pool.query(`
    SELECT DISTINCT keyword, MAX(position) as current_position
    FROM keyword_rankings
    WHERE client_id = $1
    GROUP BY keyword
    ORDER BY current_position ASC
  `, [client.id]);

  return {
    client: client.company_name,
    projectKeywords: projectsResult.rows.map(r => r.keyword),
    analysisKeywords: analysesResult.rows[0] ? {
      opportunities: JSON.parse(analysesResult.rows[0].keyword_opportunities || '[]'),
      longTail: JSON.parse(analysesResult.rows[0].long_tail_opportunities || '[]'),
      quickWins: JSON.parse(analysesResult.rows[0].quick_wins || '[]'),
    } : null,
    trackedKeywords: trackedResult.rows.map(r => ({
      keyword: r.keyword,
      currentPosition: r.current_position,
    })),
  };
}

/**
 * Tool: Get portfolio overview
 */
async function toolGetPortfolioOverview() {
  const clients = await getAllClients();

  // Get aggregate stats
  const projectsResult = await pool.query(`
    SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status != 'draft') as active
    FROM projects
  `);

  const contentResult = await pool.query(`
    SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'published') as published
    FROM content
  `);

  const tasksResult = await pool.query(`
    SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'pending') as pending
    FROM tasks
  `);

  const keywordsResult = await pool.query(`
    SELECT COUNT(DISTINCT keyword) as count
    FROM keyword_rankings
  `);

  return {
    clients: {
      total: clients.length,
      active: clients.filter(c => c.is_active).length,
    },
    projects: {
      total: parseInt(projectsResult.rows[0].total),
      active: parseInt(projectsResult.rows[0].active),
    },
    content: {
      total: parseInt(contentResult.rows[0].total),
      published: parseInt(contentResult.rows[0].published),
    },
    tasks: {
      total: parseInt(tasksResult.rows[0].total),
      pending: parseInt(tasksResult.rows[0].pending),
    },
    keywords: {
      tracked: parseInt(keywordsResult.rows[0].count) || 0,
    },
  };
}

/**
 * Tool: Get client metrics
 */
async function toolGetClientMetrics(clientName, timeRange) {
  const client = await findClientByName(clientName);
  if (!client) {
    return { error: `Client "${clientName}" not found` };
  }

  const timeRanges = {
    last_7_days: '7 days',
    last_30_days: '30 days',
    last_90_days: '90 days',
  };
  const interval = timeRanges[timeRange] || '30 days';

  // Rankings
  const rankingsResult = await pool.query(`
    SELECT 
      COUNT(*) as total,
      AVG(position) FILTER (WHERE position IS NOT NULL) as avg_position,
      COUNT(*) FILTER (WHERE change > 0) as improved,
      COUNT(*) FILTER (WHERE change < 0) as declined
    FROM keyword_rankings
    WHERE client_id = $1
      AND tracked_date >= CURRENT_DATE - INTERVAL '${interval}'
  `, [client.id]);

  // Content
  const contentResult = await pool.query(`
    SELECT COUNT(*) as published
    FROM content c
    JOIN projects p ON c.project_id = p.id
    WHERE p.client_id = $1
      AND c.status = 'published'
      AND c.published_at >= CURRENT_TIMESTAMP - INTERVAL '${interval}'
  `, [client.id]);

  // Tasks
  const tasksResult = await pool.query(`
    SELECT COUNT(*) as completed
    FROM tasks
    WHERE client_id = $1
      AND status = 'completed'
      AND completed_at >= CURRENT_TIMESTAMP - INTERVAL '${interval}'
  `, [client.id]);

  return {
    client: client.company_name,
    timeRange: interval,
    rankings: {
      total: parseInt(rankingsResult.rows[0].total) || 0,
      averagePosition: parseFloat(rankingsResult.rows[0].avg_position) || null,
      improved: parseInt(rankingsResult.rows[0].improved) || 0,
      declined: parseInt(rankingsResult.rows[0].declined) || 0,
    },
    content: {
      published: parseInt(contentResult.rows[0].published) || 0,
    },
    tasks: {
      completed: parseInt(tasksResult.rows[0].completed) || 0,
    },
  };
}

/**
 * Tool: Get client recommendations
 */
async function toolGetClientRecommendations(clientName) {
  const client = await findClientByName(clientName);
  if (!client) {
    return { error: `Client "${clientName}" not found` };
  }

  const subscribedServices = client.subscribed_services || [];

  const recommendations = [];

  // Check for Local SEO upsell
  if (!subscribedServices.includes('local_seo')) {
    recommendations.push({
      type: 'upsell',
      service: 'Local SEO',
      priority: 'medium',
      reason: 'Local SEO can help improve local search visibility',
    });
  }

  // Check for missing content types
  const contentTypesResult = await pool.query(`
    SELECT DISTINCT content_type
    FROM content c
    JOIN projects p ON c.project_id = p.id
    WHERE p.client_id = $1
  `, [client.id]);

  const hasContentTypes = contentTypesResult.rows.map(r => r.content_type);

  if (!hasContentTypes.includes('blog')) {
    recommendations.push({
      type: 'content_gap',
      service: 'SEO Blog Content',
      priority: 'high',
      reason: 'No blog content generated yet - high-impact for SEO',
    });
  }

  // Check for low keyword tracking
  const keywordsCount = await pool.query(`
    SELECT COUNT(DISTINCT keyword) as count
    FROM keyword_rankings
    WHERE client_id = $1
  `, [client.id]);

  if (parseInt(keywordsCount.rows[0].count) < 10) {
    recommendations.push({
      type: 'keyword_opportunity',
      service: 'Keyword Tracking',
      priority: 'medium',
      reason: 'Less than 10 keywords tracked - expand keyword monitoring',
    });
  }

  return {
    client: client.company_name,
    recommendations,
  };
}

/**
 * Tool: Search clients
 */
async function toolSearchClients(query) {
  const clients = await getAllClients();
  const queryLower = query.toLowerCase();

  const matches = clients.filter(client =>
    client.company_name?.toLowerCase().includes(queryLower) ||
    client.tapverse_client_id?.toLowerCase().includes(queryLower) ||
    client.industry?.toLowerCase().includes(queryLower)
  );

  return {
    query,
    results: matches.map(c => ({
      id: c.id,
      name: c.company_name,
      industry: c.industry,
      isActive: c.is_active,
    })),
  };
}

/**
 * Tool: Get low performing clients
 */
async function toolGetLowPerformingClients() {
  // Clients with no projects in last 30 days
  const inactiveClientsResult = await pool.query(`
    SELECT c.id, c.company_name, c.industry, MAX(p.created_at) as last_project_date
    FROM clients c
    LEFT JOIN projects p ON p.client_id = c.id
    WHERE c.is_active = TRUE
    GROUP BY c.id, c.company_name, c.industry
    HAVING MAX(p.created_at) < CURRENT_TIMESTAMP - INTERVAL '30 days'
       OR MAX(p.created_at) IS NULL
    ORDER BY last_project_date ASC NULLS LAST
    LIMIT 10
  `);

  return {
    lowPerformingClients: inactiveClientsResult.rows.map(c => ({
      name: c.company_name,
      industry: c.industry,
      lastProjectDate: c.last_project_date,
      issue: c.last_project_date ? 'No recent projects' : 'No projects ever',
    })),
  };
}

/**
 * Tool: Get upsell opportunities
 */
async function toolGetUpsellOpportunities() {
  const clients = await getAllClients();
  const opportunities = [];

  for (const client of clients.slice(0, 50)) { // Limit to 50 for performance
    const subscribedServices = client.subscribed_services || [];
    const clientOpportunities = [];

    if (!subscribedServices.includes('local_seo') && client.primary_business_type === 'local') {
      clientOpportunities.push('Local SEO');
    }

    if (!subscribedServices.includes('ai_video')) {
      clientOpportunities.push('AI Video Content');
    }

    if (clientOpportunities.length > 0) {
      opportunities.push({
        client: client.company_name,
        opportunities: clientOpportunities,
      });
    }
  }

  return {
    upsellOpportunities: opportunities,
  };
}

/**
 * Tool: Get portfolio recommendations
 */
async function toolGetPortfolioRecommendations() {
  const recommendations = [];

  // Get portfolio stats
  const stats = await toolGetPortfolioOverview();

  // Check for clients needing attention
  const lowPerformers = await toolGetLowPerformingClients();
  if (lowPerformers.lowPerformingClients.length > 0) {
    recommendations.push({
      type: 'at_risk',
      title: 'Clients Needing Attention',
      description: `${lowPerformers.lowPerformingClients.length} clients have no recent activity`,
      priority: 'high',
      clients: lowPerformers.lowPerformingClients.map(c => c.name),
    });
  }

  // Check pending tasks
  if (stats.tasks.pending > 20) {
    recommendations.push({
      type: 'workload',
      title: 'High Task Volume',
      description: `${stats.tasks.pending} tasks pending - consider resource allocation`,
      priority: 'medium',
    });
  }

  // Check content publication rate
  const publishRate = stats.content.total > 0
    ? (stats.content.published / stats.content.total) * 100
    : 0;

  if (publishRate < 50 && stats.content.total > 10) {
    recommendations.push({
      type: 'content',
      title: 'Low Content Publication Rate',
      description: `Only ${publishRate.toFixed(0)}% of generated content is published`,
      priority: 'medium',
    });
  }

  return {
    recommendations,
    portfolioStats: stats,
  };
}

/**
 * Find client by name or ID
 */
async function findClientByName(clientName) {
  // Try by ID first
  let client = await getClientById(clientName);
  if (client) return client;

  // Try by company name
  const result = await pool.query(
    'SELECT * FROM clients WHERE LOWER(company_name) LIKE LOWER($1) OR tapverse_client_id = $1 LIMIT 1',
    [`%${clientName}%`]
  );

  return result.rows[0] || null;
}

/**
 * Send message in admin chat with tool calling
 */
export async function sendAdminMessage(conversationId, userMessage, options = {}) {
  const { model = DEFAULT_MODEL } = options;

  // Build system prompt with available tools
  const systemPrompt = `You are an AI assistant for admin users. You have access to data query functions that can retrieve client information, portfolio statistics, and generate recommendations.

Available functions:
${ADMIN_TOOLS.map(t => `- ${t.name}: ${t.description}`).join('\n')}

When the user asks about client data, use the appropriate function to get accurate information. Always provide data-driven, actionable insights.

Format responses clearly with:
- Data summaries
- Actionable recommendations
- Specific numbers and metrics`;

  // For now, we'll use a simpler approach: detect intent and call tools
  // In future, can implement full Claude tool calling API

  // Simple intent detection
  let toolToCall = null;
  let toolParams = {};

  const messageLower = userMessage.toLowerCase();

  if (messageLower.includes('status') && (messageLower.includes('client') || messageLower.match(/client [a-z]/i))) {
    const clientMatch = userMessage.match(/client\s+([a-zA-Z0-9\s]+)/i);
    if (clientMatch) {
      toolToCall = 'getClientStatus';
      toolParams = { clientName: clientMatch[1].trim() };
    }
  } else if (messageLower.includes('keyword') && (messageLower.includes('client') || messageLower.match(/client [a-z]/i))) {
    const clientMatch = userMessage.match(/client\s+([a-zA-Z0-9\s]+)/i);
    if (clientMatch) {
      toolToCall = 'getClientKeywords';
      toolParams = { clientName: clientMatch[1].trim() };
    }
  } else if (messageLower.includes('portfolio') || messageLower.includes('overview') || messageLower.includes('all clients')) {
    toolToCall = 'getPortfolioOverview';
  } else if (messageLower.includes('recommendation')) {
    if (messageLower.includes('portfolio') || messageLower.includes('all')) {
      toolToCall = 'getPortfolioRecommendations';
    } else if (messageLower.match(/client\s+[a-z]/i)) {
      const clientMatch = userMessage.match(/client\s+([a-zA-Z0-9\s]+)/i);
      if (clientMatch) {
        toolToCall = 'getClientRecommendations';
        toolParams = { clientName: clientMatch[1].trim() };
      }
    }
  } else if (messageLower.includes('low') || messageLower.includes('underperforming') || messageLower.includes('at risk')) {
    toolToCall = 'getLowPerformingClients';
  } else if (messageLower.includes('upsell')) {
    toolToCall = 'getUpsellOpportunities';
  }

  // Call tool if detected
  let toolResult = null;
  if (toolToCall) {
    try {
      toolResult = await executeTool(toolToCall, toolParams);
    } catch (error) {
      toolResult = { error: error.message };
    }
  }

  // Build prompt with tool result
  let enhancedPrompt = userMessage;
  if (toolResult) {
    enhancedPrompt = `${userMessage}\n\nHere's the data I retrieved:\n${JSON.stringify(toolResult, null, 2)}\n\nBased on this data, provide a clear, actionable response.`;
  }

  // Get conversation context (simpler for admin - less summarization needed)
  const context = await getMessagesForContext(conversationId, false); // Don't use summaries for admin chat (shorter conversations)

  // Generate response
  const messages = context.messages.slice(-10).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));

  messages.push({ role: 'user', content: enhancedPrompt });

  const aiResponse = await generateContentWithSystem(
    systemPrompt,
    enhancedPrompt,
    {
      model,
      maxTokens: 4096,
    }
  );

  // Save messages
  await addMessage(conversationId, 'user', userMessage);
  await addMessage(conversationId, 'assistant', aiResponse);

  return {
    message: aiResponse,
    toolUsed: toolToCall,
    toolResult: toolResult ? (toolResult.error ? null : toolResult) : null,
  };
}

/**
 * Generate automated portfolio recommendations (cron job)
 */
export async function generateAutomatedRecommendations() {
  try {
    // Get portfolio recommendations
    const portfolioRecs = await toolGetPortfolioRecommendations();

    // Get low performing clients
    const lowPerformers = await toolGetLowPerformingClients();

    // Store in admin_insights table
    for (const rec of portfolioRecs.recommendations) {
      await pool.query(`
        INSERT INTO admin_insights (insight_type, title, description, priority, insight_data)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [
        rec.type,
        rec.title,
        rec.description,
        rec.priority,
        JSON.stringify(rec),
      ]);
    }

    // Store client-specific recommendations
    const clients = await getAllClients();
    for (const client of clients.slice(0, 50)) {
      const clientRecs = await toolGetClientRecommendations(client.company_name);
      if (clientRecs.recommendations && clientRecs.recommendations.length > 0) {
        for (const rec of clientRecs.recommendations) {
          await pool.query(`
            INSERT INTO admin_insights (insight_type, client_id, title, description, priority, insight_data)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT DO NOTHING
          `, [
            rec.type,
            client.id,
            `${rec.service} - ${client.company_name}`,
            rec.reason,
            rec.priority,
            JSON.stringify(rec),
          ]);
        }
      }
    }

    return { success: true, insightsGenerated: true };
  } catch (error) {
    console.error('Error generating automated recommendations:', error);
    throw error;
  }
}

/**
 * Get admin insights
 */
export async function getAdminInsights(filters = {}) {
  let query = 'SELECT * FROM admin_insights WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (filters.clientId) {
    query += ` AND (client_id = $${paramIndex} OR client_id IS NULL)`;
    params.push(filters.clientId);
    paramIndex++;
  }

  if (filters.insightType) {
    query += ` AND insight_type = $${paramIndex}`;
    params.push(filters.insightType);
    paramIndex++;
  }

  if (filters.acknowledged === false) {
    query += ' AND acknowledged_at IS NULL';
  }

  query += ' ORDER BY priority DESC, generated_at DESC LIMIT 50';

  const result = await pool.query(query, params);
  return result.rows;
}

export default {
  sendAdminMessage,
  generateAutomatedRecommendations,
  getAdminInsights,
  ADMIN_TOOLS,
};
