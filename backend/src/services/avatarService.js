import fetch from 'node-fetch';
import FormData from 'form-data';
import pool from '../db/index.js';
import { getSetting } from '../db/queries.js';

const HEYGEN_API_URL = 'https://api.heygen.com/v2';
const HEYGEN_V1_API_URL = 'https://api.heygen.com/v1';

/**
 * Create Instant Avatar from video (HeyGen Video Avatars API)
 * This is for creating Instant Avatars - faster than training-based avatars
 * 
 * @param {Buffer} videoBuffer - Video file buffer (MP4 or MOV)
 * @param {string} transcription - Exact transcription of spoken words in video
 * @param {string} name - Avatar name
 * @param {string} apiKey - HeyGen API key
 * @returns {Promise<Object>} Avatar creation response with job_id/avatar_id
 */
export async function createInstantAvatar(videoBuffer, transcription, name, apiKey) {
  if (!apiKey) {
    throw new Error('HeyGen API key is required');
  }

  if (!videoBuffer || videoBuffer.length === 0) {
    throw new Error('Video file is required');
  }

  if (!transcription || transcription.trim().length === 0) {
    throw new Error('Transcription is required for Instant Avatar creation');
  }

  try {
    // Create form data for multipart/form-data request
    const formData = new FormData();
    formData.append('file', videoBuffer, { 
      filename: 'avatar-video.mp4', 
      contentType: 'video/mp4' 
    });
    formData.append('transcription', transcription.trim());
    if (name) {
      formData.append('name', name);
    }

    // Use HeyGen Video Avatars API endpoint
    // Based on HeyGen docs: /v2/video_avatars or /v2/instant_avatar
    // We'll try the instant_avatar endpoint first
    const url = `${HEYGEN_API_URL}/instant_avatar`;
    
    console.log('Creating Instant Avatar with HeyGen API:', {
      url,
      videoSize: videoBuffer.length,
      transcriptionLength: transcription.length,
      name,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const responseText = await response.text();
    console.log('HeyGen API Response Status:', response.status);
    console.log('HeyGen API Response:', responseText.substring(0, 500));

    if (!response.ok) {
      let errorMessage = 'HeyGen API error';
      try {
        const error = JSON.parse(responseText);
        errorMessage = error.message || error.error?.message || JSON.stringify(error);
      } catch (e) {
        errorMessage = responseText.substring(0, 200);
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    
    // HeyGen returns different formats - try to extract job_id or avatar_id
    const jobId = data.job_id || data.data?.job_id || data.id;
    const avatarId = data.avatar_id || data.data?.avatar_id || data.avatar_id;
    const status = data.status || 'processing';

    return {
      job_id: jobId,
      avatar_id: avatarId,
      status: status,
      message: 'Instant Avatar creation started. This may take a few minutes.',
      heygen_response: data, // Store full response for debugging
    };
  } catch (error) {
    console.error('Error creating Instant Avatar:', error);
    throw new Error(`Failed to create Instant Avatar: ${error.message}`);
  }
}

/**
 * Check Instant Avatar creation status
 * 
 * @param {string} jobId - HeyGen job ID
 * @param {string} apiKey - HeyGen API key
 * @returns {Promise<Object>} Status update
 */
export async function checkInstantAvatarStatus(jobId, apiKey) {
  if (!apiKey) {
    throw new Error('HeyGen API key is required');
  }

  try {
    const url = `${HEYGEN_API_URL}/instant_avatar/${jobId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'HeyGen API error');
    }

    const data = await response.json();
    
    return {
      job_id: jobId,
      avatar_id: data.avatar_id || data.data?.avatar_id,
      status: data.status || 'processing',
      progress: data.progress,
      thumbnail_url: data.thumbnail_url || data.data?.thumbnail_url,
      error_message: data.error_message || data.error?.message,
    };
  } catch (error) {
    console.error('Error checking Instant Avatar status:', error);
    throw new Error(`Failed to check status: ${error.message}`);
  }
}

/**
 * Get all custom avatars for a user
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of custom avatars
 */
export async function getUserCustomAvatars(userId) {
  const result = await pool.query(
    `SELECT 
      id, name, heygen_avatar_id, heygen_job_id, status, 
      thumbnail_url, error_message, created_at, updated_at, completed_at
    FROM custom_avatars 
    WHERE user_id = $1 
    ORDER BY created_at DESC`,
    [userId]
  );
  
  return result.rows;
}

/**
 * Get a custom avatar by ID
 * 
 * @param {string} avatarId - Avatar ID (UUID)
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} Avatar data
 */
export async function getCustomAvatarById(avatarId, userId) {
  const result = await pool.query(
    `SELECT 
      id, user_id, name, heygen_avatar_id, heygen_job_id, status,
      video_url, transcription, thumbnail_url, error_message,
      created_at, updated_at, completed_at
    FROM custom_avatars 
    WHERE id = $1 AND user_id = $2`,
    [avatarId, userId]
  );
  
  return result.rows[0] || null;
}

/**
 * Create a custom avatar record in database
 * 
 * @param {string} userId - User ID
 * @param {string} name - Avatar name
 * @param {string} heygenJobId - HeyGen job ID
 * @param {string} transcription - Transcription text
 * @returns {Promise<Object>} Created avatar record
 */
export async function createCustomAvatarRecord(userId, name, heygenJobId, transcription) {
  const result = await pool.query(
    `INSERT INTO custom_avatars (
      user_id, name, heygen_job_id, status, transcription
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [userId, name, heygenJobId, 'processing', transcription]
  );
  
  return result.rows[0];
}

/**
 * Update custom avatar status (called by webhook)
 * 
 * @param {string} heygenJobId - HeyGen job ID
 * @param {string} status - New status (completed, failed)
 * @param {string} heygenAvatarId - HeyGen avatar ID (when completed)
 * @param {string} thumbnailUrl - Thumbnail URL (when completed)
 * @param {string} errorMessage - Error message (if failed)
 * @returns {Promise<Object|null>} Updated avatar record
 */
export async function updateCustomAvatarStatus(
  heygenJobId, 
  status, 
  heygenAvatarId = null, 
  thumbnailUrl = null, 
  errorMessage = null
) {
  const updateFields = ['status = $2', 'updated_at = CURRENT_TIMESTAMP'];
  const values = [heygenJobId, status];
  let paramIndex = 3;

  if (heygenAvatarId) {
    updateFields.push(`heygen_avatar_id = $${paramIndex}`);
    values.push(heygenAvatarId);
    paramIndex++;
  }

  if (thumbnailUrl) {
    updateFields.push(`thumbnail_url = $${paramIndex}`);
    values.push(thumbnailUrl);
    paramIndex++;
  }

  if (errorMessage) {
    updateFields.push(`error_message = $${paramIndex}`);
    values.push(errorMessage);
    paramIndex++;
  }

  if (status === 'completed') {
    updateFields.push(`completed_at = CURRENT_TIMESTAMP`);
  }

  const result = await pool.query(
    `UPDATE custom_avatars 
    SET ${updateFields.join(', ')}
    WHERE heygen_job_id = $1
    RETURNING *`,
    values
  );
  
  return result.rows[0] || null;
}

/**
 * Delete a custom avatar
 * 
 * @param {string} avatarId - Avatar ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success
 */
export async function deleteCustomAvatar(avatarId, userId) {
  const result = await pool.query(
    `DELETE FROM custom_avatars 
    WHERE id = $1 AND user_id = $2
    RETURNING id`,
    [avatarId, userId]
  );
  
  return result.rows.length > 0;
}

export default {
  createInstantAvatar,
  checkInstantAvatarStatus,
  getUserCustomAvatars,
  getCustomAvatarById,
  createCustomAvatarRecord,
  updateCustomAvatarStatus,
  deleteCustomAvatar,
};
