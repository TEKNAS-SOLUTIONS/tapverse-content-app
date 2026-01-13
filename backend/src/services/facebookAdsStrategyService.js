import { generateContentWithSystem } from './claude.js';
import pool from '../db/index.js';

/**
 * Facebook Ads Strategy Generation Service
 * 
 * Generates comprehensive Facebook/Instagram Ads strategies using Claude
 * Includes: campaign objectives, audience targeting, ad creatives, placements, bidding
 */

/**
 * Generate comprehensive Facebook Ads strategy for a project
 */
export async function generateFacebookAdsStrategy(projectId, clientData = {}, projectData = {}) {
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
    const savedStrategy = await saveFacebookAdsStrategy(projectId, clientId, strategy);
    
    return savedStrategy;
  } catch (error) {
    console.error('Error generating Facebook Ads strategy:', error);
    throw new Error(`Failed to generate Facebook Ads strategy: ${error.message}`);
  }
}

/**
 * Generate Facebook Ads strategy using Claude AI
 */
async function generateStrategyWithAI(clientData, projectData) {
  const industry = clientData.industry || 'General';
  const companyName = clientData.company_name || 'Client';
  const targetAudience = projectData.target_audience || clientData.target_audience || 'General audience';
  const keywords = projectData.keywords || [];
  const competitors = clientData.competitors || [];
  const brandVoice = clientData.brand_voice || 'Professional';
  const brandTone = clientData.brand_tone || 'Professional';
  const facebookPageId = clientData.facebook_page_id || 'Not specified';
  const instagramAccountId = clientData.instagram_account_id || 'Not specified';
  
  const systemPrompt = `You are an expert Facebook and Instagram Ads strategist with 15+ years of experience. 
You create comprehensive, data-driven social media advertising strategies that drive real business results.

Your strategies include:
- Optimal campaign objectives and structure
- Precise audience targeting (demographics, interests, behaviors, custom audiences, lookalikes)
- Compelling ad creative concepts (images, videos, copy)
- Strategic placement recommendations
- Smart budget and bidding strategies
- A/B testing frameworks

Always provide actionable, specific recommendations backed by strategic thinking.`;

  const userPrompt = `Create a comprehensive Facebook and Instagram Ads strategy for:

COMPANY: ${companyName}
INDUSTRY: ${industry}
TARGET AUDIENCE: ${targetAudience}
BRAND VOICE: ${brandVoice}
BRAND TONE: ${brandTone}
FACEBOOK PAGE ID: ${facebookPageId}
INSTAGRAM ACCOUNT ID: ${instagramAccountId}
PRIMARY KEYWORDS: ${keywords.length > 0 ? keywords.join(', ') : 'To be researched'}
COMPETITORS: ${competitors.length > 0 ? competitors.join(', ') : 'None specified'}

Generate a complete Facebook/Instagram Ads strategy including:

1. EXECUTIVE SUMMARY
   - Overview of Facebook/Instagram Ads opportunity
   - Key recommendations summary
   - Expected outcomes and KPIs

2. CAMPAIGN STRUCTURE
   - Recommended campaign objectives (3-5 campaigns)
   - Campaign naming conventions
   - Ad set organization

3. AUDIENCE TARGETING
   - Detailed audience personas
   - Demographic targeting (age, gender, location, language)
   - Interest and behavior targeting
   - Custom audience recommendations
   - Lookalike audience strategies

4. AD CREATIVE CONCEPTS
   - Image ad concepts (3-5 variations)
   - Video ad concepts (2-3 variations)
   - Carousel ad concepts
   - Story ad concepts
   - Copy variations for each ad type

5. PLACEMENT RECOMMENDATIONS
   - Facebook Feed, Instagram Feed, Stories
   - Audience Network, Messenger, etc.
   - Placement optimization strategies

6. BUDGET STRATEGY
   - Budget distribution across campaigns
   - Daily/monthly budget recommendations
   - Budget optimization strategies

7. BIDDING STRATEGY
   - Recommended bidding strategies (Lowest Cost, Cost Cap, Bid Cap, etc.)
   - Bid optimization tips
   - Campaign Budget Optimization (CBO) recommendations

8. A/B TESTING SUGGESTIONS
   - Creative tests (images, videos, copy)
   - Audience tests
   - Placement tests
   - Bid strategy tests

9. TARGET AUDIENCE ANALYSIS
   - Detailed audience personas for targeting
   - Psychographic and behavioral insights
   - Platform-specific audience behaviors

10. COMPETITOR ANALYSIS
    - Competitor ad strategies
    - Opportunities to outperform
    - Creative inspiration opportunities

CRITICAL: Keep the response concise and within 4000 tokens. Focus on the most important recommendations.

Format the output as VALID JSON (no trailing commas, all strings quoted):
{
  "executive_summary": "Brief 2-3 sentence overview",
  "campaign_structure": [
    {"name": "Campaign 1", "objective": "Traffic/Conversions/Awareness", "ad_sets": 3, "description": "Brief description"},
    {"name": "Campaign 2", "objective": "Engagement", "ad_sets": 2, "description": "Brief description"}
  ],
  "campaign_objectives": [
    {"campaign": "Campaign 1", "objective": "Conversions", "description": "Brief description"}
  ],
  "audience_targeting": [
    {"name": "Audience 1", "demographics": "Age 25-45, Gender: All", "interests": ["Interest1", "Interest2"], "behaviors": ["Behavior1"], "description": "Brief description"},
    {"name": "Audience 2", "demographics": "Age 30-55", "interests": ["Interest3"], "behaviors": [], "description": "Brief description"}
  ],
  "custom_audiences": [
    {"type": "Website Visitors", "description": "Brief description"},
    {"type": "Email List", "description": "Brief description"}
  ],
  "lookalike_audiences": [
    {"source": "Custom Audience 1", "percentage": "1-3%", "description": "Brief description"}
  ],
  "ad_creative_concepts": [
    {"type": "Image", "concept": "Brief concept", "copy": "Ad copy text", "cta": "Learn More"},
    {"type": "Video", "concept": "Brief concept", "copy": "Ad copy text", "cta": "Shop Now"}
  ],
  "placement_recommendations": "3-4 key recommendations in 2-3 sentences",
  "budget_strategy": "2-3 sentence recommendation",
  "bidding_strategy": "2-3 sentence recommendation",
  "ab_testing_suggestions": [
    {"test_type": "Creative", "description": "Brief description"},
    {"test_type": "Audience", "description": "Brief description"}
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
            executive_summary: response.substring(0, 500) || "Facebook Ads strategy generated",
            campaign_structure: [],
            campaign_objectives: [],
            audience_targeting: [],
            custom_audiences: [],
            lookalike_audiences: [],
            ad_creative_concepts: [],
            placement_recommendations: "See full response in logs",
            budget_strategy: "",
            bidding_strategy: "",
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
    console.error('Failed to parse Facebook Ads strategy JSON. Response length:', response.length);
    console.error('Response preview:', response.substring(0, 1000));
    throw new Error('Failed to parse Facebook Ads strategy JSON from Claude response. Response may be too large or malformed.');
  } catch (error) {
    console.error('Error generating Facebook Ads strategy with AI:', error);
    throw error;
  }
}

/**
 * Save Facebook Ads strategy to database
 */
async function saveFacebookAdsStrategy(projectId, clientId, strategy) {
  try {
    const result = await pool.query(`
      INSERT INTO facebook_ads_strategies (
        client_id,
        project_id,
        campaign_structure,
        campaign_objectives,
        audience_targeting,
        custom_audiences,
        lookalike_audiences,
        demographic_targeting,
        ad_creative_concepts,
        image_suggestions,
        video_suggestions,
        copy_variations,
        placement_recommendations,
        budget_strategy,
        bidding_strategy,
        ab_testing_suggestions,
        executive_summary,
        target_audience_analysis,
        competitor_analysis
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING *
    `, [
      clientId,
      projectId,
      JSON.stringify(strategy.campaign_structure || []),
      JSON.stringify(strategy.campaign_objectives || []),
      JSON.stringify(strategy.audience_targeting || []),
      JSON.stringify(strategy.custom_audiences || []),
      JSON.stringify(strategy.lookalike_audiences || []),
      JSON.stringify((strategy.audience_targeting || []).map(a => a.demographics || '')), // Extract demographics
      JSON.stringify((strategy.ad_creative_concepts || []).filter(c => c.type === 'Image')),
      JSON.stringify((strategy.ad_creative_concepts || []).filter(c => c.type === 'Video')),
      JSON.stringify((strategy.ad_creative_concepts || []).map(c => c.copy || '')),
      strategy.placement_recommendations || '',
      strategy.budget_strategy || '',
      strategy.bidding_strategy || '',
      JSON.stringify(strategy.ab_testing_suggestions || []),
      strategy.executive_summary || '',
      strategy.target_audience_analysis || '',
      strategy.competitor_analysis || ''
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error saving Facebook Ads strategy:', error);
    throw error;
  }
}

/**
 * Get Facebook Ads strategies for a project
 */
export async function getFacebookAdsStrategiesByProject(projectId) {
  try {
    const result = await pool.query(
      'SELECT * FROM facebook_ads_strategies WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching Facebook Ads strategies:', error);
    throw error;
  }
}

/**
 * Get specific Facebook Ads strategy by ID
 */
export async function getFacebookAdsStrategyById(strategyId) {
  try {
    const result = await pool.query(
      'SELECT * FROM facebook_ads_strategies WHERE id = $1',
      [strategyId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching Facebook Ads strategy:', error);
    throw error;
  }
}

/**
 * Update Facebook Ads strategy
 */
export async function updateFacebookAdsStrategy(strategyId, updates) {
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    const allowedFields = [
      'campaign_structure', 'campaign_objectives', 'audience_targeting',
      'custom_audiences', 'lookalike_audiences', 'ad_creative_concepts',
      'placement_recommendations', 'budget_strategy', 'bidding_strategy',
      'ab_testing_suggestions', 'executive_summary', 'target_audience_analysis',
      'competitor_analysis'
    ];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        // Handle JSONB fields
        if (['campaign_structure', 'campaign_objectives', 'audience_targeting',
             'custom_audiences', 'lookalike_audiences', 'ad_creative_concepts',
             'ab_testing_suggestions'].includes(key)) {
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
      UPDATE facebook_ads_strategies 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating Facebook Ads strategy:', error);
    throw error;
  }
}

/**
 * Delete Facebook Ads strategy
 */
export async function deleteFacebookAdsStrategy(strategyId) {
  try {
    const result = await pool.query(
      'DELETE FROM facebook_ads_strategies WHERE id = $1 RETURNING id',
      [strategyId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error deleting Facebook Ads strategy:', error);
    throw error;
  }
}

