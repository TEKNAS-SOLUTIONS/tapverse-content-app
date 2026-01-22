import { query, transaction } from '../core/database.js';
import { NotFoundError, DatabaseError } from '../core/errors.js';
import { logger } from '../core/logger.js';

/**
 * Projects Repository
 * Data access layer for project operations
 */

/**
 * Get all projects
 */
export const findAll = async (clientId = null) => {
  try {
    let result;
    if (clientId) {
      result = await query(
        'SELECT * FROM projects WHERE client_id = $1 ORDER BY created_at DESC',
        [clientId]
      );
    } else {
      result = await query(
        'SELECT * FROM projects ORDER BY created_at DESC'
      );
    }
    return result.rows;
  } catch (error) {
    logger.error({ err: error, clientId }, 'Error finding all projects');
    throw new DatabaseError('Failed to fetch projects', error);
  }
};

/**
 * Get project by ID
 */
export const findById = async (id) => {
  try {
    const result = await query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Project');
    }
    
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error({ err: error, id }, 'Error finding project by ID');
    throw new DatabaseError('Failed to fetch project', error);
  }
};

/**
 * Create a new project
 */
export const create = async (projectData) => {
  try {
    const {
      client_id,
      project_name,
      project_type,
      project_types,
      keywords,
      competitors,
      target_audience,
      status,
    } = projectData;

    const result = await query(
      `INSERT INTO projects (
        client_id, project_name, project_type, project_types,
        keywords, competitors, target_audience, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        client_id,
        project_name,
        project_type,
        project_types ? JSON.stringify(project_types) : null,
        keywords ? JSON.stringify(keywords) : null,
        competitors ? JSON.stringify(competitors) : null,
        target_audience,
        status || 'active',
      ]
    );

    return result.rows[0];
  } catch (error) {
    logger.error({ err: error, projectData }, 'Error creating project');
    throw new DatabaseError('Failed to create project', error);
  }
};

/**
 * Update a project
 */
export const update = async (id, projectData) => {
  try {
    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(projectData).forEach((key) => {
      if (projectData[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        
        // Handle JSON fields
        if (['project_types', 'keywords', 'competitors'].includes(key)) {
          values.push(projectData[key] ? JSON.stringify(projectData[key]) : null);
        } else {
          values.push(projectData[key]);
        }
        
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return await findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE projects SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Project');
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error({ err: error, id, projectData }, 'Error updating project');
    throw new DatabaseError('Failed to update project', error);
  }
};

/**
 * Delete a project
 */
export const remove = async (id) => {
  try {
    const result = await query(
      'DELETE FROM projects WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Project');
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error({ err: error, id }, 'Error deleting project');
    throw new DatabaseError('Failed to delete project', error);
  }
};
