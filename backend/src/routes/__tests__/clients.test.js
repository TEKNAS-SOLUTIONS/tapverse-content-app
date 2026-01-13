import request from 'supertest';
import express from 'express';
import clientsRouter from '../clients.js';
import {
  createClient,
  getClientById,
  deleteClient,
} from '../../db/queries.js';

const app = express();
app.use(express.json());
app.use('/api/clients', clientsRouter);

describe('Clients API Routes', () => {
  let testClientId;
  const testTapverseId = `test-api-${Date.now()}`;

  afterAll(async () => {
    // Clean up test client
    if (testClientId) {
      try {
        await deleteClient(testClientId);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  describe('POST /api/clients', () => {
    test('should create a new client', async () => {
      const clientData = {
        tapverse_client_id: testTapverseId,
        company_name: 'Test API Company',
        website_url: 'https://testapi.com',
        industry: 'Technology',
        target_audience: 'Developers',
        unique_selling_points: 'Fast API',
      };

      const response = await request(app)
        .post('/api/clients')
        .send(clientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.company_name).toBe('Test API Company');
      expect(response.body.data.tapverse_client_id).toBe(testTapverseId);
      
      testClientId = response.body.data.id;
    });

    test('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({ company_name: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    test('should return 409 if client already exists', async () => {
      const clientData = {
        tapverse_client_id: testTapverseId,
        company_name: 'Duplicate Test',
      };

      const response = await request(app)
        .post('/api/clients')
        .send(clientData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('GET /api/clients', () => {
    test('should get all clients', async () => {
      const response = await request(app)
        .get('/api/clients')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/clients/:id', () => {
    test('should get client by id', async () => {
      const response = await request(app)
        .get(`/api/clients/${testClientId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testClientId);
      expect(response.body.data.company_name).toBe('Test API Company');
    });

    test('should return 404 for non-existent client', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/clients/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PUT /api/clients/:id', () => {
    test('should update a client', async () => {
      const updateData = {
        company_name: 'Updated API Company',
        industry: 'Updated Industry',
      };

      const response = await request(app)
        .put(`/api/clients/${testClientId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.company_name).toBe('Updated API Company');
      expect(response.body.data.industry).toBe('Updated Industry');
    });

    test('should return 404 for non-existent client', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/clients/${fakeId}`)
        .send({ company_name: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/clients/:id', () => {
    test('should delete a client', async () => {
      const response = await request(app)
        .delete(`/api/clients/${testClientId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testClientId);
      
      // Clear testClientId since it's deleted
      testClientId = null;
    });

    test('should return 404 for non-existent client', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/clients/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

