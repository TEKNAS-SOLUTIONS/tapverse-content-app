import express from 'express';
import multer from 'multer';
import {
  generateVideoScript,
  createHeyGenVideo,
  checkHeyGenVideoStatus,
  getHeyGenAvatars,
  getHeyGenVoices,
  generateVoiceover,
  getElevenLabsVoices,
  createCustomAvatarFromPhoto,
  createCustomAvatarFromVideo,
  checkAvatarTrainingStatus,
} from '../services/videoService.js';
import { getProjectById, getClientById, getSetting } from '../db/queries.js';
import { query } from '../db/index.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, WebP, MP4, MOV, WebM'));
    }
  }
});

/**
 * Generate video script for a project
 * POST /api/video/generate-script
 */
router.post('/generate-script', async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        error: 'project_id is required',
      });
    }

    // Get project and client data
    const project = await getProjectById(project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const client = await getClientById(project.client_id);

    // Generate video script
    const script = await generateVideoScript(project, client);

    // Save to database
    const result = await query(
      `INSERT INTO content (
        project_id, content_type, title, content, 
        meta_description, status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        project_id,
        'video_script',
        script.title || 'Video Script',
        JSON.stringify(script),
        script.hook || '',
        'ready',
      ]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        script: script,
      },
    });
  } catch (error) {
    console.error('Error generating video script:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Create video with HeyGen
 * POST /api/video/create
 */
router.post('/create', async (req, res) => {
  try {
    const { script_id, script_text, avatar_id, voice_id } = req.body;

    if (!script_text) {
      return res.status(400).json({
        success: false,
        error: 'script_text is required',
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

    // Create video
    const result = await createHeyGenVideo(script_text, {
      avatarId: avatar_id,
      voiceId: voice_id,
      apiKey: heygenApiKey.setting_value,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Check video status
 * GET /api/video/status/:video_id
 */
router.get('/status/:video_id', async (req, res) => {
  try {
    const { video_id } = req.params;

    // Get HeyGen API key
    const heygenApiKey = await getSetting('heygen_api_key');
    if (!heygenApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'HeyGen API key not configured',
      });
    }

    const status = await checkHeyGenVideoStatus(video_id, heygenApiKey.setting_value);

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error checking video status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get available avatars
 * GET /api/video/avatars
 */
router.get('/avatars', async (req, res) => {
  try {
    // Get HeyGen API key
    const heygenApiKey = await getSetting('heygen_api_key');
    if (!heygenApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'HeyGen API key not configured. Please add it in Admin Setup.',
      });
    }

    const avatars = await getHeyGenAvatars(heygenApiKey.setting_value);

    res.json({
      success: true,
      data: avatars,
    });
  } catch (error) {
    console.error('Error getting avatars:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Generate voiceover with ElevenLabs
 * POST /api/video/voiceover
 */
router.post('/voiceover', async (req, res) => {
  try {
    const { text, voice_id } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required',
      });
    }

    // Get ElevenLabs API key
    const elevenLabsApiKey = await getSetting('elevenlabs_api_key');
    if (!elevenLabsApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'ElevenLabs API key not configured. Please add it in Admin Setup.',
      });
    }

    const result = await generateVoiceover(text, {
      voiceId: voice_id || 'default',
      apiKey: elevenLabsApiKey.setting_value,
    });

    // Return audio as base64
    const base64Audio = Buffer.from(result.audio).toString('base64');

    res.json({
      success: true,
      data: {
        audio: base64Audio,
        contentType: result.contentType,
      },
    });
  } catch (error) {
    console.error('Error generating voiceover:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get available HeyGen voices (for video creation)
 * GET /api/video/voices
 */
router.get('/voices', async (req, res) => {
  try {
    // Get HeyGen API key (for video creation, we use HeyGen voices)
    const heygenApiKey = await getSetting('heygen_api_key');
    if (!heygenApiKey?.setting_value) {
      return res.status(400).json({
        success: false,
        error: 'HeyGen API key not configured. Please add it in Admin Setup.',
      });
    }

    const voices = await getHeyGenVoices(heygenApiKey.setting_value);

    // Transform HeyGen voices to match expected format
    const formattedVoices = voices.map(voice => ({
      voice_id: voice.voice_id || voice.id,
      name: voice.name || voice.voice_name,
      gender: voice.gender,
      language: voice.language,
      accent: voice.accent,
      description: voice.description || `${voice.name} - ${voice.gender || ''} ${voice.language || ''}`.trim(),
    }));

    res.json({
      success: true,
      data: formattedVoices,
    });
  } catch (error) {
    console.error('Error getting HeyGen voices:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

