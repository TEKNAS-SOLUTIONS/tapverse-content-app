import { generateContentWithSystem } from './claude.js';
import pool from '../db/index.js';

/**
 * SEO Strategy Generation Service
 * 
 * Generates comprehensive SEO strategies using Claude Sonnet
 * Includes: keyword research, content pillars, technical SEO, competitor analysis
 * Supports business-type-specific strategies: General, Local, Shopify
 */

/**
 * Build prompt for General Business (Blog, SaaS, Services, Agency)
 */
function buildGeneralBusinessPrompt(clientData, projectData) {
  const industry = clientData.industry || 'General';
  const companyName = clientData.company_name || 'Client';
  const targetAudience = projectData.target_audience || clientData.target_audience || 'General audience';
  const keywords = projectData.keywords || [];
  const competitors = clientData.competitors || [];
  const brandVoice = clientData.brand_voice || 'Professional';
  const brandTone = clientData.brand_tone || 'Professional';
  
  const systemPrompt = `You are an expert SEO strategist with 15+ years of experience. 
You create comprehensive, data-driven SEO strategies that drive real business results.

Your strategies focus on:
- Thought leadership and brand authority
- Organic traffic growth
- Long-form content and whitepapers
- Informational and navigational keyword intent
- Brand awareness and industry positioning

Always provide actionable, specific recommendations backed by strategic thinking.`;

  const userPrompt = `Create a comprehensive SEO strategy for a GENERAL BUSINESS:

COMPANY: ${companyName}
INDUSTRY: ${industry}
TARGET AUDIENCE: ${targetAudience}
BRAND VOICE: ${brandVoice}
BRAND TONE: ${brandTone}
PRIMARY KEYWORDS: ${keywords.length > 0 ? keywords.join(', ') : 'To be researched'}
COMPETITORS: ${competitors.length > 0 ? competitors.join(', ') : 'None specified'}

Focus Areas:
- Thought leadership content (long-form articles, whitepapers, case studies)
- Brand authority building
- Informational and navigational keyword targeting
- Industry expertise positioning
- Organic traffic growth
- Brand mentions and awareness

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

CRITICAL: Keep the response concise and within 4000 tokens. Focus on the most important recommendations.

Format the output as VALID JSON (no trailing commas, all strings quoted):
{
  "executive_summary": "Brief 2-3 sentence overview",
  "primary_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "secondary_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"],
  "content_pillars": [
    {"theme": "Pillar 1", "target_keywords": ["kw1", "kw2"], "goals": "Brief goal"},
    {"theme": "Pillar 2", "target_keywords": ["kw3", "kw4"], "goals": "Brief goal"},
    {"theme": "Pillar 3", "target_keywords": ["kw5", "kw6"], "goals": "Brief goal"}
  ],
  "content_calendar": [
    {"month": "Month 1", "theme": "Theme", "frequency": "2 posts/week", "priority_pieces": ["Piece 1", "Piece 2"]},
    {"month": "Month 2", "theme": "Theme", "frequency": "2 posts/week", "priority_pieces": ["Piece 1", "Piece 2"]}
  ],
  "technical_seo_recommendations": "3-4 key technical recommendations in 2-3 sentences",
  "link_building_opportunities": [
    {"opportunity": "Brief description", "type": "guest_post", "priority": "high"},
    {"opportunity": "Brief description", "type": "resource_page", "priority": "medium"}
  ],
  "content_gap_analysis": [
    {"topic": "Topic", "priority": "high", "content_type": "blog", "target_keyword": "keyword"},
    {"topic": "Topic", "priority": "medium", "content_type": "guide", "target_keyword": "keyword"}
  ],
  "competitor_gaps": [
    {"opportunity": "Brief opportunity", "competitor": "Competitor", "priority": "high", "content_type": "blog"}
  ],
  "target_audience_analysis": "2-3 sentence audience analysis",
  "competitor_analysis_summary": "2-3 sentence competitor summary"
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations. Just the JSON object.`;

  return { systemPrompt, userPrompt };
}

/**
 * Build prompt for Local Business (Dentist, Plumber, Salon, Lawyer, etc.)
 */
function buildLocalBusinessPrompt(clientData, projectData, location) {
  const industry = clientData.industry || 'Local Business';
  const companyName = clientData.company_name || 'Client';
  const targetAudience = projectData.target_audience || clientData.target_audience || 'Local customers';
  const keywords = projectData.keywords || [];
  const competitors = clientData.competitors || [];
  const brandVoice = clientData.brand_voice || 'Professional';
  const brandTone = clientData.brand_tone || 'Professional';
  
  const systemPrompt = `You are an expert local SEO strategist with 15+ years of experience. 
You create comprehensive, data-driven local SEO strategies that drive real business results.

Your strategies focus on:
- Local visibility and Google My Business optimization
- Local pack rankings
- Location-based keyword targeting
- Local citations and directories
- Review strategy and reputation management
- Local link building
- Service area targeting

Always provide actionable, specific recommendations backed by strategic thinking.`;

  const userPrompt = `Create a comprehensive LOCAL BUSINESS SEO strategy for:

COMPANY: ${companyName}
INDUSTRY: ${industry}
LOCATION: ${location}
TARGET AUDIENCE: ${targetAudience}
BRAND VOICE: ${brandVoice}
BRAND TONE: ${brandTone}
PRIMARY KEYWORDS: ${keywords.length > 0 ? keywords.join(', ') : 'To be researched'}
COMPETITORS: ${competitors.length > 0 ? competitors.join(', ') : 'None specified'}

Focus Areas:
- Local pack rankings (Google Maps)
- Google My Business optimization
- Local citations and directory listings
- Review strategy and reputation management
- Location-based keyword targeting (city + service)
- Local link building
- Service area pages
- Local content (guides, service pages, location-specific content)
- Phone calls and store visits
- Local traffic growth

Generate a complete local SEO strategy including:

1. EXECUTIVE SUMMARY
   - Overview of local SEO opportunity
   - Key recommendations summary
   - Expected outcomes (local pack position, phone calls, store visits)

2. KEYWORD RESEARCH
   - Local primary keywords (city + service, e.g., "dentist in New York")
   - Secondary local keywords (neighborhood + service, service + near me)
   - Search intent analysis (local intent)
   - Keyword difficulty estimates
   - Search volume estimates

3. CONTENT PILLAR STRATEGY
   - 3-5 main content pillars (service pages, location pages, local guides)
   - For each pillar: theme, target keywords, content types, goals

4. CONTENT CALENDAR RECOMMENDATIONS
   - Monthly content themes
   - Content types (service pages, location guides, local news, etc.)
   - Publishing frequency recommendations
   - Priority content pieces

5. TECHNICAL SEO RECOMMENDATIONS
   - Local schema markup (LocalBusiness, Service, etc.)
   - Site speed optimization
   - Mobile optimization (critical for local)
   - Site structure improvements
   - NAP (Name, Address, Phone) consistency

6. GOOGLE MY BUSINESS OPTIMIZATION
   - Profile optimization recommendations
   - Posting strategy
   - Photo optimization
   - Q&A management
   - Review response strategy

7. LOCAL CITATIONS & DIRECTORIES
   - High-priority citation sources
   - Industry-specific directories
   - Local business directories
   - Citation building strategy

8. REVIEW STRATEGY
   - Review generation tactics
   - Review response templates
   - Review monitoring
   - Reputation management

9. LINK BUILDING OPPORTUNITIES
   - Local business associations
   - Chamber of commerce
   - Local news sites
   - Community partnerships
   - Local sponsorships

10. CONTENT GAP ANALYSIS
    - Missing service pages
    - Missing location pages
    - Underperforming local content
    - Content refresh opportunities

11. COMPETITOR GAP ANALYSIS
    - Local competitors' strengths
    - Opportunities to outperform local competitors
    - Competitive positioning recommendations

12. TARGET AUDIENCE ANALYSIS
    - Local customer personas
    - Local search behavior patterns
    - Content preferences

13. COMPETITOR ANALYSIS SUMMARY
    - Top local competitors' strengths
    - Opportunities to outperform competitors
    - Competitive positioning recommendations

CRITICAL: Keep the response concise and within 4000 tokens. Focus on the most important recommendations.

Format the output as VALID JSON (same structure as general business, but include local-specific fields):
{
  "executive_summary": "Brief 2-3 sentence overview with local focus",
  "primary_keywords": ["local keyword 1", "local keyword 2", ...],
  "secondary_keywords": ["local keyword 1", "local keyword 2", ...],
  "content_pillars": [
    {"theme": "Pillar 1", "target_keywords": ["kw1", "kw2"], "goals": "Brief goal"}
  ],
  "content_calendar": [...],
  "technical_seo_recommendations": "Include local schema markup, NAP consistency",
  "link_building_opportunities": [...],
  "content_gap_analysis": [...],
  "competitor_gaps": [...],
  "target_audience_analysis": "Local customer focus",
  "competitor_analysis_summary": "Local competitor focus"
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations. Just the JSON object.`;

  return { systemPrompt, userPrompt };
}

/**
 * Build prompt for Shopify Store (E-commerce)
 */
function buildShopifyPrompt(clientData, projectData) {
  const industry = clientData.industry || 'E-commerce';
  const companyName = clientData.company_name || 'Client';
  const targetAudience = projectData.target_audience || clientData.target_audience || 'Online shoppers';
  const keywords = projectData.keywords || [];
  const competitors = clientData.competitors || [];
  const brandVoice = clientData.brand_voice || 'Professional';
  const brandTone = clientData.brand_tone || 'Professional';
  const shopifyUrl = clientData.shopify_url || '';
  
  const systemPrompt = `You are an expert e-commerce SEO strategist with 15+ years of experience. 
You create comprehensive, data-driven e-commerce SEO strategies that drive real business results.

Your strategies focus on:
- Product page optimization
- Category page strategy
- Commercial keyword targeting
- Conversion optimization
- Product schema markup
- Shopping feed optimization
- Revenue-focused content
- Buying guides and product comparisons

Always provide actionable, specific recommendations backed by strategic thinking.`;

  const userPrompt = `Create a comprehensive SHOPIFY E-COMMERCE SEO strategy for:

COMPANY: ${companyName}
INDUSTRY: ${industry}
SHOPIFY STORE: ${shopifyUrl}
TARGET AUDIENCE: ${targetAudience}
BRAND VOICE: ${brandVoice}
BRAND TONE: ${brandTone}
PRIMARY KEYWORDS: ${keywords.length > 0 ? keywords.join(', ') : 'To be researched'}
COMPETITORS: ${competitors.length > 0 ? competitors.join(', ') : 'None specified'}

Focus Areas:
- Product page optimization
- Category page strategy
- Commercial keyword targeting (buying intent)
- Conversion rate optimization
- Product schema markup
- Shopping feed optimization
- Revenue-focused content
- Buying guides and product comparisons
- Product page traffic
- Conversion rate
- Average order value
- Revenue growth

Generate a complete e-commerce SEO strategy including:

1. EXECUTIVE SUMMARY
   - Overview of e-commerce SEO opportunity
   - Key recommendations summary
   - Expected outcomes (product page traffic, conversion rate, revenue)

2. KEYWORD RESEARCH
   - Commercial primary keywords (product keywords, buying keywords)
   - Secondary keywords (category keywords, comparison keywords)
   - Search intent analysis (commercial intent)
   - Keyword difficulty estimates
   - Search volume estimates

3. CONTENT PILLAR STRATEGY
   - 3-5 main content pillars (product categories, buying guides, comparisons)
   - For each pillar: theme, target keywords, content types, goals

4. CONTENT CALENDAR RECOMMENDATIONS
   - Monthly content themes
   - Content types (product pages, buying guides, comparisons, blog posts)
   - Publishing frequency recommendations
   - Priority content pieces

5. TECHNICAL SEO RECOMMENDATIONS
   - Product schema markup (Product, Offer, AggregateRating)
   - Category page optimization
   - Site speed optimization (critical for e-commerce)
   - Mobile optimization
   - Site structure improvements
   - Faceted navigation optimization

6. PRODUCT PAGE OPTIMIZATION
   - Product title optimization
   - Product description optimization
   - Image optimization
   - Review integration
   - Related products strategy

7. CATEGORY PAGE STRATEGY
   - Category page optimization
   - Category descriptions
   - Filter optimization
   - Category content strategy

8. LINK BUILDING OPPORTUNITIES
   - Product review sites
   - Industry blogs
   - Influencer partnerships
   - Resource page opportunities
   - Content-based link building

9. CONTENT GAP ANALYSIS
   - Missing product pages
   - Missing category pages
   - Missing buying guides
   - Missing product comparisons
   - Underperforming product content

10. COMPETITOR GAP ANALYSIS
    - Product pages competitors rank for
    - Category strategies competitors use
    - Keyword opportunities competitors miss
    - Content formats competitors use

11. TARGET AUDIENCE ANALYSIS
    - Customer personas
    - Shopping behavior patterns
    - Content preferences
    - Buying journey

12. COMPETITOR ANALYSIS SUMMARY
    - Top competitors' strengths
    - Opportunities to outperform competitors
    - Competitive positioning recommendations

CRITICAL: Keep the response concise and within 4000 tokens. Focus on the most important recommendations.

Format the output as VALID JSON (same structure as general business, but include e-commerce-specific focus):
{
  "executive_summary": "Brief 2-3 sentence overview with e-commerce focus",
  "primary_keywords": ["commercial keyword 1", "product keyword 2", ...],
  "secondary_keywords": ["category keyword 1", "buying keyword 2", ...],
  "content_pillars": [
    {"theme": "Pillar 1", "target_keywords": ["kw1", "kw2"], "goals": "Brief goal"}
  ],
  "content_calendar": [...],
  "technical_seo_recommendations": "Include product schema, category optimization",
  "link_building_opportunities": [...],
  "content_gap_analysis": [...],
  "competitor_gaps": [...],
  "target_audience_analysis": "E-commerce customer focus",
  "competitor_analysis_summary": "E-commerce competitor focus"
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations. Just the JSON object.`;

  return { systemPrompt, userPrompt };
}

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
  
  // Detect business type
  const businessTypes = clientData.business_types || ['general'];
  const primaryBusinessType = clientData.primary_business_type || businessTypes[0] || 'general';
  const location = clientData.location || '';
  
  // Select appropriate prompt builder based on business type
  let systemPrompt, userPrompt;
  
  if (primaryBusinessType === 'local') {
    ({ systemPrompt, userPrompt } = buildLocalBusinessPrompt(clientData, projectData, location));
  } else if (primaryBusinessType === 'shopify') {
    ({ systemPrompt, userPrompt } = buildShopifyPrompt(clientData, projectData));
  } else {
    ({ systemPrompt, userPrompt } = buildGeneralBusinessPrompt(clientData, projectData));
  }
  
  // If multiple types, add note about multi-type strategy
  if (businessTypes.length > 1) {
    userPrompt += `\n\nNOTE: This client has multiple business types: ${businessTypes.join(', ')}. Focus on ${primaryBusinessType} as primary, but consider elements from other types where relevant.`;
  }

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
      maxTokens, // Adjusted based on model capabilities
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
            executive_summary: response.substring(0, 500) || "SEO strategy generated",
            primary_keywords: [],
            secondary_keywords: [],
            content_pillars: [],
            content_calendar: [],
            technical_seo_recommendations: "See full response in logs",
            link_building_opportunities: [],
            content_gap_analysis: [],
            competitor_gaps: [],
            target_audience_analysis: "",
            competitor_analysis_summary: ""
          };
          console.warn('Returning minimal strategy due to JSON parse failure');
          return minimal;
        } catch (e2) {
          console.error('Failed to create minimal strategy:', e2);
        }
      }
    }
    
    // If all parsing fails, log the response for debugging
    console.error('Failed to parse SEO strategy JSON. Response length:', response.length);
    console.error('Response preview:', response.substring(0, 1000));
    throw new Error('Failed to parse SEO strategy JSON from Claude response. Response may be too large or malformed.');
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

