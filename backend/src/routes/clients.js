import express from 'express';
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

// GET /api/clients/:id - Get client by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await getClientById(id);
    
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    
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

    // Pass all fields from request body
    const client = await createClient(req.body);

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

    const client = await updateClient(id, clientData);
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

