import express from 'express';
import pool from '../db/index.js';
import {
  getGoogleAuthUrl,
  isGoogleOAuthConfigured,
  exchangeCodeForToken,
  getValidAccessToken,
  discoverGoogleAdsAccounts,
  discoverSearchConsoleProperties,
  discoverAnalyticsAccounts,
  getGoogleUserInfo,
} from '../services/googleOAuthService.js';

const router = express.Router();

/**
 * GET /api/connections
 * Get all API connections
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        connection_name,
        connection_type,
        provider,
        account_id,
        account_name,
        account_email,
        is_active,
        last_synced_at,
        created_at,
        updated_at,
        connection_data
      FROM api_connections
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch connections',
    });
  }
});

/**
 * GET /api/connections/:id
 * Get specific connection details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM api_connections WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Connection not found',
      });
    }

    const connection = result.rows[0];
    
    // Don't return sensitive tokens in response
    delete connection.access_token;
    delete connection.refresh_token;

    res.json({
      success: true,
      data: connection,
    });
  } catch (error) {
    console.error('Error fetching connection:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch connection',
    });
  }
});

/**
 * GET /api/connections/google/status
 * Check if Google OAuth is configured
 */
router.get('/google/status', async (req, res) => {
  try {
    const isConfigured = isGoogleOAuthConfigured();
    res.json({
      success: true,
      data: {
        configured: isConfigured,
        message: isConfigured 
          ? 'Google OAuth is configured' 
          : 'Google OAuth credentials not configured. See GOOGLE_OAUTH_SETUP.md for instructions.',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check OAuth status',
    });
  }
});

/**
 * POST /api/connections/google/auth-url
 * Generate Google OAuth authorization URL
 */
router.post('/google/auth-url', async (req, res) => {
  try {
    const { connectionType } = req.body;

    if (!connectionType) {
      return res.status(400).json({
        success: false,
        error: 'connectionType is required',
      });
    }

    // Check if OAuth is configured
    if (!isGoogleOAuthConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file. See GOOGLE_OAUTH_SETUP.md for instructions.',
      });
    }

    const { authUrl, stateToken } = getGoogleAuthUrl(connectionType);

    res.json({
      success: true,
      data: {
        authUrl,
        stateToken,
      },
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate auth URL',
    });
  }
});

/**
 * POST /api/connections/google/callback
 * Handle Google OAuth callback
 */
router.post('/google/callback', async (req, res) => {
  try {
    const { code, state: stateToken, connectionType, connectionName } = req.body;

    if (!code || !stateToken) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code and state are required',
      });
    }

    // Exchange code for tokens
    const tokenData = await exchangeCodeForToken(code, stateToken);

    // Get user info
    const userInfo = await getGoogleUserInfo(tokenData.accessToken);

    // Discover available resources based on connection type
    let discoveredResources = {};
    let accountId = null;
    let accountName = connectionName || userInfo.name || 'Google Account';

    try {
      if (connectionType === 'google_ads' || tokenData.scope.includes('adwords')) {
        const accounts = await discoverGoogleAdsAccounts(tokenData.accessToken);
        discoveredResources.googleAdsAccounts = accounts;
        if (accounts.length > 0) {
          accountId = accounts[0].customerId;
          accountName = accounts[0].customerName;
        }
      }

      if (connectionType === 'google_search_console' || tokenData.scope.includes('webmasters')) {
        const properties = await discoverSearchConsoleProperties(tokenData.accessToken);
        discoveredResources.searchConsoleProperties = properties;
      }

      if (connectionType === 'google_analytics' || tokenData.scope.includes('analytics')) {
        const accounts = await discoverAnalyticsAccounts(tokenData.accessToken);
        discoveredResources.analyticsAccounts = accounts;
      }
    } catch (discoverError) {
      console.error('Error discovering resources:', discoverError);
      // Continue even if discovery fails - connection is still valid
    }

    // Save connection to database
    const result = await pool.query(`
      INSERT INTO api_connections (
        connection_name,
        connection_type,
        provider,
        access_token,
        refresh_token,
        token_expires_at,
        account_id,
        account_name,
        account_email,
        connection_data,
        is_active,
        last_synced_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      RETURNING id, connection_name, connection_type, provider, account_id, account_name, account_email, is_active, created_at
    `, [
      connectionName || accountName,
      connectionType || 'google_all',
      'google',
      tokenData.accessToken,
      tokenData.refreshToken,
      tokenData.expiresAt,
      accountId,
      accountName,
      userInfo.email,
      JSON.stringify(discoveredResources),
      true,
    ]);

    res.json({
      success: true,
      data: {
        connection: result.rows[0],
        discoveredResources,
      },
      message: 'Google account connected successfully',
    });
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete OAuth flow',
    });
  }
});

/**
 * POST /api/connections/:id/discover
 * Re-discover available resources for a connection
 */
router.post('/:id/discover', async (req, res) => {
  try {
    const { id } = req.params;

    // Get connection
    const connResult = await pool.query(
      'SELECT * FROM api_connections WHERE id = $1',
      [id]
    );

    if (connResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Connection not found',
      });
    }

    const connection = connResult.rows[0];

    // Get valid access token
    const accessToken = await getValidAccessToken(id);

    // Discover resources based on connection type
    let discoveredResources = {};

    if (connection.connection_type === 'google_ads' || connection.connection_type === 'google_all') {
      try {
        discoveredResources.googleAdsAccounts = await discoverGoogleAdsAccounts(accessToken);
      } catch (err) {
        console.error('Error discovering Google Ads:', err);
      }
    }

    if (connection.connection_type === 'google_search_console' || connection.connection_type === 'google_all') {
      try {
        discoveredResources.searchConsoleProperties = await discoverSearchConsoleProperties(accessToken);
      } catch (err) {
        console.error('Error discovering Search Console:', err);
      }
    }

    if (connection.connection_type === 'google_analytics' || connection.connection_type === 'google_all') {
      try {
        discoveredResources.analyticsAccounts = await discoverAnalyticsAccounts(accessToken);
      } catch (err) {
        console.error('Error discovering Analytics:', err);
      }
    }

    // Update connection data
    await pool.query(
      `UPDATE api_connections 
       SET connection_data = $1, last_synced_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [JSON.stringify(discoveredResources), id]
    );

    res.json({
      success: true,
      data: discoveredResources,
      message: 'Resources discovered successfully',
    });
  } catch (error) {
    console.error('Error discovering resources:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to discover resources',
    });
  }
});

/**
 * DELETE /api/connections/:id
 * Delete a connection
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM api_connections WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Connection not found',
      });
    }

    res.json({
      success: true,
      message: 'Connection deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete connection',
    });
  }
});

/**
 * GET /api/connections/available/:clientId
 * Get available connections for a client
 */
router.get('/available/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const result = await pool.query(`
      SELECT 
        ac.id,
        ac.connection_name,
        ac.connection_type,
        ac.provider,
        ac.account_id,
        ac.account_name,
        ac.account_email,
        ac.connection_data,
        cc.is_default,
        cc.settings as client_settings
      FROM client_connections cc
      JOIN api_connections ac ON cc.connection_id = ac.id
      WHERE cc.client_id = $1 AND ac.is_active = true
      ORDER BY cc.is_default DESC, ac.connection_name
    `, [clientId]);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching available connections:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch available connections',
    });
  }
});

/**
 * POST /api/connections/assign
 * Assign connections to a client
 */
router.post('/assign', async (req, res) => {
  try {
    const { clientId, connectionIds, defaultConnectionId } = req.body;

    if (!clientId || !Array.isArray(connectionIds)) {
      return res.status(400).json({
        success: false,
        error: 'clientId and connectionIds array are required',
      });
    }

    // Verify client exists
    const clientResult = await pool.query('SELECT id FROM clients WHERE id = $1', [clientId]);
    if (clientResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Verify all connections exist and are active
    if (connectionIds.length > 0) {
      const connResult = await pool.query(
        `SELECT id FROM api_connections WHERE id = ANY($1::uuid[]) AND is_active = true`,
        [connectionIds]
      );
      
      if (connResult.rows.length !== connectionIds.length) {
        return res.status(400).json({
          success: false,
          error: 'One or more connections not found or inactive',
        });
      }
    }

    // Use transaction to ensure atomicity
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Remove all existing assignments
      await client.query('DELETE FROM client_connections WHERE client_id = $1', [clientId]);

      // Add new assignments
      if (connectionIds.length > 0) {
        for (const connectionId of connectionIds) {
          const isDefault = defaultConnectionId === connectionId;
          await client.query(
            `INSERT INTO client_connections (client_id, connection_id, is_default)
             VALUES ($1, $2, $3)`,
            [clientId, connectionId, isDefault]
          );
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Connections assigned successfully',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error assigning connections:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to assign connections',
    });
  }
});

/**
 * GET /api/connections/all-available
 * Get all active connections (for assignment to clients)
 */
router.get('/all-available', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        connection_name,
        connection_type,
        provider,
        account_id,
        account_name,
        account_email,
        connection_data,
        is_active,
        created_at
      FROM api_connections
      WHERE is_active = true
      ORDER BY provider, connection_type, connection_name
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching all connections:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch connections',
    });
  }
});

export default router;
