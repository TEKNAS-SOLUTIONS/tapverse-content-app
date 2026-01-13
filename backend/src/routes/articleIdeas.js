import express from 'express';
import {
  generateArticleIdeas,
  generateArticleFromIdea,
  refreshTrendingTopics,
} from '../services/articleIdeasService.js';
import {
  getClientById,
  getProjectById,
  createArticleIdea,
  getArticleIdeasByClient,
  getArticleIdeasByProject,
  getArticleIdeaById,
  updateArticleIdea,
  deleteArticleIdea,
  bulkCreateArticleIdeas,
} from '../db/queries.js';
import { query } from '../db/index.js';

const router = express.Router();

/**
 * Generate new article ideas for a client
 * POST /api/article-ideas/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { client_id, project_id, count = 10 } = req.body;

    if (!client_id) {
      return res.status(400).json({
        success: false,
        error: 'client_id is required',
      });
    }

    // Get client data
    const client = await getClientById(client_id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Get project data if provided
    let project = null;
    if (project_id) {
      project = await getProjectById(project_id);
    }

    // Generate ideas using AI
    const result = await generateArticleIdeas(client, project, { count });

    // Save ideas to database
    const savedIdeas = await bulkCreateArticleIdeas(
      client_id,
      project_id,
      result.ideas.map(idea => ({
        title: idea.title,
        primary_keyword: idea.primaryKeyword,
        secondary_keywords: idea.secondaryKeywords || [],
        search_intent: idea.searchIntent,
        estimated_search_volume: idea.estimatedSearchVolume,
        estimated_difficulty: idea.estimatedDifficulty,
        trending_score: idea.trendingScore || 0,
        competitor_gap_score: idea.competitorGapScore || 0,
        content_type: idea.contentType,
        unique_angle: idea.uniqueAngle,
        outline: idea.outline,
        target_featured_snippet: idea.targetFeaturedSnippet,
        idea_source: idea.ideaSource,
        source_details: idea.sourceDetails,
        status: 'pending',
      }))
    );

    res.json({
      success: true,
      data: {
        ideas: savedIdeas,
        strategyInsights: result.strategyInsights,
        competitorAnalysis: result.competitorAnalysis,
        trendingTopics: result.trendingTopics,
      },
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
 * Get all article ideas for a client
 * GET /api/article-ideas/client/:client_id
 */
router.get('/client/:client_id', async (req, res) => {
  try {
    const { client_id } = req.params;
    const ideas = await getArticleIdeasByClient(client_id);
    
    res.json({
      success: true,
      data: ideas,
    });
  } catch (error) {
    console.error('Error fetching article ideas:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get all article ideas for a project
 * GET /api/article-ideas/project/:project_id
 */
router.get('/project/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;
    const ideas = await getArticleIdeasByProject(project_id);
    
    res.json({
      success: true,
      data: ideas,
    });
  } catch (error) {
    console.error('Error fetching article ideas:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Generate full article from a selected idea
 * POST /api/article-ideas/:id/generate-article
 */
router.post('/:id/generate-article', async (req, res) => {
  try {
    const { id } = req.params;
    const { project_id } = req.body;

    // Get the idea
    const idea = await getArticleIdeaById(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Article idea not found',
      });
    }

    // Get the client
    const client = await getClientById(idea.client_id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Get project if provided
    let project = null;
    if (project_id) {
      project = await getProjectById(project_id);
    }

    // Update idea status to generating
    await updateArticleIdea(id, { status: 'generating', project_id });

    // Generate the full article
    const article = await generateArticleFromIdea(idea, client, project);

    // Save the content to database
    const contentResult = await query(
      `INSERT INTO content (
        project_id, content_type, title, content, 
        meta_description, keywords, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        project_id || idea.project_id,
        'blog',
        article.title,
        article.content,
        article.meta_description,
        article.keywords,
        'ready',
      ]
    );

    const savedContent = contentResult.rows[0];

    // Update idea status to generated and link content
    await updateArticleIdea(id, { 
      status: 'generated', 
      generated_content_id: savedContent.id,
    });

    res.json({
      success: true,
      data: {
        content: savedContent,
        idea: await getArticleIdeaById(id),
      },
    });
  } catch (error) {
    console.error('Error generating article from idea:', error);
    
    // Update idea status to failed
    try {
      await updateArticleIdea(req.params.id, { status: 'pending' });
    } catch (e) {
      console.error('Failed to reset idea status:', e);
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Update article idea status
 * PATCH /api/article-ideas/:id
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, project_id } = req.body;

    const updated = await updateArticleIdea(id, { status, project_id });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Article idea not found',
      });
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating article idea:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Delete an article idea
 * DELETE /api/article-ideas/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteArticleIdea(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Article idea not found',
      });
    }

    res.json({
      success: true,
      data: deleted,
    });
  } catch (error) {
    console.error('Error deleting article idea:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Refresh trending topics for an industry
 * POST /api/article-ideas/trending
 */
router.post('/trending', async (req, res) => {
  try {
    const { industry, keywords = [] } = req.body;

    if (!industry) {
      return res.status(400).json({
        success: false,
        error: 'industry is required',
      });
    }

    const trendingTopics = await refreshTrendingTopics(industry, keywords);

    res.json({
      success: true,
      data: trendingTopics,
    });
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

