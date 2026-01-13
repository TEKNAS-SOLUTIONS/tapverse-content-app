import express from 'express';
import {
  generateFacebookAdsStrategy,
  getFacebookAdsStrategiesByProject,
  getFacebookAdsStrategyById,
  updateFacebookAdsStrategy,
  deleteFacebookAdsStrategy,
} from '../services/facebookAdsStrategyService.js';
import pool from '../db/index.js';

const router = express.Router();

/**
 * POST /api/facebook-ads-strategy/generate
 * Generate a new Facebook Ads strategy for a project
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
    
    const strategy = await generateFacebookAdsStrategy(projectId, finalClientData, finalProjectData);
    
    res.json({
      success: true,
      data: strategy
    });
  } catch (error) {
    console.error('Error generating Facebook Ads strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate Facebook Ads strategy'
    });
  }
});

/**
 * GET /api/facebook-ads-strategy/project/:projectId
 * Get all Facebook Ads strategies for a project
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const strategies = await getFacebookAdsStrategiesByProject(projectId);
    
    res.json({
      success: true,
      data: strategies
    });
  } catch (error) {
    console.error('Error fetching Facebook Ads strategies:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch Facebook Ads strategies'
    });
  }
});

/**
 * GET /api/facebook-ads-strategy/:id
 * Get a specific Facebook Ads strategy by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const strategy = await getFacebookAdsStrategyById(id);
    
    if (!strategy) {
      return res.status(404).json({
        success: false,
        error: 'Facebook Ads strategy not found'
      });
    }
    
    res.json({
      success: true,
      data: strategy
    });
  } catch (error) {
    console.error('Error fetching Facebook Ads strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch Facebook Ads strategy'
    });
  }
});

/**
 * PUT /api/facebook-ads-strategy/:id
 * Update a Facebook Ads strategy
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedStrategy = await updateFacebookAdsStrategy(id, updates);
    
    if (!updatedStrategy) {
      return res.status(404).json({
        success: false,
        error: 'Facebook Ads strategy not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedStrategy
    });
  } catch (error) {
    console.error('Error updating Facebook Ads strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update Facebook Ads strategy'
    });
  }
});

/**
 * DELETE /api/facebook-ads-strategy/:id
 * Delete a Facebook Ads strategy
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteFacebookAdsStrategy(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Facebook Ads strategy not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Facebook Ads strategy deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Facebook Ads strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete Facebook Ads strategy'
    });
  }
});

export default router;

