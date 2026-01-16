import { generateContentWithSystem } from './claude.js';
import pool from '../db/index.js';

/**
 * Content Evidence Service
 * 
 * Generates transparent, evidence-based analysis for all AI-generated content.
 * Shows WHY content was created, what data supports it, and confidence levels.
 * 
 * Integration Points (for enhanced accuracy):
 * - Google Trends API: Real trend data
 * - SerpAPI/DataForSEO: SERP analysis
 * - Ahrefs/SEMrush API: Keyword metrics
 * - SimilarWeb API: Competitor traffic
 */

/**
 * Generate comprehensive evidence for content
 * @param {object} params - Parameters for evidence generation
 * @returns {Promise<object>} Evidence analysis object
 */
export async function generateContentEvidence(params) {
  const {
    contentType,      // 'blog', 'social', 'ad', 'email', etc.
    topic,            // Main topic/title
    keywords = [],    // Target keywords
    competitors = [], // Competitor URLs
    industry,         // Industry/niche
    targetAudience,   // Target audience description
    clientData = {},  // Full client data
    projectData = {}, // Full project data
  } = params;

  try {
    // Check for external API integrations
    const apiIntegrations = await checkAvailableAPIs();
    
    // Gather evidence from available sources
    const evidence = {
      overall_confidence: 0,
      seo_potential: 0,
      competition_level: 'medium',
      trend_direction: 'stable',
      trend_reason: '',
      key_insights: [],
      data_sources: ['AI Analysis (Claude)'],
      keyword_analysis: null,
      competitor_analysis: null,
      trend_analysis: null,
      serp_analysis: null,
      ai_reasoning: null,
      missing_data: [],
    };

    // Track what data we're missing for transparency
    if (!apiIntegrations.googleTrends) evidence.missing_data.push('Google Trends API');
    if (!apiIntegrations.serpApi) evidence.missing_data.push('SERP Data API');
    if (!apiIntegrations.keywordApi) evidence.missing_data.push('Keyword Metrics API');
    if (competitors.length === 0) evidence.missing_data.push('Competitor URLs');

    // Generate AI-powered analysis with reasoning
    const aiAnalysis = await generateAIEvidence({
      contentType,
      topic,
      keywords,
      competitors,
      industry,
      targetAudience,
      clientData,
      projectData,
    });

    // Merge AI analysis into evidence
    Object.assign(evidence, aiAnalysis);

    // Calculate overall confidence based on available data
    evidence.overall_confidence = calculateConfidenceScore(evidence, apiIntegrations, competitors);

    return evidence;
  } catch (error) {
    console.error('Error generating content evidence:', error);
    throw new Error(`Failed to generate content evidence: ${error.message}`);
  }
}

/**
 * Check which external APIs are available
 */
async function checkAvailableAPIs() {
  const integrations = {
    googleTrends: false,
    serpApi: false,
    keywordApi: false,
    competitorApi: false,
  };

  try {
    // Check system_settings for API keys
    const result = await pool.query(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key IN ('google_trends_api_key', 'serp_api_key', 'ahrefs_api_key', 'semrush_api_key')
    `);

    result.rows.forEach(row => {
      if (row.setting_value) {
        if (row.setting_key === 'google_trends_api_key') integrations.googleTrends = true;
        if (row.setting_key === 'serp_api_key') integrations.serpApi = true;
        if (row.setting_key === 'ahrefs_api_key' || row.setting_key === 'semrush_api_key') {
          integrations.keywordApi = true;
        }
      }
    });
  } catch (error) {
    console.error('Error checking API integrations:', error);
  }

  return integrations;
}

/**
 * Generate AI-powered evidence analysis
 */
async function generateAIEvidence(params) {
  const {
    contentType,
    topic,
    keywords,
    competitors,
    industry,
    targetAudience,
    clientData,
    projectData,
  } = params;

  const systemPrompt = `You are an expert SEO strategist and content analyst. Your job is to provide TRANSPARENT, EVIDENCE-BASED analysis that explains WHY specific content recommendations were made.

You must:
1. Clearly explain your reasoning process step-by-step
2. Acknowledge limitations and assumptions
3. Provide confidence scores based on available data
4. Suggest what additional data would improve accuracy
5. Be honest about uncertainty

Never make up specific numbers without labeling them as estimates.
Always explain the logic behind recommendations.`;

  const userPrompt = `Analyze this content opportunity and provide evidence-based insights:

CONTENT TYPE: ${contentType}
TOPIC: ${topic || 'Not specified'}
TARGET KEYWORDS: ${keywords.length > 0 ? keywords.join(', ') : 'None provided'}
COMPETITORS: ${competitors.length > 0 ? competitors.join(', ') : 'None specified'}
INDUSTRY: ${industry || 'General'}
TARGET AUDIENCE: ${targetAudience || 'Not specified'}
COMPANY: ${clientData.company_name || 'Client'}
BRAND TONE: ${clientData.brand_tone || 'professional'}

Provide a comprehensive analysis as JSON:

{
  "seo_potential": <number 1-100, your estimate based on keyword analysis>,
  "competition_level": "<low|medium|high>",
  "trend_direction": "<rising|stable|declining>",
  "trend_reason": "<brief explanation of trend assessment>",
  
  "key_insights": [
    "<insight 1: specific, actionable>",
    "<insight 2: why this content will work>",
    "<insight 3: competitive advantage>"
  ],
  
  "keyword_analysis": {
    "primary_keywords": [
      {
        "keyword": "<keyword>",
        "score": <1-100 opportunity score>,
        "volume": "<estimated: high/medium/low>",
        "difficulty": <estimated 1-100>,
        "intent": "<informational|navigational|commercial|transactional>",
        "why_chosen": "<specific reason this keyword matters>"
      }
    ],
    "selection_reasoning": "<explain the overall keyword selection strategy>"
  },
  
  "competitor_analysis": {
    "competitors": [
      {
        "name": "<competitor name or domain>",
        "domain_authority": "<estimated DA or N/A>",
        "strengths": "<what they do well>",
        "weaknesses": "<gaps we can exploit>"
      }
    ],
    "our_advantage": "<specific competitive advantage for this content>"
  },
  
  "trend_analysis": {
    "seasonal_relevance": "<e.g., 'Q1 peak for tax content'>",
    "best_time_to_publish": "<recommendation>",
    "industry_growth": "<growing|stable|declining>",
    "related_trends": ["<trend 1>", "<trend 2>", "<trend 3>"],
    "reasoning": "<explain how you assessed trends>"
  },
  
  "serp_analysis": {
    "avg_word_count": "<estimated for top results>",
    "avg_da": "<estimated average DA of top 10>",
    "has_featured_snippet": <true|false>,
    "dominant_content_type": "<listicle|how-to|guide|comparison|etc>",
    "top_results": [
      {"title": "<likely top result type>", "word_count": "<estimate>"}
    ],
    "strategy": "<how to beat current rankings>"
  },
  
  "ai_reasoning": {
    "steps": [
      {"title": "Step 1: Topic Analysis", "description": "<what you analyzed>"},
      {"title": "Step 2: Keyword Research", "description": "<how you selected keywords>"},
      {"title": "Step 3: Competition Check", "description": "<competitive landscape>"},
      {"title": "Step 4: Content Strategy", "description": "<why this approach>"}
    ],
    "assumptions": [
      "<assumption 1 you're making>",
      "<assumption 2 you're making>"
    ],
    "limitations": [
      "<limitation 1: e.g., no real search volume data>",
      "<limitation 2: e.g., competitor analysis based on AI knowledge>"
    ]
  }
}

IMPORTANT: 
- Be honest about what is estimated vs. real data
- Label assumptions clearly
- Provide actionable insights, not generic advice
- Focus on WHY, not just WHAT

Return ONLY valid JSON.`;

  try {
    // Get model from settings
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

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // Try to fix common JSON issues
        let fixedJson = jsonMatch[0]
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        return JSON.parse(fixedJson);
      }
    }

    throw new Error('Failed to parse AI evidence response');
  } catch (error) {
    console.error('Error generating AI evidence:', error);
    // Return minimal evidence on error
    return {
      seo_potential: 50,
      competition_level: 'medium',
      trend_direction: 'stable',
      trend_reason: 'Analysis pending',
      key_insights: ['Analysis could not be completed. Please try again.'],
      keyword_analysis: { primary_keywords: [], selection_reasoning: 'Analysis failed' },
      competitor_analysis: { competitors: [], our_advantage: 'Analysis failed' },
      trend_analysis: { reasoning: 'Analysis failed' },
      serp_analysis: { strategy: 'Analysis failed' },
      ai_reasoning: {
        steps: [],
        assumptions: ['Analysis could not be completed'],
        limitations: ['Error occurred during analysis'],
      },
    };
  }
}

/**
 * Calculate confidence score based on available data
 */
function calculateConfidenceScore(evidence, apiIntegrations, competitors) {
  let score = 40; // Base score for AI analysis

  // Add points for available data
  if (apiIntegrations.googleTrends) score += 15;
  if (apiIntegrations.serpApi) score += 15;
  if (apiIntegrations.keywordApi) score += 15;
  if (competitors.length > 0) score += 10;
  if (competitors.length >= 3) score += 5;

  // Adjust based on analysis quality
  if (evidence.keyword_analysis?.primary_keywords?.length >= 3) score += 5;
  if (evidence.competitor_analysis?.competitors?.length >= 2) score += 5;
  if (evidence.ai_reasoning?.steps?.length >= 3) score += 5;

  return Math.min(score, 100);
}

/**
 * Get evidence for existing content
 */
export async function getContentEvidenceById(contentId) {
  try {
    const result = await pool.query(
      'SELECT evidence FROM content WHERE id = $1',
      [contentId]
    );
    return result.rows[0]?.evidence || null;
  } catch (error) {
    console.error('Error fetching content evidence:', error);
    return null;
  }
}

/**
 * Save evidence to content record
 */
export async function saveContentEvidence(contentId, evidence) {
  try {
    await pool.query(
      'UPDATE content SET evidence = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(evidence), contentId]
    );
    return true;
  } catch (error) {
    console.error('Error saving content evidence:', error);
    return false;
  }
}

export default {
  generateContentEvidence,
  getContentEvidenceById,
  saveContentEvidence,
};
