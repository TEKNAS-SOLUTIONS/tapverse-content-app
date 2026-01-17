import express from 'express';
import { exportKeywords, exportContent, exportTasks, toCSV, toJSON } from '../services/exportService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/export/keywords
 * Export keywords data
 */
router.get('/keywords', authenticate, async (req, res) => {
  try {
    const { clientId, projectId, format = 'csv' } = req.query;
    const data = await exportKeywords(clientId, projectId, format);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="keywords_${Date.now()}.json"`);
      res.send(toJSON(data));
    } else {
      // CSV format
      const headers = ['id', 'project_name', 'company_name', 'created_at', 'keyword_opportunities', 'competitor_gaps', 'industry_trends'];
      const csv = toCSV(data, headers);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="keywords_${Date.now()}.csv"`);
      res.send(csv);
    }
  } catch (error) {
    console.error('Error exporting keywords:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/export/content
 * Export content data
 */
router.get('/content', authenticate, async (req, res) => {
  try {
    const { clientId, projectId, format = 'csv' } = req.query;
    const data = await exportContent(clientId, projectId, format);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="content_${Date.now()}.json"`);
      res.send(toJSON(data));
    } else {
      // CSV format
      const headers = ['id', 'content_type', 'title', 'status', 'created_at', 'project_name', 'company_name'];
      const csv = toCSV(data, headers);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="content_${Date.now()}.csv"`);
      res.send(csv);
    }
  } catch (error) {
    console.error('Error exporting content:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/export/tasks
 * Export tasks data
 */
router.get('/tasks', authenticate, async (req, res) => {
  try {
    const { clientId, format = 'csv' } = req.query;
    const data = await exportTasks(clientId, format);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="tasks_${Date.now()}.json"`);
      res.send(toJSON(data));
    } else {
      // CSV format
      const headers = ['id', 'title', 'task_type', 'status', 'priority', 'due_date', 'assigned_to_email', 'company_name'];
      const csv = toCSV(data, headers);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="tasks_${Date.now()}.csv"`);
      res.send(csv);
    }
  } catch (error) {
    console.error('Error exporting tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
