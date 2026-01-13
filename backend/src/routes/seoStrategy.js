import express from 'express';
import {
  generateSEOStrategy,
  getSEOStrategiesByProject,
  getSEOStrategyById,
  updateSEOStrategy,
  deleteSEOStrategy,
} from '../services/seoStrategyService.js';
import pool from '../db/index.js';

const router = express.Router();

/**
 * POST /api/seo-strategy/generate
 * Generate a new SEO strategy for a project
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
    
    const strategy = await generateSEOStrategy(projectId, finalClientData, finalProjectData);
    
    res.json({
      success: true,
      data: strategy
    });
  } catch (error) {
    console.error('Error generating SEO strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate SEO strategy'
    });
  }
});

/**
 * GET /api/seo-strategy/project/:projectId
 * Get all SEO strategies for a project
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const strategies = await getSEOStrategiesByProject(projectId);
    
    res.json({
      success: true,
      data: strategies
    });
  } catch (error) {
    console.error('Error fetching SEO strategies:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch SEO strategies'
    });
  }
});

/**
 * GET /api/seo-strategy/:id
 * Get a specific SEO strategy by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const strategy = await getSEOStrategyById(id);
    
    if (!strategy) {
      return res.status(404).json({
        success: false,
        error: 'SEO strategy not found'
      });
    }
    
    res.json({
      success: true,
      data: strategy
    });
  } catch (error) {
    console.error('Error fetching SEO strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch SEO strategy'
    });
  }
});

/**
 * PUT /api/seo-strategy/:id
 * Update a SEO strategy
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedStrategy = await updateSEOStrategy(id, updates);
    
    if (!updatedStrategy) {
      return res.status(404).json({
        success: false,
        error: 'SEO strategy not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedStrategy
    });
  } catch (error) {
    console.error('Error updating SEO strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update SEO strategy'
    });
  }
});

/**
 * DELETE /api/seo-strategy/:id
 * Delete a SEO strategy
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteSEOStrategy(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'SEO strategy not found'
      });
    }
    
    res.json({
      success: true,
      message: 'SEO strategy deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting SEO strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete SEO strategy'
    });
  }
});

export default router;

