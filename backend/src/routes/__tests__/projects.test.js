import request from 'supertest';
import express from 'express';
import projectsRouter from '../projects.js';
import {
  createClient,
  createProject,
  deleteProject,
  deleteClient,
} from '../../db/queries.js';

const app = express();
app.use(express.json());
app.use('/api/projects', projectsRouter);

describe('Projects API Routes', () => {
  let testProjectId;
  let testClientId;
  const testTapverseId = `test-proj-client-${Date.now()}`;

  beforeAll(async () => {
    // Create a test client for projects
    const client = await createClient({
      tapverse_client_id: testTapverseId,
      company_name: 'Project Test Client',
      website_url: 'https://projecttest.com',
    });
    testClientId = client.id;
  });

  afterAll(async () => {
    // Clean up test project
    if (testProjectId) {
      try {
        await deleteProject(testProjectId);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    // Clean up test client
    if (testClientId) {
      try {
        await deleteClient(testClientId);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  describe('POST /api/projects', () => {
    test('should create a new project', async () => {
      const projectData = {
        client_id: testClientId,
        project_name: 'Test API Project',
        project_type: 'seo',
        keywords: ['test', 'api'],
        competitors: ['https://competitor.com'],
        target_audience: 'Developers',
        unique_angle: 'Test unique angle',
        content_preferences: 'professional',
        status: 'draft',
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.project_name).toBe('Test API Project');
      expect(response.body.data.client_id).toBe(testClientId);
      
      testProjectId = response.body.data.id;
    });

    test('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ project_name: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    test('should return 404 if client does not exist', async () => {
      const fakeClientId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post('/api/projects')
        .send({
          client_id: fakeClientId,
          project_name: 'Test',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Client not found');
    });
  });

  describe('GET /api/projects', () => {
    test('should get all projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get projects by client_id', async () => {
      const response = await request(app)
        .get(`/api/projects?client_id=${testClientId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/projects/:id', () => {
    test('should get project by id', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProjectId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProjectId);
      expect(response.body.data.project_name).toBe('Test API Project');
    });

    test('should return 404 for non-existent project', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/projects/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('PUT /api/projects/:id', () => {
    test('should update a project', async () => {
      const updateData = {
        project_name: 'Updated API Project',
        status: 'processing',
      };

      const response = await request(app)
        .put(`/api/projects/${testProjectId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project_name).toBe('Updated API Project');
      expect(response.body.data.status).toBe('processing');
    });

    test('should return 404 for non-existent project', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/projects/${fakeId}`)
        .send({ project_name: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    test('should delete a project', async () => {
      const response = await request(app)
        .delete(`/api/projects/${testProjectId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProjectId);
      
      testProjectId = null; // Clear since deleted
    });

    test('should return 404 for non-existent project', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/projects/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

