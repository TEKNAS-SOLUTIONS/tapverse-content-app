import express from 'express';
import {
  generateBlogContent,
  generateLinkedInPost,
  generateGoogleAdsCopy,
  generateFacebookAdsCopy,
  generateArticleIdeas,
} from '../services/contentGeneration.js';
import { getProjectById, getClientById } from '../db/queries.js';
import { query } from '../db/index.js';
import {
  calculateSEOScore,
  calculateReadabilityScore,
  getAISearchOptimizationNotes,
  calculateStatistics,
} from '../services/seoScoreService.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper function to get project with client data
 */
async function getProjectWithClient(project_id) {
  const project = await getProjectById(project_id);
  if (!project) return null;
  
  const client = await getClientById(project.client_id);
  return { project, client };
}

/**
 * Generate blog content for a project
 * POST /api/content/generate/blog
 */
router.post('/generate/blog', async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        error: 'project_id is required',
      });
    }

    // Get project and client data
    const data = await getProjectWithClient(project_id);
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const { project, client } = data;

    // Generate blog content with client context for brand voice
    const blogContent = await generateBlogContent(project, client);

    // Save to database
    const result = await query(
      `INSERT INTO content (
        project_id, content_type, title, content, 
        meta_description, keywords, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        project_id,
        'blog',
        blogContent.title,
        blogContent.content,
        blogContent.meta_description,
        blogContent.keywords,
        blogContent.status || 'ready',
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
      keywordStrategy: blogContent.keywordStrategy, // Include strategy for frontend display
    });
  } catch (error) {
    console.error('Error generating blog content:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Generate LinkedIn post for a project
 * POST /api/content/generate/linkedin
 */
router.post('/generate/linkedin', async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        error: 'project_id is required',
      });
    }

    // Get project and client data
    const data = await getProjectWithClient(project_id);
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const { project, client } = data;

    // Generate LinkedIn post with brand context
    const linkedInContent = await generateLinkedInPost(project, client);

    // Save to database
    const result = await query(
      `INSERT INTO content (
        project_id, content_type, content, platform, status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        project_id,
        'linkedin',
        linkedInContent.content,
        linkedInContent.platform,
        linkedInContent.status || 'ready',
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error generating LinkedIn post:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Generate Google Ads copy for a project
 * POST /api/content/generate/google-ads
 */
router.post('/generate/google-ads', async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        error: 'project_id is required',
      });
    }

    // Get project and client data
    const data = await getProjectWithClient(project_id);
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const { project, client } = data;

    // Generate Google Ads copy with brand context
    const adsContent = await generateGoogleAdsCopy(project, client);

    // Save to database (save all headlines and descriptions as JSON in body_text)
    const result = await query(
      `INSERT INTO ads (
        project_id, ad_type, platform, headline, 
        body_text, cta_text, target_keywords, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        project_id,
        adsContent.ad_type,
        adsContent.platform,
        adsContent.headline,
        JSON.stringify({
          headlines: adsContent.headlines,
          descriptions: adsContent.descriptions,
          adVariations: adsContent.adVariations,
          strategy: adsContent.strategy,
        }),
        adsContent.cta_text,
        adsContent.target_keywords,
        adsContent.status || 'ready',
      ]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        headlines: adsContent.headlines,
        descriptions: adsContent.descriptions,
        adVariations: adsContent.adVariations,
      },
    });
  } catch (error) {
    console.error('Error generating Google Ads copy:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Generate Facebook Ads copy for a project
 * POST /api/content/generate/facebook-ads
 */
router.post('/generate/facebook-ads', async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        error: 'project_id is required',
      });
    }

    // Get project and client data
    const data = await getProjectWithClient(project_id);
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const { project, client } = data;

    // Generate Facebook Ads copy with brand context
    const adsContent = await generateFacebookAdsCopy(project, client);

    // Save to database
    const result = await query(
      `INSERT INTO ads (
        project_id, ad_type, platform, headline, 
        body_text, cta_text, target_keywords, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        project_id,
        adsContent.ad_type,
        adsContent.platform,
        adsContent.headline,
        JSON.stringify({
          hook: adsContent.hook,
          adVariations: adsContent.adVariations,
          creativeSuggestions: adsContent.creativeSuggestions,
          audienceSuggestions: adsContent.audienceSuggestions,
        }),
        adsContent.cta_text,
        adsContent.target_keywords,
        adsContent.status || 'ready',
      ]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        hook: adsContent.hook,
        adVariations: adsContent.adVariations,
        creativeSuggestions: adsContent.creativeSuggestions,
        audienceSuggestions: adsContent.audienceSuggestions,
      },
    });
  } catch (error) {
    console.error('Error generating Facebook Ads copy:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Generate article ideas for a project
 * POST /api/content/generate/ideas
 */
router.post('/generate/ideas', async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        error: 'project_id is required',
      });
    }

    // Get project and client data
    const data = await getProjectWithClient(project_id);
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const { project, client } = data;

    // Generate article ideas
    const ideas = await generateArticleIdeas(project, client);

    res.json({
      success: true,
      data: ideas,
    });
  } catch (error) {
    console.error('Error generating article ideas:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get content by project ID
 * GET /api/content/project/:project_id
 */
router.get('/project/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;

    const result = await query(
      'SELECT * FROM content WHERE project_id = $1 ORDER BY created_at DESC',
      [project_id]
    );

    // Calculate SEO scores and statistics for each content item
    const contentWithScores = result.rows.map(article => {
      const seoScore = calculateSEOScore(article);
      const readabilityScore = calculateReadabilityScore(article);
      const statistics = calculateStatistics(article);
      const aiSearchNotes = getAISearchOptimizationNotes(article);

      return {
        ...article,
        seo_score: seoScore,
        readability_score: readabilityScore,
        statistics,
        ai_search_notes: aiSearchNotes,
      };
    });

    res.json({
      success: true,
      data: contentWithScores,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get ads by project ID
 * GET /api/content/ads/:project_id
 */
router.get('/ads/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;

    const result = await query(
      'SELECT * FROM ads WHERE project_id = $1 ORDER BY created_at DESC',
      [project_id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
