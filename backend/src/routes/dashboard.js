import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

// GET /api/dashboard/:projectId - Get comprehensive dashboard data
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get project
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const project = projectResult.rows[0];
    const clientId = project.client_id;

    // Get client
    const clientResult = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [clientId]
    );
    const client = clientResult.rows[0] || {};

    // Get SEO strategy
    const seoResult = await pool.query(
      'SELECT * FROM seo_strategies WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1',
      [projectId]
    );
    const seoStrategy = seoResult.rows[0];

    // Get Google Ads strategy
    const googleAdsResult = await pool.query(
      'SELECT * FROM google_ads_strategies WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1',
      [projectId]
    );
    const googleAdsStrategy = googleAdsResult.rows[0];

    // Get Facebook Ads strategy
    const facebookAdsResult = await pool.query(
      'SELECT * FROM facebook_ads_strategies WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1',
      [projectId]
    );
    const facebookAdsStrategy = facebookAdsResult.rows[0];

    // Calculate metrics
    const contentCalendar = seoStrategy?.content_calendar || [];
    const totalArticlesPlanned = contentCalendar.reduce((sum, month) => 
      sum + (month.priority_pieces?.length || 0), 0
    );

    // Get generated content count
    const contentResult = await pool.query(
      'SELECT COUNT(*) as count FROM content WHERE project_id = $1 AND content_type = $2',
      [projectId, 'blog']
    );
    const articlesGenerated = parseInt(contentResult.rows[0]?.count || 0);

    // Get published content count (assuming status field or published_at)
    const publishedResult = await pool.query(
      'SELECT COUNT(*) as count FROM content WHERE project_id = $1 AND content_type = $2 AND status = $3',
      [projectId, 'blog', 'published']
    );
    const articlesPublished = parseInt(publishedResult.rows[0]?.count || 0);

    // Build dashboard response
    const dashboard = {
      project: {
        id: project.id,
        name: project.project_name,
        business_types: client.business_types || ['general'],
        primary_business_type: client.primary_business_type || 'general',
        created_at: project.created_at,
        updated_at: project.updated_at,
      },
      strategies: {
        seo: seoStrategy ? {
          id: seoStrategy.id,
          status: 'active',
          created_at: seoStrategy.created_at,
          updated_at: seoStrategy.updated_at,
          metrics: {
            articles_planned: totalArticlesPlanned,
            articles_generated: articlesGenerated,
            articles_published: articlesPublished,
            expected_traffic: seoStrategy?.executive_summary ? '10,000+' : null,
            expected_revenue: null,
          },
        } : null,
        google_ads: googleAdsStrategy ? {
          id: googleAdsStrategy.id,
          status: 'active',
          created_at: googleAdsStrategy.created_at,
          updated_at: googleAdsStrategy.updated_at,
          metrics: {
            estimated_monthly_budget: googleAdsStrategy.budget_allocation?.[0]?.monthly_budget || 0,
            estimated_monthly_clicks: 1000,
            estimated_monthly_conversions: 50,
            estimated_roi: 300,
          },
        } : null,
        facebook_ads: facebookAdsStrategy ? {
          id: facebookAdsStrategy.id,
          status: 'active',
          created_at: facebookAdsStrategy.created_at,
          updated_at: facebookAdsStrategy.updated_at,
          metrics: {
            estimated_monthly_budget: 2000,
            estimated_monthly_reach: 50000,
            estimated_monthly_conversions: 100,
            estimated_cost_per_result: 20,
          },
        } : null,
      },
      summary: {
        total_articles_planned: totalArticlesPlanned,
        total_articles_generated: articlesGenerated,
        total_articles_published: articlesPublished,
        total_expected_traffic: 10000,
        total_expected_conversions: 150,
        total_expected_revenue: 5000,
      },
    };

    res.json({ success: true, data: dashboard });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

