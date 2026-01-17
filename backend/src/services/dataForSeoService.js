import https from 'https';
import { config } from '../config/config.js';

/**
 * DataForSEO API Service
 * 
 * Provides real SEO data including:
 * - Keyword search volume, difficulty, CPC
 * - SERP analysis
 * - Related keywords
 * - Trend data
 * 
 * API Documentation: https://dataforseo.com/apis
 * Base URL: https://api.dataforseo.com/v3/
 */

const BASE_URL = 'https://api.dataforseo.com/v3';
const API_LOGIN = config.dataForSeo?.login || process.env.DATAFORSEO_LOGIN || 'sanket@teknas.com.au';
const API_PASSWORD = config.dataForSeo?.password || process.env.DATAFORSEO_PASSWORD || '97e322c50317d801';

/**
 * Simple in-memory cache for API responses
 * Reduces API costs by caching results
 */
const cache = new Map();

/**
 * Cache configuration
 */
const CACHE_TTL = {
  keywordData: 24 * 60 * 60 * 1000, // 24 hours (keyword data changes slowly)
  serpData: 6 * 60 * 60 * 1000,      // 6 hours (SERP changes more frequently)
  relatedKeywords: 12 * 60 * 60 * 1000, // 12 hours
};

/**
 * Generate cache key
 */
function getCacheKey(type, params) {
  return `${type}:${JSON.stringify(params)}`;
}

/**
 * Get from cache if valid
 */
function getFromCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

/**
 * Set cache value
 */
function setCache(key, data, ttl) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  });
}

/**
 * Clear expired cache entries (run periodically)
 */
function clearExpiredCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now > value.expiresAt) {
      cache.delete(key);
    }
  }
}

// Clear expired cache every hour
setInterval(clearExpiredCache, 60 * 60 * 1000);

/**
 * Get Base64 encoded credentials for Basic Auth
 */
function getAuthHeader() {
  const credentials = `${API_LOGIN}:${API_PASSWORD}`;
  return Buffer.from(credentials).toString('base64');
}

/**
 * Make API request to DataForSEO
 * @param {string} endpoint - API endpoint (e.g., '/keywords_data/google_ads/keywords/task_post')
 * @param {object} data - Request payload
 * @param {string} method - HTTP method (default: 'POST')
 * @returns {Promise<object>} API response
 */
async function makeRequest(endpoint, data = null, method = 'POST') {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Authorization': `Basic ${getAuthHeader()}`,
        'Content-Type': 'application/json',
      },
    };

    if (data && method === 'POST') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          
          // Check for API errors
          if (parsed.status_code && parsed.status_code !== 20000) {
            reject(new Error(`DataForSEO API Error: ${parsed.status_message || 'Unknown error'}`));
            return;
          }

          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse DataForSEO response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`DataForSEO request failed: ${error.message}`));
    });

    if (data && method === 'POST') {
      req.write(JSON.stringify(data));
    }

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('DataForSEO request timeout'));
    });

    req.end();
  });
}

/**
 * Get keyword data (search volume, difficulty, CPC)
 * @param {string[]} keywords - Array of keywords to analyze
 * @param {string} locationCode - Location code (e.g., '2840' for US, '2826' for UK)
 * @param {string} languageCode - Language code (e.g., 'en' for English)
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Promise<object>} Keyword data
 */
export async function getKeywordData(keywords, locationCode = '2840', languageCode = 'en', useCache = true) {
  try {
    // Check cache first
    if (useCache) {
      const cacheKey = getCacheKey('keywordData', { keywords: keywords.sort(), locationCode, languageCode });
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.log(`DataForSEO: Using cached keyword data for ${keywords.length} keywords`);
        return cached;
      }
    }
    // Step 1: Post task
    const taskResponse = await makeRequest('/keywords_data/google_ads/keywords/task_post', [
      {
        keywords: keywords,
        location_code: parseInt(locationCode),
        language_code: languageCode,
      }
    ]);

    if (!taskResponse.tasks || taskResponse.tasks.length === 0) {
      throw new Error('No task created');
    }

    const taskId = taskResponse.tasks[0].id;

    // Step 2: Wait a bit for processing (DataForSEO needs time)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Get results
    const resultsResponse = await makeRequest(`/keywords_data/google_ads/keywords/task_get/${taskId}`, null, 'GET');

    if (!resultsResponse.tasks || resultsResponse.tasks.length === 0) {
      throw new Error('No results available');
    }

    const results = resultsResponse.tasks[0].result || [];
    
    // Format results
    const formatted = results.map(item => ({
      keyword: item.keyword || '',
      search_volume: item.search_volume || 0,
      competition: item.competition || 'low',
      competition_index: item.competition_index || 0,
      cpc: item.cpc || 0,
      monthly_searches: item.monthly_searches || [],
      keyword_info: {
        se_type: item.se_type || 'google',
        last_updated_time: item.last_updated_time || '',
      }
    }));

    // Cache the results
    if (useCache) {
      const cacheKey = getCacheKey('keywordData', { keywords: keywords.sort(), locationCode, languageCode });
      setCache(cacheKey, formatted, CACHE_TTL.keywordData);
    }

    return formatted;
  } catch (error) {
    console.error('DataForSEO getKeywordData error:', error);
    throw error;
  }
}

/**
 * Get SERP data for a keyword
 * @param {string} keyword - Keyword to check
 * @param {string} locationCode - Location code
 * @param {string} languageCode - Language code
 * @param {string} device - Device type ('desktop' or 'mobile', default: 'desktop')
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Promise<object>} SERP data
 */
export async function getSerpData(keyword, locationCode = '2840', languageCode = 'en', device = 'desktop', useCache = true) {
  try {
    // Check cache first
    if (useCache) {
      const cacheKey = getCacheKey('serpData', { keyword, locationCode, languageCode, device });
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.log(`DataForSEO: Using cached SERP data for "${keyword}"`);
        return cached;
      }
    }
    // Post SERP task
    const taskResponse = await makeRequest('/serp/google/organic/task_post', [
      {
        keyword: keyword,
        location_code: parseInt(locationCode),
        language_code: languageCode,
        device: device,
        depth: 100, // Get top 100 results
      }
    ]);

    if (!taskResponse.tasks || taskResponse.tasks.length === 0) {
      throw new Error('No SERP task created');
    }

    const taskId = taskResponse.tasks[0].id;

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get results
    const resultsResponse = await makeRequest(`/serp/google/organic/task_get/${taskId}`, null, 'GET');

    if (!resultsResponse.tasks || resultsResponse.tasks.length === 0) {
      throw new Error('No SERP results available');
    }

    const result = resultsResponse.tasks[0].result?.[0];
    
    const serpData = {
      keyword: keyword,
      location_code: locationCode,
      language_code: languageCode,
      device: device,
      serp_info: {
        total_results: result?.items_count || 0,
        search_parameters: result?.search_parameters || {},
      },
      organic_results: (result?.items || []).slice(0, 20).map(item => ({
        rank: item.rank_group || 0,
        title: item.title || '',
        url: item.url || '',
        domain: item.domain || '',
        description: item.description || '',
        type: item.type || 'organic',
      })),
      featured_snippet: result?.items?.find(item => item.type === 'featured_snippet') || null,
    };

    // Cache the results
    if (useCache) {
      const cacheKey = getCacheKey('serpData', { keyword, locationCode, languageCode, device });
      setCache(cacheKey, serpData, CACHE_TTL.serpData);
    }

    return serpData;
  } catch (error) {
    console.error('DataForSEO getSerpData error:', error);
    throw error;
  }
}

/**
 * Get related keywords
 * @param {string} keyword - Seed keyword
 * @param {string} locationCode - Location code
 * @param {string} languageCode - Language code
 * @param {number} limit - Maximum number of related keywords (default: 10)
 * @param {boolean} useCache - Whether to use cache (default: true)
 * @returns {Promise<object[]>} Related keywords
 */
export async function getRelatedKeywords(keyword, locationCode = '2840', languageCode = 'en', limit = 10, useCache = true) {
  try {
    // Check cache first
    if (useCache) {
      const cacheKey = getCacheKey('relatedKeywords', { keyword, locationCode, languageCode, limit });
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.log(`DataForSEO: Using cached related keywords for "${keyword}"`);
        return cached;
      }
    }
    const taskResponse = await makeRequest('/keywords_data/google_ads/keywords_for_keywords/task_post', [
      {
        keyword: keyword,
        location_code: parseInt(locationCode),
        language_code: languageCode,
        limit: limit,
      }
    ]);

    if (!taskResponse.tasks || taskResponse.tasks.length === 0) {
      throw new Error('No related keywords task created');
    }

    const taskId = taskResponse.tasks[0].id;

    await new Promise(resolve => setTimeout(resolve, 2000));

    const resultsResponse = await makeRequest(`/keywords_data/google_ads/keywords_for_keywords/task_get/${taskId}`, null, 'GET');

    if (!resultsResponse.tasks || resultsResponse.tasks.length === 0) {
      throw new Error('No related keywords results available');
    }

    const results = resultsResponse.tasks[0].result || [];
    
    const formatted = results.map(item => ({
      keyword: item.keyword || '',
      search_volume: item.search_volume || 0,
      competition: item.competition || 'low',
      cpc: item.cpc || 0,
    }));

    // Cache the results
    if (useCache) {
      const cacheKey = getCacheKey('relatedKeywords', { keyword, locationCode, languageCode, limit });
      setCache(cacheKey, formatted, CACHE_TTL.relatedKeywords);
    }

    return formatted;
  } catch (error) {
    console.error('DataForSEO getRelatedKeywords error:', error);
    throw error;
  }
}

/**
 * Get local SERP data (includes local pack)
 * @param {string} keyword - Keyword to check
 * @param {object} options - Options (locationCode, languageCode, device, useCache)
 * @returns {Promise<object>} Local SERP data with local pack
 */
export async function getSerpLocal(keyword, options = {}) {
  const {
    locationCode = '2840',
    languageCode = 'en',
    device = 'desktop',
    useCache = true,
  } = options;

  try {
    // Check cache first
    if (useCache) {
      const cacheKey = getCacheKey('serpData', { keyword, locationCode, languageCode, device, type: 'local' });
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.log(`DataForSEO: Using cached local SERP data for "${keyword}"`);
        return cached;
      }
    }

    // Post local SERP task
    const taskResponse = await makeRequest('/serp/google/local_pack/task_post', [
      {
        keyword: keyword,
        location_code: parseInt(locationCode),
        language_code: languageCode,
        device: device,
        depth: 100,
      }
    ]);

    if (!taskResponse.tasks || taskResponse.tasks.length === 0) {
      throw new Error('No local SERP task created');
    }

    const taskId = taskResponse.tasks[0].id;

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get results
    const resultsResponse = await makeRequest(`/serp/google/local_pack/task_get/${taskId}`, null, 'GET');

    if (!resultsResponse.tasks || resultsResponse.tasks.length === 0) {
      throw new Error('No local SERP results available');
    }

    const result = resultsResponse.tasks[0].result?.[0];
    
    // Extract local pack (3-pack)
    const localPack = (result?.items || [])
      .filter(item => item.type === 'local_pack')
      .flatMap(item => item.local_pack || [])
      .slice(0, 3)
      .map((business, idx) => ({
        position: idx + 1,
        title: business.title || business.name || '',
        address: business.address || '',
        phone: business.phone || '',
        website: business.website || '',
        rating: business.rating || null,
        reviews: business.reviews || 0,
        category: business.category || '',
        coordinates: business.coordinates || null,
      }));

    const serpData = {
      keyword: keyword,
      location_code: locationCode,
      language_code: languageCode,
      device: device,
      local_pack: localPack,
      organic_results: (result?.items || [])
        .filter(item => item.type === 'organic')
        .slice(0, 10)
        .map(item => ({
          rank: item.rank_group || 0,
          title: item.title || '',
          url: item.url || '',
          domain: item.domain || '',
          description: item.description || '',
        })),
      serp_info: {
        total_results: result?.items_count || 0,
        search_parameters: result?.search_parameters || {},
      },
    };

    // Cache the results
    if (useCache) {
      const cacheKey = getCacheKey('serpData', { keyword, locationCode, languageCode, device, type: 'local' });
      setCache(cacheKey, serpData, CACHE_TTL.serpData);
    }

    return serpData;
  } catch (error) {
    console.error('DataForSEO getSerpLocal error:', error);
    // Fallback to regular SERP if local pack endpoint fails
    try {
      return await getSerpData(keyword, locationCode, languageCode, device, useCache);
    } catch (fallbackError) {
      throw new Error(`Local SERP failed: ${error.message}`);
    }
  }
}

/**
 * Get keyword difficulty (using SERP analysis)
 * @param {string} keyword - Keyword to analyze
 * @param {string} locationCode - Location code
 * @param {string} languageCode - Language code
 * @returns {Promise<number>} Difficulty score (0-100)
 */
export async function getKeywordDifficulty(keyword, locationCode = '2840', languageCode = 'en') {
  try {
    const serpData = await getSerpData(keyword, locationCode, languageCode);
    
    // Calculate difficulty based on top 10 results
    // Simple heuristic: check domain authority indicators
    const topResults = serpData.organic_results.slice(0, 10);
    
    // Count high-authority domains (Wikipedia, major sites, etc.)
    const highAuthDomains = ['wikipedia.org', 'youtube.com', 'amazon.com', 'reddit.com', 'quora.com'];
    const highAuthCount = topResults.filter(r => 
      highAuthDomains.some(domain => r.domain.includes(domain))
    ).length;
    
    // Base difficulty on high-authority presence
    // More high-authority = higher difficulty
    let difficulty = 30; // Base difficulty
    difficulty += highAuthCount * 10; // +10 per high-authority site
    
    // If featured snippet exists, increase difficulty
    if (serpData.featured_snippet) {
      difficulty += 15;
    }
    
    return Math.min(100, Math.max(0, difficulty));
  } catch (error) {
    console.error('DataForSEO getKeywordDifficulty error:', error);
    // Return estimated difficulty if API fails
    return 50;
  }
}

/**
 * Batch get keyword data with caching support
 * @param {string[]} keywords - Array of keywords
 * @param {object} options - Options (locationCode, languageCode, useCache)
 * @returns {Promise<object[]>} Keyword data array
 */
export async function batchGetKeywordData(keywords, options = {}) {
  const {
    locationCode = '2840',
    languageCode = 'en',
    useCache = true,
  } = options;

  // Check cache for all keywords first
  if (useCache) {
    const cacheKey = getCacheKey('keywordData', { keywords: keywords.sort(), locationCode, languageCode });
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log(`DataForSEO: Using cached batch keyword data for ${keywords.length} keywords`);
      return cached;
    }
  }

  try {
    // DataForSEO allows up to 1000 keywords per request
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < keywords.length; i += batchSize) {
      batches.push(keywords.slice(i, i + batchSize));
    }

    const results = [];
    
    for (const batch of batches) {
      try {
        // Get data (with caching disabled for individual batches since we cache the full result)
        const batchResults = await getKeywordData(batch, locationCode, languageCode, false);
        results.push(...batchResults);
        
        // Rate limiting: wait between batches
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error processing batch:`, error);
        // Continue with other batches
      }
    }

    // Cache the full batch result
    if (useCache) {
      const cacheKey = getCacheKey('keywordData', { keywords: keywords.sort(), locationCode, languageCode });
      setCache(cacheKey, results, CACHE_TTL.keywordData);
    }

    return results;
  } catch (error) {
    console.error('DataForSEO batchGetKeywordData error:', error);
    throw error;
  }
}

/**
 * Get cache statistics (for monitoring)
 */
export function getCacheStats() {
  clearExpiredCache(); // Clean up first
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
  };
}

/**
 * Clear all cache (for testing or manual refresh)
 */
export function clearAllCache() {
  cache.clear();
  return { cleared: true };
}

export default {
  getKeywordData,
  getSerpData,
  getSerpLocal,
  getRelatedKeywords,
  getKeywordDifficulty,
  batchGetKeywordData,
  getCacheStats,
  clearAllCache,
};
