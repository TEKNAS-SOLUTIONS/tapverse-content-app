import { generateContent, generateContentWithSystem } from './claude.js';

/**
 * SEO Content Generation Service
 * 
 * This service generates high-quality, SEO-optimized content that:
 * 1. Incorporates keyword research and strategy
 * 2. Analyzes competitors and identifies gaps
 * 3. Optimizes for AI search engines (Google AI Overviews, ChatGPT, Perplexity)
 * 4. Produces human-sounding, non-AI-detectable content
 * 5. Follows brand voice and guidelines
 */

/**
 * Master prompt instructions for human-like, SEO content
 */
const HUMAN_WRITING_GUIDELINES = `
CRITICAL WRITING RULES TO AVOID AI DETECTION:

1. SENTENCE STRUCTURE VARIATION:
   - Mix short punchy sentences with longer, flowing ones
   - Start some sentences with "But", "And", "So", "Because" (natural speech)
   - Use fragments occasionally for emphasis. Like this.
   - Vary paragraph lengths (2-6 sentences)

2. CONVERSATIONAL ELEMENTS:
   - Use contractions (don't, won't, it's, they're)
   - Include rhetorical questions
   - Add personal observations ("Here's what most people miss...")
   - Use phrases like "honestly", "look", "the thing is", "here's the deal"

3. SPECIFICITY & AUTHENTICITY:
   - Include specific numbers, dates, percentages
   - Reference real tools, companies, studies (even if hypothetical examples)
   - Add "insider" tips that show expertise
   - Include mild opinions and takes

4. NATURAL IMPERFECTIONS:
   - Use em dashes—like this—for parenthetical thoughts
   - Include occasional parentheses (for asides)
   - Use ellipses sparingly... for effect
   - Add transitional phrases humans use ("That said...", "Now here's where it gets interesting...")

5. ENGAGEMENT HOOKS:
   - Open with a bold statement or surprising fact
   - Use power words (proven, exclusive, essential, critical)
   - Create curiosity gaps
   - Include mini-stories or scenarios

6. AVOID AI TELLS:
   - Never use: "In conclusion", "Furthermore", "Moreover", "In today's digital landscape"
   - Don't start multiple paragraphs the same way
   - Avoid overly formal or academic tone
   - Don't explain obvious things
   - Skip generic intros like "In this article, we will discuss..."
`;

/**
 * AI Search Optimization Guidelines
 */
const AI_SEARCH_OPTIMIZATION = `
OPTIMIZE FOR AI SEARCH ENGINES (Critical for 2024-2026 SEO):

1. GOOGLE AI OVERVIEWS / SGE:
   - Lead with direct, factual answers to likely questions
   - Use clear definition formats for key terms
   - Structure content for easy extraction (lists, tables, headers)
   - Include authoritative statements with supporting context

2. CHATGPT / COPILOT SEARCH:
   - Answer the core question in the first 100 words
   - Use semantic variations of keywords naturally
   - Include expert-level depth that AI can cite
   - Structure as Q&A format where appropriate

3. PERPLEXITY / CLAUDE SEARCH:
   - Provide comprehensive coverage of subtopics
   - Include statistics and data points
   - Add context that supports factual responses
   - Use clear attribution language ("According to...", "Research shows...")

4. FEATURED SNIPPET OPTIMIZATION:
   - Create "definition" paragraphs (40-60 words)
   - Use numbered lists for processes
   - Create comparison tables
   - Answer "what is", "how to", "why" directly
`;

/**
 * Build comprehensive context from project and client data
 */
function buildContentContext(projectData, clientData = {}) {
  return {
    // Project specifics
    projectName: projectData.project_name || '',
    keywords: projectData.keywords || [],
    primaryKeyword: (projectData.keywords || [])[0] || 'topic',
    secondaryKeywords: (projectData.keywords || []).slice(1),
    competitors: projectData.competitors || [],
    targetAudience: projectData.target_audience || clientData.target_audience || '',
    uniqueAngle: projectData.unique_angle || '',
    contentStyle: projectData.content_preferences || clientData.brand_tone || 'professional',
    
    // Client/Brand specifics
    companyName: clientData.company_name || '',
    industry: clientData.industry || '',
    brandVoice: clientData.brand_voice || '',
    brandTone: clientData.brand_tone || 'professional',
    contentGuidelines: clientData.content_guidelines || '',
    sampleContent: clientData.sample_content || '',
    uniqueSellingPoints: clientData.unique_selling_points || '',
    websiteUrl: clientData.website_url || '',
  };
}

/**
 * Generate keyword research and content strategy analysis
 */
async function generateKeywordStrategy(context) {
  const systemPrompt = `You are an elite SEO strategist with 15+ years experience. Analyze keywords and create a comprehensive content strategy.`;

  const userPrompt = `Analyze this keyword opportunity and create a content strategy:

PRIMARY KEYWORD: "${context.primaryKeyword}"
SECONDARY KEYWORDS: ${context.secondaryKeywords.join(', ') || 'None specified'}
INDUSTRY: ${context.industry || 'General'}
TARGET AUDIENCE: ${context.targetAudience || 'General audience'}
COMPETITORS: ${context.competitors.length > 0 ? context.competitors.join(', ') : 'Not specified'}

Provide a JSON response with:
{
  "keywordAnalysis": {
    "primaryKeywordIntent": "informational|transactional|navigational|commercial",
    "searcherPainPoints": ["list of 3-5 pain points searchers have"],
    "questionsToAnswer": ["list of 5-7 questions searchers want answered"],
    "semanticKeywords": ["10-15 related keywords to include naturally"],
    "longTailVariations": ["5-7 long-tail keyword phrases"]
  },
  "competitorGaps": {
    "whatCompetitorsMiss": ["3-5 topics competitors likely undercover"],
    "uniqueAngles": ["3-4 fresh angles to differentiate"],
    "contentDepthOpportunity": "area where we can go deeper"
  },
  "contentStrategy": {
    "recommendedTitle": "SEO-optimized title suggestion",
    "contentStructure": ["list of H2 sections to cover"],
    "uniqueValueProposition": "what makes this content stand out",
    "callToAction": "recommended CTA based on keyword intent"
  },
  "aiSearchOptimization": {
    "featuredSnippetOpportunity": "specific snippet format to target",
    "directAnswerToInclude": "40-60 word direct answer for AI extraction",
    "definitionToInclude": "key term definition to include"
  }
}`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt);
    // Try to parse JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Error generating keyword strategy:', error);
    return null;
  }
}

/**
 * Generate SEO-optimized blog content
 */
export async function generateBlogContent(projectData, clientData = {}) {
  const context = buildContentContext(projectData, clientData);
  
  // First, get keyword strategy (if API credits allow)
  let strategy = null;
  try {
    strategy = await generateKeywordStrategy(context);
  } catch (e) {
    console.log('Skipping keyword strategy generation:', e.message);
  }

  const systemPrompt = `You are a senior content strategist and writer who creates content that ranks #1 on Google while being impossible to detect as AI-written.

${HUMAN_WRITING_GUIDELINES}

${AI_SEARCH_OPTIMIZATION}

BRAND CONTEXT:
- Company: ${context.companyName || 'Our client'}
- Industry: ${context.industry || 'Business'}
- Brand Voice: ${context.brandVoice || 'Professional yet approachable'}
- Brand Tone: ${context.brandTone}
${context.contentGuidelines ? `- Content Guidelines: ${context.contentGuidelines}` : ''}
${context.uniqueSellingPoints ? `- USPs: ${context.uniqueSellingPoints}` : ''}`;

  const userPrompt = `Create a comprehensive, SEO-optimized article that will rank #1 and NOT be detected as AI-written.

TARGET KEYWORD: "${context.primaryKeyword}"
SECONDARY KEYWORDS: ${context.secondaryKeywords.join(', ') || 'Use semantically related terms'}
TARGET AUDIENCE: ${context.targetAudience || 'Professionals interested in this topic'}
UNIQUE ANGLE: ${context.uniqueAngle || 'Provide fresh, actionable insights'}
${context.competitors.length > 0 ? `\nOUTCOMPETE THESE SITES: ${context.competitors.join(', ')}\n- Go deeper on topics they miss\n- Provide more specific, actionable advice\n- Include data and examples they don't have` : ''}

${strategy ? `
KEYWORD STRATEGY TO FOLLOW:
- Questions to answer: ${strategy.keywordAnalysis?.questionsToAnswer?.join('; ') || 'Address common questions'}
- Include these semantic keywords naturally: ${strategy.keywordAnalysis?.semanticKeywords?.join(', ') || 'Use related terms'}
- Competitor gaps to exploit: ${strategy.competitorGaps?.whatCompetitorsMiss?.join('; ') || 'Cover comprehensively'}
- Featured snippet opportunity: ${strategy.aiSearchOptimization?.featuredSnippetOpportunity || 'Include a concise definition'}
- Direct answer to include early: ${strategy.aiSearchOptimization?.directAnswerToInclude || 'Answer the main question upfront'}
` : ''}

ARTICLE REQUIREMENTS:
1. LENGTH: 3,500-4,500 words (comprehensive but not padded)
2. STRUCTURE:
   - Hook opening (no generic intros)
   - Clear H2 sections (6-10 sections)
   - H3 subsections where needed
   - Bullet/numbered lists for actionable items
   - Summary or key takeaways
   - Strong CTA

3. SEO REQUIREMENTS:
   - Primary keyword in: title, first 100 words, 2-3 H2s, conclusion
   - Secondary keywords distributed naturally
   - Meta description (under 155 characters, compelling)
   - Internal linking suggestions noted as [INTERNAL: topic]
   
4. AI SEARCH OPTIMIZATION:
   - Include a clear definition paragraph early (40-60 words)
   - Answer "what is [keyword]" directly within first 200 words
   - Include specific statistics and data points
   - Create scannable lists and tables
   
5. HUMAN AUTHENTICITY:
   - Include specific examples (real company names, tools, scenarios)
   - Add insider tips ("Pro tip:", "Here's what experts actually do:")
   - Include mild opinions and recommendations
   - Reference recent trends or changes in the industry
   - Use casual transitions naturally

FORMAT YOUR RESPONSE AS:
---
title: [SEO Title - max 60 chars, include keyword]
metaDescription: [Compelling meta - max 155 chars]  
keywords: [${context.keywords.join(', ')}]
estimatedReadTime: [X minutes]
targetFeaturedSnippet: [paragraph|list|table]
---

[ARTICLE CONTENT IN MARKDOWN]`;

  try {
    const content = await generateContentWithSystem(systemPrompt, userPrompt);
    const parsed = parseMarkdownWithFrontmatter(content);
    
    return {
      title: parsed.title || `Complete Guide: ${context.primaryKeyword}`,
      content: parsed.content || content,
      meta_description: parsed.metaDescription || '',
      keywords: context.keywords,
      keywordStrategy: strategy,
      status: 'ready',
    };
  } catch (error) {
    console.error('Error generating blog content:', error);
    throw new Error(`Failed to generate blog content: ${error.message}`);
  }
}

/**
 * Generate LinkedIn post optimized for engagement
 */
export async function generateLinkedInPost(projectData, clientData = {}) {
  const context = buildContentContext(projectData, clientData);

  const systemPrompt = `You are a LinkedIn content creator with 500k+ followers. You write posts that go viral while sounding authentic and human.

${HUMAN_WRITING_GUIDELINES}

LINKEDIN-SPECIFIC RULES:
- Open with a hook that stops the scroll
- Use line breaks for readability (short paragraphs)
- Include a personal angle or observation
- End with a question or CTA that drives comments
- NO hashtags in the main body (add 3-5 at the very end)
- NO emojis overload (max 3-4 total, strategically placed)`;

  const userPrompt = `Create a LinkedIn post that will get 10,000+ impressions.

TOPIC: "${context.primaryKeyword}"
BRAND: ${context.companyName || 'a professional'}
INDUSTRY: ${context.industry || 'Business'}
TARGET AUDIENCE: ${context.targetAudience || 'Business professionals'}
TONE: ${context.brandTone || 'Professional yet conversational'}
${context.brandVoice ? `VOICE: ${context.brandVoice}` : ''}

REQUIREMENTS:
1. LENGTH: 200-300 words (optimal for LinkedIn)
2. STRUCTURE:
   - Opening hook (1-2 lines that grab attention)
   - The insight or value (what are you sharing?)
   - 3-5 actionable takeaways OR a compelling story
   - Closing CTA or question
   - 3-5 relevant hashtags at the end

3. ENGAGEMENT TRIGGERS:
   - Controversial or counterintuitive take
   - "Here's what nobody tells you about..."
   - Specific numbers or results
   - Relatable struggle or win

4. AUTHENTICITY:
   - Write like you're sharing with a colleague
   - Include a personal observation
   - Don't be preachy or lecture-y
   - Sound like a real person, not a brand`;

  try {
    const content = await generateContentWithSystem(systemPrompt, userPrompt);
    
    return {
      content: content,
      platform: 'linkedin',
      status: 'ready',
    };
  } catch (error) {
    console.error('Error generating LinkedIn post:', error);
    throw new Error(`Failed to generate LinkedIn post: ${error.message}`);
  }
}

/**
 * Generate Google Ads copy with high CTR focus
 */
export async function generateGoogleAdsCopy(projectData, clientData = {}) {
  const context = buildContentContext(projectData, clientData);

  const systemPrompt = `You are a Google Ads specialist with $100M+ in managed ad spend. You create ads with industry-leading CTR and conversion rates.

KEY PRINCIPLES:
- Every character counts (strict limits)
- Match search intent precisely
- Include keywords naturally
- Use power words that drive clicks
- Create urgency without being spammy
- Different headlines for different intents`;

  const userPrompt = `Create Google Search Ads for this campaign:

PRIMARY KEYWORDS: ${context.keywords.join(', ') || context.primaryKeyword}
TARGET AUDIENCE: ${context.targetAudience || 'People searching for this solution'}
UNIQUE SELLING POINTS: ${context.uniqueSellingPoints || 'Quality service, professional results'}
COMPANY: ${context.companyName || 'Our client'}
INDUSTRY: ${context.industry || 'Business services'}

CREATE 3 COMPLETE AD VARIATIONS with:

For EACH variation, provide:
1. HEADLINES (15 variations total - mix of types):
   - Keyword-focused (include exact keyword)
   - Benefit-focused (what they get)
   - Urgency-focused (why now)
   - Social proof (results/numbers)
   - Question-based (address pain point)
   (Max 30 characters each - COUNT CAREFULLY)

2. DESCRIPTIONS (6 variations):
   - Feature-benefit descriptions
   - Call-to-action focused
   - Differentiator focused
   (Max 90 characters each - COUNT CAREFULLY)

3. RESPONSIVE SEARCH AD STRATEGY:
   - Which headlines to pin
   - Recommended combinations
   - A/B testing suggestions

Format as JSON:
{
  "adVariations": [
    {
      "name": "Variation 1 - Benefit Focused",
      "headlines": ["headline1 (X chars)", "headline2 (X chars)", ...],
      "descriptions": ["desc1 (X chars)", "desc2 (X chars)"],
      "pinnedHeadlines": {"position1": "headline", "position2": "headline"},
      "strategy": "targeting rationale"
    }
  ],
  "allHeadlines": ["15 unique headlines with char counts"],
  "allDescriptions": ["6 unique descriptions with char counts"],
  "negativKeywords": ["keywords to exclude"],
  "estimatedCTR": "expected range based on industry",
  "callToAction": "primary CTA"
}`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt);
    
    let parsed;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { text: response };
    } catch {
      parsed = { text: response };
    }
    
    return {
      headline: parsed.allHeadlines?.[0]?.replace(/\s*\(\d+\s*chars?\)/, '') || '',
      headlines: (parsed.allHeadlines || []).map(h => h.replace(/\s*\(\d+\s*chars?\)/, '')),
      body_text: parsed.allDescriptions?.[0]?.replace(/\s*\(\d+\s*chars?\)/, '') || '',
      descriptions: (parsed.allDescriptions || []).map(d => d.replace(/\s*\(\d+\s*chars?\)/, '')),
      cta_text: parsed.callToAction || 'Get Started',
      adVariations: parsed.adVariations || [],
      strategy: parsed.estimatedCTR || '',
      ad_type: 'google_search',
      platform: 'google',
      target_keywords: context.keywords,
      status: 'ready',
    };
  } catch (error) {
    console.error('Error generating Google Ads copy:', error);
    throw new Error(`Failed to generate Google Ads copy: ${error.message}`);
  }
}

/**
 * Generate Facebook/Instagram Ads copy
 */
export async function generateFacebookAdsCopy(projectData, clientData = {}) {
  const context = buildContentContext(projectData, clientData);

  const systemPrompt = `You are a Facebook/Meta Ads specialist who creates scroll-stopping ad copy that converts.

KEY PRINCIPLES:
- Hook in the first line (pattern interrupt)
- Speak to ONE specific person
- Agitate pain before presenting solution
- Use social proof when possible
- Clear, single CTA
- Mobile-first formatting`;

  const userPrompt = `Create Facebook/Instagram ad copy for:

PRODUCT/SERVICE: ${context.primaryKeyword}
TARGET AUDIENCE: ${context.targetAudience || 'Potential customers'}
UNIQUE VALUE: ${context.uniqueSellingPoints || context.uniqueAngle || 'Quality solution'}
COMPANY: ${context.companyName || 'Our brand'}
INDUSTRY: ${context.industry || 'Business'}
TONE: ${context.brandTone || 'Professional yet friendly'}

CREATE 3 AD VARIATIONS targeting different angles:
1. Pain Point Focus - Address the problem first
2. Benefit Focus - Lead with the transformation
3. Social Proof Focus - Lead with results/testimonials

For EACH variation:
- Hook (first line that stops scroll - max 40 chars)
- Primary Text (main copy - 125-300 chars for feed, up to 500 for consideration)
- Headline (40 chars max - appears below image)
- Description (optional - 30 chars for link ads)
- CTA Button (choose from: Learn More, Sign Up, Shop Now, Get Quote, Contact Us, Download, Book Now)

Format as JSON:
{
  "adVariations": [
    {
      "angle": "Pain Point",
      "hook": "attention-grabbing opener",
      "primaryText": "main ad copy",
      "headline": "below image headline",
      "description": "link description",
      "cta": "CTA button text",
      "targetEmotion": "what emotion this triggers",
      "bestFor": "awareness|consideration|conversion"
    }
  ],
  "creativeSuggestions": {
    "imageStyle": "recommended visual approach",
    "videoHook": "if using video, opening hook idea",
    "carouselCards": ["card 1 idea", "card 2 idea", "card 3 idea"]
  },
  "audienceSuggestions": {
    "primaryAudience": "main targeting recommendation",
    "lookalike": "lookalike audience suggestion",
    "retargeting": "retargeting copy variation"
  }
}`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt);
    
    let parsed;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { text: response };
    } catch {
      parsed = { text: response };
    }
    
    const firstAd = parsed.adVariations?.[0] || {};
    
    return {
      headline: firstAd.headline || '',
      body_text: firstAd.primaryText || parsed.text || '',
      cta_text: firstAd.cta || 'Learn More',
      hook: firstAd.hook || '',
      adVariations: parsed.adVariations || [],
      creativeSuggestions: parsed.creativeSuggestions || {},
      audienceSuggestions: parsed.audienceSuggestions || {},
      ad_type: 'facebook',
      platform: 'facebook',
      target_keywords: context.keywords,
      status: 'ready',
    };
  } catch (error) {
    console.error('Error generating Facebook Ads copy:', error);
    throw new Error(`Failed to generate Facebook Ads copy: ${error.message}`);
  }
}

/**
 * Generate article ideas based on keyword research
 */
export async function generateArticleIdeas(projectData, clientData = {}) {
  const context = buildContentContext(projectData, clientData);

  const systemPrompt = `You are an SEO content strategist. Generate high-potential article ideas based on keyword research and competitive analysis.`;

  const userPrompt = `Generate 10 high-potential article ideas for:

MAIN TOPIC: "${context.primaryKeyword}"
INDUSTRY: ${context.industry || 'General'}
TARGET AUDIENCE: ${context.targetAudience || 'General audience'}
COMPETITORS: ${context.competitors.join(', ') || 'Not specified'}

For each idea, provide:
{
  "articleIdeas": [
    {
      "title": "SEO-optimized title",
      "primaryKeyword": "main target keyword",
      "secondaryKeywords": ["2-3 related keywords"],
      "searchIntent": "informational|commercial|transactional",
      "estimatedDifficulty": "low|medium|high",
      "contentType": "how-to|listicle|guide|comparison|case-study",
      "uniqueAngle": "what makes this different",
      "outline": ["3-5 main sections"],
      "potentialFeaturedSnippet": "yes/no and what type",
      "competitorGap": "why this beats competitors"
    }
  ],
  "contentCalendarSuggestion": {
    "pillarContent": "main comprehensive piece",
    "clusterContent": ["supporting articles that link to pillar"],
    "quickWins": ["easy to rank articles to start with"]
  }
}`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt);
    
    let parsed;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { ideas: response };
    } catch {
      parsed = { ideas: response };
    }
    
    return {
      articleIdeas: parsed.articleIdeas || [],
      contentCalendar: parsed.contentCalendarSuggestion || {},
      status: 'ready',
    };
  } catch (error) {
    console.error('Error generating article ideas:', error);
    throw new Error(`Failed to generate article ideas: ${error.message}`);
  }
}

/**
 * Helper function to parse Markdown with frontmatter
 */
function parseMarkdownWithFrontmatter(markdown) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return { content: markdown };
  }

  const frontmatter = match[1];
  const content = match[2];

  const parsed = { content };

  // Parse frontmatter fields
  const titleMatch = frontmatter.match(/title:\s*(.+)/i);
  const metaMatch = frontmatter.match(/metaDescription:\s*(.+)/i);
  const keywordsMatch = frontmatter.match(/keywords:\s*(.+)/i);
  const readTimeMatch = frontmatter.match(/estimatedReadTime:\s*(.+)/i);
  const snippetMatch = frontmatter.match(/targetFeaturedSnippet:\s*(.+)/i);

  if (titleMatch) parsed.title = titleMatch[1].trim();
  if (metaMatch) parsed.metaDescription = metaMatch[1].trim();
  if (keywordsMatch) parsed.keywords = keywordsMatch[1].split(',').map(k => k.trim());
  if (readTimeMatch) parsed.readTime = readTimeMatch[1].trim();
  if (snippetMatch) parsed.targetSnippet = snippetMatch[1].trim();

  return parsed;
}
