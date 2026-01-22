import { query, transaction } from '../core/database.js';
import { NotFoundError, DatabaseError } from '../core/errors.js';
import { logger } from '../core/logger.js';

/**
 * Clients Repository
 * Data access layer for client operations
 */

/**
 * Get all clients
 */
export const findAll = async () => {
  try {
    const result = await query(
      'SELECT * FROM clients ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    logger.error({ err: error }, 'Error finding all clients');
    throw new DatabaseError('Failed to fetch clients', error);
  }
};

/**
 * Get client by ID
 */
export const findById = async (id) => {
  try {
    const result = await query(
      'SELECT * FROM clients WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Client');
    }
    
    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error({ err: error, id }, 'Error finding client by ID');
    throw new DatabaseError('Failed to fetch client', error);
  }
};

/**
 * Create a new client
 */
export const create = async (clientData) => {
  try {
    const {
      tapverse_client_id,
      company_name,
      website_url,
      industry,
      target_audience,
      unique_selling_points,
      competitors,
      subscribed_services,
      brand_voice,
      brand_tone,
      content_guidelines,
      sample_content,
      business_types,
      primary_business_type,
      location,
      shopify_url,
    } = clientData;

    const result = await query(
      `INSERT INTO clients (
        tapverse_client_id, company_name, website_url, industry,
        target_audience, unique_selling_points, competitors,
        subscribed_services, brand_voice, brand_tone,
        content_guidelines, sample_content, business_types,
        primary_business_type, location, shopify_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        tapverse_client_id,
        company_name,
        website_url,
        industry,
        target_audience,
        unique_selling_points,
        competitors ? JSON.stringify(competitors) : null,
        subscribed_services ? JSON.stringify(subscribed_services) : null,
        brand_voice,
        brand_tone,
        content_guidelines,
        sample_content,
        business_types ? JSON.stringify(business_types) : null,
        primary_business_type,
        location,
        shopify_url,
      ]
    );

    return result.rows[0];
  } catch (error) {
    logger.error({ err: error, clientData }, 'Error creating client');
    throw new DatabaseError('Failed to create client', error);
  }
};

/**
 * Update a client
 */
export const update = async (id, clientData) => {
  try {
    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(clientData).forEach((key) => {
      if (clientData[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        
        // Handle JSON fields
        if (['competitors', 'subscribed_services', 'business_types'].includes(key)) {
          values.push(clientData[key] ? JSON.stringify(clientData[key]) : null);
        } else {
          values.push(clientData[key]);
        }
        
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return await findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE clients SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Client');
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error({ err: error, id, clientData }, 'Error updating client');
    throw new DatabaseError('Failed to update client', error);
  }
};

/**
 * Delete a client
 */
export const remove = async (id) => {
  try {
    const result = await query(
      'DELETE FROM clients WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Client');
    }

    return result.rows[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error({ err: error, id }, 'Error deleting client');
    throw new DatabaseError('Failed to delete client', error);
  }
};

/**
 * Get clients by industry
 */
export const findByIndustry = async (industry) => {
  try {
    const result = await query(
      'SELECT * FROM clients WHERE industry = $1 ORDER BY created_at DESC',
      [industry]
    );
    return result.rows;
  } catch (error) {
    logger.error({ err: error, industry }, 'Error finding clients by industry');
    throw new DatabaseError('Failed to fetch clients by industry', error);
  }
};
