import { query, transaction } from '../core/database.js';
import { NotFoundError, DatabaseError } from '../core/errors.js';
import { logger } from '../core/logger.js';

/**
 * Content Repository
 * Data access layer for content operations
 */

/**
 * Get all content for a project
 */
export const findByProject = async (projectId) => {
  try {
    const result = await query(
      'SELECT * FROM content WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    return result.rows;
  } catch (error) {
    logger.error({ err: error, projectId }, 'Error finding content by project');
    throw new DatabaseError('Failed to fetch content', error);
  }
};

/**
 * Get content by ID
 */
export const findById = async (id) => {
  try {
    const result = await query(
      'SELECT * FROM content WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Content');
    }
    
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error({ err: error, id }, 'Error finding content by ID');
    throw new DatabaseError('Failed to fetch content', error);
  }
};

/**
 * Create new content
 */
export const create = async (contentData) => {
  try {
    const {
      project_id,
      content_type,
      title,
      content,
      meta_description,
      keywords,
      status,
    } = contentData;

    const result = await query(
      `INSERT INTO content (
        project_id, content_type, title, content,
        meta_description, keywords, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        project_id,
        content_type,
        title,
        content,
        meta_description,
        keywords ? JSON.stringify(keywords) : null,
        status || 'draft',
      ]
    );

    return result.rows[0];
  } catch (error) {
    logger.error({ err: error, contentData }, 'Error creating content');
    throw new DatabaseError('Failed to create content', error);
  }
};

/**
 * Update content
 */
export const update = async (id, contentData) => {
  try {
    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(contentData).forEach((key) => {
      if (contentData[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        
        // Handle JSON fields
        if (key === 'keywords') {
          values.push(contentData[key] ? JSON.stringify(contentData[key]) : null);
        } else {
          values.push(contentData[key]);
        }
        
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return await findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE content SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Content');
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error({ err: error, id, contentData }, 'Error updating content');
    throw new DatabaseError('Failed to update content', error);
  }
};

/**
 * Delete content
 */
export const remove = async (id) => {
  try {
    const result = await query(
      'DELETE FROM content WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Content');
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error({ err: error, id }, 'Error deleting content');
    throw new DatabaseError('Failed to delete content', error);
  }
};
