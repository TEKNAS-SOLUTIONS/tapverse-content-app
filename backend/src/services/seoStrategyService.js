import { generateContentWithSystem } from './claude.js';
import pool from '../db/index.js';

/**
 * SEO Strategy Generation Service
 * 
 * Generates comprehensive SEO strategies using Claude Sonnet
 * Includes: keyword research, content pillars, technical SEO, competitor analysis
 */

/**
 * Generate comprehensive SEO strategy for a project
 * @param {string} projectId - Project ID
 * @param {object} clientData - Client data (industry, competitors, brand info)
 * @param {object} projectData - Project data (keywords, target audience, goals)
 * @returns {Promise<object>} Generated SEO strategy
 */
export async function generateSEOStrategy(projectId, clientData = {}, projectData = {}) {
  try {
    // Fetch existing project and client data from database
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
    
    // Merge database data with provided data
    const mergedClientData = {
      ...client,
      ...clientData,
      competitors: client.competitors || clientData.competitors || [],
    };
    
    const mergedProjectData = {
      ...project,
      ...projectData,
      keywords: project.keywords || projectData.keywords || [],
    };
    
    // Generate strategy using Claude
    const strategy = await generateStrategyWithAI(mergedClientData, mergedProjectData);
    
    // Save to database
    const savedStrategy = await saveSEOStrategy(projectId, clientId, strategy);
    
    return savedStrategy;
  } catch (error) {
    console.error('Error generating SEO strategy:', error);
    throw new Error(`Failed to generate SEO strategy: ${error.message}`);
  }
}

/**
 * Generate SEO strategy using Claude AI
 */
async function generateStrategyWithAI(clientData, projectData) {
  const industry = clientData.industry || 'General';
  const companyName = clientData.company_name || 'Client';
  const targetAudience = projectData.target_audience || clientData.target_audience || 'General audience';
  const keywords = projectData.keywords || [];
  const competitors = clientData.competitors || [];
  const brandVoice = clientData.brand_voice || 'Professional';
  const brandTone = clientData.brand_tone || 'Professional';
  
  const systemPrompt = `You are an expert SEO strategist with 15+ years of experience. 
You create comprehensive, data-driven SEO strategies that drive real business results.

Your strategies include:
- Deep keyword research and gap analysis
- Content pillar architecture
- Technical SEO recommendations
- Competitor content gap analysis
- Link building opportunities
- Content calendar recommendations
- SEO-optimized content briefs

Always provide actionable, specific recommendations backed by strategic thinking.`;

  const userPrompt = `Create a comprehensive SEO strategy for:

COMPANY: ${companyName}
INDUSTRY: ${industry}
TARGET AUDIENCE: ${targetAudience}
BRAND VOICE: ${brandVoice}
BRAND TONE: ${brandTone}
PRIMARY KEYWORDS: ${keywords.length > 0 ? keywords.join(', ') : 'To be researched'}
COMPETITORS: ${competitors.length > 0 ? competitors.join(', ') : 'None specified'}

Generate a complete SEO strategy including:

1. EXECUTIVE SUMMARY
   - Overview of SEO opportunity
   - Key recommendations summary
   - Expected outcomes

2. KEYWORD RESEARCH
   - Primary keywords (10-15 high-value targets)
   - Secondary keywords (20-30 supporting keywords)
   - Search intent analysis
   - Keyword difficulty estimates
   - Search volume estimates (if applicable)

3. CONTENT PILLAR STRATEGY
   - 3-5 main content pillars
   - For each pillar: theme, target keywords, content types, goals

4. CONTENT CALENDAR RECOMMENDATIONS
   - Monthly content themes
   - Content types (blog posts, guides, videos, etc.)
   - Publishing frequency recommendations
   - Priority content pieces

5. TECHNICAL SEO RECOMMENDATIONS
   - Site speed optimization
   - Mobile optimization
   - Schema markup opportunities
   - Site structure improvements
   - Indexing and crawling recommendations

6. LINK BUILDING OPPORTUNITIES
   - High-authority sites in the industry
   - Guest posting opportunities
   - Resource page link opportunities
   - Partnership opportunities
   - Content-based link building ideas

7. CONTENT GAP ANALYSIS
   - Missing content topics
   - Underperforming content opportunities
   - Content refresh opportunities

8. COMPETITOR GAP ANALYSIS
   - Content topics competitors rank for that we don't
   - Content formats competitors use that we should
   - Keyword opportunities competitors miss

9. TARGET AUDIENCE ANALYSIS
   - Detailed audience personas
   - Search behavior patterns
   - Content preferences

10. COMPETITOR ANALYSIS SUMMARY
    - Top competitors' strengths
    - Opportunities to outperform competitors
    - Competitive positioning recommendations

Format the output as JSON:
{
  "executive_summary": "Comprehensive overview...",
  "primary_keywords": ["keyword1", "keyword2", ...],
  "secondary_keywords": ["keyword1", "keyword2", ...],
  "content_pillars": [
    {
      "theme": "Pillar theme",
      "target_keywords": ["kw1", "kw2"],
      "content_types": ["blog", "guide"],
      "goals": "Pillar goals"
    }
  ],
  "content_calendar": [
    {
      "month": "Month name",
      "theme": "Monthly theme",
      "content_types": ["type1", "type2"],
      "frequency": "X posts per week",
      "priority_pieces": ["Piece 1", "Piece 2"]
    }
  ],
  "technical_seo_recommendations": "Detailed technical recommendations...",
  "link_building_opportunities": [
    {
      "opportunity": "Opportunity description",
      "type": "guest_post/resource_page/partnership",
      "priority": "high/medium/low"
    }
  ],
  "content_gap_analysis": [
    {
      "topic": "Missing topic",
      "priority": "high/medium/low",
      "content_type": "blog/guide/video",
      "target_keyword": "Primary keyword"
    }
  ],
  "competitor_gaps": [
    {
      "opportunity": "Content opportunity",
      "competitor": "Competitor name",
      "priority": "high/medium/low",
      "content_type": "blog/guide/video"
    }
  ],
  "target_audience_analysis": "Detailed audience analysis...",
  "competitor_analysis_summary": "Comprehensive competitor analysis..."
}`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt, {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 8192, // Large response for comprehensive strategy
    });
    
    // Parse JSON from response
    let jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      } catch (parseError) {
        console.error('JSON parse error:', parseError.message);
        // Try more flexible JSON extraction
        jsonMatch = response.match(/```json\s*(\{[\s\S]*?\})\s*```/) || 
                    response.match(/```\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1]);
        }
        throw new Error('Failed to parse SEO strategy JSON from Claude response');
      }
    }
    
    throw new Error('No JSON found in Claude response');
  } catch (error) {
    console.error('Error generating SEO strategy with AI:', error);
    throw error;
  }
}

/**
 * Save SEO strategy to database
 */
async function saveSEOStrategy(projectId, clientId, strategy) {
  try {
    const result = await pool.query(`
      INSERT INTO seo_strategies (
        client_id,
        project_id,
        primary_keywords,
        secondary_keywords,
        content_pillars,
        content_calendar,
        technical_seo_recommendations,
        link_building_opportunities,
        content_gap_analysis,
        competitor_gaps,
        executive_summary,
        target_audience_analysis,
        competitor_analysis_summary,
        keyword_research_summary
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *
    `, [
      clientId,
      projectId,
      strategy.primary_keywords || [],
      strategy.secondary_keywords || [],
      JSON.stringify(strategy.content_pillars || []),
      JSON.stringify(strategy.content_calendar || []),
      strategy.technical_seo_recommendations || '',
      JSON.stringify(strategy.link_building_opportunities || []),
      JSON.stringify(strategy.content_gap_analysis || []),
      JSON.stringify(strategy.competitor_gaps || []),
      strategy.executive_summary || '',
      strategy.target_audience_analysis || '',
      strategy.competitor_analysis_summary || '',
      `Primary: ${(strategy.primary_keywords || []).join(', ')} | Secondary: ${(strategy.secondary_keywords || []).join(', ')}`
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error saving SEO strategy:', error);
    throw error;
  }
}

/**
 * Get SEO strategies for a project
 */
export async function getSEOStrategiesByProject(projectId) {
  try {
    const result = await pool.query(
      'SELECT * FROM seo_strategies WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching SEO strategies:', error);
    throw error;
  }
}

/**
 * Get specific SEO strategy by ID
 */
export async function getSEOStrategyById(strategyId) {
  try {
    const result = await pool.query(
      'SELECT * FROM seo_strategies WHERE id = $1',
      [strategyId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching SEO strategy:', error);
    throw error;
  }
}

/**
 * Update SEO strategy
 */
export async function updateSEOStrategy(strategyId, updates) {
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    const allowedFields = [
      'primary_keywords', 'secondary_keywords', 'content_pillars',
      'content_calendar', 'technical_seo_recommendations',
      'link_building_opportunities', 'content_gap_analysis',
      'competitor_gaps', 'executive_summary', 'target_audience_analysis',
      'competitor_analysis_summary'
    ];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        // Handle JSONB fields
        if (['content_pillars', 'content_calendar', 'link_building_opportunities', 
             'content_gap_analysis', 'competitor_gaps'].includes(key)) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        paramCount++;
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(strategyId);
    const query = `
      UPDATE seo_strategies 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating SEO strategy:', error);
    throw error;
  }
}

/**
 * Delete SEO strategy
 */
export async function deleteSEOStrategy(strategyId) {
  try {
    const result = await pool.query(
      'DELETE FROM seo_strategies WHERE id = $1 RETURNING id',
      [strategyId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting SEO strategy:', error);
    throw error;
  }
}

