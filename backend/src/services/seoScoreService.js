/**
 * SEO Score Calculation Service
 * 
 * Calculates SEO and readability scores for content
 */

/**
 * Calculate SEO score based on various factors
 * @param {object} article - Article object with title, content, meta_description, etc.
 * @returns {number} SEO score (0-100)
 */
export function calculateSEOScore(article) {
  let score = 0;
  const factors = {
    keywordInTitle: false,
    keywordInFirst100: false,
    keywordInHeaders: false,
    metaDescriptionLength: false,
    contentLength: false,
    headerStructure: false,
    internalLinks: false,
    externalLinks: false,
    imageAltText: false,
    urlStructure: false,
    mobileFriendly: true, // Assume true for now
  };

  const title = article.title || '';
  const content = article.content || '';
  const metaDescription = article.meta_description || '';
  const keywords = article.keywords || [];
  const primaryKeyword = keywords[0] || '';

  // Check keyword in title (20 points)
  if (primaryKeyword && title.toLowerCase().includes(primaryKeyword.toLowerCase())) {
    factors.keywordInTitle = true;
    score += 20;
  }

  // Check keyword in first 100 words (15 points)
  const first100Words = content.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
  if (primaryKeyword && first100Words.includes(primaryKeyword.toLowerCase())) {
    factors.keywordInFirst100 = true;
    score += 15;
  }

  // Check keyword in headers (15 points)
  const headers = content.match(/^#+\s+.+$/gm) || [];
  const hasKeywordInHeaders = headers.some(header => 
    primaryKeyword && header.toLowerCase().includes(primaryKeyword.toLowerCase())
  );
  if (hasKeywordInHeaders) {
    factors.keywordInHeaders = true;
    score += 15;
  }

  // Meta description length (10 points)
  if (metaDescription.length >= 50 && metaDescription.length <= 160) {
    factors.metaDescriptionLength = true;
    score += 10;
  } else if (metaDescription.length > 0) {
    score += 5; // Partial points
  }

  // Content length (10 points)
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 300) {
    factors.contentLength = true;
    score += 10;
  } else if (wordCount >= 200) {
    score += 5;
  }

  // Header structure (10 points)
  const h1Count = (content.match(/^#\s+/gm) || []).length;
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  if (h1Count === 1 && h2Count >= 2) {
    factors.headerStructure = true;
    score += 10;
  } else if (h1Count === 1) {
    score += 5;
  }

  // Internal links (10 points)
  const internalLinks = (content.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
  if (internalLinks >= 3) {
    factors.internalLinks = true;
    score += 10;
  } else if (internalLinks >= 1) {
    score += 5;
  }

  // External links (5 points)
  const externalLinks = (content.match(/https?:\/\//g) || []).length;
  if (externalLinks >= 2) {
    factors.externalLinks = true;
    score += 5;
  } else if (externalLinks >= 1) {
    score += 2;
  }

  // Image alt text (assume present if images exist) (5 points)
  const images = (content.match(/!\[([^\]]*)\]\([^)]+\)/g) || []);
  if (images.length > 0) {
    const hasAltText = images.some(img => img.match(/!\[([^\]]+)\]/));
    if (hasAltText) {
      factors.imageAltText = true;
      score += 5;
    }
  }

  // URL structure (assume good if title exists) (0 points - already considered)
  if (title) {
    factors.urlStructure = true;
  }

  return Math.min(100, Math.round(score));
}

/**
 * Calculate readability score
 * @param {object} article - Article object with content
 * @returns {number} Readability score (0-100)
 */
export function calculateReadabilityScore(article) {
  const content = article.content || '';
  if (!content) return 0;

  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  // Average sentence length
  const avgSentenceLength = words.length / sentences.length;

  // Average word length
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

  // Flesch-Kincaid grade level (simplified)
  const fleschKincaid = 0.39 * (words.length / sentences.length) + 11.8 * (words.filter(w => w.match(/[aeiou]/i)).length / words.length) - 15.59;

  // Calculate score based on ideal ranges
  let score = 100;

  // Penalize very long sentences (ideal: 15-20 words)
  if (avgSentenceLength > 25) {
    score -= 20;
  } else if (avgSentenceLength > 20) {
    score -= 10;
  } else if (avgSentenceLength < 10) {
    score -= 5;
  }

  // Penalize very long words (ideal: 4-5 characters)
  if (avgWordLength > 6) {
    score -= 15;
  } else if (avgWordLength > 5) {
    score -= 5;
  }

  // Penalize very high Flesch-Kincaid level (ideal: 8-10)
  if (fleschKincaid > 12) {
    score -= 20;
  } else if (fleschKincaid > 10) {
    score -= 10;
  }

  // Reward good paragraph structure
  const avgParagraphLength = words.length / paragraphs.length;
  if (avgParagraphLength >= 100 && avgParagraphLength <= 200) {
    score += 10;
  }

  // Reward use of subheadings
  const subheadings = (content.match(/^##+\s+/gm) || []).length;
  if (subheadings >= 3) {
    score += 10;
  } else if (subheadings >= 1) {
    score += 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get AI search optimization notes
 * @param {object} article - Article object
 * @returns {object} AI search optimization notes
 */
export function getAISearchOptimizationNotes(article) {
  const title = article.title || '';
  const content = article.content || '';
  const metaDescription = article.meta_description || '';
  const keywords = article.keywords || [];
  const primaryKeyword = keywords[0] || '';

  return {
    google_ai_overviews: `Optimized for Google AI Overviews with clear structure, ${primaryKeyword ? `target keyword "${primaryKeyword}"` : 'relevant keywords'}, and comprehensive information.`,
    chatgpt_search: `Structured for ChatGPT search with clear headings, ${primaryKeyword ? `primary keyword "${primaryKeyword}"` : 'relevant topics'}, and detailed explanations.`,
    perplexity: `Optimized for Perplexity with ${primaryKeyword ? `keyword "${primaryKeyword}"` : 'relevant topics'}, clear sections, and authoritative content.`,
    claude_search: `Formatted for Claude search with ${primaryKeyword ? `target keyword "${primaryKeyword}"` : 'relevant information'}, logical flow, and comprehensive coverage.`,
    copilot: `Optimized for Microsoft Copilot with ${primaryKeyword ? `keyword "${primaryKeyword}"` : 'relevant content'}, clear structure, and detailed information.`,
  };
}

/**
 * Calculate content statistics
 * @param {object} article - Article object
 * @returns {object} Statistics object
 */
export function calculateStatistics(article) {
  const content = article.content || '';
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  const headings = (content.match(/^#+\s+/gm) || []).length;
  const links = (content.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
  const keywords = article.keywords || [];
  const primaryKeyword = keywords[0] || '';

  // Calculate keyword density
  let keywordDensity = 0;
  if (primaryKeyword && words.length > 0) {
    const keywordCount = words.filter(w => 
      w.toLowerCase().includes(primaryKeyword.toLowerCase())
    ).length;
    keywordDensity = (keywordCount / words.length) * 100;
  }

  // Calculate Flesch-Kincaid reading level
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgWordLength = words.length > 0 ? words.reduce((sum, word) => sum + word.length, 0) / words.length : 0;
  const syllables = words.reduce((sum, word) => {
    const wordLower = word.toLowerCase();
    const matches = wordLower.match(/[aeiouy]+/g);
    return sum + (matches ? matches.length : 1);
  }, 0);
  const avgSyllablesPerWord = words.length > 0 ? syllables / words.length : 0;
  const fleschKincaid = 0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59;

  return {
    word_count: words.length,
    reading_time: Math.ceil(words.length / 200),
    paragraph_count: paragraphs.length,
    heading_count: headings,
    link_count: links,
    keyword_density: keywordDensity,
    flesch_kincaid_level: fleschKincaid,
  };
}

