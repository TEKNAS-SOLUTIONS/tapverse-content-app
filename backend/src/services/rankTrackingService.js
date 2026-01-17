import pool from '../db/index.js';

/**
 * Rank Tracking Service
 * Tracks keyword rankings over time with month-on-month comparisons
 */

/**
 * Ensure keyword_rankings table exists
 */
export async function ensureRankingsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS keyword_rankings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        keyword VARCHAR(255) NOT NULL,
        url VARCHAR(500),
        position INTEGER,
        previous_position INTEGER,
        change INTEGER DEFAULT 0,
        search_volume INTEGER,
        cpc DECIMAL(10, 2),
        tracked_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_id, keyword, tracked_date)
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_rankings_client_id ON keyword_rankings(client_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_rankings_keyword ON keyword_rankings(keyword)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_rankings_tracked_date ON keyword_rankings(tracked_date)
    `);
  } catch (error) {
    console.error('Error ensuring rankings table:', error);
    throw error;
  }
}

/**
 * Record keyword ranking
 */
export async function recordRanking(rankingData) {
  const {
    clientId,
    projectId,
    keyword,
    url,
    position,
    searchVolume,
    cpc,
    trackedDate = new Date().toISOString().split('T')[0],
  } = rankingData;

  if (!clientId || !keyword) {
    throw new Error('Client ID and keyword are required');
  }

  // Get previous ranking
  const previousResult = await pool.query(`
    SELECT position FROM keyword_rankings
    WHERE client_id = $1 AND keyword = $2
    ORDER BY tracked_date DESC
    LIMIT 1
  `, [clientId, keyword]);

  const previousPosition = previousResult.rows[0]?.position || null;
  const change = previousPosition ? position - previousPosition : 0;

  const result = await pool.query(`
    INSERT INTO keyword_rankings (
      client_id, project_id, keyword, url, position,
      previous_position, change, search_volume, cpc, tracked_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (client_id, keyword, tracked_date)
    DO UPDATE SET
      position = EXCLUDED.position,
      previous_position = EXCLUDED.previous_position,
      change = EXCLUDED.change,
      url = EXCLUDED.url,
      search_volume = EXCLUDED.search_volume,
      cpc = EXCLUDED.cpc
    RETURNING *
  `, [
    clientId,
    projectId || null,
    keyword,
    url || null,
    position,
    previousPosition,
    change,
    searchVolume || null,
    cpc || null,
    trackedDate,
  ]);

  return result.rows[0];
}

/**
 * Get rankings for a client
 */
export async function getRankingsByClient(clientId, filters = {}) {
  let query = `
    SELECT * FROM keyword_rankings
    WHERE client_id = $1
  `;
  const params = [clientId];
  let paramIndex = 2;

  if (filters.keyword) {
    query += ` AND keyword = $${paramIndex}`;
    params.push(filters.keyword);
    paramIndex++;
  }

  if (filters.startDate) {
    query += ` AND tracked_date >= $${paramIndex}`;
    params.push(filters.startDate);
    paramIndex++;
  }

  if (filters.endDate) {
    query += ` AND tracked_date <= $${paramIndex}`;
    params.push(filters.endDate);
    paramIndex++;
  }

  query += ' ORDER BY tracked_date DESC, keyword ASC';

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get month-on-month ranking trends
 */
export async function getRankingTrends(clientId, months = 6) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const result = await pool.query(`
    SELECT 
      keyword,
      tracked_date,
      position,
      previous_position,
      change,
      search_volume,
      cpc
    FROM keyword_rankings
    WHERE client_id = $1
      AND tracked_date >= $2
      AND tracked_date <= $3
    ORDER BY keyword, tracked_date ASC
  `, [clientId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);

  // Group by keyword
  const trends = {};
  for (const row of result.rows) {
    if (!trends[row.keyword]) {
      trends[row.keyword] = [];
    }
    trends[row.keyword].push({
      date: row.tracked_date,
      position: row.position,
      change: row.change,
      searchVolume: row.search_volume,
      cpc: row.cpc,
    });
  }

  return trends;
}

/**
 * Get ranking summary statistics
 */
export async function getRankingSummary(clientId) {
  const result = await pool.query(`
    SELECT 
      COUNT(DISTINCT keyword) as total_keywords,
      COUNT(*) FILTER (WHERE position <= 10) as top_10_count,
      COUNT(*) FILTER (WHERE position <= 3) as top_3_count,
      AVG(position) FILTER (WHERE position IS NOT NULL) as avg_position,
      SUM(change) FILTER (WHERE change > 0) as total_improvements,
      SUM(change) FILTER (WHERE change < 0) as total_declines
    FROM keyword_rankings
    WHERE client_id = $1
      AND tracked_date >= CURRENT_DATE - INTERVAL '30 days'
  `, [clientId]);

  return result.rows[0] || {};
}

// Ensure table exists on import
ensureRankingsTable().catch(console.error);

export default {
  ensureRankingsTable,
  recordRanking,
  getRankingsByClient,
  getRankingTrends,
  getRankingSummary,
};
