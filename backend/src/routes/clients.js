import express from 'express';
import pool from '../db/index.js';
import {
  createClient,
  getClientById,
  getClientByTapverseId,
  getAllClients,
  updateClient,
  deleteClient,
} from '../db/queries.js';

const router = express.Router();

// GET /api/clients - Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await getAllClients();
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/dashboard/metrics - Get dashboard metrics
router.get('/dashboard/metrics', async (req, res) => {
  try {
    const { clientId } = req.query;
    
    if (clientId) {
      // Client-specific metrics
      const client = await getClientById(clientId);
      if (!client) {
        return res.status(404).json({ success: false, error: 'Client not found' });
      }

      // Get projects count
      const projectsResult = await pool.query(
        'SELECT COUNT(*) as count FROM projects WHERE client_id = $1',
        [clientId]
      );
      const activeProjects = parseInt(projectsResult.rows[0]?.count || 0);

      // Get content count
      const contentResult = await pool.query(
        `SELECT COUNT(*) as count FROM content c
         JOIN projects p ON c.project_id = p.id
         WHERE p.client_id = $1`,
        [clientId]
      );
      const contentGenerated = parseInt(contentResult.rows[0]?.count || 0);

      // Get keywords count (from projects)
      const keywordsResult = await pool.query(
        `SELECT COUNT(DISTINCT keyword) as count
         FROM projects, unnest(keywords) as keyword
         WHERE client_id = $1 AND keywords IS NOT NULL`,
        [clientId]
      );
      const keywordsTracked = parseInt(keywordsResult.rows[0]?.count || 0);

      // Get rank tracking data (if table exists)
      let rankingChanges = 0;
      try {
        const rankResult = await pool.query(
          'SELECT COUNT(*) as count FROM keyword_rankings WHERE client_id = $1',
          [clientId]
        );
        rankingChanges = parseInt(rankResult.rows[0]?.count || 0);
      } catch (err) {
        // Table might not exist yet, ignore
        console.log('Keyword rankings table not found, skipping');
      }

      res.json({
        success: true,
        data: {
          activeProjects,
          contentGenerated,
          keywordsTracked,
          rankingChanges,
          trafficEstimate: 0, // Placeholder
        },
      });
    } else {
      // All clients metrics
      const clientsResult = await pool.query(
        'SELECT COUNT(*) as count FROM clients WHERE is_active = TRUE'
      );
      const totalClients = parseInt(clientsResult.rows[0]?.count || 0);

      const projectsResult = await pool.query(
        'SELECT COUNT(*) as count FROM projects'
      );
      const activeProjects = parseInt(projectsResult.rows[0]?.count || 0);

      const contentResult = await pool.query(
        'SELECT COUNT(*) as count FROM content'
      );
      const contentGenerated = parseInt(contentResult.rows[0]?.count || 0);

      res.json({
        success: true,
        data: {
          totalClients,
          activeProjects,
          contentGenerated,
          revenue: 0, // Placeholder
        },
      });
    }
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/clients/:id - Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await getClientById(id);
    
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    // Get assigned connections
    const connectionsResult = await pool.query(`
      SELECT 
        cc.connection_id,
        cc.is_default,
        ac.connection_name,
        ac.connection_type,
        ac.provider
      FROM client_connections cc
      JOIN api_connections ac ON cc.connection_id = ac.id
      WHERE cc.client_id = $1
      ORDER BY cc.is_default DESC
    `, [id]);

    client.assigned_connections = connectionsResult.rows.map(row => ({
      connection_id: row.connection_id,
      is_default: row.is_default,
      connection_name: row.connection_name,
      connection_type: row.connection_type,
      provider: row.provider,
    }));
    
    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/clients - Create a new client
router.post('/', async (req, res) => {
  try {
    const { tapverse_client_id, company_name, business_types, primary_business_type, location, shopify_url } = req.body;

    // Validation
    if (!tapverse_client_id || !company_name) {
      return res.status(400).json({
        success: false,
        error: 'tapverse_client_id and company_name are required',
      });
    }

    // Validate business types
    const validBusinessTypes = ['general', 'local', 'shopify'];
    if (business_types) {
      if (!Array.isArray(business_types) || business_types.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'business_types must be a non-empty array',
        });
      }
      const invalidTypes = business_types.filter(t => !validBusinessTypes.includes(t));
      if (invalidTypes.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid business types: ${invalidTypes.join(', ')}. Valid types: ${validBusinessTypes.join(', ')}`,
        });
      }
      if (primary_business_type && !business_types.includes(primary_business_type)) {
        return res.status(400).json({
          success: false,
          error: 'primary_business_type must be one of the selected business_types',
        });
      }
    }

    // Validate conditional fields
    if (business_types?.includes('local') && !location?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'location is required for local businesses',
      });
    }
    if (business_types?.includes('shopify')) {
      if (!shopify_url?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'shopify_url is required for Shopify stores',
        });
      }
      if (!shopify_url.startsWith('https://') || 
          (!shopify_url.includes('.myshopify.com') && !shopify_url.includes('shopify'))) {
        return res.status(400).json({
          success: false,
          error: 'shopify_url must start with https:// and contain .myshopify.com or shopify',
        });
      }
    }

    // Check if client already exists
    const existing = await getClientByTapverseId(tapverse_client_id);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Client with this tapverse_client_id already exists',
      });
    }

    // Pass all fields from request body (excluding connectionIds)
    const { connectionIds, defaultConnectionId, ...clientData } = req.body;
    const client = await createClient(clientData);

    // Assign connections if provided
    if (connectionIds && Array.isArray(connectionIds) && connectionIds.length > 0) {
      try {
        // Remove existing assignments
        await pool.query('DELETE FROM client_connections WHERE client_id = $1', [client.id]);

        // Add new assignments
        for (const connectionId of connectionIds) {
          const isDefault = defaultConnectionId === connectionId;
          await pool.query(
            `INSERT INTO client_connections (client_id, connection_id, is_default)
             VALUES ($1, $2, $3)`,
            [client.id, connectionId, isDefault]
          );
        }
      } catch (connError) {
        console.error('Error assigning connections:', connError);
        // Don't fail client creation if connection assignment fails
      }
    }

    res.status(201).json({ success: true, data: client });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/clients/:id - Update a client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clientData = req.body;
    const { business_types, primary_business_type, location, shopify_url } = clientData;

    // Check if client exists
    const existing = await getClientById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    // Validate business types if provided
    const validBusinessTypes = ['general', 'local', 'shopify'];
    if (business_types !== undefined) {
      if (!Array.isArray(business_types) || business_types.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'business_types must be a non-empty array',
        });
      }
      const invalidTypes = business_types.filter(t => !validBusinessTypes.includes(t));
      if (invalidTypes.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid business types: ${invalidTypes.join(', ')}. Valid types: ${validBusinessTypes.join(', ')}`,
        });
      }
      if (primary_business_type && !business_types.includes(primary_business_type)) {
        return res.status(400).json({
          success: false,
          error: 'primary_business_type must be one of the selected business_types',
        });
      }
    }

    // Validate conditional fields
    const finalBusinessTypes = business_types || existing.business_types || ['general'];
    if (finalBusinessTypes.includes('local') && !location?.trim() && !existing.location) {
      return res.status(400).json({
        success: false,
        error: 'location is required for local businesses',
      });
    }
    if (finalBusinessTypes.includes('shopify')) {
      const finalShopifyUrl = shopify_url || existing.shopify_url;
      if (!finalShopifyUrl?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'shopify_url is required for Shopify stores',
        });
      }
      if (!finalShopifyUrl.startsWith('https://') || 
          (!finalShopifyUrl.includes('.myshopify.com') && !finalShopifyUrl.includes('shopify'))) {
        return res.status(400).json({
          success: false,
          error: 'shopify_url must start with https:// and contain .myshopify.com or shopify',
        });
      }
    }

    // Handle connection assignments separately
    const { connectionIds, defaultConnectionId, ...clientUpdateData } = clientData;
    const client = await updateClient(id, clientUpdateData);

    // Update connections if provided
    if (connectionIds !== undefined) {
      try {
        // Remove existing assignments
        await pool.query('DELETE FROM client_connections WHERE client_id = $1', [id]);

        // Add new assignments
        if (Array.isArray(connectionIds) && connectionIds.length > 0) {
          for (const connectionId of connectionIds) {
            const isDefault = defaultConnectionId === connectionId;
            await pool.query(
              `INSERT INTO client_connections (client_id, connection_id, is_default)
               VALUES ($1, $2, $3)`,
              [id, connectionId, isDefault]
            );
          }
        }
      } catch (connError) {
        console.error('Error updating connections:', connError);
        // Don't fail client update if connection assignment fails
      }
    }

    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/clients/:id - Delete a client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if client exists
    const existing = await getClientById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const client = await deleteClient(id);
    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

