import pool from '../db/index.js';
import { generateContentWithSystem } from './claude.js';

/**
 * Content Scheduling Service
 * Handles scheduling content for publishing across platforms
 */

/**
 * Schedule content for publishing
 */
export async function scheduleContent(scheduleData) {
  try {
    const {
      projectId,
      contentId,
      clientId,
      platform,
      scheduledAt,
      timezone = 'UTC',
      contentType,
      contentData = {}
    } = scheduleData;

    if (!projectId || !clientId || !platform || !scheduledAt || !contentType) {
      throw new Error('Missing required fields: projectId, clientId, platform, scheduledAt, contentType');
    }

    const result = await pool.query(`
      INSERT INTO content_schedules (
        project_id, content_id, client_id, platform, scheduled_at, timezone,
        content_type, content_data, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      projectId,
      contentId || null,
      clientId,
      platform,
      scheduledAt,
      timezone,
      contentType,
      JSON.stringify(contentData),
      'scheduled'
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error scheduling content:', error);
    throw error;
  }
}

/**
 * Get scheduled content for a project
 */
export async function getScheduledContent(projectId, filters = {}) {
  try {
    let query = 'SELECT * FROM content_schedules WHERE project_id = $1';
    const params = [projectId];
    let paramCount = 1;

    if (filters.status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
    }

    if (filters.platform) {
      paramCount++;
      query += ` AND platform = $${paramCount}`;
      params.push(filters.platform);
    }

    query += ' ORDER BY scheduled_at ASC';

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching scheduled content:', error);
    throw error;
  }
}

/**
 * Get upcoming scheduled content (for processing)
 */
export async function getUpcomingSchedules(limit = 50) {
  try {
    const result = await pool.query(`
      SELECT * FROM content_schedules
      WHERE status = 'scheduled'
        AND scheduled_at <= NOW() + INTERVAL '1 hour'
        AND scheduled_at >= NOW() - INTERVAL '5 minutes'
      ORDER BY scheduled_at ASC
      LIMIT $1
    `, [limit]);

    return result.rows;
  } catch (error) {
    console.error('Error fetching upcoming schedules:', error);
    throw error;
  }
}

/**
 * Update schedule status
 */
export async function updateScheduleStatus(scheduleId, status, additionalData = {}) {
  try {
    const updates = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [status];
    let paramCount = 1;

    if (additionalData.publishedAt) {
      paramCount++;
      updates.push(`published_at = $${paramCount}`);
      params.push(additionalData.publishedAt);
    }

    if (additionalData.publishUrl) {
      paramCount++;
      updates.push(`publish_url = $${paramCount}`);
      params.push(additionalData.publishUrl);
    }

    if (additionalData.publishId) {
      paramCount++;
      updates.push(`publish_id = $${paramCount}`);
      params.push(additionalData.publishId);
    }

    if (additionalData.errorMessage) {
      paramCount++;
      updates.push(`error_message = $${paramCount}`);
      params.push(additionalData.errorMessage);
    }

    if (additionalData.retryCount !== undefined) {
      paramCount++;
      updates.push(`retry_count = $${paramCount}`);
      params.push(additionalData.retryCount);
    }

    paramCount++;
    params.push(scheduleId);

    const result = await pool.query(`
      UPDATE content_schedules
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, params);

    return result.rows[0];
  } catch (error) {
    console.error('Error updating schedule status:', error);
    throw error;
  }
}

/**
 * Cancel a scheduled content
 */
export async function cancelSchedule(scheduleId) {
  try {
    const result = await pool.query(`
      UPDATE content_schedules
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'scheduled'
      RETURNING *
    `, [scheduleId]);

    return result.rows[0];
  } catch (error) {
    console.error('Error cancelling schedule:', error);
    throw error;
  }
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(scheduleId) {
  try {
    const result = await pool.query(
      'DELETE FROM content_schedules WHERE id = $1 RETURNING id',
      [scheduleId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
}

/**
 * Get schedule by ID
 */
export async function getScheduleById(scheduleId) {
  try {
    const result = await pool.query(
      'SELECT * FROM content_schedules WHERE id = $1',
      [scheduleId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
}

