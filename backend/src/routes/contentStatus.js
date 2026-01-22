import express from 'express';
import { query } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Valid content statuses
 */
const VALID_STATUSES = ['draft', 'in_review', 'approved', 'scheduled', 'published', 'rejected', 'edited'];

/**
 * PUT /api/content/:id/status
 * Update content status
 */
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, reviewNotes, publishedUrl } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    // Get current content
    const contentResult = await query('SELECT * FROM content WHERE id = $1', [id]);
    if (contentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    const updateFields = ['status = $1', 'status_changed_at = CURRENT_TIMESTAMP', 'status_changed_by = $2'];
    const values = [status, req.user.id];
    let paramIndex = 3;

    // Handle status-specific fields
    if (status === 'published') {
      updateFields.push('published_at = CURRENT_TIMESTAMP');
      if (publishedUrl) {
        updateFields.push(`published_url = $${paramIndex}`);
        values.push(publishedUrl);
        paramIndex++;
      }
    } else if (status === 'rejected') {
      if (rejectionReason) {
        updateFields.push(`rejection_reason = $${paramIndex}`);
        values.push(rejectionReason);
        paramIndex++;
      }
    }

    if (reviewNotes) {
      updateFields.push(`review_notes = $${paramIndex}`);
      values.push(reviewNotes);
      paramIndex++;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await query(
      `UPDATE content SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating content status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/content/:id/status-history
 * Get content status history (if we add a history table later)
 */
router.get('/:id/status-history', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT status, status_changed_at, status_changed_by, 
              u.email as changed_by_email, u.full_name as changed_by_name
       FROM content c
       LEFT JOIN users u ON c.status_changed_by = u.id
       WHERE c.id = $1
       ORDER BY c.status_changed_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
