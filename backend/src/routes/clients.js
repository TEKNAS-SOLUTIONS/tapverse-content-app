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
    const { tapverse_client_id, company_name } = req.body;

    // Validation
    if (!tapverse_client_id || !company_name) {
      return res.status(400).json({
        success: false,
        error: 'tapverse_client_id and company_name are required',
      });
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

    // Check if client exists
    const existing = await getClientById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Client not found' });
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

