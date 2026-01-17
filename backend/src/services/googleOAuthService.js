import https from 'https';
import { config } from '../config/config.js';
import pool from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Google OAuth 2.0 Service
 * 
 * Handles OAuth flows for Google services:
 * - Google Ads
 * - Google Search Console
 * - Google Analytics
 * - Google My Business
 */

const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || config.google?.clientId,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || config.google?.clientSecret,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || config.google?.redirectUri || `${config.frontend.url}/connections/google/callback`,
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  revokeUrl: 'https://oauth2.googleapis.com/revoke',
};

/**
 * Scopes for different Google services
 */
export const GOOGLE_SCOPES = {
  ads: [
    'https://www.googleapis.com/auth/adwords',
  ],
  searchConsole: [
    'https://www.googleapis.com/auth/webmasters.readonly',
  ],
  analytics: [
    'https://www.googleapis.com/auth/analytics.readonly',
  ],
  myBusiness: [
    'https://www.googleapis.com/auth/business.manage',
  ],
  all: [
    'https://www.googleapis.com/auth/adwords',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/business.manage',
  ],
};

/**
 * Check if Google OAuth is configured
 */
export function isGoogleOAuthConfigured() {
  return !!(GOOGLE_OAUTH_CONFIG.clientId && GOOGLE_OAUTH_CONFIG.clientSecret);
}

/**
 * Generate OAuth authorization URL
 */
export function getGoogleAuthUrl(connectionType, scopes = []) {
  if (!GOOGLE_OAUTH_CONFIG.clientId) {
    throw new Error('Google OAuth client ID not configured. Please set GOOGLE_CLIENT_ID in your .env file. See GOOGLE_OAUTH_SETUP.md for instructions.');
  }
  
  if (!GOOGLE_OAUTH_CONFIG.clientSecret) {
    throw new Error('Google OAuth client secret not configured. Please set GOOGLE_CLIENT_SECRET in your .env file. See GOOGLE_OAUTH_SETUP.md for instructions.');
  }

  // Generate state token for security
  const stateToken = uuidv4();
  
  // Store state in database (expires in 10 minutes)
  pool.query(
    `INSERT INTO oauth_states (state_token, connection_type, expires_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '10 minutes')`,
    [stateToken, connectionType]
  ).catch(err => console.error('Error storing OAuth state:', err));

  // Determine scopes based on connection type
  let requestedScopes = scopes;
  if (scopes.length === 0) {
    switch (connectionType) {
      case 'google_ads':
        requestedScopes = GOOGLE_SCOPES.ads;
        break;
      case 'google_search_console':
        requestedScopes = GOOGLE_SCOPES.searchConsole;
        break;
      case 'google_analytics':
        requestedScopes = GOOGLE_SCOPES.analytics;
        break;
      case 'google_my_business':
        requestedScopes = GOOGLE_SCOPES.myBusiness;
        break;
      default:
        requestedScopes = GOOGLE_SCOPES.all;
    }
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: requestedScopes.join(' '),
    access_type: 'offline', // Required to get refresh token
    prompt: 'consent', // Force consent screen to get refresh token
    state: stateToken,
  });

  return {
    authUrl: `${GOOGLE_OAUTH_CONFIG.authUrl}?${params.toString()}`,
    stateToken,
  };
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code, stateToken) {
  return new Promise((resolve, reject) => {
    // Verify state token
    pool.query(
      `SELECT * FROM oauth_states 
       WHERE state_token = $1 
       AND expires_at > CURRENT_TIMESTAMP`,
      [stateToken]
    ).then(result => {
      if (result.rows.length === 0) {
        return reject(new Error('Invalid or expired state token'));
      }

      const state = result.rows[0];
      
      // Delete used state token
      pool.query('DELETE FROM oauth_states WHERE state_token = $1', [stateToken])
        .catch(err => console.error('Error deleting OAuth state:', err));

      // Exchange code for token
      const postData = new URLSearchParams({
        code: code,
        client_id: GOOGLE_OAUTH_CONFIG.clientId,
        client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
        redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
        grant_type: 'authorization_code',
      });

      const options = {
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const tokenData = JSON.parse(data);
            
            if (tokenData.error) {
              return reject(new Error(tokenData.error_description || tokenData.error));
            }

            // Calculate token expiration
            const expiresAt = tokenData.expires_in
              ? new Date(Date.now() + tokenData.expires_in * 1000)
              : null;

            resolve({
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              expiresAt,
              scope: tokenData.scope,
              tokenType: tokenData.token_type,
              connectionType: state.connection_type,
            });
          } catch (error) {
            reject(new Error('Failed to parse token response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData.toString());
      req.end();
    }).catch(reject);
  });
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: GOOGLE_OAUTH_CONFIG.clientId,
      client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const tokenData = JSON.parse(data);
          
          if (tokenData.error) {
            return reject(new Error(tokenData.error_description || tokenData.error));
          }

          const expiresAt = tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null;

          resolve({
            accessToken: tokenData.access_token,
            expiresAt,
            scope: tokenData.scope,
            tokenType: tokenData.token_type,
          });
        } catch (error) {
          reject(new Error('Failed to parse token response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData.toString());
    req.end();
  });
}

/**
 * Get valid access token (refresh if needed)
 */
export async function getValidAccessToken(connectionId) {
  const result = await pool.query(
    'SELECT access_token, refresh_token, token_expires_at FROM api_connections WHERE id = $1',
    [connectionId]
  );

  if (result.rows.length === 0) {
    throw new Error('Connection not found');
  }

  const connection = result.rows[0];

  // Check if token is expired or expires soon (within 5 minutes)
  const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at) : null;
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  if (!expiresAt || expiresAt < fiveMinutesFromNow) {
    // Token expired or expiring soon, refresh it
    if (!connection.refresh_token) {
      throw new Error('No refresh token available. Re-authentication required.');
    }

    const newToken = await refreshAccessToken(connection.refresh_token);

    // Update connection with new token
    await pool.query(
      `UPDATE api_connections 
       SET access_token = $1, token_expires_at = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [newToken.accessToken, newToken.expiresAt, connectionId]
    );

    return newToken.accessToken;
  }

  return connection.access_token;
}

/**
 * Make authenticated request to Google API
 */
export async function makeGoogleApiRequest(endpoint, accessToken, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, 'https://www.googleapis.com/');
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.headers['Content-Length'] = JSON.stringify(body).length;
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            const error = JSON.parse(data);
            reject(new Error(error.error?.message || `API request failed: ${res.statusCode}`));
          }
        } catch (error) {
          reject(new Error('Failed to parse API response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Discover available Google Ads accounts
 */
export async function discoverGoogleAdsAccounts(accessToken) {
  try {
    // Google Ads API requires different endpoint structure
    // This is a simplified version - full implementation would use Google Ads API library
    const response = await makeGoogleApiRequest(
      '/googleads/v14/customers:listAccessibleCustomers',
      accessToken
    );

    // The response contains customer IDs, then we need to fetch details for each
    const customerIds = response.resourceNames || [];
    
    const accounts = [];
    for (const customerId of customerIds.slice(0, 10)) { // Limit to 10 for now
      try {
        // Extract customer ID from resource name (customers/1234567890)
        const id = customerId.replace('customers/', '');
        
        // Get customer details
        const customerResponse = await makeGoogleApiRequest(
          `/googleads/v14/customers/${id}`,
          accessToken
        );

        accounts.push({
          customerId: id,
          customerName: customerResponse.customer?.descriptiveName || `Account ${id}`,
          currencyCode: customerResponse.customer?.currencyCode,
          timeZone: customerResponse.customer?.timeZone,
          manager: customerResponse.customer?.manager || false,
        });
      } catch (err) {
        console.error(`Error fetching customer ${customerId}:`, err.message);
        // Continue with other accounts
      }
    }

    return accounts;
  } catch (error) {
    console.error('Error discovering Google Ads accounts:', error);
    throw error;
  }
}

/**
 * Discover available Search Console properties
 */
export async function discoverSearchConsoleProperties(accessToken) {
  try {
    const response = await makeGoogleApiRequest(
      '/webmasters/v3/sites',
      accessToken
    );

    const properties = (response.siteEntry || []).map(site => ({
      propertyUrl: site.siteUrl,
      permissionLevel: site.permissionLevel,
    }));

    return properties;
  } catch (error) {
    console.error('Error discovering Search Console properties:', error);
    throw error;
  }
}

/**
 * Discover available Analytics accounts
 */
export async function discoverAnalyticsAccounts(accessToken) {
  try {
    const response = await makeGoogleApiRequest(
      '/analytics/v3/management/accounts',
      accessToken
    );

    const accounts = (response.items || []).map(account => ({
      accountId: account.id,
      accountName: account.name,
      properties: [], // Will be populated separately
    }));

    // For each account, get properties
    for (const account of accounts) {
      try {
        const propertiesResponse = await makeGoogleApiRequest(
          `/analytics/v3/management/accounts/${account.accountId}/webproperties`,
          accessToken
        );

        account.properties = (propertiesResponse.items || []).map(prop => ({
          propertyId: prop.id,
          propertyName: prop.name,
          websiteUrl: prop.websiteUrl,
        }));
      } catch (err) {
        console.error(`Error fetching properties for account ${account.accountId}:`, err.message);
      }
    }

    return accounts;
  } catch (error) {
    console.error('Error discovering Analytics accounts:', error);
    throw error;
  }
}

/**
 * Get user info from Google
 */
export async function getGoogleUserInfo(accessToken) {
  try {
    const response = await makeGoogleApiRequest(
      '/oauth2/v2/userinfo',
      accessToken
    );

    return {
      email: response.email,
      name: response.name,
      picture: response.picture,
      verifiedEmail: response.verified_email,
    };
  } catch (error) {
    console.error('Error fetching Google user info:', error);
    throw error;
  }
}
