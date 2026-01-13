import express from 'express';
import {
  scheduleContent,
  getScheduledContent,
  getScheduleById,
  updateScheduleStatus,
  cancelSchedule,
  deleteSchedule,
} from '../services/schedulingService.js';

const router = express.Router();

/**
 * POST /api/scheduling/schedule
 * Schedule content for publishing
 */
router.post('/schedule', async (req, res) => {
  try {
    const schedule = await scheduleContent(req.body);
    res.json({ success: true, data: schedule });
  } catch (error) {
    console.error('Error scheduling content:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to schedule content'
    });
  }
});

/**
 * GET /api/scheduling/project/:projectId
 * Get scheduled content for a project
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const filters = {
      status: req.query.status,
      platform: req.query.platform,
    };
    const schedules = await getScheduledContent(projectId, filters);
    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('Error fetching scheduled content:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch scheduled content'
    });
  }
});

/**
 * GET /api/scheduling/:id
 * Get schedule by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await getScheduleById(id);
    if (schedule) {
      res.json({ success: true, data: schedule });
    } else {
      res.status(404).json({ success: false, error: 'Schedule not found' });
    }
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch schedule'
    });
  }
});

/**
 * PUT /api/scheduling/:id/status
 * Update schedule status
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ...additionalData } = req.body;
    const updated = await updateScheduleStatus(id, status, additionalData);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating schedule status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update schedule status'
    });
  }
});

/**
 * POST /api/scheduling/:id/cancel
 * Cancel a scheduled content
 */
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const cancelled = await cancelSchedule(id);
    if (cancelled) {
      res.json({ success: true, data: cancelled });
    } else {
      res.status(404).json({ success: false, error: 'Schedule not found or cannot be cancelled' });
    }
  } catch (error) {
    console.error('Error cancelling schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel schedule'
    });
  }
});

/**
 * DELETE /api/scheduling/:id
 * Delete a schedule
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteSchedule(id);
    if (deleted) {
      res.json({ success: true, message: 'Schedule deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Schedule not found' });
    }
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete schedule'
    });
  }
});

export default router;

