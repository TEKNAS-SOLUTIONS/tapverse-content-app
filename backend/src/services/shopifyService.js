import https from 'https';
import { config } from '../config/config.js';

/**
 * Shopify API Service
 * 
 * Connects to Shopify Admin API to fetch store data:
 * - Products (titles, descriptions, tags, variants, images, pricing)
 * - Collections (category pages)
 * - Pages (blog posts, static pages)
 * - Store metadata
 * 
 * API Documentation: https://shopify.dev/docs/api/admin-rest
 */

/**
 * Make request to Shopify Admin API
 * @param {string} storeUrl - Store URL (e.g., 'store.myshopify.com')
 * @param {string} accessToken - Admin API access token
 * @param {string} endpoint - API endpoint (e.g., '/admin/api/2024-01/products.json')
 * @param {string} method - HTTP method (default: 'GET')
 * @param {object} data - Request body (for POST/PUT)
 * @returns {Promise<object>} API response
 */
async function makeShopifyRequest(storeUrl, accessToken, endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    // Ensure storeUrl doesn't have protocol
    const cleanStoreUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    const options = {
      hostname: cleanStoreUrl,
      path: endpoint,
      method,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
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
          // Handle rate limiting
          if (res.statusCode === 429) {
            const retryAfter = res.headers['retry-after'] || 2;
            reject(new Error(`Shopify rate limit exceeded. Retry after ${retryAfter} seconds.`));
            return;
          }

          if (res.statusCode >= 400) {
            reject(new Error(`Shopify API error: ${res.statusCode} - ${responseData}`));
            return;
          }

          const parsed = responseData ? JSON.parse(responseData) : {};
          
          // Extract pagination info
          const linkHeader = res.headers['link'];
          let nextPageUrl = null;
          if (linkHeader && linkHeader.includes('rel="next"')) {
            const match = linkHeader.match(/<([^>]+)>; rel="next"/);
            if (match) {
              nextPageUrl = match[1];
            }
          }

          resolve({
            data: parsed,
            pagination: {
              hasNext: !!nextPageUrl,
              nextUrl: nextPageUrl,
            },
          });
        } catch (error) {
          reject(new Error(`Failed to parse Shopify response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Shopify request failed: ${error.message}`));
    });

    if (data && (method === 'POST' || method === 'PUT')) {
      req.write(JSON.stringify(data));
    }

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Shopify request timeout'));
    });

    req.end();
  });
}

/**
 * Get all products from Shopify store
 * @param {string} storeUrl - Store URL
 * @param {string} accessToken - Admin API access token
 * @param {number} limit - Products per page (max 250, default: 250)
 * @returns {Promise<object[]>} Array of products
 */
export async function getShopifyProducts(storeUrl, accessToken, limit = 250) {
  try {
    const allProducts = [];
    let pageInfo = null;
    let page = 1;
    const maxPages = 100; // Safety limit

    while (page <= maxPages) {
      let endpoint = `/admin/api/2024-01/products.json?limit=${limit}`;
      
      if (pageInfo) {
        endpoint += `&page_info=${pageInfo}`;
      }

      const response = await makeShopifyRequest(storeUrl, accessToken, endpoint);
      
      const products = response.data.products || [];
      allProducts.push(...products);

      // Check for next page
      if (!response.pagination.hasNext) {
        break;
      }

      // Extract page_info from next URL
      if (response.pagination.nextUrl) {
        const url = new URL(response.pagination.nextUrl);
        pageInfo = url.searchParams.get('page_info');
      } else {
        break;
      }

      page++;

      // Rate limiting: wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Fetched ${allProducts.length} products from Shopify`);
    return allProducts;
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
}

/**
 * Get all collections from Shopify store
 * @param {string} storeUrl - Store URL
 * @param {string} accessToken - Admin API access token
 * @returns {Promise<object[]>} Array of collections
 */
export async function getShopifyCollections(storeUrl, accessToken) {
  try {
    const allCollections = [];
    let pageInfo = null;
    let page = 1;

    while (page <= 50) {
      let endpoint = `/admin/api/2024-01/collections.json?limit=250`;
      
      if (pageInfo) {
        endpoint += `&page_info=${pageInfo}`;
      }

      const response = await makeShopifyRequest(storeUrl, accessToken, endpoint);
      
      const collections = response.data.collections || [];
      allCollections.push(...collections);

      if (!response.pagination.hasNext) {
        break;
      }

      if (response.pagination.nextUrl) {
        const url = new URL(response.pagination.nextUrl);
        pageInfo = url.searchParams.get('page_info');
      } else {
        break;
      }

      page++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Fetched ${allCollections.length} collections from Shopify`);
    return allCollections;
  } catch (error) {
    console.error('Error fetching Shopify collections:', error);
    throw error;
  }
}

/**
 * Get all pages from Shopify store
 * @param {string} storeUrl - Store URL
 * @param {string} accessToken - Admin API access token
 * @returns {Promise<object[]>} Array of pages
 */
export async function getShopifyPages(storeUrl, accessToken) {
  try {
    const allPages = [];
    let pageInfo = null;
    let page = 1;

    while (page <= 50) {
      let endpoint = `/admin/api/2024-01/pages.json?limit=250`;
      
      if (pageInfo) {
        endpoint += `&page_info=${pageInfo}`;
      }

      const response = await makeShopifyRequest(storeUrl, accessToken, endpoint);
      
      const pages = response.data.pages || [];
      allPages.push(...pages);

      if (!response.pagination.hasNext) {
        break;
      }

      if (response.pagination.nextUrl) {
        const url = new URL(response.pagination.nextUrl);
        pageInfo = url.searchParams.get('page_info');
      } else {
        break;
      }

      page++;
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Fetched ${allPages.length} pages from Shopify`);
    return allPages;
  } catch (error) {
    console.error('Error fetching Shopify pages:', error);
    throw error;
  }
}

/**
 * Get store information
 * @param {string} storeUrl - Store URL
 * @param {string} accessToken - Admin API access token
 * @returns {Promise<object>} Store information
 */
export async function getShopifyStoreInfo(storeUrl, accessToken) {
  try {
    const response = await makeShopifyRequest(storeUrl, accessToken, '/admin/api/2024-01/shop.json');
    return response.data.shop || {};
  } catch (error) {
    console.error('Error fetching Shopify store info:', error);
    throw error;
  }
}

/**
 * Test Shopify connection
 * @param {string} storeUrl - Store URL
 * @param {string} accessToken - Admin API access token
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testShopifyConnection(storeUrl, accessToken) {
  try {
    await getShopifyStoreInfo(storeUrl, accessToken);
    return true;
  } catch (error) {
    console.error('Shopify connection test failed:', error);
    return false;
  }
}

/**
 * Get product metafields (for SEO metadata)
 * @param {string} storeUrl - Store URL
 * @param {string} accessToken - Admin API access token
 * @param {string} productId - Product ID
 * @returns {Promise<object[]>} Array of metafields
 */
export async function getProductMetafields(storeUrl, accessToken, productId) {
  try {
    const response = await makeShopifyRequest(
      storeUrl,
      accessToken,
      `/admin/api/2024-01/products/${productId}/metafields.json`
    );
    return response.data.metafields || [];
  } catch (error) {
    console.error(`Error fetching metafields for product ${productId}:`, error);
    return [];
  }
}

export default {
  getShopifyProducts,
  getShopifyCollections,
  getShopifyPages,
  getShopifyStoreInfo,
  testShopifyConnection,
  getProductMetafields,
};
