import { generateContentWithSystem } from './claude.js';

/**
 * Article Ideas Generation Service
 * 
 * Generates high-quality article ideas based on:
 * 1. Industry analysis
 * 2. Competitor analysis
 * 3. Trending topics
 * 4. Keyword gaps
 * 5. Search intent optimization
 * 
 * Future integrations:
 * - Google Search Console API (for actual keyword data)
 * - Google Analytics API (for traffic patterns)
 * - Google Trends API (for trending topics)
 * - SEMrush/Ahrefs API (for competitive analysis)
 */

/**
 * Generate article ideas based on client and project data
 */
export async function generateArticleIdeas(client, project = null, options = {}) {
  const {
    count = 10,
    focusAreas = [], // e.g., ['trending', 'competitor_gap', 'keyword_expansion']
  } = options;

  // Build context for idea generation
  const context = buildIdeaContext(client, project);
  
  // Generate ideas using AI
  const ideas = await generateIdeasWithAI(context, count);
  
  return ideas;
}

/**
 * Build context for idea generation
 */
function buildIdeaContext(client, project = null) {
  return {
    // Client info
    companyName: client.company_name || '',
    industry: client.industry || '',
    targetAudience: client.target_audience || '',
    uniqueSellingPoints: client.unique_selling_points || '',
    competitors: client.competitors || [],
    websiteUrl: client.website_url || '',
    brandVoice: client.brand_voice || '',
    brandTone: client.brand_tone || 'professional',
    
    // Project info (if provided)
    projectKeywords: project?.keywords || [],
    projectName: project?.project_name || '',
    projectTargetAudience: project?.target_audience || '',
    selectedCompetitors: project?.selected_competitors || project?.competitors || [],
  };
}

/**
 * Generate ideas using Claude AI
 */
async function generateIdeasWithAI(context, count) {
  const systemPrompt = `You are an elite SEO content strategist and market researcher with expertise in:
- Keyword research and search intent analysis
- Competitor content gap analysis
- Industry trend identification
- Content performance prediction

Your goal is to identify the BEST article opportunities that will:
1. Rank well on Google and AI search engines
2. Fill gaps competitors are missing
3. Capture trending/emerging topics
4. Drive qualified traffic and conversions

Be SPECIFIC and ACTIONABLE. Don't give generic ideas - each should be a clear winner with strong rationale.`;

  const userPrompt = `Generate ${count} HIGH-POTENTIAL article ideas for this client:

COMPANY: ${context.companyName || 'The client'}
INDUSTRY: ${context.industry || 'Business services'}
WEBSITE: ${context.websiteUrl || 'Not provided'}
TARGET AUDIENCE: ${context.targetAudience || context.projectTargetAudience || 'Business professionals'}
UNIQUE VALUE: ${context.uniqueSellingPoints || 'Quality service provider'}

${context.competitors.length > 0 ? `
COMPETITORS TO OUTRANK:
${context.competitors.map((c, i) => `${i + 1}. ${c}`).join('\n')}
` : ''}

${context.projectKeywords.length > 0 ? `
TARGET KEYWORDS TO EXPAND ON:
${context.projectKeywords.join(', ')}
` : ''}

For each article idea, provide DETAILED analysis in this JSON format:
{
  "articleIdeas": [
    {
      "title": "Compelling, SEO-optimized title (max 65 chars)",
      "primaryKeyword": "Main target keyword",
      "secondaryKeywords": ["3-5 related keywords"],
      "searchIntent": "informational|commercial|transactional|navigational",
      "estimatedSearchVolume": "Low (100-1K)|Medium (1K-10K)|High (10K-100K)|Very High (100K+)",
      "estimatedDifficulty": "Low|Medium|High",
      "trendingScore": 0-100,
      "competitorGapScore": 0-100,
      "contentType": "how-to|ultimate-guide|listicle|comparison|case-study|news|tutorial|checklist|review",
      "uniqueAngle": "What makes this different from existing content",
      "whyThisWillRank": "Specific reasons this article will outperform competitors",
      "outline": [
        "H2: Section 1 Title",
        "H2: Section 2 Title",
        "H3: Subsection",
        "H2: Section 3 Title"
      ],
      "targetFeaturedSnippet": "paragraph|list|table|none",
      "estimatedWordCount": "2000-3000",
      "ideaSource": "competitor_gap|trending|keyword_expansion|audience_need|seasonal",
      "sourceDetails": {
        "insight": "Why this idea was generated",
        "competitorMissing": "What competitors fail to cover",
        "userPainPoint": "What problem this solves"
      },
      "monetizationPotential": "How this content can drive business goals"
    }
  ],
  "strategyInsights": {
    "pillarContentRecommendation": "Which 1-2 ideas should be cornerstone content",
    "quickWins": ["Ideas that can rank quickly with less effort"],
    "contentCalendarSuggestion": "Recommended publishing order and timing",
    "internalLinkingStrategy": "How these articles should link to each other"
  },
  "competitorAnalysisSummary": {
    "commonGaps": ["Topics all competitors miss"],
    "weaknessesToExploit": ["Where competitor content is thin or outdated"],
    "differentiationOpportunity": "How to position content differently"
  },
  "trendingTopicsIdentified": [
    {
      "topic": "Trending topic name",
      "relevance": "How it relates to the industry",
      "timeliness": "Why now is the right time"
    }
  ]
}

IMPORTANT GUIDELINES:
1. Each idea must be UNIQUE and SPECIFIC - no generic topics
2. Prioritize ideas with HIGH competitor gap scores (topics others miss)
3. Include 2-3 trending/timely topics (trendingScore > 70)
4. Mix of difficulty levels (include some quick wins)
5. Each outline should have 5-8 clear sections
6. Be realistic about search volumes and difficulty
7. Consider the ${new Date().getFullYear()} context - what's relevant NOW`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt);
    
    console.log('Claude response length:', response?.length || 0);
    
    // Try to find and parse JSON response
    // First try to find a complete JSON object
    const jsonMatch = response.match(/\{[\s\S]*"articleIdeas"[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        // Clean up the JSON - remove any trailing content after the last }
        let jsonStr = jsonMatch[0];
        
        // Find the matching closing brace
        let braceCount = 0;
        let endIndex = 0;
        for (let i = 0; i < jsonStr.length; i++) {
          if (jsonStr[i] === '{') braceCount++;
          if (jsonStr[i] === '}') braceCount--;
          if (braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
        
        if (endIndex > 0) {
          jsonStr = jsonStr.substring(0, endIndex);
        }
        
        const parsed = JSON.parse(jsonStr);
        return {
          ideas: parsed.articleIdeas || [],
          strategyInsights: parsed.strategyInsights || {},
          competitorAnalysis: parsed.competitorAnalysisSummary || {},
          trendingTopics: parsed.trendingTopicsIdentified || [],
        };
      } catch (parseError) {
        console.error('JSON parse error:', parseError.message);
        console.log('Attempted to parse:', jsonMatch[0].substring(0, 500));
      }
    }
    
    // Fallback: Try to extract just the articleIdeas array
    const ideasMatch = response.match(/"articleIdeas"\s*:\s*\[([\s\S]*?)\]/);
    if (ideasMatch) {
      try {
        const ideasArray = JSON.parse('[' + ideasMatch[1] + ']');
        return {
          ideas: ideasArray,
          strategyInsights: {},
          competitorAnalysis: {},
          trendingTopics: [],
        };
      } catch (e) {
        console.error('Fallback parse error:', e.message);
      }
    }
    
    // Last resort: Generate simpler ideas without full analysis
    console.log('Falling back to simple idea generation');
    return await generateSimpleIdeas(context, count);
    
  } catch (error) {
    console.error('Error generating article ideas:', error);
    throw new Error(`Failed to generate article ideas: ${error.message}`);
  }
}

/**
 * Simple fallback idea generation when full analysis fails
 */
async function generateSimpleIdeas(context, count) {
  const systemPrompt = `You are an SEO expert. Generate article ideas as a simple JSON array.`;
  
  const userPrompt = `Generate ${count} article ideas for ${context.industry || 'business'} industry targeting "${context.projectKeywords?.[0] || 'general topics'}".

Return ONLY a JSON array (no other text):
[
  {
    "title": "Article title",
    "primaryKeyword": "main keyword",
    "secondaryKeywords": ["kw1", "kw2"],
    "searchIntent": "informational",
    "estimatedSearchVolume": "Medium (1K-10K)",
    "estimatedDifficulty": "Medium",
    "trendingScore": 50,
    "competitorGapScore": 60,
    "contentType": "guide",
    "uniqueAngle": "What makes this different",
    "outline": ["Section 1", "Section 2", "Section 3"],
    "targetFeaturedSnippet": "paragraph",
    "ideaSource": "keyword_expansion"
  }
]`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt);
    
    // Try to parse as array
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      const ideas = JSON.parse(arrayMatch[0]);
      return {
        ideas: ideas,
        strategyInsights: {},
        competitorAnalysis: {},
        trendingTopics: [],
      };
    }
    
    throw new Error('Could not parse simple ideas');
  } catch (error) {
    console.error('Simple ideas generation failed:', error);
    // Return empty result rather than throwing
    return {
      ideas: [],
      strategyInsights: {},
      competitorAnalysis: {},
      trendingTopics: [],
    };
  }
}

/**
 * Generate a single detailed article from a selected idea
 */
export async function generateArticleFromIdea(idea, client, project = null) {
  const systemPrompt = `You are a senior content writer creating a comprehensive, SEO-optimized article.

CRITICAL REQUIREMENTS:
1. Write in a HUMAN, non-AI-detectable style
2. Follow the exact outline provided
3. Include specific examples, data, and actionable insights
4. Optimize for the target keyword naturally
5. Format for AI search engines (Google AI Overviews, ChatGPT Search, Perplexity)

WRITING STYLE RULES:
- Mix short and long sentences
- Use contractions (don't, won't, it's)
- Include rhetorical questions
- Add personal observations ("Here's what most people miss...")
- Use em dashes—like this—for emphasis
- Start some sentences with "But", "And", "So"
- Avoid: "In conclusion", "Furthermore", "Moreover", "In today's digital landscape"
- Be specific with examples, numbers, and tools`;

  const userPrompt = `Write a comprehensive article based on this plan:

TITLE: ${idea.title}
PRIMARY KEYWORD: ${idea.primary_keyword || idea.primaryKeyword}
SECONDARY KEYWORDS: ${(idea.secondary_keywords || idea.secondaryKeywords || []).join(', ')}
TARGET AUDIENCE: ${client.target_audience || 'Business professionals'}
BRAND TONE: ${client.brand_tone || 'professional'}

OUTLINE TO FOLLOW:
${(idea.outline || []).map((section, i) => `${i + 1}. ${section}`).join('\n')}

UNIQUE ANGLE: ${idea.unique_angle || idea.uniqueAngle || 'Provide expert insights'}

CONTENT TYPE: ${idea.content_type || idea.contentType || 'guide'}
TARGET WORD COUNT: ${idea.estimatedWordCount || '2500-3500'}
FEATURED SNIPPET TARGET: ${idea.target_featured_snippet || idea.targetFeaturedSnippet || 'paragraph'}

REQUIREMENTS:
1. SEO-optimized title (under 60 characters)
2. Compelling meta description (under 155 characters)
3. Primary keyword in first 100 words
4. Clear H2/H3 structure following the outline
5. Include specific examples and actionable tips
6. Add a strong call-to-action
7. Natural keyword placement throughout

FORMAT OUTPUT AS:
---
title: [SEO Title]
metaDescription: [Meta description]
primaryKeyword: ${idea.primary_keyword || idea.primaryKeyword}
secondaryKeywords: [${(idea.secondary_keywords || idea.secondaryKeywords || []).join(', ')}]
---

[ARTICLE CONTENT IN MARKDOWN]`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt);
    
    // Parse the response
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = response.match(frontmatterRegex);

    let title = idea.title;
    let metaDescription = '';
    let content = response;

    if (match) {
      const frontmatter = match[1];
      content = match[2];
      
      const titleMatch = frontmatter.match(/title:\s*(.+)/i);
      const metaMatch = frontmatter.match(/metaDescription:\s*(.+)/i);
      
      if (titleMatch) title = titleMatch[1].trim();
      if (metaMatch) metaDescription = metaMatch[1].trim();
    }

    return {
      title,
      content,
      meta_description: metaDescription,
      keywords: [idea.primary_keyword || idea.primaryKeyword, ...(idea.secondary_keywords || idea.secondaryKeywords || [])],
      content_type: 'blog',
      status: 'ready',
      source_idea_id: idea.id,
    };
  } catch (error) {
    console.error('Error generating article from idea:', error);
    throw new Error(`Failed to generate article: ${error.message}`);
  }
}

/**
 * Refresh trending topics for an industry
 * (In production, this would call Google Trends API or similar)
 */
export async function refreshTrendingTopics(industry, keywords = []) {
  const systemPrompt = `You are a trend analyst specializing in ${industry}. Identify what's trending NOW in ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`;

  const userPrompt = `Identify 5 trending topics in ${industry} that would make excellent article opportunities.

${keywords.length > 0 ? `Related to these themes: ${keywords.join(', ')}` : ''}

For each trending topic, provide:
{
  "trendingTopics": [
    {
      "topic": "Topic name",
      "searchInterest": "Rising|Stable|Breakout",
      "relevantKeywords": ["related keywords"],
      "whyTrending": "Explanation of why this is trending now",
      "contentAngle": "Suggested angle for content",
      "timeliness": "Evergreen|Seasonal|Time-sensitive",
      "estimatedPeakTiming": "When this topic will peak"
    }
  ]
}`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.trendingTopics || [];
    }
    return [];
  } catch (error) {
    console.error('Error refreshing trending topics:', error);
    return [];
  }
}

export default {
  generateArticleIdeas,
  generateArticleFromIdea,
  refreshTrendingTopics,
};

