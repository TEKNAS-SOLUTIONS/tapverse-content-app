import express from 'express';
import { updateCustomAvatarStatus } from '../services/avatarService.js';

const router = express.Router();

/**
 * POST /api/webhooks/heygen-avatar-status
 * Webhook endpoint for HeyGen to send avatar creation status updates
 * 
 * This endpoint should be publicly accessible (no authentication required)
 * but HeyGen should be configured to send requests with a secret/webhook signature
 * for security (to be implemented if HeyGen supports it)
 */
router.post('/heygen-avatar-status', async (req, res) => {
  try {
    const { job_id, avatar_id, status, thumbnail_url, error_message } = req.body;

    if (!job_id) {
      return res.status(400).json({
        success: false,
        error: 'job_id is required',
      });
    }

    // Validate status
    const validStatuses = ['processing', 'completed', 'failed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Update avatar status in database
    const updatedAvatar = await updateCustomAvatarStatus(
      job_id,
      status || 'processing',
      avatar_id || null,
      thumbnail_url || null,
      error_message || null
    );

    if (!updatedAvatar) {
      console.warn(`Avatar with job_id ${job_id} not found in database`);
      return res.status(404).json({
        success: false,
        error: 'Avatar not found',
      });
    }

    console.log(`Avatar status updated: job_id=${job_id}, status=${status}, avatar_id=${avatar_id || 'N/A'}`);

    // Return success to HeyGen
    res.json({
      success: true,
      message: 'Status updated',
      avatar_id: updatedAvatar.id,
    });
  } catch (error) {
    console.error('Error processing HeyGen webhook:', error);
    // Return 200 to HeyGen even on error (to prevent retries for our errors)
    // But log the error for investigation
    res.status(200).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
