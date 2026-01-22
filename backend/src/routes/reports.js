import express from 'express';
import {
  generateMonthlyReport,
  saveMonthlyReport,
  getMonthlyReportsByClient,
  getMonthlyReportById,
  updateMonthlyReport,
} from '../services/reportService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/reports/monthly/generate
 * Generate monthly report
 */
router.post('/monthly/generate', authenticate, async (req, res) => {
  try {
    const {
      clientId,
      reportMonth,
      includeDraft = false,
      includeRejected = false,
      customNotes = '',
    } = req.body;

    if (!clientId || !reportMonth) {
      return res.status(400).json({
        success: false,
        error: 'Client ID and report month are required',
      });
    }

    const reportData = await generateMonthlyReport(clientId, reportMonth, {
      includeDraft,
      includeRejected,
      customNotes,
    });

    res.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/reports/monthly/save
 * Save monthly report
 */
router.post('/monthly/save', authenticate, async (req, res) => {
  try {
    const {
      clientId,
      reportMonth,
      contentIncluded,
      contentExcluded,
      reportData: fullReportData,
      status,
    } = req.body;

    const report = await saveMonthlyReport({
      clientId,
      reportMonth,
      contentIncluded,
      contentExcluded,
      reportData: fullReportData,
      status,
    }, req.user.id);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error saving monthly report:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/reports/monthly/client/:clientId
 * Get all monthly reports for a client
 */
router.get('/monthly/client/:clientId', authenticate, async (req, res) => {
  try {
    const { clientId } = req.params;
    const reports = await getMonthlyReportsByClient(clientId);

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('Error fetching monthly reports:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/reports/monthly/:id
 * Get monthly report by ID
 */
router.get('/monthly/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await getMonthlyReportById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/reports/monthly/:id
 * Update monthly report
 */
router.put('/monthly/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateMonthlyReport(id, req.body);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating monthly report:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
