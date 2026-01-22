import express from 'express';
import { query } from '../core/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError, ValidationError } from '../core/errors.js';
import { logger } from '../core/logger.js';

const router = express.Router();

/**
 * GET /api/cms/content/approved
 * Returns all approved content ready for CMS
 * Query params: status, content_type, project_id, client_id
 */
router.get('/content/approved', asyncHandler(async (req, res) => {
  const { status = 'approved', content_type, project_id, client_id } = req.query;

  let queryText = `
    SELECT 
      id, project_id, client_id, content_type, status,
      title, content, slug,
      meta_title, meta_description, focus_keyword, keywords,
      canonical_url, og_title, og_description, og_image_url,
      twitter_title, twitter_description, twitter_image_url,
      suburb, service, location_data,
      content_idea_id, keyword_analysis_data,
      published_at, scheduled_publish_at,
      cms_post_id, cms_synced_at, cms_sync_status,
      created_at, updated_at, approved_at
    FROM approved_content
    WHERE status = $1
  `;
  
  const params = [status];
  let paramIndex = 2;

  if (content_type) {
    queryText += ` AND content_type = $${paramIndex}`;
    params.push(content_type);
    paramIndex++;
  }

  if (project_id) {
    queryText += ` AND project_id = $${paramIndex}`;
    params.push(project_id);
    paramIndex++;
  }

  if (client_id) {
    queryText += ` AND client_id = $${paramIndex}`;
    params.push(client_id);
    paramIndex++;
  }

  queryText += ' ORDER BY approved_at DESC, created_at DESC';

  const result = await query(queryText, params);

  res.json({
    success: true,
    data: result.rows,
    count: result.rows.length,
  });
}));

/**
 * POST /api/cms/content/approve
 * Approve content and store in CMS-ready format
 */
router.post('/content/approve', asyncHandler(async (req, res) => {
  const {
    contentId,
    projectId,
    clientId,
    contentType,
    title,
    content,
    meta_title,
    meta_description,
    focus_keyword,
    suburb,
    service,
    location_data,
    ...otherMeta
  } = req.body;

  if (!title || !content || !projectId || !clientId || !contentType) {
    throw new ValidationError('Missing required fields: title, content, projectId, clientId, contentType');
  }

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const result = await query(
    `INSERT INTO approved_content (
      project_id, client_id, content_type, status,
      title, content, slug,
      meta_title, meta_description, focus_keyword,
      suburb, service, location_data,
      approved_at, cms_sync_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), 'pending')
    RETURNING *`,
    [
      projectId,
      clientId,
      contentType,
      'approved',
      title,
      content,
      slug,
      meta_title || title,
      meta_description,
      focus_keyword,
      suburb,
      service,
      location_data ? JSON.stringify(location_data) : null,
    ]
  );

  logger.info({
    contentId: result.rows[0].id,
    projectId,
    contentType,
  }, 'Content approved and stored for CMS');

  res.json({
    success: true,
    data: result.rows[0],
    message: 'Content approved and stored in CMS-ready format',
  });
}));

export default router;
