import request from 'supertest';
import { app } from '../server.js';

describe('Server', () => {
  describe('GET /health', () => {
    test('should return health status with database connection', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api', () => {
    test('should return API message', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Tapverse Content Automation API');
    });
  });

  describe('404 Handler', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Route not found');
    });
  });
});

