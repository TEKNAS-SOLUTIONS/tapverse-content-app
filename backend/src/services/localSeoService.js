import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/config.js';
import { batchGetKeywordData, getSerpLocal } from './dataForSeoService.js';

const anthropic = new Anthropic({
  apiKey: config.api.anthropicApiKey,
});

/**
 * Local SEO Service
 * 
 * Provides comprehensive local SEO analysis including:
 * - Local keyword research with real DataForSEO data
 * - Local SERP analysis (local pack)
 * - Local content recommendations
 * - Local schema markup generation
 * - On-page local SEO audit
 * 
 * Designed for local businesses (dentists, plumbers, salons, lawyers, etc.)
 */

/**
 * Location code mapping for DataForSEO
 * Common US locations
 */
const LOCATION_CODES = {
  'US': 2840,
  'New York, NY': 1023191,
  'Los Angeles, CA': 1023192,
  'Chicago, IL': 1023193,
  'Houston, TX': 1023194,
  'Phoenix, AZ': 1023195,
  'Philadelphia, PA': 1023196,
  'San Antonio, TX': 1023197,
  'San Diego, CA': 1023198,
  'Dallas, TX': 1023199,
  'San Jose, CA': 1023200,
  'Austin, TX': 1023201,
  'Jacksonville, FL': 1023202,
  'San Francisco, CA': 1023203,
  'Columbus, OH': 1023204,
  'Fort Worth, TX': 1023205,
  'Charlotte, NC': 1023206,
  'Seattle, WA': 1023207,
  'Denver, CO': 1023208,
  'Boston, MA': 1023209,
  'El Paso, TX': 1023210,
};

/**
 * Get location code from location string
 */
function getLocationCode(location) {
  if (!location) return config.dataForSeo.defaultLocation;
  
  // Check if it's already a code
  if (/^\d+$/.test(location)) {
    return parseInt(location);
  }
  
  // Try to match location name
  const normalized = location.trim();
  if (LOCATION_CODES[normalized]) {
    return LOCATION_CODES[normalized];
  }
  
  // Try partial match
  for (const [key, code] of Object.entries(LOCATION_CODES)) {
    if (key.toLowerCase().includes(normalized.toLowerCase()) || 
        normalized.toLowerCase().includes(key.toLowerCase())) {
      return code;
    }
  }
  
  // Default to US
  return config.dataForSeo.defaultLocation;
}

/**
 * Generate local keywords from base keywords and location
 */
function generateLocalKeywords(baseKeywords, location) {
  const localKeywords = [];
  const locationName = location || 'your area';
  
  for (const keyword of baseKeywords) {
    // Add location variations
    localKeywords.push(`${keyword} in ${locationName}`);
    localKeywords.push(`${keyword} near me`);
    localKeywords.push(`${locationName} ${keyword}`);
    localKeywords.push(`${keyword} ${locationName}`);
  }
  
  return [...new Set(localKeywords)]; // Remove duplicates
}

/**
 * Analyze local keywords with DataForSEO
 */
async function analyzeLocalKeywords(keywords, location, locationCode) {
  if (!config.dataForSeo?.enabled || keywords.length === 0) {
    return null;
  }
  
  try {
    const keywordData = await batchGetKeywordData(keywords, {
      locationCode,
      languageCode: config.dataForSeo.defaultLanguage,
    });
    
    return keywordData;
  } catch (error) {
    console.error('Error fetching local keyword data:', error);
    return null;
  }
}

/**
 * Analyze local SERP (local pack)
 */
async function analyzeLocalSerp(keyword, location, locationCode) {
  if (!config.dataForSeo?.enabled) {
    return null;
  }
  
  try {
    const serpData = await getSerpLocal(keyword, {
      locationCode,
      languageCode: config.dataForSeo.defaultLanguage,
    });
    
    return serpData;
  } catch (error) {
    console.error('Error fetching local SERP data:', error);
    return null;
  }
}

/**
 * Generate comprehensive local SEO analysis
 */
export async function generateLocalSeoAnalysis({
  clientId,
  projectId,
  clientData,
  projectData,
  location,
  websiteUrl,
}) {
  const companyName = clientData.company_name || 'Business';
  const industry = clientData.industry || 'Local Business';
  const services = projectData.services || clientData.services || [];
  const baseKeywords = projectData.keywords || [];
  const targetAudience = projectData.target_audience || clientData.target_audience || 'Local customers';
  const brandVoice = clientData.brand_voice || 'Professional';
  const brandTone = clientData.brand_tone || 'Friendly';
  
  const locationCode = getLocationCode(location);
  
  // Generate local keywords
  const localKeywords = generateLocalKeywords(baseKeywords, location);
  const primaryLocalKeywords = localKeywords.slice(0, 10); // Top 10 for analysis
  
  // Fetch real keyword data
  let realKeywordData = null;
  let dataSource = 'ai';
  if (config.dataForSeo?.enabled && primaryLocalKeywords.length > 0) {
    try {
      realKeywordData = await analyzeLocalKeywords(primaryLocalKeywords, location, locationCode);
      if (realKeywordData && realKeywordData.length > 0) {
        dataSource = 'dataforseo';
      }
    } catch (error) {
      console.error('DataForSEO error (falling back to AI):', error.message);
      dataSource = 'ai_fallback';
    }
  }
  
  // Fetch local SERP data for primary keyword
  let localSerpData = null;
  const primaryKeyword = primaryLocalKeywords[0] || baseKeywords[0];
  if (config.dataForSeo?.enabled && primaryKeyword) {
    try {
      localSerpData = await analyzeLocalSerp(primaryKeyword, location, locationCode);
    } catch (error) {
      console.error('Local SERP error:', error.message);
    }
  }
  
  // Generate analysis with AI
  const analysis = await generateLocalSeoAnalysisWithAI({
    companyName,
    industry,
    location,
    services,
    baseKeywords,
    localKeywords: primaryLocalKeywords,
    targetAudience,
    brandVoice,
    brandTone,
    websiteUrl,
    realKeywordData,
    localSerpData,
  });
  
  // Add metadata
  analysis.metadata = {
    data_source: dataSource,
    dataforseo_enabled: config.dataForSeo?.enabled || false,
    location_code: locationCode,
    location: location || 'Not specified',
    keywords_analyzed: primaryLocalKeywords.length,
    real_data_count: realKeywordData?.length || 0,
    serp_analyzed: !!localSerpData,
    fallback_used: dataSource === 'ai_fallback',
    message: dataSource === 'dataforseo'
      ? `Real local keyword data from DataForSEO API (Location: ${location || 'US'})`
      : dataSource === 'ai_fallback'
      ? '⚠️ DataForSEO unavailable - using AI estimates for local keywords (fallback)'
      : 'AI-powered local SEO analysis (DataForSEO not enabled)',
  };
  
  return analysis;
}

/**
 * Generate local SEO analysis with Claude AI
 */
async function generateLocalSeoAnalysisWithAI({
  companyName,
  industry,
  location,
  services,
  baseKeywords,
  localKeywords,
  targetAudience,
  brandVoice,
  brandTone,
  websiteUrl,
  realKeywordData,
  localSerpData,
}) {
  const systemPrompt = `You are an expert local SEO strategist with 15+ years of experience helping local businesses rank in Google's local pack and local organic results.

You create comprehensive, data-driven local SEO strategies that drive real business results:
- Local pack rankings (Google Maps 3-pack)
- Local organic visibility
- Phone calls and store visits
- Location-based keyword targeting
- Local content optimization
- Schema markup for local businesses
- NAP consistency
- Local link building

Always provide actionable, specific recommendations backed by strategic thinking.`;

  // Build keyword data summary
  let keywordDataSummary = '';
  if (realKeywordData && realKeywordData.length > 0) {
    keywordDataSummary = '\n\nREAL KEYWORD DATA FROM DATAFORSEO:\n';
    realKeywordData.forEach(kw => {
      // DataForSEO returns competition_index (0-1) not keyword_difficulty
      const difficulty = kw.competition_index !== undefined 
        ? Math.round(kw.competition_index * 100) 
        : kw.keyword_difficulty || 'N/A';
      keywordDataSummary += `- "${kw.keyword}": Search Volume: ${kw.search_volume || 'N/A'}, Difficulty: ${difficulty}, CPC: $${kw.cpc || 'N/A'}\n`;
    });
  } else {
    keywordDataSummary = '\n\nNote: Using AI estimates for keyword data (DataForSEO not available or not enabled).';
  }
  
  // Build SERP data summary
  let serpSummary = '';
  if (localSerpData && localSerpData.local_pack && localSerpData.local_pack.length > 0) {
    serpSummary = '\n\nLOCAL PACK RESULTS (Google Maps 3-Pack):\n';
    localSerpData.local_pack.forEach((result, idx) => {
      serpSummary += `${idx + 1}. ${result.title || result.name || 'Business'}\n`;
      if (result.address) serpSummary += `   Address: ${result.address}\n`;
      if (result.rating) serpSummary += `   Rating: ${result.rating}/5\n`;
      if (result.reviews) serpSummary += `   Reviews: ${result.reviews}\n`;
      if (result.phone) serpSummary += `   Phone: ${result.phone}\n`;
    });
  } else {
    serpSummary = '\n\nNote: Local pack data not available (DataForSEO not available or not enabled).';
  }
  
  const userPrompt = `Create a comprehensive LOCAL SEO analysis for:

COMPANY: ${companyName}
INDUSTRY: ${industry}
LOCATION: ${location || 'Not specified'}
SERVICES: ${services.length > 0 ? services.join(', ') : 'General services'}
BASE KEYWORDS: ${baseKeywords.length > 0 ? baseKeywords.join(', ') : 'To be researched'}
LOCAL KEYWORDS: ${localKeywords.length > 0 ? localKeywords.slice(0, 20).join(', ') : 'None'}
TARGET AUDIENCE: ${targetAudience}
BRAND VOICE: ${brandVoice}
BRAND TONE: ${brandTone}
WEBSITE: ${websiteUrl || 'Not provided'}
${keywordDataSummary}
${serpSummary}

Generate a complete local SEO analysis including:

1. LOCAL KEYWORD RESEARCH
   - Primary local keywords (with real search volumes if available)
   - Secondary local keywords
   - Keyword opportunities by neighborhood/area
   - Competition analysis for local keywords
   - Keyword difficulty assessment

2. LOCAL SERP ANALYSIS
   - Current local pack competitors (if data available)
   - Local pack optimization opportunities
   - What competitors are doing well
   - How to improve local pack ranking

3. LOCAL CONTENT RECOMMENDATIONS
   - Location page templates
   - Service area page content
   - Local landing page recommendations
   - Neighborhood-specific content ideas
   - Local meta descriptions

4. LOCAL SCHEMA MARKUP
   - LocalBusiness schema JSON-LD
   - Service schema markup
   - Opening hours schema
   - Service area schema
   - AggregateRating schema (if reviews available)

5. ON-PAGE LOCAL SEO AUDIT
   - NAP (Name, Address, Phone) consistency check
   - Local keyword usage recommendations
   - Location mentions
   - Service area information
   - Schema markup presence check

6. PRIORITY RECOMMENDATIONS
   - Top 5-10 actionable recommendations
   - Priority level (high/medium/low)
   - Expected impact
   - Implementation effort

7. LOCAL SEO SCORE
   - Overall local SEO health score (0-100)
   - Breakdown by category
   - Improvement opportunities

CRITICAL: 
- Use REAL keyword data when provided (from DataForSEO)
- Use REAL local pack data when provided
- Be specific and actionable
- Focus on what can be implemented (not Google Business Profile automation)
- Keep response concise and within 6000 tokens

Format the output as VALID JSON:
{
  "local_seo_score": 75,
  "score_breakdown": {
    "keyword_research": 80,
    "content_optimization": 70,
    "schema_markup": 60,
    "nap_consistency": 85,
    "local_citations": 50
  },
  "local_keyword_research": {
    "primary_keywords": [
      {
        "keyword": "dentist in New York",
        "search_volume": 1200,
        "difficulty": 45,
        "cpc": 8.50,
        "opportunity": "high",
        "recommendation": "Focus on this high-volume keyword"
      }
    ],
    "secondary_keywords": [...],
    "keyword_opportunities": [...]
  },
  "local_serp_analysis": {
    "local_pack_competitors": [...],
    "optimization_opportunities": [...],
    "competitor_insights": "..."
  },
  "content_recommendations": {
    "location_pages": [...],
    "service_area_pages": [...],
    "local_content_ideas": [...],
    "meta_descriptions": [...]
  },
  "schema_markup": {
    "local_business_schema": {...},
    "service_schema": [...],
    "opening_hours_schema": {...},
    "service_area_schema": {...}
  },
  "on_page_audit": {
    "nap_consistency": {
      "status": "good",
      "issues": [],
      "recommendations": "..."
    },
    "local_keyword_usage": {
      "score": 75,
      "recommendations": "..."
    },
    "location_mentions": {
      "count": 5,
      "recommendations": "..."
    },
    "schema_presence": {
      "has_schema": false,
      "recommendations": "Add LocalBusiness schema"
    }
  },
  "priority_recommendations": [
    {
      "title": "Add LocalBusiness Schema Markup",
      "priority": "high",
      "impact": "high",
      "effort": "low",
      "description": "...",
      "steps": [...]
    }
  ],
  "limitations": [
    "Cannot automate Google Business Profile updates (manual work required)",
    "Cannot build citations automatically (manual work required)",
    "Cannot track rankings continuously (one-time snapshot only)"
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations. Just the JSON object.`;

  try {
    const response = await anthropic.messages.create({
      model: config.api.claudeModel,
      max_tokens: 6000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
      let jsonText = content.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Response text:', content.text);
      throw new Error('Failed to parse AI response as JSON');
    }

    return analysis;
  } catch (error) {
    console.error('Error generating local SEO analysis:', error);
    throw error;
  }
}

/**
 * Generate local schema markup
 */
export function generateLocalSchemaMarkup({
  companyName,
  address,
  city,
  state,
  zipCode,
  country,
  phone,
  email,
  website,
  businessType,
  services,
  openingHours,
  priceRange,
  rating,
  reviewCount,
  latitude,
  longitude,
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: companyName,
  };
  
  if (address || city || state) {
    schema.address = {
      '@type': 'PostalAddress',
    };
    if (address) schema.address.streetAddress = address;
    if (city) schema.address.addressLocality = city;
    if (state) schema.address.addressRegion = state;
    if (zipCode) schema.address.postalCode = zipCode;
    if (country) schema.address.addressCountry = country;
  }
  
  if (phone) schema.telephone = phone;
  if (email) schema.email = email;
  if (website) schema.url = website;
  if (businessType) schema['@type'] = businessType; // e.g., 'Dentist', 'Plumber'
  
  if (latitude && longitude) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
  }
  
  if (openingHours && Array.isArray(openingHours)) {
    schema.openingHoursSpecification = openingHours.map(hours => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.day,
      opens: hours.opens,
      closes: hours.closes,
    }));
  }
  
  if (priceRange) schema.priceRange = priceRange;
  
  if (rating && reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: parseFloat(rating),
      reviewCount: parseInt(reviewCount),
    };
  }
  
  if (services && Array.isArray(services) && services.length > 0) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: services.map((service, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service,
        },
        position: index + 1,
      })),
    };
  }
  
  return schema;
}
