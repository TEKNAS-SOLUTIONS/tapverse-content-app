import express from 'express';
import {
  generateGoogleAdsStrategy,
  getGoogleAdsStrategiesByProject,
  getGoogleAdsStrategyById,
  updateGoogleAdsStrategy,
  deleteGoogleAdsStrategy,
} from '../services/googleAdsStrategyService.js';
import pool from '../db/index.js';

const router = express.Router();

/**
 * POST /api/google-ads-strategy/generate
 * Generate a new Google Ads strategy for a project
 */
router.post('/generate', async (req, res) => {
  try {
    const { projectId, clientData, projectData } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required'
      });
    }
    
    // Fetch project and client data if not provided
    let finalClientData = clientData || {};
    let finalProjectData = projectData || {};
    
    if (!clientData || !projectData) {
      const projectResult = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [projectId]
      );
      
      if (projectResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }
      
      const project = projectResult.rows[0];
      finalProjectData = { ...project, ...finalProjectData };
      
      const clientResult = await pool.query(
        'SELECT * FROM clients WHERE id = $1',
        [project.client_id]
      );
      
      if (clientResult.rows.length > 0) {
        finalClientData = { ...clientResult.rows[0], ...finalClientData };
      }
    }
    
    const strategy = await generateGoogleAdsStrategy(projectId, finalClientData, finalProjectData);
    
    res.json({
      success: true,
      data: strategy
    });
  } catch (error) {
    console.error('Error generating Google Ads strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate Google Ads strategy'
    });
  }
});

/**
 * GET /api/google-ads-strategy/project/:projectId
 * Get all Google Ads strategies for a project
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const strategies = await getGoogleAdsStrategiesByProject(projectId);
    
    res.json({
      success: true,
      data: strategies
    });
  } catch (error) {
    console.error('Error fetching Google Ads strategies:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch Google Ads strategies'
    });
  }
});

/**
 * GET /api/google-ads-strategy/:id
 * Get a specific Google Ads strategy by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const strategy = await getGoogleAdsStrategyById(id);
    
    if (!strategy) {
      return res.status(404).json({
        success: false,
        error: 'Google Ads strategy not found'
      });
    }
    
    res.json({
      success: true,
      data: strategy
    });
  } catch (error) {
    console.error('Error fetching Google Ads strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch Google Ads strategy'
    });
  }
});

/**
 * PUT /api/google-ads-strategy/:id
 * Update a Google Ads strategy
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedStrategy = await updateGoogleAdsStrategy(id, updates);
    
    if (!updatedStrategy) {
      return res.status(404).json({
        success: false,
        error: 'Google Ads strategy not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedStrategy
    });
  } catch (error) {
    console.error('Error updating Google Ads strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update Google Ads strategy'
    });
  }
});

/**
 * DELETE /api/google-ads-strategy/:id
 * Delete a Google Ads strategy
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteGoogleAdsStrategy(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Google Ads strategy not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Google Ads strategy deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Google Ads strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete Google Ads strategy'
    });
  }
});

export default router;

