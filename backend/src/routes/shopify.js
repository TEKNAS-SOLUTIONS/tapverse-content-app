import express from 'express';
import { testShopifyConnection, getShopifyStoreInfo } from '../services/shopifyService.js';
import { analyzeShopifyStore } from '../services/shopifyStoreAnalysisService.js';
import pool from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * POST /api/shopify/connect
 * Connect a Shopify store to a client
 */
router.post('/connect', async (req, res) => {
  try {
    const { client_id, store_url, access_token } = req.body;

    if (!client_id || !store_url || !access_token) {
      return res.status(400).json({
        success: false,
        error: 'client_id, store_url, and access_token are required',
      });
    }

    // Validate client exists
    const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [client_id]);
    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    const client = clientResult.rows[0];
    if (client.primary_business_type !== 'shopify') {
      return res.status(400).json({
        success: false,
        error: 'Client must have primary_business_type set to "shopify"',
      });
    }

    // Test connection
    const isValid = await testShopifyConnection(store_url, access_token);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Shopify credentials. Please check store_url and access_token.',
      });
    }

    // Get store info
    const storeInfo = await getShopifyStoreInfo(store_url, access_token);

    // Clean store URL (remove protocol)
    const cleanStoreUrl = store_url.replace(/^https?:\/\//, '').replace(/\/$/, '');

    // Check if store already connected
    const existingResult = await pool.query(
      'SELECT * FROM shopify_stores WHERE client_id = $1 AND store_url = $2',
      [client_id, cleanStoreUrl]
    );

    let store;
    if (existingResult.rows.length > 0) {
      // Update existing connection
      const result = await pool.query(`
        UPDATE shopify_stores
        SET access_token = $1, store_name = $2, store_domain = $3, 
            last_sync_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `, [access_token, storeInfo.name, storeInfo.domain, existingResult.rows[0].id]);
      store = result.rows[0];
    } else {
      // Create new connection
      const result = await pool.query(`
        INSERT INTO shopify_stores (client_id, store_url, store_domain, access_token, store_name, last_sync_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING *
      `, [client_id, cleanStoreUrl, storeInfo.domain, access_token, storeInfo.name]);
      store = result.rows[0];
    }

    res.json({
      success: true,
      data: {
        store_id: store.id,
        store_name: store.store_name,
        store_url: store.store_url,
        store_domain: store.store_domain,
        connected_at: store.created_at,
      },
      message: 'Shopify store connected successfully',
    });
  } catch (error) {
    console.error('Error connecting Shopify store:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to connect Shopify store',
    });
  }
});

/**
 * GET /api/shopify/stores/:clientId
 * Get Shopify store connection for a client
 */
router.get('/stores/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const result = await pool.query(
      'SELECT * FROM shopify_stores WHERE client_id = $1 ORDER BY created_at DESC LIMIT 1',
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No Shopify store connected for this client',
      });
    }

    const store = result.rows[0];
    // Don't return access_token for security
    res.json({
      success: true,
      data: {
        store_id: store.id,
        store_name: store.store_name,
        store_url: store.store_url,
        store_domain: store.store_domain,
        is_active: store.is_active,
        last_sync_at: store.last_sync_at,
        connected_at: store.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching Shopify store:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch Shopify store',
    });
  }
});

/**
 * POST /api/shopify/analyze/:clientId
 * Run full store analysis
 */
router.post('/analyze/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const options = req.body.options || {};

    console.log(`Starting store analysis for client ${clientId}...`);

    // Run analysis (this may take a while)
    const analysis = await analyzeShopifyStore(clientId, options);

    res.json({
      success: true,
      data: analysis,
      message: 'Store analysis completed successfully',
    });
  } catch (error) {
    console.error('Error analyzing Shopify store:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze Shopify store',
    });
  }
});

/**
 * GET /api/shopify/analyses/:clientId
 * Get analysis history for a client
 */
router.get('/analyses/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(`
      SELECT 
        id,
        seo_score,
        products_analyzed,
        collections_analyzed,
        recommendations_count,
        created_at,
        updated_at
      FROM shopify_analyses
      WHERE client_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [clientId, limit]);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analyses',
    });
  }
});

/**
 * GET /api/shopify/analysis/:analysisId
 * Get specific analysis details
 */
router.get('/analysis/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;

    const result = await pool.query(
      'SELECT * FROM shopify_analyses WHERE id = $1',
      [analysisId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found',
      });
    }

    const analysis = result.rows[0];
    res.json({
      success: true,
      data: {
        id: analysis.id,
        client_id: analysis.client_id,
        seo_score: analysis.seo_score,
        products_analyzed: analysis.products_analyzed,
        collections_analyzed: analysis.collections_analyzed,
        recommendations_count: analysis.recommendations_count,
        analysis_data: analysis.analysis_data,
        created_at: analysis.created_at,
        updated_at: analysis.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analysis',
    });
  }
});

export default router;
