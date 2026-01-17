import express from 'express';
import { generateContentIdeasAndGaps } from '../services/contentIdeasService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/content-ideas/generate
 * Generate content ideas and gaps for a client (upsell opportunities)
 */
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { clientId, projectId } = req.body;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required',
      });
    }

    const result = await generateContentIdeasAndGaps(clientId, projectId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error generating content ideas:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
