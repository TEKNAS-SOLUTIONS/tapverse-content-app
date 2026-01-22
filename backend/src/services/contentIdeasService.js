import { generateContentWithSystem } from './claude.js';
import { batchGetKeywordData, getRelatedKeywords } from './dataForSeoService.js';
import pool from '../db/index.js';
import { config } from '../config/config.js';

/**
 * Content Ideas & Gaps Service
 * AI + DataForSEO driven content opportunities for upsell
 */

/**
 * Generate content ideas and gaps for a client
 * This identifies opportunities regardless of subscribed services (for upsell)
 */
export async function generateContentIdeasAndGaps(clientId, projectId = null) {
  try {
    // Get client data
    const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
    if (clientResult.rows.length === 0) {
      throw new Error('Client not found');
    }
    const client = clientResult.rows[0];

    // Get project data if provided
    let project = null;
    if (projectId) {
      const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
      if (projectResult.rows.length > 0) {
        project = projectResult.rows[0];
      }
    }

    // Get existing keywords from projects
    const keywordsResult = await pool.query(`
      SELECT DISTINCT unnest(keywords) as keyword
      FROM projects
      WHERE client_id = $1
    `, [clientId]);
    const existingKeywords = keywordsResult.rows.map(r => r.keyword).filter(Boolean);

    // Get real keyword data from DataForSEO if enabled
    let realKeywordData = null;
    if (config.dataForSeo?.enabled && existingKeywords.length > 0) {
      try {
        realKeywordData = await batchGetKeywordData(
          existingKeywords.slice(0, 20),
          {
            locationCode: config.dataForSeo.defaultLocation,
            languageCode: config.dataForSeo.defaultLanguage,
          }
        );
      } catch (error) {
        console.error('DataForSEO error (continuing with AI):', error.message);
      }
    }

    // Generate content ideas using AI
    const ideas = await generateContentIdeas({
      client,
      project,
      existingKeywords,
      realKeywordData,
    });

    // Identify upsell opportunities
    const upsellOpportunities = identifyUpsellOpportunities(client, ideas);

    return {
      contentIdeas: ideas.contentIdeas,
      contentGaps: ideas.contentGaps,
      keywordOpportunities: ideas.keywordOpportunities,
      upsellOpportunities,
      dataSource: realKeywordData ? 'dataforseo' : 'ai',
    };
  } catch (error) {
    console.error('Error generating content ideas and gaps:', error);
    throw error;
  }
}

/**
 * Generate content ideas using AI
 */
async function generateContentIdeas(params) {
  const {
    client,
    project,
    existingKeywords = [],
    realKeywordData = null,
  } = params;

  const systemPrompt = `You are an expert content strategist and SEO analyst. Identify content opportunities and gaps that can drive business growth.`;

  let keywordDataContext = '';
  if (realKeywordData && realKeywordData.length > 0) {
    keywordDataContext = `\n\nREAL KEYWORD DATA FROM DATAFORSEO:\n`;
    realKeywordData.forEach(kw => {
      keywordDataContext += `- "${kw.keyword}": ${kw.search_volume} monthly searches, CPC: $${kw.cpc}, Competition: ${kw.competition}\n`;
    });
  }

  const userPrompt = `Analyze content opportunities for:

COMPANY: ${client.company_name}
INDUSTRY: ${client.industry || 'General'}
EXISTING KEYWORDS: ${existingKeywords.join(', ') || 'None'}
COMPETITORS: ${client.competitors?.join(', ') || 'None specified'}
${keywordDataContext}

Provide comprehensive content opportunities:

1. HIGH OPPORTUNITY KEYWORDS (Not Yet Targeted)
   - Keywords with good search volume that client isn't targeting
   - For each: keyword, estimated_volume, difficulty, opportunity_score (1-100), content_type_recommended

2. COMPETITOR CONTENT GAPS
   - Topics competitors rank for that client should target
   - For each: topic, competitor_rank, opportunity_score, recommended_content_type

3. CONTENT IDEAS BY SERVICE TYPE (Upsell Opportunities)
   - Local SEO: High-intent local keywords client could target
   - Video Content: Topics suitable for video content
   - Social Media: Trending topics for social engagement
   - Email Marketing: Newsletter-worthy topics
   - Programmatic SEO: Service+Location opportunities

4. CONTENT PILLARS MISSING
   - Major content themes client should build around
   - For each: pillar_name, why_important, content_count_needed

Format as JSON:
{
  "contentIdeas": [
    {
      "keyword": "example keyword",
      "estimated_volume": "high|medium|low",
      "difficulty": 45,
      "opportunity_score": 78,
      "content_type": "blog_post|video|local_seo|social",
      "rationale": "Why this is valuable"
    }
  ],
  "contentGaps": [
    {
      "topic": "gap topic",
      "competitor_rank": 3,
      "opportunity_score": 75,
      "recommended_content_type": "blog_post",
      "why_valuable": "Explanation"
    }
  ],
  "keywordOpportunities": [
    {
      "keyword": "opportunity keyword",
      "estimated_volume": "high",
      "difficulty": 30,
      "opportunity_score": 85,
      "content_type_recommended": "blog_post"
    }
  ]
}`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt, {
      maxTokens: 4096,
    });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback structure
    return {
      contentIdeas: [],
      contentGaps: [],
      keywordOpportunities: [],
    };
  } catch (error) {
    console.error('Error generating content ideas:', error);
    return {
      contentIdeas: [],
      contentGaps: [],
      keywordOpportunities: [],
    };
  }
}

/**
 * Identify upsell opportunities based on client's current services
 */
function identifyUpsellOpportunities(client, ideas) {
  const subscribedServices = client.subscribed_services || [];
  const opportunities = [];

  // Local SEO upsell
  if (!subscribedServices.includes('local_seo')) {
    const localKeywords = ideas.keywordOpportunities?.filter(
      kw => kw.keyword.toLowerCase().includes('near me') ||
            kw.keyword.toLowerCase().includes('in ') ||
            kw.content_type_recommended === 'local_seo'
    ).slice(0, 15) || [];

    if (localKeywords.length > 0) {
      opportunities.push({
        service: 'Local SEO',
        opportunity: `${localKeywords.length} high-intent local keywords identified`,
        keywords: localKeywords,
        value: 'Improve local search visibility and drive foot traffic',
      });
    }
  }

  // Video Content upsell
  if (!subscribedServices.includes('ai_video')) {
    const videoTopics = ideas.contentIdeas?.filter(
      idea => idea.content_type === 'video' || idea.opportunity_score >= 70
    ).slice(0, 8) || [];

    if (videoTopics.length > 0) {
      opportunities.push({
        service: 'AI Video Content',
        opportunity: `${videoTopics.length} topics suitable for video content`,
        topics: videoTopics,
        value: 'Engage audience with video content and improve retention',
      });
    }
  }

  // Programmatic SEO upsell
  const programmaticOpportunities = ideas.contentIdeas?.filter(
    idea => idea.content_type === 'programmatic_seo'
  ).length || 0;

  if (programmaticOpportunities > 0) {
    opportunities.push({
      service: 'Programmatic SEO',
      opportunity: `${programmaticOpportunities} service+location combinations available`,
      value: 'Scale content creation for multiple locations/services',
    });
  }

  return opportunities;
}

export default {
  generateContentIdeasAndGaps,
};
