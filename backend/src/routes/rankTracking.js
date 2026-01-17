import express from 'express';
import {
  recordRanking,
  getRankingsByClient,
  getRankingTrends,
  getRankingSummary,
} from '../services/rankTrackingService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/rank-tracking/record
 * Record a keyword ranking
 */
router.post('/record', authenticate, async (req, res) => {
  try {
    const {
      clientId,
      projectId,
      keyword,
      url,
      position,
      searchVolume,
      cpc,
      trackedDate,
    } = req.body;

    if (!clientId || !keyword || position === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Client ID, keyword, and position are required',
      });
    }

    const ranking = await recordRanking({
      clientId,
      projectId,
      keyword,
      url,
      position,
      searchVolume,
      cpc,
      trackedDate,
    });

    res.json({
      success: true,
      data: ranking,
    });
  } catch (error) {
    console.error('Error recording ranking:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/rank-tracking/client/:clientId
 * Get rankings for a client
 */
router.get('/client/:clientId', authenticate, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { keyword, startDate, endDate } = req.query;

    const rankings = await getRankingsByClient(clientId, {
      keyword,
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: rankings,
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/rank-tracking/client/:clientId/trends
 * Get month-on-month ranking trends
 */
router.get('/client/:clientId/trends', authenticate, async (req, res) => {
  try {
    const { clientId } = req.params;
    const months = parseInt(req.query.months) || 6;

    const trends = await getRankingTrends(clientId, months);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error('Error fetching ranking trends:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/rank-tracking/client/:clientId/summary
 * Get ranking summary statistics
 */
router.get('/client/:clientId/summary', authenticate, async (req, res) => {
  try {
    const { clientId } = req.params;
    const summary = await getRankingSummary(clientId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching ranking summary:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
