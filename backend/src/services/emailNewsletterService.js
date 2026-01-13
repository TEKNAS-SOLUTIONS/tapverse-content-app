import { generateContentWithSystem } from './claude.js';
import pool from '../db/index.js';

/**
 * Email Newsletter Generation Service
 * Generates email newsletters from blog content or custom prompts
 */

/**
 * Generate email newsletter from content
 */
export async function generateEmailNewsletter(projectId, options = {}) {
  try {
    // Fetch project and client data
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      throw new Error('Project not found');
    }

    const project = projectResult.rows[0];
    const clientId = project.client_id;

    const clientResult = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [clientId]
    );

    if (clientResult.rows.length === 0) {
      throw new Error('Client not found');
    }

    const client = clientResult.rows[0];

    // Get source content if provided
    let sourceContent = null;
    if (options.sourceContentId) {
      const contentResult = await pool.query(
        'SELECT * FROM content WHERE id = $1',
        [options.sourceContentId]
      );
      if (contentResult.rows.length > 0) {
        sourceContent = contentResult.rows[0];
      }
    }

    // Generate newsletter using Claude
    const newsletter = await generateNewsletterWithAI(
      client,
      project,
      sourceContent,
      options
    );

    // Save to database
    const savedNewsletter = await saveEmailNewsletter(
      projectId,
      clientId,
      newsletter,
      options.sourceContentId
    );

    return savedNewsletter;
  } catch (error) {
    console.error('Error generating email newsletter:', error);
    throw new Error(`Failed to generate email newsletter: ${error.message}`);
  }
}

/**
 * Generate newsletter content using Claude AI
 */
async function generateNewsletterWithAI(client, project, sourceContent, options) {
  const companyName = client.company_name || 'Our Company';
  const brandVoice = client.brand_voice || 'Professional';
  const brandTone = client.brand_tone || 'Professional';
  const sourceText = sourceContent?.content || options.customContent || '';

  const systemPrompt = `You are an expert email marketing copywriter. Create engaging, professional email newsletters that drive opens, clicks, and conversions.

Your emails should:
- Have compelling subject lines (50 characters max)
- Include preview text that entices opens
- Use clear, scannable formatting
- Include strong calls-to-action
- Be mobile-friendly
- Follow email best practices
- Match the brand voice and tone`;

  const userPrompt = `Create an email newsletter for ${companyName}.

BRAND VOICE: ${brandVoice}
BRAND TONE: ${brandTone}
${sourceText ? `SOURCE CONTENT:\n${sourceText.substring(0, 2000)}` : 'CUSTOM CONTENT REQUEST'}

Requirements:
1. Subject Line (50 characters max, compelling)
2. Preview Text (100 characters max, supports subject line)
3. Email Body (HTML formatted, 300-500 words)
   - Professional header
   - Engaging introduction
   - Main content (2-3 key points)
   - Clear call-to-action button
   - Footer with unsubscribe link
4. Plain Text Version (for email clients that don't support HTML)

Format the output as JSON:
{
  "subject_line": "Subject line here",
  "preview_text": "Preview text here",
  "email_body": "<html>...</html>",
  "plain_text_body": "Plain text version",
  "cta_text": "Call to Action",
  "cta_url": "https://example.com/cta"
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks.`;

  try {
    let model = 'claude-3-haiku-20240307';
    try {
      const modelResult = await pool.query(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'claude_model'"
      );
      if (modelResult.rows.length > 0 && modelResult.rows[0].setting_value) {
        model = modelResult.rows[0].setting_value;
      }
    } catch (err) {
      console.error('Error fetching model:', err);
    }

    const maxTokens = model.includes('haiku') ? 4096 : 8192;

    const response = await generateContentWithSystem(systemPrompt, userPrompt, {
      model,
      maxTokens,
    });

    // Parse JSON
    let parsed = null;
    let jsonMatch = response.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||
                    response.match(/```\s*(\{[\s\S]*?\})\s*```/);
    
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1]);
      } catch (e) {
        jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (e2) {
            console.error('JSON parse error:', e2);
            throw new Error('Failed to parse newsletter JSON');
          }
        }
      }
    } else {
      jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          throw new Error('Failed to parse newsletter JSON');
        }
      }
    }

    if (!parsed) {
      throw new Error('Failed to parse newsletter JSON from Claude response');
    }

    return parsed;
  } catch (error) {
    console.error('Error generating newsletter with AI:', error);
    throw error;
  }
}

/**
 * Save email newsletter to database
 */
async function saveEmailNewsletter(projectId, clientId, newsletter, sourceContentId = null) {
  try {
    const result = await pool.query(`
      INSERT INTO email_newsletters (
        project_id, client_id, source_content_id, source_type,
        subject_line, preview_text, email_body, plain_text_body,
        cta_text, cta_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      projectId,
      clientId,
      sourceContentId,
      sourceContentId ? 'blog' : 'custom',
      newsletter.subject_line || '',
      newsletter.preview_text || '',
      newsletter.email_body || '',
      newsletter.plain_text_body || newsletter.email_body?.replace(/<[^>]*>/g, '') || '',
      newsletter.cta_text || 'Learn More',
      newsletter.cta_url || '',
      'draft'
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error saving email newsletter:', error);
    throw error;
  }
}

/**
 * Get email newsletters for a project
 */
export async function getEmailNewsletters(projectId) {
  try {
    const result = await pool.query(
      'SELECT * FROM email_newsletters WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching email newsletters:', error);
    throw error;
  }
}

/**
 * Get email newsletter by ID
 */
export async function getEmailNewsletterById(newsletterId) {
  try {
    const result = await pool.query(
      'SELECT * FROM email_newsletters WHERE id = $1',
      [newsletterId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching email newsletter:', error);
    throw error;
  }
}

/**
 * Update email newsletter
 */
export async function updateEmailNewsletter(newsletterId, updates) {
  try {
    const allowedFields = [
      'subject_line', 'preview_text', 'email_body', 'plain_text_body',
      'cta_text', 'cta_url', 'status', 'scheduled_at'
    ];

    const fields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(newsletterId);
    const query = `
      UPDATE email_newsletters
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating email newsletter:', error);
    throw error;
  }
}

/**
 * Delete email newsletter
 */
export async function deleteEmailNewsletter(newsletterId) {
  try {
    const result = await pool.query(
      'DELETE FROM email_newsletters WHERE id = $1 RETURNING id',
      [newsletterId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting email newsletter:', error);
    throw error;
  }
}

