import {
  createClient,
  getClientById,
  getClientByTapverseId,
  getAllClients,
  updateClient,
  deleteClient,
  createProject,
  getProjectById,
  getProjectsByClientId,
  getAllProjects,
  updateProject,
  deleteProject,
} from '../queries.js';

describe('Database Queries', () => {
  let testClientId;
  let testProjectId;
  const testTapverseId = `test-${Date.now()}`;

  describe('Client Operations', () => {
    test('should create a client', async () => {
      const clientData = {
        tapverse_client_id: testTapverseId,
        company_name: 'Test Company',
        website_url: 'https://test.com',
        industry: 'Technology',
        target_audience: 'Developers',
        unique_selling_points: 'Fast and reliable',
      };

      const client = await createClient(clientData);
      testClientId = client.id;

      expect(client).toBeDefined();
      expect(client.id).toBeDefined();
      expect(client.company_name).toBe('Test Company');
      expect(client.tapverse_client_id).toBe(testTapverseId);
    });

    test('should get client by id', async () => {
      const client = await getClientById(testClientId);
      expect(client).toBeDefined();
      expect(client.id).toBe(testClientId);
      expect(client.company_name).toBe('Test Company');
    });

    test('should get client by tapverse_id', async () => {
      const client = await getClientByTapverseId(testTapverseId);
      expect(client).toBeDefined();
      expect(client.tapverse_client_id).toBe(testTapverseId);
    });

    test('should get all clients', async () => {
      const clients = await getAllClients();
      expect(Array.isArray(clients)).toBe(true);
      expect(clients.length).toBeGreaterThan(0);
    });

    test('should update a client', async () => {
      const updated = await updateClient(testClientId, {
        company_name: 'Updated Company Name',
        industry: 'Updated Industry',
      });

      expect(updated).toBeDefined();
      expect(updated.company_name).toBe('Updated Company Name');
      expect(updated.industry).toBe('Updated Industry');
    });

    test('should delete a client', async () => {
      const deleted = await deleteClient(testClientId);
      expect(deleted).toBeDefined();
      expect(deleted.id).toBe(testClientId);
    });
  });

  describe('Project Operations', () => {
    let projectClientId;

    beforeAll(async () => {
      // Create a test client for projects
      const clientData = {
        tapverse_client_id: `test-project-client-${Date.now()}`,
        company_name: 'Project Test Company',
        website_url: 'https://projecttest.com',
      };
      const client = await createClient(clientData);
      projectClientId = client.id;
    });

    test('should create a project', async () => {
      const projectData = {
        client_id: projectClientId,
        project_name: 'Test Project',
        project_type: 'seo',
        keywords: ['test', 'keywords'],
        competitors: ['https://competitor1.com'],
        target_audience: 'Developers',
        unique_angle: 'Test unique angle',
        content_preferences: 'professional',
        status: 'draft',
      };

      const project = await createProject(projectData);
      testProjectId = project.id;

      expect(project).toBeDefined();
      expect(project.id).toBeDefined();
      expect(project.project_name).toBe('Test Project');
      expect(project.client_id).toBe(projectClientId);
    });

    test('should get project by id', async () => {
      const project = await getProjectById(testProjectId);
      expect(project).toBeDefined();
      expect(project.id).toBe(testProjectId);
      expect(project.project_name).toBe('Test Project');
    });

    test('should get projects by client_id', async () => {
      const projects = await getProjectsByClientId(projectClientId);
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);
    });

    test('should get all projects', async () => {
      const projects = await getAllProjects();
      expect(Array.isArray(projects)).toBe(true);
    });

    test('should update a project', async () => {
      const updated = await updateProject(testProjectId, {
        project_name: 'Updated Project Name',
        status: 'processing',
      });

      expect(updated).toBeDefined();
      expect(updated.project_name).toBe('Updated Project Name');
      expect(updated.status).toBe('processing');
    });

    test('should delete a project', async () => {
      const deleted = await deleteProject(testProjectId);
      expect(deleted).toBeDefined();
      expect(deleted.id).toBe(testProjectId);
    });

    afterAll(async () => {
      // Clean up test client
      if (projectClientId) {
        await deleteClient(projectClientId);
      }
    });
  });
});

