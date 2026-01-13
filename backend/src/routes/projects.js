import express from 'express';
import {
  createProject,
  getProjectById,
  getProjectsByClientId,
  getAllProjects,
  updateProject,
  deleteProject,
} from '../db/queries.js';
import { getClientById } from '../db/queries.js';

const router = express.Router();

// GET /api/projects - Get all projects
router.get('/', async (req, res) => {
  try {
    const { client_id } = req.query;
    
    let projects;
    if (client_id) {
      projects = await getProjectsByClientId(client_id);
    } else {
      projects = await getAllProjects();
    }
    
    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getProjectById(id);
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/projects - Create a new project
router.post('/', async (req, res) => {
  try {
    const { client_id, project_name } = req.body;

    // Validation
    if (!client_id || !project_name) {
      return res.status(400).json({
        success: false,
        error: 'client_id and project_name are required',
      });
    }

    // Check if client exists
    const client = await getClientById(client_id);
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Pass all fields from request body (includes project_types array)
    const project = await createProject(req.body);

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/projects/:id - Update a project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = req.body;

    // Check if project exists
    const existing = await getProjectById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const project = await updateProject(id, projectData);
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const existing = await getProjectById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const project = await deleteProject(id);
    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

