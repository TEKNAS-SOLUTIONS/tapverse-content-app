import { generateContentWithSystem } from './claude.js';
import pool from '../db/index.js';

/**
 * Google Ads Strategy Generation Service
 * 
 * Generates comprehensive Google Ads strategies using Claude
 * Includes: campaign structure, keywords, ad copy, landing pages, bidding, budget
 */

/**
 * Generate comprehensive Google Ads strategy for a project
 */
export async function generateGoogleAdsStrategy(projectId, clientData = {}, projectData = {}) {
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
    const savedStrategy = await saveGoogleAdsStrategy(projectId, clientId, strategy);
    
    return savedStrategy;
  } catch (error) {
    console.error('Error generating Google Ads strategy:', error);
    throw new Error(`Failed to generate Google Ads strategy: ${error.message}`);
  }
}

/**
 * Generate Google Ads strategy using Claude AI
 */
async function generateStrategyWithAI(clientData, projectData) {
  const industry = clientData.industry || 'General';
  const companyName = clientData.company_name || 'Client';
  const targetAudience = projectData.target_audience || clientData.target_audience || 'General audience';
  const keywords = projectData.keywords || [];
  const competitors = clientData.competitors || [];
  const brandVoice = clientData.brand_voice || 'Professional';
  const brandTone = clientData.brand_tone || 'Professional';
  const googleAdsId = clientData.google_ads_id || 'Not specified';
  
  const systemPrompt = `You are an expert Google Ads strategist with 15+ years of experience. 
You create comprehensive, data-driven Google Ads strategies that drive real business results.

Your strategies include:
- Optimal campaign structure and organization
- Strategic keyword research with match types
- High-converting ad copy variations
- Landing page optimization recommendations
- Smart bidding strategies
- Budget allocation across campaigns
- A/B testing frameworks

Always provide actionable, specific recommendations backed by strategic thinking.`;

  const userPrompt = `Create a comprehensive Google Ads strategy for:

COMPANY: ${companyName}
INDUSTRY: ${industry}
TARGET AUDIENCE: ${targetAudience}
BRAND VOICE: ${brandVoice}
BRAND TONE: ${brandTone}
GOOGLE ADS ACCOUNT ID: ${googleAdsId}
PRIMARY KEYWORDS: ${keywords.length > 0 ? keywords.join(', ') : 'To be researched'}
COMPETITORS: ${competitors.length > 0 ? competitors.join(', ') : 'None specified'}

Generate a complete Google Ads strategy including:

1. EXECUTIVE SUMMARY
   - Overview of Google Ads opportunity
   - Key recommendations summary
   - Expected outcomes and KPIs

2. CAMPAIGN STRUCTURE
   - Recommended campaign organization (3-5 campaigns)
   - Campaign naming conventions
   - Ad group structure recommendations

3. KEYWORD RESEARCH
   - Primary keywords (15-20 high-value targets) with match types
   - Long-tail keyword opportunities
   - Negative keyword recommendations
   - Search intent analysis

4. AD COPY VARIATIONS
   - 3-5 headline variations per campaign
   - 3-5 description variations
   - Call-to-action recommendations
   - Ad extensions suggestions

5. LANDING PAGE RECOMMENDATIONS
   - Landing page optimization tips
   - Conversion-focused recommendations
   - Mobile optimization priorities

6. BID STRATEGY
   - Recommended bidding strategies (Manual CPC, Target CPA, etc.)
   - Bid adjustment recommendations
   - Quality Score optimization tips

7. BUDGET ALLOCATION
   - Budget distribution across campaigns
   - Daily/monthly budget recommendations
   - Budget optimization strategies

8. A/B TESTING SUGGESTIONS
   - Ad copy tests
   - Landing page tests
   - Bid strategy tests

9. TARGET AUDIENCE ANALYSIS
   - Detailed audience personas for targeting
   - Demographic targeting recommendations
   - Device and location targeting

10. COMPETITOR ANALYSIS
    - Competitor ad strategies
    - Opportunities to outperform
    - Competitive positioning

CRITICAL: Keep the response concise and within 4000 tokens. Focus on the most important recommendations.

Format the output as VALID JSON (no trailing commas, all strings quoted):
{
  "executive_summary": "Brief 2-3 sentence overview",
  "campaign_structure": [
    {"name": "Campaign 1", "type": "Search/Display/Shopping", "ad_groups": 3, "description": "Brief description"},
    {"name": "Campaign 2", "type": "Search", "ad_groups": 2, "description": "Brief description"}
  ],
  "primary_keywords": [
    {"keyword": "keyword1", "match_type": "exact", "estimated_cpc": "$X.XX", "search_volume": "XK"},
    {"keyword": "keyword2", "match_type": "phrase", "estimated_cpc": "$X.XX", "search_volume": "XK"}
  ],
  "negative_keywords": ["keyword1", "keyword2", "keyword3"],
  "ad_copy_variations": [
    {"headlines": ["Headline 1", "Headline 2", "Headline 3"], "descriptions": ["Desc 1", "Desc 2"], "cta": "CTA text"},
    {"headlines": ["Headline 1", "Headline 2"], "descriptions": ["Desc 1", "Desc 2"], "cta": "CTA text"}
  ],
  "landing_page_recommendations": "3-4 key recommendations in 2-3 sentences",
  "bid_strategy_recommendations": "2-3 sentence recommendation",
  "budget_allocation": [
    {"campaign": "Campaign 1", "daily_budget": "$XX", "monthly_budget": "$XXX", "percentage": "XX%"},
    {"campaign": "Campaign 2", "daily_budget": "$XX", "monthly_budget": "$XXX", "percentage": "XX%"}
  ],
  "ab_testing_suggestions": [
    {"test_type": "Ad Copy", "description": "Brief description"},
    {"test_type": "Landing Page", "description": "Brief description"}
  ],
  "target_audience_analysis": "2-3 sentence audience analysis",
  "competitor_analysis": "2-3 sentence competitor analysis"
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations. Just the JSON object.`;

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
    
    // Haiku max is 4096, Sonnet/Opus can do 8192
    const maxTokens = model.includes('haiku') ? 4096 : 8192;
    
    const response = await generateContentWithSystem(systemPrompt, userPrompt, {
      model,
      maxTokens,
    });
    
    // Parse JSON from response - try multiple strategies
    let parsed = null;
    
    // Strategy 1: Try to find JSON in code blocks
    let jsonMatch = response.match(/```json\s*(\{[\s\S]*?\})\s*```/) || 
                    response.match(/```\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1]);
        return parsed;
      } catch (e) {
        console.log('Failed to parse JSON from code block, trying other methods...');
      }
    }
    
    // Strategy 2: Try to find JSON object in response
    jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      } catch (parseError) {
        console.error('JSON parse error:', parseError.message);
        // Try to fix common JSON issues
        let fixedJson = jsonMatch[0]
          .replace(/,\s*}/g, '}')  // Remove trailing commas
          .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Quote unquoted keys
          .replace(/:\s*([^",{\[\]\s][^,}\]]*?)([,}\]])/g, ': "$1"$2');  // Quote unquoted string values
        
        try {
          parsed = JSON.parse(fixedJson);
          return parsed;
        } catch (e2) {
          console.error('Failed to fix and parse JSON:', e2.message);
        }
      }
    }
    
    // Strategy 3: Try to extract just the JSON part (find first { and last })
    const firstBrace = response.indexOf('{');
    const lastBrace = response.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        let jsonStr = response.substring(firstBrace, lastBrace + 1);
        // Try to fix common JSON issues
        jsonStr = jsonStr
          .replace(/,\s*}/g, '}')  // Remove trailing commas before }
          .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Quote unquoted keys
          .replace(/:\s*([^",{\[\]\s][^,}\]]*?)([,}\]])/g, ': "$1"$2');  // Quote unquoted string values
        
        parsed = JSON.parse(jsonStr);
        return parsed;
      } catch (e) {
        console.error('Failed to parse extracted JSON:', e.message);
        // Last resort: try to build a minimal valid JSON from what we have
        try {
          const minimal = {
            executive_summary: response.substring(0, 500) || "Google Ads strategy generated",
            campaign_structure: [],
            primary_keywords: [],
            negative_keywords: [],
            ad_copy_variations: [],
            landing_page_recommendations: "See full response in logs",
            bid_strategy_recommendations: "",
            budget_allocation: [],
            ab_testing_suggestions: [],
            target_audience_analysis: "",
            competitor_analysis: ""
          };
          console.warn('Returning minimal strategy due to JSON parse failure');
          return minimal;
        } catch (e2) {
          console.error('Failed to create minimal strategy:', e2);
        }
      }
    }
    
    // If all parsing fails, log the response for debugging
    console.error('Failed to parse Google Ads strategy JSON. Response length:', response.length);
    console.error('Response preview:', response.substring(0, 1000));
    throw new Error('Failed to parse Google Ads strategy JSON from Claude response. Response may be too large or malformed.');
  } catch (error) {
    console.error('Error generating Google Ads strategy with AI:', error);
    throw error;
  }
}

/**
 * Save Google Ads strategy to database
 */
async function saveGoogleAdsStrategy(projectId, clientId, strategy) {
  try {
    const result = await pool.query(`
      INSERT INTO google_ads_strategies (
        client_id,
        project_id,
        campaign_structure,
        recommended_campaigns,
        primary_keywords,
        keyword_match_types,
        negative_keywords,
        ad_copy_variations,
        headline_suggestions,
        description_suggestions,
        landing_page_recommendations,
        bid_strategy_recommendations,
        budget_allocation,
        ab_testing_suggestions,
        executive_summary,
        target_audience_analysis,
        competitor_analysis
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *
    `, [
      clientId,
      projectId,
      JSON.stringify(strategy.campaign_structure || []),
      JSON.stringify(strategy.campaign_structure || []), // Use same for recommended_campaigns
      JSON.stringify(strategy.primary_keywords || []),
      JSON.stringify((strategy.primary_keywords || []).map(kw => kw.match_type || 'broad')), // Extract match types
      strategy.negative_keywords || [],
      JSON.stringify(strategy.ad_copy_variations || []),
      JSON.stringify((strategy.ad_copy_variations || []).flatMap(ad => ad.headlines || [])),
      JSON.stringify((strategy.ad_copy_variations || []).flatMap(ad => ad.descriptions || [])),
      strategy.landing_page_recommendations || '',
      strategy.bid_strategy_recommendations || '',
      JSON.stringify(strategy.budget_allocation || []),
      JSON.stringify(strategy.ab_testing_suggestions || []),
      strategy.executive_summary || '',
      strategy.target_audience_analysis || '',
      strategy.competitor_analysis || ''
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error saving Google Ads strategy:', error);
    throw error;
  }
}

/**
 * Get Google Ads strategies for a project
 */
export async function getGoogleAdsStrategiesByProject(projectId) {
  try {
    const result = await pool.query(
      'SELECT * FROM google_ads_strategies WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching Google Ads strategies:', error);
    throw error;
  }
}

/**
 * Get specific Google Ads strategy by ID
 */
export async function getGoogleAdsStrategyById(strategyId) {
  try {
    const result = await pool.query(
      'SELECT * FROM google_ads_strategies WHERE id = $1',
      [strategyId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching Google Ads strategy:', error);
    throw error;
  }
}

/**
 * Update Google Ads strategy
 */
export async function updateGoogleAdsStrategy(strategyId, updates) {
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    const allowedFields = [
      'campaign_structure', 'primary_keywords', 'negative_keywords',
      'ad_copy_variations', 'landing_page_recommendations',
      'bid_strategy_recommendations', 'budget_allocation',
      'ab_testing_suggestions', 'executive_summary', 'target_audience_analysis',
      'competitor_analysis'
    ];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        // Handle JSONB fields
        if (['campaign_structure', 'primary_keywords', 'ad_copy_variations', 
             'budget_allocation', 'ab_testing_suggestions'].includes(key)) {
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
      UPDATE google_ads_strategies 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating Google Ads strategy:', error);
    throw error;
  }
}

/**
 * Delete Google Ads strategy
 */
export async function deleteGoogleAdsStrategy(strategyId) {
  try {
    const result = await pool.query(
      'DELETE FROM google_ads_strategies WHERE id = $1 RETURNING id',
      [strategyId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting Google Ads strategy:', error);
    throw error;
  }
}

