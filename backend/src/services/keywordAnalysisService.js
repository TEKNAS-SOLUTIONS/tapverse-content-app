import { generateContentWithSystem } from './claude.js';
import pool from '../db/index.js';
import { getKeywordData, getRelatedKeywords, getKeywordDifficulty, batchGetKeywordData } from './dataForSeoService.js';
import { config } from '../config/config.js';

/**
 * Keyword Analysis Service
 * 
 * Provides keyword research, competitor keyword analysis, industry trends,
 * and keyword strength ratings using Claude AI
 */

/**
 * Analyze keywords for a project/client
 * @param {object} params - Analysis parameters
 * @returns {Promise<object>} Keyword analysis results
 */
export async function analyzeKeywords(params) {
  const {
    clientId,
    projectId,
    keywords = [],
    competitors = [],
    industry = '',
    targetAudience = '',
    businessType = 'general',
    location = '',
  } = params;

  try {
    // Fetch client and project data if IDs provided
    let clientData = {};
    let projectData = {};

    if (clientId) {
      const clientResult = await pool.query(
        'SELECT * FROM clients WHERE id = $1',
        [clientId]
      );
      if (clientResult.rows.length > 0) {
        clientData = clientResult.rows[0];
      }
    }

    if (projectId) {
      const projectResult = await pool.query(
        'SELECT * FROM projects WHERE id = $1',
        [projectId]
      );
      if (projectResult.rows.length > 0) {
        projectData = projectResult.rows[0];
      }
    }

    // Merge data
    const finalKeywords = keywords.length > 0 ? keywords : (projectData.keywords || []);
    const finalCompetitors = competitors.length > 0 ? competitors : (clientData.competitors || []);
    const finalIndustry = industry || clientData.industry || 'General';
    const finalTargetAudience = targetAudience || projectData.target_audience || clientData.target_audience || '';
    const finalBusinessType = businessType || clientData.primary_business_type || 'general';
    const finalLocation = location || clientData.location || '';

    // Get real keyword data from DataForSEO if enabled
    let realKeywordData = null;
    let dataSource = 'ai'; // Track data source for user visibility
    if (config.dataForSeo?.enabled && finalKeywords.length > 0) {
      try {
        console.log('Fetching real keyword data from DataForSEO...');
        realKeywordData = await batchGetKeywordData(
          finalKeywords.slice(0, 50), // Limit to 50 keywords per analysis
          {
            locationCode: config.dataForSeo.defaultLocation,
            languageCode: config.dataForSeo.defaultLanguage,
          }
        );
        console.log(`Retrieved data for ${realKeywordData.length} keywords`);
        dataSource = 'dataforseo';
      } catch (error) {
        console.error('DataForSEO error (falling back to AI):', error.message);
        dataSource = 'ai_fallback'; // Indicate fallback occurred
        // Continue with AI-only analysis if DataForSEO fails
      }
    }

    // Generate analysis (enhanced with real data if available)
    const analysis = await generateKeywordAnalysis({
      companyName: clientData.company_name || '',
      keywords: finalKeywords,
      competitors: finalCompetitors,
      industry: finalIndustry,
      targetAudience: finalTargetAudience,
      businessType: finalBusinessType,
      location: finalLocation,
      realKeywordData, // Pass real data to enhance AI analysis
    });

    // Add data source metadata to response
    analysis.metadata = {
      data_source: dataSource,
      dataforseo_enabled: config.dataForSeo?.enabled || false,
      keywords_analyzed: finalKeywords.length,
      real_data_count: realKeywordData?.length || 0,
      fallback_used: dataSource === 'ai_fallback',
      message: dataSource === 'dataforseo' 
        ? 'Real keyword data from DataForSEO API' 
        : dataSource === 'ai_fallback'
        ? '⚠️ DataForSEO unavailable - using AI estimates (fallback)'
        : 'AI-powered keyword analysis (DataForSEO not enabled)',
    };

    // Save analysis if we have project ID
    if (projectId) {
      await saveKeywordAnalysis(projectId, clientId, analysis);
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing keywords:', error);
    throw new Error(`Failed to analyze keywords: ${error.message}`);
  }
}

/**
 * Generate keyword analysis using Claude AI
 */
async function generateKeywordAnalysis(params) {
  const {
    companyName,
    keywords,
    competitors,
    industry,
    targetAudience,
    businessType,
    location,
    realKeywordData = null, // Real data from DataForSEO
  } = params;

  const systemPrompt = `You are an expert SEO analyst and keyword researcher with 15+ years of experience.
You specialize in:
- Keyword research and analysis
- Competitor keyword gap analysis
- Industry trend identification
- Keyword difficulty and opportunity assessment
- Search intent classification
- Keyword strength scoring

Provide data-driven, actionable keyword insights. Rate keyword strength on a scale of 1-100.`;

  // Build real data context if available
  let realDataContext = '';
  if (realKeywordData && realKeywordData.length > 0) {
    realDataContext = `\n\nREAL KEYWORD DATA FROM DATAFORSEO (use this instead of estimates):\n`;
    realKeywordData.forEach(kw => {
      realDataContext += `- "${kw.keyword}": ${kw.search_volume} monthly searches, CPC: $${kw.cpc}, Competition: ${kw.competition}\n`;
    });
    realDataContext += `\nIMPORTANT: Use the REAL search volumes and CPC data above. Only estimate for keywords not in this list.\n`;
  }

  const userPrompt = `Perform a comprehensive KEYWORD ANALYSIS for:

COMPANY: ${companyName || 'Client'}
INDUSTRY: ${industry}
BUSINESS TYPE: ${businessType}${businessType === 'local' ? ` (Location: ${location})` : ''}
TARGET AUDIENCE: ${targetAudience || 'Not specified'}
CURRENT KEYWORDS: ${keywords.length > 0 ? keywords.join(', ') : 'None provided - research from scratch'}
COMPETITORS: ${competitors.length > 0 ? competitors.join(', ') : 'None specified'}
${realDataContext}

Analyze and provide:

1. KEYWORD OPPORTUNITIES (10-15 keywords)
   - For each keyword, provide:
     * keyword: the keyword phrase
     * search_volume: ${realKeywordData ? 'REAL monthly search volume from DataForSEO (use exact numbers)' : 'estimated monthly searches (high/medium/low)'}
     * difficulty: ranking difficulty (1-100) ${realKeywordData ? '(use real competition_index if available)' : ''}
     * cpc: ${realKeywordData ? 'REAL cost-per-click from DataForSEO' : 'estimated CPC'}
     * strength_score: overall opportunity score (1-100)
     * intent: search intent (informational/navigational/commercial/transactional)
     * priority: high/medium/low
     * rationale: why this keyword is valuable

2. COMPETITOR KEYWORD GAPS (5-8 opportunities)
   - Keywords competitors rank for that the client should target
   - For each: keyword, competitor, difficulty, opportunity_score

3. INDUSTRY TRENDS (5-8 trending topics)
   - Current trending topics in the industry
   - For each: topic, trend_direction (rising/stable/declining), relevance_score (1-100)

4. LONG-TAIL OPPORTUNITIES (8-10 keywords)
   - Specific, lower competition keywords
   - For each: keyword, search_volume, difficulty, conversion_potential (high/medium/low)

5. KEYWORD CLUSTERS (3-5 clusters)
   - Group related keywords into content themes
   - For each: cluster_name, primary_keyword, supporting_keywords, content_recommendations

6. QUICK WINS (5-8 keywords)
   - Low difficulty, high opportunity keywords for immediate targeting
   - For each: keyword, difficulty, potential_traffic, time_to_rank

7. ANALYSIS SUMMARY
   - Overall keyword strategy recommendation
   - Top 3 priority keywords to target first
   - Expected results timeline

Format as VALID JSON${realKeywordData ? ' (use REAL numbers from DataForSEO when available)' : ''}:
{
  "keyword_opportunities": [
    {
      "keyword": "example keyword",
      "search_volume": ${realKeywordData ? '1500' : '"medium"'},
      "difficulty": 45,
      ${realKeywordData ? '"cpc": 1.25,\n      ' : ''}"strength_score": 78,
      "intent": "commercial",
      "priority": "high",
      "rationale": "Why this keyword matters"${realKeywordData ? ',\n      "data_source": "DataForSEO"' : ''}
    }
  ],
  "competitor_gaps": [
    {
      "keyword": "gap keyword",
      "competitor": "competitor.com",
      "difficulty": 50,
      "opportunity_score": 75
    }
  ],
  "industry_trends": [
    {
      "topic": "trending topic",
      "trend_direction": "rising",
      "relevance_score": 85,
      "keywords": ["related kw1", "related kw2"]
    }
  ],
  "long_tail_opportunities": [
    {
      "keyword": "long tail keyword phrase",
      "search_volume": "low",
      "difficulty": 25,
      "conversion_potential": "high"
    }
  ],
  "keyword_clusters": [
    {
      "cluster_name": "Cluster Theme",
      "primary_keyword": "main keyword",
      "supporting_keywords": ["kw1", "kw2", "kw3"],
      "content_recommendation": "Create pillar content about..."
    }
  ],
  "quick_wins": [
    {
      "keyword": "quick win keyword",
      "difficulty": 20,
      "potential_traffic": "medium",
      "time_to_rank": "1-2 months"
    }
  ],
  "summary": {
    "overall_strategy": "Brief strategy overview",
    "top_priorities": ["keyword1", "keyword2", "keyword3"],
    "timeline": "Expected results in 3-6 months"
  }
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks.`;

  try {
    // Get model from database or use default
    let model = 'claude-3-haiku-20240307';
    try {
      const modelResult = await pool.query(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'claude_model'"
      );
      if (modelResult.rows.length > 0 && modelResult.rows[0].setting_value) {
        model = modelResult.rows[0].setting_value;
      }
    } catch (err) {
      console.error('Error fetching model from database:', err);
    }

    const maxTokens = model.includes('haiku') ? 4096 : 8192;

    const response = await generateContentWithSystem(systemPrompt, userPrompt, {
      model,
      maxTokens,
    });

    // Parse JSON response
    let parsed = null;

    // Try to find JSON in response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (e) {
        // Try to fix common JSON issues
        let fixedJson = jsonMatch[0]
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        try {
          parsed = JSON.parse(fixedJson);
        } catch (e2) {
          console.error('Failed to parse keyword analysis JSON:', e2.message);
        }
      }
    }

    if (!parsed) {
      // Return minimal structure on parse failure
      return {
        keyword_opportunities: [],
        competitor_gaps: [],
        industry_trends: [],
        long_tail_opportunities: [],
        keyword_clusters: [],
        quick_wins: [],
        summary: {
          overall_strategy: 'Analysis generation failed. Please try again.',
          top_priorities: [],
          timeline: 'N/A'
        }
      };
    }

    return parsed;
  } catch (error) {
    console.error('Error generating keyword analysis:', error);
    throw error;
  }
}

/**
 * Save keyword analysis to database
 */
async function saveKeywordAnalysis(projectId, clientId, analysis) {
  try {
    // Check if keyword_analyses table exists, create if not
    await pool.query(`
      CREATE TABLE IF NOT EXISTS keyword_analyses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
        keyword_opportunities JSONB DEFAULT '[]',
        competitor_gaps JSONB DEFAULT '[]',
        industry_trends JSONB DEFAULT '[]',
        long_tail_opportunities JSONB DEFAULT '[]',
        keyword_clusters JSONB DEFAULT '[]',
        quick_wins JSONB DEFAULT '[]',
        summary JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(`
      INSERT INTO keyword_analyses (
        project_id, client_id, keyword_opportunities, competitor_gaps,
        industry_trends, long_tail_opportunities, keyword_clusters, quick_wins, summary
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      projectId,
      clientId,
      JSON.stringify(analysis.keyword_opportunities || []),
      JSON.stringify(analysis.competitor_gaps || []),
      JSON.stringify(analysis.industry_trends || []),
      JSON.stringify(analysis.long_tail_opportunities || []),
      JSON.stringify(analysis.keyword_clusters || []),
      JSON.stringify(analysis.quick_wins || []),
      JSON.stringify(analysis.summary || {}),
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error saving keyword analysis:', error);
    // Don't throw - just log. Analysis can still be returned without saving
  }
}

/**
 * Get keyword analyses for a project
 */
export async function getKeywordAnalysesByProject(projectId) {
  try {
    const result = await pool.query(
      'SELECT * FROM keyword_analyses WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching keyword analyses:', error);
    return [];
  }
}

/**
 * Get keyword analysis by ID
 */
export async function getKeywordAnalysisById(analysisId) {
  try {
    const result = await pool.query(
      'SELECT * FROM keyword_analyses WHERE id = $1',
      [analysisId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching keyword analysis:', error);
    return null;
  }
}

/**
 * Delete keyword analysis
 */
export async function deleteKeywordAnalysis(analysisId) {
  try {
    const result = await pool.query(
      'DELETE FROM keyword_analyses WHERE id = $1 RETURNING id',
      [analysisId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting keyword analysis:', error);
    throw error;
  }
}

export default {
  analyzeKeywords,
  getKeywordAnalysesByProject,
  getKeywordAnalysisById,
  deleteKeywordAnalysis,
};
