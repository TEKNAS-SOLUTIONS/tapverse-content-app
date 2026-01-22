import pool from '../db/index.js';
import { generateContentWithSystem } from './claude.js';

/**
 * Monthly Report Service
 * Generates comprehensive monthly reports for clients
 */

/**
 * Ensure monthly_reports table exists
 */
export async function ensureReportsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS monthly_reports (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
        report_month DATE NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
        content_included JSONB DEFAULT '[]',
        content_excluded JSONB DEFAULT '[]',
        report_data JSONB,
        pdf_path TEXT,
        sent_to_client BOOLEAN DEFAULT FALSE,
        sent_at TIMESTAMP,
        client_notes TEXT,
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'sent'))
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_client_id ON monthly_reports(client_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_month ON monthly_reports(report_month)
    `);
  } catch (error) {
    console.error('Error ensuring reports table:', error);
    throw error;
  }
}

/**
 * Generate monthly report data
 */
export async function generateMonthlyReport(clientId, reportMonth, options = {}) {
  const {
    includeDraft = false,
    includeRejected = false,
    customNotes = '',
  } = options;

  // Get date range for the month
  const monthStart = new Date(reportMonth);
  monthStart.setDate(1);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  monthEnd.setDate(0);

  // Get client data
  const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
  if (clientResult.rows.length === 0) {
    throw new Error('Client not found');
  }
  const client = clientResult.rows[0];

  // Get published content
  const publishedContent = await pool.query(`
    SELECT c.*, p.project_name
    FROM content c
    LEFT JOIN projects p ON c.project_id = p.id
    WHERE p.client_id = $1
      AND c.status = 'published'
      AND c.published_at >= $2
      AND c.published_at < $3
    ORDER BY c.published_at DESC
  `, [clientId, monthStart.toISOString(), monthEnd.toISOString()]);

  // Get scheduled content
  const scheduledContent = await pool.query(`
    SELECT c.*, p.project_name
    FROM content c
    LEFT JOIN projects p ON c.project_id = p.id
    WHERE p.client_id = $1
      AND c.status = 'scheduled'
      AND c.created_at >= $2
      AND c.created_at < $3
    ORDER BY c.created_at DESC
  `, [clientId, monthStart.toISOString(), monthEnd.toISOString()]);

  // Get approved content (if manager selected)
  const approvedContent = await pool.query(`
    SELECT c.*, p.project_name
    FROM content c
    LEFT JOIN projects p ON c.project_id = p.id
    WHERE p.client_id = $1
      AND c.status = 'approved'
      AND c.created_at >= $2
      AND c.created_at < $3
    ORDER BY c.created_at DESC
  `, [clientId, monthStart.toISOString(), monthEnd.toISOString()]);

  // Get ranking data
  const rankingsResult = await pool.query(`
    SELECT 
      keyword,
      position,
      change,
      tracked_date
    FROM keyword_rankings
    WHERE client_id = $1
      AND tracked_date >= $2
      AND tracked_date < $3
    ORDER BY tracked_date DESC
  `, [clientId, monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]]);

  // Get tasks completed
  const tasksResult = await pool.query(`
    SELECT *
    FROM tasks
    WHERE client_id = $1
      AND status = 'completed'
      AND completed_at >= $2
      AND completed_at < $3
    ORDER BY completed_at DESC
  `, [clientId, monthStart.toISOString(), monthEnd.toISOString()]);

  // Get keyword analysis summary
  const keywordSummary = await pool.query(`
    SELECT 
      COUNT(DISTINCT keyword) as total_keywords,
      COUNT(*) FILTER (WHERE position <= 10) as top_10,
      COUNT(*) FILTER (WHERE position <= 3) as top_3,
      AVG(position) FILTER (WHERE position IS NOT NULL) as avg_position
    FROM keyword_rankings
    WHERE client_id = $1
      AND tracked_date >= $2
      AND tracked_date < $3
  `, [clientId, monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]]);

  // Generate AI summary
  const reportData = {
    client: {
      id: client.id,
      companyName: client.company_name,
      industry: client.industry,
    },
    month: reportMonth,
    content: {
      published: publishedContent.rows,
      scheduled: scheduledContent.rows,
      approved: includeDraft ? approvedContent.rows : [],
    },
    rankings: rankingsResult.rows,
    tasks: tasksResult.rows,
    keywordSummary: keywordSummary.rows[0] || {},
    metrics: {
      totalContentPublished: publishedContent.rows.length,
      totalContentScheduled: scheduledContent.rows.length,
      totalKeywordsTracked: keywordSummary.rows[0]?.total_keywords || 0,
      top10Keywords: keywordSummary.rows[0]?.top_10 || 0,
      top3Keywords: keywordSummary.rows[0]?.top_3 || 0,
      tasksCompleted: tasksResult.rows.length,
    },
  };

  // Generate AI executive summary
  const executiveSummary = await generateExecutiveSummary(reportData);

  return {
    ...reportData,
    executiveSummary,
    customNotes,
  };
}

/**
 * Generate executive summary using AI
 */
async function generateExecutiveSummary(reportData) {
  const systemPrompt = `You are an expert SEO and content marketing analyst. Create a professional executive summary for a monthly client report.`;

  const userPrompt = `Create an executive summary for ${reportData.client.companyName}'s monthly report for ${reportData.month}.

Key Metrics:
- Content Published: ${reportData.metrics.totalContentPublished}
- Content Scheduled: ${reportData.metrics.totalContentScheduled}
- Keywords Tracked: ${reportData.metrics.totalKeywordsTracked}
- Top 10 Rankings: ${reportData.metrics.top10Keywords}
- Top 3 Rankings: ${reportData.metrics.top3Keywords}
- Tasks Completed: ${reportData.metrics.tasksCompleted}

Ranking Changes:
${reportData.rankings.slice(0, 10).map(r => `- ${r.keyword}: Position ${r.position} (${r.change > 0 ? '+' : ''}${r.change})`).join('\n')}

Provide a concise, professional executive summary (3-4 paragraphs) highlighting:
1. Overall performance this month
2. Key achievements
3. Notable improvements or concerns
4. Recommendations for next month

Format as plain text, no markdown.`;

  try {
    const summary = await generateContentWithSystem(systemPrompt, userPrompt, {
      maxTokens: 1000,
    });
    return summary;
  } catch (error) {
    console.error('Error generating executive summary:', error);
    return 'Executive summary generation failed. Please review the metrics manually.';
  }
}

/**
 * Save monthly report
 */
export async function saveMonthlyReport(reportData, generatedBy) {
  const {
    clientId,
    reportMonth,
    contentIncluded = [],
    contentExcluded = [],
    reportData: fullReportData,
    status = 'draft',
  } = reportData;

  const result = await pool.query(`
    INSERT INTO monthly_reports (
      client_id, report_month, generated_by,
      content_included, content_excluded, report_data, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [
    clientId,
    reportMonth,
    generatedBy,
    JSON.stringify(contentIncluded),
    JSON.stringify(contentExcluded),
    JSON.stringify(fullReportData),
    status,
  ]);

  return result.rows[0];
}

/**
 * Get monthly reports for a client
 */
export async function getMonthlyReportsByClient(clientId) {
  const result = await pool.query(`
    SELECT * FROM monthly_reports
    WHERE client_id = $1
    ORDER BY report_month DESC
  `, [clientId]);

  return result.rows;
}

/**
 * Get monthly report by ID
 */
export async function getMonthlyReportById(reportId) {
  const result = await pool.query(
    'SELECT * FROM monthly_reports WHERE id = $1',
    [reportId]
  );

  return result.rows[0] || null;
}

/**
 * Update monthly report
 */
export async function updateMonthlyReport(reportId, updates) {
  const allowedFields = ['status', 'content_included', 'content_excluded', 'client_notes', 'sent_to_client'];
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      if (field === 'content_included' || field === 'content_excluded') {
        updateFields.push(`${field} = $${paramIndex}::jsonb`);
        values.push(JSON.stringify(updates[field]));
      } else {
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
      }
      paramIndex++;
    }
  }

  if (updates.sent_to_client) {
    updateFields.push('sent_at = CURRENT_TIMESTAMP');
  }

  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(reportId);

  const result = await pool.query(`
    UPDATE monthly_reports
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `, values);

  return result.rows[0];
}

// Ensure table exists on import
ensureReportsTable().catch(console.error);

export default {
  ensureReportsTable,
  generateMonthlyReport,
  saveMonthlyReport,
  getMonthlyReportsByClient,
  getMonthlyReportById,
  updateMonthlyReport,
};
