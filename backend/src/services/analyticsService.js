import pool from '../db/index.js';

/**
 * Analytics Service
 * Tracks and analyzes content performance
 */

/**
 * Record analytics data
 */
export async function recordAnalytics(analyticsData) {
  try {
    const {
      contentId,
      projectId,
      clientId,
      scheduleId,
      platform,
      contentType,
      metrics = {},
      dateFrom,
      dateTo
    } = analyticsData;

    if (!projectId || !clientId || !platform || !contentType) {
      throw new Error('Missing required fields');
    }

    const result = await pool.query(`
      INSERT INTO content_analytics (
        content_id, project_id, client_id, schedule_id, platform, content_type,
        views, impressions, clicks, likes, comments, shares, saves,
        sent_count, delivered_count, opened_count, clicked_count,
        conversions, conversion_value,
        date_from, date_to
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `, [
      contentId || null,
      projectId,
      clientId,
      scheduleId || null,
      platform,
      contentType,
      metrics.views || 0,
      metrics.impressions || 0,
      metrics.clicks || 0,
      metrics.likes || 0,
      metrics.comments || 0,
      metrics.shares || 0,
      metrics.saves || 0,
      metrics.sentCount || 0,
      metrics.deliveredCount || 0,
      metrics.openedCount || 0,
      metrics.clickedCount || 0,
      metrics.conversions || 0,
      metrics.conversionValue || 0,
      dateFrom || new Date(),
      dateTo || new Date()
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error recording analytics:', error);
    throw error;
  }
}

/**
 * Get analytics for a project
 */
export async function getProjectAnalytics(projectId, dateRange = {}) {
  try {
    const { startDate, endDate } = dateRange;
    let query = `
      SELECT 
        platform,
        content_type,
        SUM(views) as total_views,
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        SUM(likes) as total_likes,
        SUM(comments) as total_comments,
        SUM(shares) as total_shares,
        SUM(saves) as total_saves,
        SUM(sent_count) as total_sent,
        SUM(opened_count) as total_opened,
        SUM(clicked_count) as total_clicked,
        SUM(conversions) as total_conversions,
        SUM(conversion_value) as total_conversion_value,
        COUNT(*) as content_count
      FROM content_analytics
      WHERE project_id = $1
    `;
    const params = [projectId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      query += ` AND date_from >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND date_to <= $${paramCount}`;
      params.push(endDate);
    }

    query += ' GROUP BY platform, content_type ORDER BY platform, content_type';

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    throw error;
  }
}

/**
 * Get analytics for a client
 */
export async function getClientAnalytics(clientId, dateRange = {}) {
  try {
    const { startDate, endDate } = dateRange;
    let query = `
      SELECT 
        platform,
        content_type,
        SUM(views) as total_views,
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        SUM(likes) as total_likes,
        SUM(comments) as total_comments,
        SUM(shares) as total_shares,
        SUM(saves) as total_saves,
        SUM(sent_count) as total_sent,
        SUM(opened_count) as total_opened,
        SUM(clicked_count) as total_clicked,
        SUM(conversions) as total_conversions,
        SUM(conversion_value) as total_conversion_value,
        COUNT(*) as content_count
      FROM content_analytics
      WHERE client_id = $1
    `;
    const params = [clientId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      query += ` AND date_from >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND date_to <= $${paramCount}`;
      params.push(endDate);
    }

    query += ' GROUP BY platform, content_type ORDER BY platform, content_type';

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching client analytics:', error);
    throw error;
  }
}

/**
 * Get top performing content
 */
export async function getTopPerformingContent(projectId, limit = 10, metric = 'views') {
  try {
    const validMetrics = ['views', 'clicks', 'likes', 'shares', 'conversions'];
    const orderBy = validMetrics.includes(metric) ? metric : 'views';

    const result = await pool.query(`
      SELECT 
        ca.*,
        c.content_type as original_content_type,
        c.content
      FROM content_analytics ca
      LEFT JOIN content c ON ca.content_id = c.id
      WHERE ca.project_id = $1
      ORDER BY ca.${orderBy} DESC
      LIMIT $2
    `, [projectId, limit]);

    return result.rows;
  } catch (error) {
    console.error('Error fetching top performing content:', error);
    throw error;
  }
}

/**
 * Get analytics summary for dashboard
 */
export async function getAnalyticsSummary(clientId, projectId = null, period = 'monthly') {
  try {
    const periodType = period === 'daily' ? 'daily' : period === 'weekly' ? 'weekly' : 'monthly';
    
    // Calculate period dates
    const now = new Date();
    let periodStart, periodEnd;
    
    if (periodType === 'daily') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 1);
    } else if (periodType === 'weekly') {
      const dayOfWeek = now.getDay();
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - dayOfWeek);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 7);
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    let query = `
      SELECT 
        COUNT(DISTINCT ca.content_id) as total_content,
        SUM(ca.views) as total_views,
        SUM(ca.impressions) as total_impressions,
        SUM(ca.clicks) as total_clicks,
        SUM(ca.likes + ca.comments + ca.shares) as total_engagement,
        SUM(ca.conversions) as total_conversions,
        SUM(ca.conversion_value) as total_conversion_value,
        COUNT(DISTINCT ca.platform) as platform_count
      FROM content_analytics ca
      WHERE ca.client_id = $1
        AND ca.date_from >= $2
        AND ca.date_to < $3
    `;
    const params = [clientId, periodStart, periodEnd];
    let paramCount = 3;

    if (projectId) {
      paramCount++;
      query += ` AND ca.project_id = $${paramCount}`;
      params.push(projectId);
    }

    const result = await pool.query(query, params);
    const summary = result.rows[0] || {
      total_content: 0,
      total_views: 0,
      total_impressions: 0,
      total_clicks: 0,
      total_engagement: 0,
      total_conversions: 0,
      total_conversion_value: 0,
      platform_count: 0
    };

    // Calculate rates
    summary.engagement_rate = summary.total_impressions > 0
      ? ((summary.total_engagement / summary.total_impressions) * 100).toFixed(2)
      : 0;
    summary.click_through_rate = summary.total_impressions > 0
      ? ((summary.total_clicks / summary.total_impressions) * 100).toFixed(2)
      : 0;

    return summary;
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    throw error;
  }
}

/**
 * Get platform breakdown
 */
export async function getPlatformBreakdown(clientId, projectId = null, dateRange = {}) {
  try {
    let query = `
      SELECT 
        platform,
        COUNT(*) as content_count,
        SUM(views) as total_views,
        SUM(clicks) as total_clicks,
        SUM(likes + comments + shares) as total_engagement,
        AVG(CASE WHEN impressions > 0 THEN (clicks::float / impressions) * 100 ELSE 0 END) as avg_ctr
      FROM content_analytics
      WHERE client_id = $1
    `;
    const params = [clientId];
    let paramCount = 1;

    if (projectId) {
      paramCount++;
      query += ` AND project_id = $${paramCount}`;
      params.push(projectId);
    }

    if (dateRange.startDate) {
      paramCount++;
      query += ` AND date_from >= $${paramCount}`;
      params.push(dateRange.startDate);
    }

    if (dateRange.endDate) {
      paramCount++;
      query += ` AND date_to <= $${paramCount}`;
      params.push(dateRange.endDate);
    }

    query += ' GROUP BY platform ORDER BY total_views DESC';

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching platform breakdown:', error);
    throw error;
  }
}

