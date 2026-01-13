import express from 'express';
import {
  generateEmailNewsletter,
  getEmailNewsletters,
  getEmailNewsletterById,
  updateEmailNewsletter,
  deleteEmailNewsletter,
} from '../services/emailNewsletterService.js';

const router = express.Router();

/**
 * POST /api/email-newsletters/generate
 * Generate email newsletter
 */
router.post('/generate', async (req, res) => {
  try {
    const { projectId, ...options } = req.body;
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required'
      });
    }
    const newsletter = await generateEmailNewsletter(projectId, options);
    res.json({ success: true, data: newsletter });
  } catch (error) {
    console.error('Error generating email newsletter:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate email newsletter'
    });
  }
});

/**
 * GET /api/email-newsletters/project/:projectId
 * Get email newsletters for a project
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const newsletters = await getEmailNewsletters(projectId);
    res.json({ success: true, data: newsletters });
  } catch (error) {
    console.error('Error fetching email newsletters:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch email newsletters'
    });
  }
});

/**
 * GET /api/email-newsletters/:id
 * Get email newsletter by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const newsletter = await getEmailNewsletterById(id);
    if (newsletter) {
      res.json({ success: true, data: newsletter });
    } else {
      res.status(404).json({ success: false, error: 'Email newsletter not found' });
    }
  } catch (error) {
    console.error('Error fetching email newsletter:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch email newsletter'
    });
  }
});

/**
 * PUT /api/email-newsletters/:id
 * Update email newsletter
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateEmailNewsletter(id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating email newsletter:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update email newsletter'
    });
  }
});

/**
 * DELETE /api/email-newsletters/:id
 * Delete email newsletter
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteEmailNewsletter(id);
    if (deleted) {
      res.json({ success: true, message: 'Email newsletter deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Email newsletter not found' });
    }
  } catch (error) {
    console.error('Error deleting email newsletter:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete email newsletter'
    });
  }
});

export default router;

