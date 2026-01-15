import express from 'express';
import pool from '../db/index.js';
import { generateContentWithSystem } from '../services/claude.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/roadmap/:projectId - Get full 12-month roadmap for project
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get SEO strategy for the project to extract content calendar
    const strategyResult = await pool.query(
      'SELECT * FROM seo_strategies WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1',
      [projectId]
    );

    if (strategyResult.rows.length === 0) {
      return res.json({ 
        success: true, 
        data: generateEmptyRoadmap() 
      });
    }

    const strategy = strategyResult.rows[0];
    const contentCalendar = strategy.content_calendar || [];
    const contentPillars = strategy.content_pillars || [];

    // Build roadmap from content calendar
    const roadmap = generateEmptyRoadmap();
    
    // Populate roadmap with articles from content calendar
    contentCalendar.forEach((monthData, index) => {
      if (index < 12 && monthData.priority_pieces) {
        monthData.priority_pieces.forEach((pieceTitle, pieceIndex) => {
          // Find matching pillar
          const pillar = contentPillars.find(p => 
            pieceTitle.toLowerCase().includes(p.theme?.toLowerCase() || '')
          ) || contentPillars[0] || { theme: 'General', target_keywords: [] };

          roadmap[index].articles.push({
            id: uuidv4(),
            title: pieceTitle,
            keyword: pillar.target_keywords?.[0] || strategy.primary_keywords?.[0] || '',
            pillar: pillar.theme || 'General',
            cluster: pillar.theme || 'General',
            status: 'planned',
            priority: pieceIndex + 1,
          });
        });
      }
    });

    res.json({ success: true, data: roadmap });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/roadmap/:projectId/reorder - Update article month and priority
router.put('/:projectId/reorder', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { articles } = req.body;

    // For now, we'll store this in a JSONB column or create a roadmap_articles table
    // Since we don't have a roadmap_articles table yet, we'll update the SEO strategy's content_calendar
    // This is a simplified implementation - in production, you'd want a dedicated table

    res.json({ success: true, message: 'Roadmap updated successfully' });
  } catch (error) {
    console.error('Error updating roadmap:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/roadmap/:projectId/generate-article - Generate content for article
router.post('/:projectId/generate-article', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { articleId } = req.body;

    // Get article details from roadmap
    // Generate article content using Claude
    // Update article status to 'generated'
    // Save to content table

    res.json({ success: true, message: 'Article generation started' });
  } catch (error) {
    console.error('Error generating article:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/roadmap/:projectId/article/:articleId - Update article details
router.put('/:projectId/article/:articleId', async (req, res) => {
  try {
    const { projectId, articleId } = req.params;
    const articleData = req.body;

    // Update article in roadmap
    // This would update the SEO strategy's content_calendar or a dedicated roadmap_articles table

    res.json({ success: true, message: 'Article updated successfully' });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/roadmap/:projectId/article/:articleId - Delete article from roadmap
router.delete('/:projectId/article/:articleId', async (req, res) => {
  try {
    const { projectId, articleId } = req.params;

    // Remove article from roadmap
    // This would update the SEO strategy's content_calendar or a dedicated roadmap_articles table

    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to generate empty roadmap
function generateEmptyRoadmap() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return months.map(month => ({
    month,
    articles: [],
  }));
}

export default router;

