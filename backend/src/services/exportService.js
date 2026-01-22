import pool from '../db/index.js';

/**
 * Export Service
 * Handles data export in various formats (CSV, Excel, PDF, JSON)
 */

/**
 * Export keywords data
 */
export async function exportKeywords(clientId, projectId, format = 'csv') {
  // Get keyword analysis data
  let query = `
    SELECT ka.*, c.company_name, p.project_name
    FROM keyword_analyses ka
    LEFT JOIN clients c ON ka.client_id = c.id
    LEFT JOIN projects p ON ka.project_id = p.id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (clientId) {
    query += ` AND ka.client_id = $${paramIndex}`;
    params.push(clientId);
    paramIndex++;
  }

  if (projectId) {
    query += ` AND ka.project_id = $${paramIndex}`;
    params.push(projectId);
    paramIndex++;
  }

  query += ' ORDER BY ka.created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Export content data
 */
export async function exportContent(clientId, projectId, format = 'csv') {
  let query = `
    SELECT c.*, p.project_name, cl.company_name
    FROM content c
    LEFT JOIN projects p ON c.project_id = p.id
    LEFT JOIN clients cl ON p.client_id = cl.id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (clientId) {
    query += ` AND cl.id = $${paramIndex}`;
    params.push(clientId);
    paramIndex++;
  }

  if (projectId) {
    query += ` AND c.project_id = $${paramIndex}`;
    params.push(projectId);
    paramIndex++;
  }

  query += ' ORDER BY c.created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Export tasks data
 */
export async function exportTasks(clientId, format = 'csv') {
  let query = `
    SELECT t.*, c.company_name, u.email as assigned_to_email, u.full_name as assigned_to_name
    FROM tasks t
    LEFT JOIN clients c ON t.client_id = c.id
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (clientId) {
    query += ` AND t.client_id = $${paramIndex}`;
    params.push(clientId);
    paramIndex++;
  }

  query += ' ORDER BY t.due_date ASC, t.created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Convert data to CSV format
 */
export function toCSV(data, headers) {
  if (!data || data.length === 0) {
    return '';
  }

  const csvHeaders = headers || Object.keys(data[0]);
  const rows = [csvHeaders.join(',')];

  for (const row of data) {
    const values = csvHeaders.map(header => {
      const value = row[header];
      if (value === null || value === undefined) {
        return '';
      }
      // Handle arrays and objects
      if (Array.isArray(value)) {
        return `"${value.join('; ')}"`;
      }
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value).replace(/"/g, '""');
      return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
    });
    rows.push(values.join(','));
  }

  return rows.join('\n');
}

/**
 * Convert data to JSON format
 */
export function toJSON(data) {
  return JSON.stringify(data, null, 2);
}

export default {
  exportKeywords,
  exportContent,
  exportTasks,
  toCSV,
  toJSON,
};
