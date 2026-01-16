import express from 'express';
import { generateEnhancedEvidence } from '../services/enhancedEvidenceService.js';
import {
  getContentEvidenceById,
} from '../services/contentEvidenceService.js';
import pool from '../db/index.js';

const router = express.Router();

/**
 * POST /api/content-evidence/generate
 * Generate enhanced evidence-based analysis for content
 * Uses multi-pass AI analysis + free data sources for 90%+ confidence
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      contentType,
      topic,
      keywords,
      competitors,
      industry,
      targetAudience,
      clientId,
      projectId,
    } = req.body;

    if (!contentType || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Content type and topic are required',
      });
    }

    // Fetch client and project data if IDs provided
    let clientData = {};
    let projectData = {};

    if (clientId) {
      const clientResult = await pool.query(
        'SELECT * FROM clients WHERE id = $1',
        [clientId]
      );
      if (clientResult.rows.length > 0) {
        clientData = clientResult.rows[0];
      }
    }

    if (projectId) {
      const projectResult = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [projectId]
      );
      if (projectResult.rows.length > 0) {
        projectData = projectResult.rows[0];
      }
    }

    // Use enhanced multi-pass analysis
    const evidence = await generateEnhancedEvidence({
      contentType,
      topic,
      keywords: keywords || projectData.keywords || [],
      competitors: competitors || clientData.competitors || [],
      industry: industry || clientData.industry,
      targetAudience: targetAudience || projectData.target_audience || clientData.target_audience,
      clientData,
      projectData,
    });

    res.json({
      success: true,
      data: evidence,
    });
  } catch (error) {
    console.error('Error generating content evidence:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate content evidence',
    });
  }
});

/**
 * GET /api/content-evidence/:contentId
 * Get evidence for existing content
 */
router.get('/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const evidence = await getContentEvidenceById(contentId);

    if (!evidence) {
      return res.status(404).json({
        success: false,
        error: 'Evidence not found for this content',
      });
    }

    res.json({
      success: true,
      data: evidence,
    });
  } catch (error) {
    console.error('Error fetching content evidence:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch content evidence',
    });
  }
});

export default router;
