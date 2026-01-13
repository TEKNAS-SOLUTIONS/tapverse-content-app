import express from 'express';
import {
  recordAnalytics,
  getProjectAnalytics,
  getClientAnalytics,
  getTopPerformingContent,
  getAnalyticsSummary,
  getPlatformBreakdown,
} from '../services/analyticsService.js';

const router = express.Router();

/**
 * POST /api/analytics/record
 * Record analytics data
 */
router.post('/record', async (req, res) => {
  try {
    const analytics = await recordAnalytics(req.body);
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error recording analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to record analytics'
    });
  }
});

/**
 * GET /api/analytics/project/:projectId
 * Get analytics for a project
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const dateRange = {
      startDate: req.query.startDate ? new Date(req.query.startDate) : null,
      endDate: req.query.endDate ? new Date(req.query.endDate) : null,
    };
    const analytics = await getProjectAnalytics(projectId, dateRange);
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch project analytics'
    });
  }
});

/**
 * GET /api/analytics/client/:clientId
 * Get analytics for a client
 */
router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const dateRange = {
      startDate: req.query.startDate ? new Date(req.query.startDate) : null,
      endDate: req.query.endDate ? new Date(req.query.endDate) : null,
    };
    const analytics = await getClientAnalytics(clientId, dateRange);
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching client analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch client analytics'
    });
  }
});

/**
 * GET /api/analytics/top-content/:projectId
 * Get top performing content
 */
router.get('/top-content/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const metric = req.query.metric || 'views';
    const topContent = await getTopPerformingContent(projectId, limit, metric);
    res.json({ success: true, data: topContent });
  } catch (error) {
    console.error('Error fetching top content:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch top content'
    });
  }
});

/**
 * GET /api/analytics/summary
 * Get analytics summary for dashboard
 */
router.get('/summary', async (req, res) => {
  try {
    const { clientId, projectId, period = 'monthly' } = req.query;
    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required'
      });
    }
    const summary = await getAnalyticsSummary(clientId, projectId || null, period);
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analytics summary'
    });
  }
});

/**
 * GET /api/analytics/platform-breakdown
 * Get platform breakdown
 */
router.get('/platform-breakdown', async (req, res) => {
  try {
    const { clientId, projectId, startDate, endDate } = req.query;
    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'Client ID is required'
      });
    }
    const dateRange = {
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    };
    const breakdown = await getPlatformBreakdown(clientId, projectId || null, dateRange);
    res.json({ success: true, data: breakdown });
  } catch (error) {
    console.error('Error fetching platform breakdown:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch platform breakdown'
    });
  }
});

export default router;

