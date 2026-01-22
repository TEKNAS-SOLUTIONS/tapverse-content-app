import express from 'express';
import {
  sendAdminMessage,
  generateAutomatedRecommendations,
  getAdminInsights,
} from '../services/adminChatService.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../services/authService.js';
import { createConversation, getConversations, getConversationById } from '../services/chatService.js';

const router = express.Router();

/**
 * POST /api/admin-chat/conversations/:id/messages
 * Send message in admin chat with tool calling
 */
router.post('/conversations/:id/messages', authenticate, authorize(USER_ROLES.ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    const { message, model } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    const conversation = await getConversationById(id, req.user.id);
    if (!conversation || conversation.chat_type !== 'admin') {
      return res.status(404).json({
        success: false,
        error: 'Admin conversation not found',
      });
    }

    const result = await sendAdminMessage(id, message, { model });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in admin chat:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin-chat/insights
 * Get automated recommendations and insights
 */
router.get('/insights', authenticate, authorize(USER_ROLES.ADMIN), async (req, res) => {
  try {
    const { clientId, insightType, acknowledged } = req.query;
    const insights = await getAdminInsights({
      clientId: clientId || null,
      insightType: insightType || null,
      acknowledged: acknowledged === 'false' ? false : undefined,
    });

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin-chat/generate-recommendations
 * Generate automated recommendations (can be called by cron)
 */
router.post('/generate-recommendations', authenticate, authorize(USER_ROLES.ADMIN), async (req, res) => {
  try {
    const result = await generateAutomatedRecommendations();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
