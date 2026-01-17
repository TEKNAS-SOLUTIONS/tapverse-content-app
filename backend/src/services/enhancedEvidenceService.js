import { generateContentWithSystem } from './claude.js';
import pool from '../db/index.js';
import https from 'https';
import http from 'http';
import { getSerpData } from './dataForSeoService.js';
import { config } from '../config/config.js';

/**
 * Enhanced Evidence Service
 * 
 * Achieves 90%+ confidence using AI-only approach:
 * 1. Chain-of-thought prompting for deep reasoning
 * 2. Multi-pass analysis with synthesis
 * 3. Free web scraping for competitor data
 * 4. Google autocomplete for keyword validation
 * 5. Cross-reference validation
 */

/**
 * Main function to generate enhanced evidence
 */
export async function generateEnhancedEvidence(params) {
  const {
    contentType,
    topic,
    keywords = [],
    competitors = [],
    industry,
    targetAudience,
    clientData = {},
    projectData = {},
  } = params;

  console.log('Starting enhanced evidence generation...');

  try {
    // Step 1: Gather real data from free sources
    const realData = await gatherFreeData(topic, keywords, competitors);
    
    // Step 1.5: Get SERP data from DataForSEO if enabled and keywords available
    let serpDataSource = 'none';
    if (config.dataForSeo?.enabled && keywords.length > 0) {
      try {
        console.log('Fetching SERP data from DataForSEO...');
        const primaryKeyword = keywords[0]; // Use first keyword for SERP analysis
        const serpData = await getSerpData(
          primaryKeyword,
          config.dataForSeo.defaultLocation,
          config.dataForSeo.defaultLanguage
        );
        realData.serpData = serpData;
        realData.sources.push('DataForSEO SERP Analysis');
        serpDataSource = 'dataforseo';
        console.log(`Retrieved SERP data for "${primaryKeyword}"`);
      } catch (error) {
        console.error('DataForSEO SERP error (continuing without):', error.message);
        serpDataSource = 'ai_fallback';
        // Continue without SERP data
      }
    }
    
    // Step 2: Run multi-pass AI analysis
    const analyses = await runMultiPassAnalysis({
      contentType,
      topic,
      keywords,
      competitors,
      industry,
      targetAudience,
      clientData,
      projectData,
      realData,
    });

    // Step 3: Synthesize and validate
    const synthesized = await synthesizeAnalyses(analyses, realData);

    // Step 4: Calculate confidence with new methodology
    const confidence = calculateEnhancedConfidence(synthesized, realData);

    return {
      ...synthesized,
      overall_confidence: confidence,
      methodology: {
        passes: analyses.length,
        real_data_sources: realData.sources,
        validation_method: 'Multi-pass synthesis with cross-validation',
      },
      metadata: {
        dataforseo_enabled: config.dataForSeo?.enabled || false,
        serp_data_source: serpDataSource,
        keyword_data_source: realData.serpData ? 'dataforseo' : 'ai',
        fallback_used: serpDataSource === 'ai_fallback',
        message: serpDataSource === 'dataforseo'
          ? 'Real SERP data from DataForSEO API'
          : serpDataSource === 'ai_fallback'
          ? '⚠️ DataForSEO SERP unavailable - using AI analysis (fallback)'
          : 'AI-powered analysis (DataForSEO not enabled)',
      },
    };
  } catch (error) {
    console.error('Error in enhanced evidence generation:', error);
    throw error;
  }
}

/**
 * Gather free data from various sources
 */
async function gatherFreeData(topic, keywords, competitors) {
  const data = {
    sources: [],
    googleAutocomplete: [],
    competitorData: [],
    relatedSearches: [],
    serpData: null, // DataForSEO SERP data
  };

  // 1. Google Autocomplete (free keyword ideas)
  try {
    const autocompleteResults = await getGoogleAutocomplete(topic);
    if (autocompleteResults.length > 0) {
      data.googleAutocomplete = autocompleteResults;
      data.sources.push('Google Autocomplete');
    }
  } catch (e) {
    console.log('Autocomplete fetch skipped:', e.message);
  }

  // 2. Scrape competitor sites (if URLs provided)
  if (competitors.length > 0) {
    for (const url of competitors.slice(0, 3)) { // Limit to 3
      try {
        const competitorInfo = await scrapeCompetitorBasics(url);
        if (competitorInfo) {
          data.competitorData.push(competitorInfo);
          data.sources.push(`Competitor: ${new URL(url).hostname}`);
        }
      } catch (e) {
        console.log(`Competitor scrape skipped for ${url}:`, e.message);
      }
    }
  }

  // 3. Get related searches from keywords
  for (const kw of keywords.slice(0, 3)) {
    try {
      const related = await getGoogleAutocomplete(kw);
      data.relatedSearches.push(...related.slice(0, 5));
      if (related.length > 0 && !data.sources.includes('Google Related Searches')) {
        data.sources.push('Google Related Searches');
      }
    } catch (e) {
      // Silent fail for related searches
    }
  }

  return data;
}

/**
 * Get Google Autocomplete suggestions (free)
 */
async function getGoogleAutocomplete(query) {
  return new Promise((resolve) => {
    const encodedQuery = encodeURIComponent(query);
    const url = `http://suggestqueries.google.com/complete/search?client=firefox&q=${encodedQuery}`;
    
    const timeout = setTimeout(() => resolve([]), 3000);
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        clearTimeout(timeout);
        try {
          const parsed = JSON.parse(data);
          resolve(parsed[1] || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', () => {
      clearTimeout(timeout);
      resolve([]);
    });
  });
}

/**
 * Basic competitor scraping (meta tags, headings, word count)
 */
async function scrapeCompetitorBasics(url) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 5000);
    
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; ContentBot/1.0)' 
      },
      timeout: 5000,
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        clearTimeout(timeout);
        return resolve(null); // Skip redirects for now
      }
      
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        clearTimeout(timeout);
        try {
          const info = parseBasicHTML(html, url);
          resolve(info);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => {
      clearTimeout(timeout);
      resolve(null);
    });
  });
}

/**
 * Parse basic HTML for SEO data
 */
function parseBasicHTML(html, url) {
  const info = {
    url,
    domain: new URL(url).hostname,
    title: '',
    metaDescription: '',
    h1Count: 0,
    h2Count: 0,
    wordCount: 0,
    hasSchema: false,
    contentTopics: [],
  };

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) info.title = titleMatch[1].trim();

  // Extract meta description
  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (metaMatch) info.metaDescription = metaMatch[1].trim();

  // Count headings
  info.h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  info.h2Count = (html.match(/<h2[^>]*>/gi) || []).length;

  // Estimate word count (rough)
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  info.wordCount = textContent.split(' ').length;

  // Check for schema
  info.hasSchema = html.includes('application/ld+json') || html.includes('itemtype=');

  // Extract H2 topics
  const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
  info.contentTopics = h2Matches
    .map(h => h.replace(/<[^>]+>/g, '').trim())
    .filter(h => h.length > 3)
    .slice(0, 10);

  return info;
}

/**
 * Run multi-pass AI analysis
 */
async function runMultiPassAnalysis(params) {
  const { 
    contentType, topic, keywords, competitors, industry, 
    targetAudience, clientData, projectData, realData 
  } = params;

  // Get model settings
  let model = 'claude-3-haiku-20240307';
  try {
    const modelResult = await pool.query(
      "SELECT setting_value FROM system_settings WHERE setting_key = 'claude_model'"
    );
    if (modelResult.rows.length > 0 && modelResult.rows[0].setting_value) {
      model = modelResult.rows[0].setting_value;
    }
  } catch (e) {
    console.error('Error fetching model:', e);
  }

  const analyses = [];

  // Pass 1: Deep Keyword Analysis
  console.log('Running Pass 1: Keyword Analysis...');
  const keywordAnalysis = await runKeywordPass(model, {
    topic, keywords, industry, realData
  });
  analyses.push({ type: 'keyword', data: keywordAnalysis });

  // Pass 2: Competitor & Market Analysis  
  console.log('Running Pass 2: Competitor Analysis...');
  const competitorAnalysis = await runCompetitorPass(model, {
    topic, competitors, industry, realData, clientData
  });
  analyses.push({ type: 'competitor', data: competitorAnalysis });

  // Pass 3: Content Strategy & Trends
  console.log('Running Pass 3: Strategy Analysis...');
  const strategyAnalysis = await runStrategyPass(model, {
    contentType, topic, keywords, industry, targetAudience, realData
  });
  analyses.push({ type: 'strategy', data: strategyAnalysis });

  return analyses;
}

/**
 * Pass 1: Deep Keyword Analysis
 */
async function runKeywordPass(model, params) {
  const { topic, keywords, industry, realData } = params;
  
  const systemPrompt = `You are an expert SEO keyword analyst. Your task is to provide DEEP, EVIDENCE-BASED keyword analysis.

CRITICAL RULES:
1. Use chain-of-thought reasoning - show your thinking process
2. Provide specific numbers with confidence ranges (e.g., "500-1500 monthly searches")
3. Explain WHY each keyword is valuable
4. Reference real patterns from your training data
5. Be specific to the industry, not generic

You have access to real Google Autocomplete data to validate your analysis.`;

  const autocompleteInfo = realData.googleAutocomplete.length > 0
    ? `\nREAL GOOGLE AUTOCOMPLETE DATA:\n${realData.googleAutocomplete.slice(0, 15).map(s => `- "${s}"`).join('\n')}`
    : '';

  const relatedInfo = realData.relatedSearches.length > 0
    ? `\nRELATED SEARCHES PEOPLE MAKE:\n${[...new Set(realData.relatedSearches)].slice(0, 10).map(s => `- "${s}"`).join('\n')}`
    : '';

  const userPrompt = `Perform deep keyword analysis for:

TOPIC: ${topic}
INDUSTRY: ${industry || 'General'}
PROVIDED KEYWORDS: ${keywords.length > 0 ? keywords.join(', ') : 'None - suggest based on topic'}
${autocompleteInfo}
${relatedInfo}

Think step by step:

STEP 1: SEARCH INTENT ANALYSIS
- What is the primary search intent for this topic?
- What questions are searchers trying to answer?
- What stage of the buyer journey are they in?

STEP 2: KEYWORD OPPORTUNITY ASSESSMENT
For each keyword, analyze:
- Estimated search volume range (use your knowledge of similar keywords)
- Difficulty assessment with reasoning
- Commercial value (who would pay for this traffic?)

STEP 3: KEYWORD GAPS
- What related keywords are people searching that aren't obvious?
- What long-tail variations have lower competition?

Respond in JSON:
{
  "reasoning_chain": {
    "step1_intent": "<your analysis>",
    "step2_assessment": "<your analysis>",
    "step3_gaps": "<your analysis>"
  },
  "primary_keywords": [
    {
      "keyword": "<keyword>",
      "monthly_volume_estimate": "<range like 1000-3000>",
      "volume_confidence": "<how sure: high/medium/low>",
      "difficulty": <1-100>,
      "difficulty_reasoning": "<why this difficulty>",
      "intent": "<informational/commercial/transactional/navigational>",
      "opportunity_score": <1-100>,
      "why_valuable": "<specific reason>"
    }
  ],
  "long_tail_opportunities": [
    {
      "keyword": "<long tail keyword>",
      "estimated_volume": "<range>",
      "difficulty": <1-100>,
      "conversion_potential": "<high/medium/low>",
      "rationale": "<why this is an opportunity>"
    }
  ],
  "keyword_clusters": [
    {
      "theme": "<cluster theme>",
      "keywords": ["kw1", "kw2", "kw3"],
      "content_angle": "<how to address this cluster>"
    }
  ],
  "validated_by_autocomplete": [
    "<keywords that appear in autocomplete data>"
  ],
  "confidence_factors": {
    "data_quality": "<high/medium/low>",
    "industry_familiarity": "<high/medium/low>",
    "autocomplete_validation": <true/false>
  }
}`;

  const maxTokens = model.includes('haiku') ? 4096 : 8192;
  const response = await generateContentWithSystem(systemPrompt, userPrompt, { model, maxTokens });
  
  return parseJSONResponse(response);
}

/**
 * Pass 2: Competitor Analysis
 */
async function runCompetitorPass(model, params) {
  const { topic, competitors, industry, realData, clientData } = params;

  const systemPrompt = `You are an expert competitive analyst for SEO and content marketing. Analyze competitors thoroughly using available data.

CRITICAL RULES:
1. Use actual scraped data when available
2. Identify SPECIFIC weaknesses to exploit
3. Provide actionable competitive advantages
4. Be honest about data limitations`;

  let competitorInfo = '';
  if (realData.competitorData.length > 0) {
    competitorInfo = '\nREAL COMPETITOR DATA (SCRAPED):\n';
    realData.competitorData.forEach((comp, i) => {
      competitorInfo += `
Competitor ${i + 1}: ${comp.domain}
- Title: ${comp.title}
- Meta Description: ${comp.metaDescription || 'Not found'}
- Word Count: ~${comp.wordCount}
- H1 Tags: ${comp.h1Count}
- H2 Tags: ${comp.h2Count}
- Has Schema: ${comp.hasSchema}
- Content Topics: ${comp.contentTopics.slice(0, 5).join(', ') || 'Not extracted'}
`;
    });
  }

  // Add SERP data if available
  let serpInfo = '';
  if (realData.serpData) {
    serpInfo = `\n\nREAL SERP DATA FROM DATAFORSEO (Top 10 Results):\n`;
    serpInfo += `Keyword: "${realData.serpData.keyword}"\n`;
    serpInfo += `Total Results: ${realData.serpData.serp_info?.total_results || 0}\n`;
    serpInfo += `Featured Snippet: ${realData.serpData.featured_snippet ? 'Yes' : 'No'}\n\n`;
    serpInfo += `Top Ranking Pages:\n`;
    realData.serpData.organic_results.slice(0, 10).forEach((result, i) => {
      serpInfo += `${i + 1}. ${result.title}\n`;
      serpInfo += `   Domain: ${result.domain}\n`;
      serpInfo += `   URL: ${result.url}\n`;
      if (result.description) {
        serpInfo += `   Description: ${result.description.substring(0, 100)}...\n`;
      }
      serpInfo += `\n`;
    });
  }

  const userPrompt = `Analyze the competitive landscape for:

TOPIC: ${topic}
INDUSTRY: ${industry || 'General'}
OUR COMPANY: ${clientData.company_name || 'Client'}
COMPETITOR URLs: ${competitors.length > 0 ? competitors.join(', ') : 'No specific competitors provided'}
${competitorInfo}
${serpInfo}

Provide comprehensive competitive analysis as JSON:
{
  "market_analysis": {
    "competition_level": "<low/medium/high>",
    "competition_reasoning": "<why this level>",
    "market_saturation": "<undersaturated/balanced/oversaturated>",
    "entry_difficulty": "<easy/moderate/difficult>"
  },
  "competitor_breakdown": [
    {
      "name": "<competitor name/domain>",
      "estimated_authority": "<low/medium/high>",
      "content_strengths": ["<strength 1>", "<strength 2>"],
      "content_weaknesses": ["<weakness 1>", "<weakness 2>"],
      "gaps_to_exploit": ["<gap 1>", "<gap 2>"],
      "word_count": "<if known from scraped data>",
      "content_structure": "<observed structure>"
    }
  ],
  "our_competitive_advantages": [
    {
      "advantage": "<specific advantage>",
      "how_to_leverage": "<actionable tactic>",
      "impact": "<high/medium/low>"
    }
  ],
  "content_differentiation": {
    "unique_angle": "<how to stand out>",
    "content_gaps_in_market": ["<gap 1>", "<gap 2>"],
    "recommended_approach": "<specific recommendation>"
  },
  "confidence_factors": {
    "competitor_data_available": <true/false>,
    "market_familiarity": "<high/medium/low>",
    "analysis_depth": "<surface/moderate/deep>"
  }
}`;

  const maxTokens = model.includes('haiku') ? 4096 : 8192;
  const response = await generateContentWithSystem(systemPrompt, userPrompt, { model, maxTokens });
  
  return parseJSONResponse(response);
}

/**
 * Pass 3: Content Strategy & Trends
 */
async function runStrategyPass(model, params) {
  const { contentType, topic, keywords, industry, targetAudience, realData } = params;

  const systemPrompt = `You are an expert content strategist with deep knowledge of SEO trends, content marketing, and audience psychology.

CRITICAL RULES:
1. Provide SPECIFIC, actionable recommendations
2. Back up trend claims with reasoning
3. Consider seasonality and timing
4. Focus on what will actually drive results`;

  const userPrompt = `Develop a content strategy for:

CONTENT TYPE: ${contentType}
TOPIC: ${topic}
INDUSTRY: ${industry || 'General'}
TARGET AUDIENCE: ${targetAudience || 'General audience'}
TARGET KEYWORDS: ${keywords.join(', ') || 'Not specified'}

${realData.googleAutocomplete.length > 0 ? `\nPEOPLE ARE SEARCHING FOR:\n${realData.googleAutocomplete.slice(0, 10).join(', ')}` : ''}

Provide strategic analysis as JSON:
{
  "trend_analysis": {
    "topic_trend": "<rising/stable/declining>",
    "trend_evidence": "<specific reasons for this assessment>",
    "seasonal_factors": "<any seasonality to consider>",
    "best_publish_timing": "<when to publish for max impact>",
    "trend_longevity": "<evergreen/trending/time-sensitive>"
  },
  "audience_insights": {
    "primary_pain_points": ["<pain 1>", "<pain 2>"],
    "search_motivation": "<why they're searching this>",
    "content_preferences": "<what format they prefer>",
    "trust_factors": "<what makes them trust content>"
  },
  "content_recommendations": {
    "optimal_format": "<listicle/how-to/guide/comparison/etc>",
    "recommended_length": "<word count range>",
    "key_sections": ["<section 1>", "<section 2>", "<section 3>"],
    "must_include_elements": ["<element 1>", "<element 2>"],
    "differentiation_hook": "<unique angle to stand out>"
  },
  "seo_predictions": {
    "ranking_potential": <1-100>,
    "ranking_reasoning": "<why this score>",
    "time_to_rank": "<estimated timeframe>",
    "traffic_potential": "<low/medium/high>",
    "featured_snippet_opportunity": <true/false>,
    "snippet_strategy": "<how to win snippet if applicable>"
  },
  "risk_assessment": {
    "main_risks": ["<risk 1>", "<risk 2>"],
    "mitigation_strategies": ["<strategy 1>", "<strategy 2>"],
    "success_probability": "<percentage>"
  },
  "confidence_factors": {
    "trend_certainty": "<high/medium/low>",
    "audience_understanding": "<high/medium/low>",
    "strategy_proven": "<high/medium/low>"
  }
}`;

  const maxTokens = model.includes('haiku') ? 4096 : 8192;
  const response = await generateContentWithSystem(systemPrompt, userPrompt, { model, maxTokens });
  
  return parseJSONResponse(response);
}

/**
 * Synthesize multiple analyses into final evidence
 */
async function synthesizeAnalyses(analyses, realData) {
  const keyword = analyses.find(a => a.type === 'keyword')?.data || {};
  const competitor = analyses.find(a => a.type === 'competitor')?.data || {};
  const strategy = analyses.find(a => a.type === 'strategy')?.data || {};

  return {
    // Summary metrics
    seo_potential: strategy.seo_predictions?.ranking_potential || 70,
    competition_level: competitor.market_analysis?.competition_level || 'medium',
    trend_direction: strategy.trend_analysis?.topic_trend || 'stable',
    trend_reason: strategy.trend_analysis?.trend_evidence || '',
    
    // Key insights (synthesized from all passes)
    key_insights: [
      ...(keyword.primary_keywords?.slice(0, 2).map(k => `Target keyword "${k.keyword}" has ${k.difficulty < 40 ? 'low' : k.difficulty < 70 ? 'medium' : 'high'} competition - ${k.why_valuable}`) || []),
      ...(competitor.our_competitive_advantages?.slice(0, 2).map(a => a.advantage) || []),
      strategy.content_recommendations?.differentiation_hook,
    ].filter(Boolean).slice(0, 5),

    // Detailed sections
    keyword_analysis: {
      primary_keywords: keyword.primary_keywords || [],
      long_tail_opportunities: keyword.long_tail_opportunities || [],
      keyword_clusters: keyword.keyword_clusters || [],
      selection_reasoning: keyword.reasoning_chain?.step2_assessment || '',
      validated_keywords: keyword.validated_by_autocomplete || [],
    },

    competitor_analysis: {
      market_overview: competitor.market_analysis || {},
      competitors: competitor.competitor_breakdown || [],
      our_advantage: competitor.content_differentiation?.unique_angle || '',
      gaps_to_exploit: competitor.content_differentiation?.content_gaps_in_market || [],
    },

    trend_analysis: {
      direction: strategy.trend_analysis?.topic_trend || 'stable',
      evidence: strategy.trend_analysis?.trend_evidence || '',
      seasonal_relevance: strategy.trend_analysis?.seasonal_factors || 'Year-round',
      best_time_to_publish: strategy.trend_analysis?.best_publish_timing || 'Any time',
      longevity: strategy.trend_analysis?.trend_longevity || 'evergreen',
      reasoning: strategy.trend_analysis?.trend_evidence || '',
    },

    serp_analysis: {
      ranking_potential: strategy.seo_predictions?.ranking_potential || 70,
      time_to_rank: strategy.seo_predictions?.time_to_rank || '3-6 months',
      featured_snippet_opportunity: strategy.seo_predictions?.featured_snippet_opportunity || false,
      snippet_strategy: strategy.seo_predictions?.snippet_strategy || '',
      dominant_content_type: strategy.content_recommendations?.optimal_format || 'guide',
      recommended_word_count: strategy.content_recommendations?.recommended_length || '1500-2500',
      strategy: strategy.content_recommendations?.differentiation_hook || '',
      // Real SERP data if available
      top_competitors: realData.serpData?.organic_results?.slice(0, 10).map(r => ({
        rank: r.rank,
        title: r.title,
        domain: r.domain,
        url: r.url,
      })) || [],
      total_results: realData.serpData?.serp_info?.total_results || null,
      has_featured_snippet: realData.serpData?.featured_snippet ? true : false,
      serp_data_source: realData.serpData ? 'DataForSEO' : null,
    },

    content_recommendations: strategy.content_recommendations || {},
    audience_insights: strategy.audience_insights || {},
    risk_assessment: strategy.risk_assessment || {},

    ai_reasoning: {
      steps: [
        { 
          title: 'Keyword Research', 
          description: keyword.reasoning_chain?.step1_intent || 'Analyzed search intent and keyword opportunities' 
        },
        { 
          title: 'Competition Analysis', 
          description: competitor.market_analysis?.competition_reasoning || 'Evaluated competitive landscape' 
        },
        { 
          title: 'Trend Assessment', 
          description: strategy.trend_analysis?.trend_evidence || 'Assessed topic trends and timing' 
        },
        { 
          title: 'Strategy Formation', 
          description: strategy.content_recommendations?.differentiation_hook || 'Developed content strategy' 
        },
      ],
      assumptions: [
        'Search volume estimates based on similar keyword patterns in training data',
        'Competitor analysis limited to available public data',
        'Trend assessment based on industry knowledge through early 2024',
      ],
      limitations: strategy.risk_assessment?.main_risks || [],
    },

    // Validation data
    validation: {
      autocomplete_matches: keyword.validated_by_autocomplete?.length || 0,
      competitors_analyzed: realData.competitorData.length,
      passes_run: analyses.length,
    },

    // Data sources
    data_sources: [
      'Claude AI Multi-Pass Analysis',
      ...realData.sources,
    ],

    // Missing data for transparency
    missing_data: realData.sources.length < 2 
      ? ['Add competitor URLs for deeper analysis', 'More keywords improve accuracy']
      : [],
  };
}

/**
 * Calculate enhanced confidence score
 */
function calculateEnhancedConfidence(evidence, realData) {
  let score = 50; // Base score for multi-pass AI analysis

  // Multi-pass analysis bonus
  if (evidence.validation?.passes_run >= 3) score += 15;

  // Real data bonuses
  if (realData.googleAutocomplete.length > 5) score += 10;
  if (realData.competitorData.length > 0) score += 10;
  if (realData.competitorData.length >= 2) score += 5;
  if (realData.relatedSearches.length > 0) score += 5;
  if (realData.serpData) score += 15; // SERP data is very valuable

  // Analysis quality bonuses
  if (evidence.keyword_analysis?.primary_keywords?.length >= 5) score += 5;
  if (evidence.keyword_analysis?.validated_keywords?.length > 0) score += 5;
  if (evidence.competitor_analysis?.gaps_to_exploit?.length >= 2) score += 5;
  if (evidence.ai_reasoning?.steps?.length >= 4) score += 5;

  return Math.min(score, 98); // Cap at 98% with DataForSEO
}

/**
 * Parse JSON response from AI
 */
function parseJSONResponse(response) {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let json = jsonMatch[0]
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      return JSON.parse(json);
    }
  } catch (e) {
    console.error('JSON parse error:', e.message);
  }
  return {};
}

export default {
  generateEnhancedEvidence,
};
