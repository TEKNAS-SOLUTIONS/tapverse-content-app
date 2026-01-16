import express from 'express';
import {
  analyzeKeywords,
  getKeywordAnalysesByProject,
  getKeywordAnalysisById,
  deleteKeywordAnalysis,
} from '../services/keywordAnalysisService.js';

const router = express.Router();

/**
 * POST /api/keyword-analysis/analyze
 * Generate keyword analysis for a client/project
 */
router.post('/analyze', async (req, res) => {
  try {
    const {
      clientId,
      projectId,
      keywords,
      competitors,
      industry,
      targetAudience,
      businessType,
      location,
    } = req.body;

    if (!clientId && !projectId) {
      return res.status(400).json({
        success: false,
        error: 'Either clientId or projectId is required',
      });
    }

    const analysis = await analyzeKeywords({
      clientId,
      projectId,
      keywords,
      competitors,
      industry,
      targetAudience,
      businessType,
      location,
    });

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Error generating keyword analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate keyword analysis',
    });
  }
});

/**
 * GET /api/keyword-analysis/project/:projectId
 * Get all keyword analyses for a project
 */
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const analyses = await getKeywordAnalysesByProject(projectId);

    res.json({
      success: true,
      data: analyses,
    });
  } catch (error) {
    console.error('Error fetching keyword analyses:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch keyword analyses',
    });
  }
});

/**
 * GET /api/keyword-analysis/:id
 * Get a specific keyword analysis by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const analysis = await getKeywordAnalysisById(id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Keyword analysis not found',
      });
    }

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Error fetching keyword analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch keyword analysis',
    });
  }
});

/**
 * DELETE /api/keyword-analysis/:id
 * Delete a keyword analysis
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteKeywordAnalysis(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Keyword analysis not found',
      });
    }

    res.json({
      success: true,
      message: 'Keyword analysis deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting keyword analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete keyword analysis',
    });
  }
});

export default router;
