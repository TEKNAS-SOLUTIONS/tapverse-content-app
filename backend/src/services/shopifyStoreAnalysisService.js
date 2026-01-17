import { getShopifyProducts, getShopifyCollections, getShopifyStoreInfo } from './shopifyService.js';
import { batchGetKeywordData, getSerpData } from './dataForSeoService.js';
import { generateContentWithSystem } from './claude.js';
import { config } from '../config/config.js';
import pool from '../db/index.js';

/**
 * Shopify Store Analysis Service
 * 
 * Analyzes entire Shopify store using:
 * - Shopify API: Real store data
 * - DataForSEO: Real keyword data
 * - Claude AI: Analysis and recommendations
 * 
 * Provides:
 * - SEO audit for all products
 * - Keyword opportunities
 * - Sales optimization recommendations
 * - Priority action items
 */

/**
 * Analyze entire Shopify store
 * @param {string} clientId - Client ID
 * @param {object} options - Analysis options
 * @returns {Promise<object>} Complete store analysis
 */
export async function analyzeShopifyStore(clientId, options = {}) {
  const {
    analyzeProducts = true,
    analyzeCollections = true,
    maxProducts = 100, // Limit for initial analysis
    includeDataForSeo = true,
  } = options;

  try {
    console.log(`Starting Shopify store analysis for client ${clientId}...`);

    // Step 1: Get client and store connection info
    const clientResult = await pool.query(
      'SELECT * FROM clients WHERE id = $1',
      [clientId]
    );

    if (clientResult.rows.length === 0) {
      throw new Error('Client not found');
    }

    const client = clientResult.rows[0];

    if (client.primary_business_type !== 'shopify') {
      throw new Error('Client is not a Shopify store');
    }

    // Get store connection from shopify_stores table or client data
    const storeResult = await pool.query(
      'SELECT * FROM shopify_stores WHERE client_id = $1 ORDER BY created_at DESC LIMIT 1',
      [clientId]
    );

    if (storeResult.rows.length === 0) {
      throw new Error('Shopify store not connected. Please connect store first.');
    }

    const store = storeResult.rows[0];
    const { store_url, access_token } = store;

    // Step 2: Fetch store data
    console.log('Fetching store data from Shopify...');
    const [storeInfo, products, collections] = await Promise.all([
      getShopifyStoreInfo(store_url, access_token),
      analyzeProducts ? getShopifyProducts(store_url, access_token).then(p => p.slice(0, maxProducts)) : Promise.resolve([]),
      analyzeCollections ? getShopifyCollections(store_url, access_token) : Promise.resolve([]),
    ]);

    console.log(`Fetched ${products.length} products, ${collections.length} collections`);

    // Step 3: Extract keywords from products
    const productKeywords = extractKeywordsFromProducts(products);
    console.log(`Extracted ${productKeywords.length} unique keywords from products`);

    // Step 4: Get real keyword data from DataForSEO
    let keywordData = null;
    if (includeDataForSeo && config.dataForSeo?.enabled && productKeywords.length > 0) {
      try {
        console.log('Fetching real keyword data from DataForSEO...');
        keywordData = await batchGetKeywordData(
          productKeywords.slice(0, 100), // Limit to 100 keywords
          {
            locationCode: config.dataForSeo.defaultLocation,
            languageCode: config.dataForSeo.defaultLanguage,
          }
        );
        console.log(`Retrieved data for ${keywordData.length} keywords`);
      } catch (error) {
        console.error('DataForSEO error (continuing with AI):', error.message);
      }
    }

    // Step 5: Analyze products with AI + DataForSEO
    console.log('Analyzing products with AI...');
    const productAnalyses = await analyzeProductsWithAI(
      products,
      keywordData,
      client,
      storeInfo
    );

    // Step 6: Analyze collections
    const collectionAnalyses = analyzeCollections ? 
      await analyzeCollectionsWithAI(collections, keywordData, client) : [];

    // Step 7: Generate overall recommendations
    const overallRecommendations = await generateOverallRecommendations(
      productAnalyses,
      collectionAnalyses,
      storeInfo,
      client
    );

    // Step 8: Calculate SEO score
    const seoScore = calculateStoreSEOScore(productAnalyses, collectionAnalyses);

    // Step 9: Identify sales opportunities
    const salesOpportunities = identifySalesOpportunities(productAnalyses, keywordData);

    // Step 10: Compile final analysis
    const analysis = {
      store_summary: {
        store_name: storeInfo.name || client.company_name,
        store_url: store_url,
        total_products: products.length,
        total_collections: collections.length,
        analysis_date: new Date().toISOString(),
      },
      seo_score: seoScore,
      overall_recommendations: overallRecommendations,
      product_analyses: productAnalyses,
      collection_analyses: collectionAnalyses,
      sales_opportunities: salesOpportunities,
      metadata: {
        dataforseo_enabled: config.dataForSeo?.enabled || false,
        keywords_analyzed: productKeywords.length,
        real_keyword_data_count: keywordData?.length || 0,
        data_source: keywordData ? 'dataforseo' : 'ai',
        fallback_used: includeDataForSeo && !keywordData,
      },
    };

    // Step 11: Save to database
    await saveStoreAnalysis(clientId, analysis);

    return analysis;
  } catch (error) {
    console.error('Error analyzing Shopify store:', error);
    throw error;
  }
}

/**
 * Extract keywords from products
 */
function extractKeywordsFromProducts(products) {
  const keywords = new Set();

  products.forEach(product => {
    // From title
    if (product.title) {
      const titleWords = product.title.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3);
      titleWords.forEach(w => keywords.add(w));
    }

    // From tags
    if (product.tags) {
      const tags = Array.isArray(product.tags) ? product.tags : product.tags.split(',');
      tags.forEach(tag => {
        const cleanTag = tag.trim().toLowerCase();
        if (cleanTag.length > 2) {
          keywords.add(cleanTag);
        }
      });
    }

    // From product type
    if (product.product_type) {
      keywords.add(product.product_type.toLowerCase());
    }

    // From vendor
    if (product.vendor) {
      keywords.add(product.vendor.toLowerCase());
    }
  });

  // Create keyword phrases (2-3 words)
  const keywordPhrases = [];
  const keywordArray = Array.from(keywords);
  
  for (let i = 0; i < keywordArray.length; i++) {
    keywordPhrases.push(keywordArray[i]);
    
    // 2-word phrases
    if (i < keywordArray.length - 1) {
      keywordPhrases.push(`${keywordArray[i]} ${keywordArray[i + 1]}`);
    }
    
    // 3-word phrases
    if (i < keywordArray.length - 2) {
      keywordPhrases.push(`${keywordArray[i]} ${keywordArray[i + 1]} ${keywordArray[i + 2]}`);
    }
  }

  return keywordPhrases.slice(0, 200); // Limit to 200 keywords
}

/**
 * Analyze products with AI + DataForSEO
 */
async function analyzeProductsWithAI(products, keywordData, client, storeInfo) {
  const analyses = [];

  // Process in batches to avoid overwhelming the API
  const batchSize = 10;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    const batchAnalyses = await Promise.all(
      batch.map(product => analyzeSingleProduct(product, keywordData, client))
    );

    analyses.push(...batchAnalyses);

    // Rate limiting
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return analyses;
}

/**
 * Analyze single product
 */
async function analyzeSingleProduct(product, keywordData, client) {
  // Find relevant keyword data for this product
  const productKeywords = extractProductKeywords(product);
  const relevantKeywordData = keywordData ? 
    keywordData.filter(kw => 
      productKeywords.some(pk => 
        kw.keyword.toLowerCase().includes(pk.toLowerCase()) ||
        pk.toLowerCase().includes(kw.keyword.toLowerCase())
      )
    ) : [];

  const systemPrompt = `You are an expert e-commerce SEO analyst specializing in Shopify stores.
You analyze product pages and provide specific, actionable SEO recommendations.

Focus on:
- Title optimization (include keywords, benefits, year)
- Description optimization (SEO-friendly, conversion-focused)
- Meta description
- Image alt text
- Schema markup opportunities
- Internal linking
- Keyword targeting`;

  const keywordDataContext = relevantKeywordData.length > 0
    ? `\n\nREAL KEYWORD DATA FROM DATAFORSEO:\n${relevantKeywordData.map(kw => 
        `- "${kw.keyword}": ${kw.search_volume} searches/month, CPC: $${kw.cpc}, Competition: ${kw.competition}`
      ).join('\n')}`
    : '';

  const userPrompt = `Analyze this Shopify product for SEO optimization:

PRODUCT TITLE: ${product.title || 'N/A'}
PRODUCT DESCRIPTION: ${(product.body_html || '').substring(0, 500)}
PRODUCT TYPE: ${product.product_type || 'N/A'}
VENDOR: ${product.vendor || 'N/A'}
TAGS: ${(product.tags || []).join(', ') || 'N/A'}
PRODUCT URL: ${product.handle || 'N/A'}
${keywordDataContext}

Provide analysis as JSON:
{
  "seo_score": <1-100>,
  "current_title_analysis": {
    "length": <character count>,
    "has_keywords": <true/false>,
    "has_year": <true/false>,
    "has_benefits": <true/false>,
    "issues": ["<issue 1>", "<issue 2>"]
  },
  "title_recommendation": {
    "current": "${product.title || ''}",
    "optimized": "<optimized title with keywords>",
    "reason": "<why this is better>"
  },
  "description_analysis": {
    "word_count": <number>,
    "has_keywords": <true/false>,
    "readability": "<good/medium/poor>",
    "issues": ["<issue 1>", "<issue 2>"]
  },
  "description_recommendation": {
    "improvements": ["<improvement 1>", "<improvement 2>"],
    "suggested_sections": ["<section 1>", "<section 2>"]
  },
  "meta_description": {
    "current": "<if exists>",
    "suggested": "<optimized meta description>"
  },
  "keyword_opportunities": [
    {
      "keyword": "<keyword>",
      "search_volume": <if from DataForSEO>,
      "cpc": <if from DataForSEO>,
      "opportunity": "<high/medium/low>",
      "how_to_use": "<where to use this keyword>"
    }
  ],
  "image_recommendations": {
    "missing_alt_text": <count>,
    "suggestions": ["<suggestion 1>", "<suggestion 2>"]
  },
  "schema_markup": {
    "current": "<if exists>",
    "recommended": ["Product", "Offer", "AggregateRating"],
    "reason": "<why needed>"
  },
  "priority": "<high/medium/low>",
  "estimated_impact": "<high/medium/low>"
}`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt, {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4096,
    });

    // Parse JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          product_id: product.id.toString(),
          product_title: product.title,
          product_handle: product.handle,
          product_url: `https://${storeInfo.domain || 'store'}/products/${product.handle}`,
          ...analysis,
        };
      } catch (e) {
        console.error(`Failed to parse analysis for product ${product.id}:`, e);
      }
    }
  } catch (error) {
    console.error(`Error analyzing product ${product.id}:`, error);
  }

  // Fallback analysis
  return {
    product_id: product.id.toString(),
    product_title: product.title,
    product_handle: product.handle,
    seo_score: 50,
    priority: 'medium',
    error: 'Analysis failed, using basic analysis',
  };
}

/**
 * Extract keywords from single product
 */
function extractProductKeywords(product) {
  const keywords = [];
  
  if (product.title) keywords.push(product.title.toLowerCase());
  if (product.product_type) keywords.push(product.product_type.toLowerCase());
  if (product.vendor) keywords.push(product.vendor.toLowerCase());
  if (product.tags) {
    const tags = Array.isArray(product.tags) ? product.tags : product.tags.split(',');
    tags.forEach(tag => keywords.push(tag.trim().toLowerCase()));
  }

  return keywords;
}

/**
 * Analyze collections with AI
 */
async function analyzeCollectionsWithAI(collections, keywordData, client) {
  // Similar to product analysis but for collections
  // Simplified for now
  return collections.map(collection => ({
    collection_id: collection.id.toString(),
    collection_title: collection.title,
    collection_handle: collection.handle,
    seo_score: 60,
    recommendations: [],
  }));
}

/**
 * Generate overall recommendations
 */
async function generateOverallRecommendations(productAnalyses, collectionAnalyses, storeInfo, client) {
  const systemPrompt = `You are an expert e-commerce SEO strategist. Analyze store-wide SEO issues and provide priority recommendations.`;

  const userPrompt = `Based on analysis of ${productAnalyses.length} products and ${collectionAnalyses.length} collections, provide overall store recommendations:

PRODUCT ANALYSES SUMMARY:
- Average SEO Score: ${Math.round(productAnalyses.reduce((sum, p) => sum + (p.seo_score || 50), 0) / productAnalyses.length)}
- High Priority Products: ${productAnalyses.filter(p => p.priority === 'high').length}
- Common Issues: [extract from analyses]

Provide overall recommendations as JSON:
{
  "recommendations": [
    {
      "priority": "high",
      "category": "product_seo",
      "title": "<recommendation title>",
      "description": "<detailed description>",
      "impact": "high",
      "effort": "medium",
      "affected_count": <number of products>,
      "estimated_improvement": "<expected SEO score improvement>"
    }
  ]
}`;

  try {
    const response = await generateContentWithSystem(systemPrompt, userPrompt, {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4096,
    });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.recommendations || [];
    }
  } catch (error) {
    console.error('Error generating overall recommendations:', error);
  }

  return [];
}

/**
 * Calculate overall store SEO score
 */
function calculateStoreSEOScore(productAnalyses, collectionAnalyses) {
  if (productAnalyses.length === 0) return 50;

  const productScores = productAnalyses
    .map(p => p.seo_score || 50)
    .filter(s => !isNaN(s));

  if (productScores.length === 0) return 50;

  const avgScore = productScores.reduce((sum, s) => sum + s, 0) / productScores.length;
  return Math.round(avgScore);
}

/**
 * Identify sales opportunities
 */
function identifySalesOpportunities(productAnalyses, keywordData) {
  const opportunities = [];

  productAnalyses.forEach(product => {
    if (product.keyword_opportunities) {
      product.keyword_opportunities.forEach(kw => {
        if (kw.cpc && kw.cpc > 2.0) { // High CPC = high commercial value
          opportunities.push({
            type: 'high_value_keyword',
            product_id: product.product_id,
            product_title: product.product_title,
            keyword: kw.keyword,
            cpc: kw.cpc,
            search_volume: kw.search_volume,
            recommendation: `High CPC ($${kw.cpc}) indicates strong commercial intent. Prioritize SEO optimization for this product.`,
          });
        }
      });
    }
  });

  return opportunities;
}

/**
 * Save store analysis to database
 */
async function saveStoreAnalysis(clientId, analysis) {
  try {
    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shopify_analyses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
        analysis_data JSONB NOT NULL,
        seo_score INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(`
      INSERT INTO shopify_analyses (client_id, analysis_data, seo_score)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [
      clientId,
      JSON.stringify(analysis),
      analysis.seo_score,
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error saving store analysis:', error);
    // Don't throw - analysis can still be returned
  }
}

export default {
  analyzeShopifyStore,
};
