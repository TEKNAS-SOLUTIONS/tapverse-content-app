import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import {
  createInstantAvatar,
  checkInstantAvatarStatus,
  getUserCustomAvatars,
  getCustomAvatarById,
  createCustomAvatarRecord,
  updateCustomAvatarStatus,
  deleteCustomAvatar,
} from '../services/avatarService.js';
import { getSetting } from '../db/queries.js';

const router = express.Router();

// Configure multer for video file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit for video files
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: MP4, MOV, WebM'));
    }
  }
});

/**
 * POST /api/avatars/create-instant-avatar
 * Create a new Instant Avatar from video
 */
router.post('/create-instant-avatar', authenticate, upload.single('video'), async (req, res) => {
  try {
    const { name, transcription } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Video file is required',
      });
    }

    if (!transcription || transcription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Transcription is required. Please transcribe the exact words spoken in the video.',
      });
    }

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Avatar name is required',
      });
    }

    // Get HeyGen API key
    const heygenApiKey = await getSetting('heygen_api_key');
    if (!heygenApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'HeyGen API key not configured. Please add it in Admin Setup.',
      });
    }

    // Create Instant Avatar with HeyGen
    const result = await createInstantAvatar(
      req.file.buffer,
      transcription.trim(),
      name.trim(),
      heygenApiKey.setting_value
    );

    // Save avatar record in database
    const avatarRecord = await createCustomAvatarRecord(
      req.user.id,
      name.trim(),
      result.job_id || result.avatar_id,
      transcription.trim()
    );

    res.status(201).json({
      success: true,
      data: {
        ...avatarRecord,
        heygen_job_id: result.job_id,
        heygen_avatar_id: result.avatar_id,
        status: result.status,
        message: result.message,
      },
    });
  } catch (error) {
    console.error('Error creating Instant Avatar:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create Instant Avatar',
    });
  }
});

/**
 * GET /api/avatars
 * Get all custom avatars for the authenticated user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const avatars = await getUserCustomAvatars(req.user.id);
    
    res.json({
      success: true,
      data: avatars,
    });
  } catch (error) {
    console.error('Error getting custom avatars:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/avatars/:id
 * Get a specific custom avatar by ID
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const avatar = await getCustomAvatarById(id, req.user.id);

    if (!avatar) {
      return res.status(404).json({
        success: false,
        error: 'Avatar not found',
      });
    }

    res.json({
      success: true,
      data: avatar,
    });
  } catch (error) {
    console.error('Error getting custom avatar:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/avatars/:id/check-status
 * Check status of an avatar creation (manual polling)
 */
router.post('/:id/check-status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const avatar = await getCustomAvatarById(id, req.user.id);

    if (!avatar) {
      return res.status(404).json({
        success: false,
        error: 'Avatar not found',
      });
    }

    if (!avatar.heygen_job_id) {
      return res.status(400).json({
        success: false,
        error: 'Avatar does not have a HeyGen job ID',
      });
    }

    // Get HeyGen API key
    const heygenApiKey = await getSetting('heygen_api_key');
    if (!heygenApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'HeyGen API key not configured',
      });
    }

    // Check status with HeyGen
    const statusResult = await checkInstantAvatarStatus(
      avatar.heygen_job_id,
      heygenApiKey.setting_value
    );

    // Update database if status changed
    if (statusResult.status !== avatar.status) {
      await updateCustomAvatarStatus(
        avatar.heygen_job_id,
        statusResult.status,
        statusResult.avatar_id,
        statusResult.thumbnail_url,
        statusResult.error_message
      );
    }

    res.json({
      success: true,
      data: {
        ...avatar,
        status: statusResult.status,
        heygen_avatar_id: statusResult.avatar_id || avatar.heygen_avatar_id,
        thumbnail_url: statusResult.thumbnail_url || avatar.thumbnail_url,
        error_message: statusResult.error_message,
      },
    });
  } catch (error) {
    console.error('Error checking avatar status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/avatars/:id
 * Delete a custom avatar
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteCustomAvatar(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Avatar not found or not authorized',
      });
    }

    res.json({
      success: true,
      message: 'Avatar deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
