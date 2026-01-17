import express from 'express';
import {
  getLocationSuggestions,
  generateProgrammaticContent,
  generateBatchProgrammaticContent,
  getProgrammaticContentByProject,
} from '../services/programmaticSeoService.js';
import pool from '../db/index.js';

const router = express.Router();

/**
 * GET /api/programmatic-seo/suggestions
 * Get location suggestions from Google Places Autocomplete
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { input, types } = req.query;

    if (!input || input.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const suggestions = await getLocationSuggestions(input, types);
    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Error getting location suggestions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get location suggestions',
    });
  }
});

/**
 * POST /api/programmatic-seo/generate
 * Generate programmatic SEO content for a single Service + Location
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      clientId,
      projectId,
      service,
      location,
      contentTemplate,
    } = req.body;

    if (!service || !location) {
      return res.status(400).json({
        success: false,
        error: 'Service and location are required',
      });
    }

    // Fetch client and project data
    let clientData = {};
    let projectData = {};

    if (clientId) {
      const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
      if (clientResult.rows.length > 0) {
        clientData = clientResult.rows[0];
      }
    }

    if (projectId) {
      const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
      if (projectResult.rows.length > 0) {
        projectData = projectResult.rows[0];
      }
    }

    const content = await generateProgrammaticContent({
      clientId,
      projectId,
      service,
      location,
      clientData,
      projectData,
      contentTemplate,
    });

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Error generating programmatic content:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate programmatic content',
    });
  }
});

/**
 * POST /api/programmatic-seo/generate-batch
 * Generate programmatic SEO content for multiple Service + Location combinations
 */
router.post('/generate-batch', async (req, res) => {
  try {
    const {
      clientId,
      projectId,
      services = [],
      locations = [],
      contentType = 'service_location',
    } = req.body;

    if (services.length === 0 || locations.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one service and one location are required',
      });
    }

    // Validate batch size
    const total = contentType === 'service_location' 
      ? services.length * locations.length
      : Math.max(services.length, locations.length);
    
    if (total > 50) {
      return res.status(400).json({
        success: false,
        error: `Maximum 50 combinations allowed. You have ${total}. Please reduce services or locations.`,
      });
    }

    // Fetch client and project data
    let clientData = {};
    let projectData = {};

    if (clientId) {
      const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
      if (clientResult.rows.length > 0) {
        clientData = clientResult.rows[0];
      }
    }

    if (projectId) {
      const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
      if (projectResult.rows.length > 0) {
        projectData = projectResult.rows[0];
      }
    }

    const result = await generateBatchProgrammaticContent({
      clientId,
      projectId,
      services,
      locations,
      contentType,
      clientData,
      projectData,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error generating batch programmatic content:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate batch programmatic content',
    });
  }
});

/**
 * GET /api/programmatic-seo/project/:projectId
 * Get all programmatic content for a project
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const content = await getProgrammaticContentByProject(projectId);

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Error fetching programmatic content:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch programmatic content',
    });
  }
});

export default router;
