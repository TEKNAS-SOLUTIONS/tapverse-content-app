import express from 'express';
import {
  createTask,
  getTasksByClient,
  getTasksByUser,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  generateMonthlyRecurringTasks,
} from '../services/taskService.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { USER_ROLES } from '../services/authService.js';

const router = express.Router();

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      clientId,
      projectId,
      title,
      description,
      taskType,
      assignedTo,
      priority,
      dueDate,
      recurrencePattern,
    } = req.body;

    const task = await createTask({
      clientId,
      projectId,
      title,
      description,
      taskType,
      assignedTo,
      assignedBy: req.user.id,
      priority,
      dueDate,
      recurrencePattern,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tasks
 * Get all tasks (admin/manager) or user's tasks
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { clientId, status, taskType, assignedTo } = req.query;

    let tasks;
    if (req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.MANAGER) {
      tasks = await getAllTasks({ clientId, status, taskType, assignedTo });
    } else {
      tasks = await getTasksByUser(req.user.id, { status, taskType });
    }

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tasks/client/:clientId
 * Get tasks for a specific client
 */
router.get('/client/:clientId', authenticate, async (req, res) => {
  try {
    const { clientId } = req.params;
    const { status, taskType, assignedTo } = req.query;

    const tasks = await getTasksByClient(clientId, { status, taskType, assignedTo });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tasks/my-tasks
 * Get current user's tasks
 */
router.get('/my-tasks', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    const tasks = await getTasksByUser(req.user.id, { status });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tasks/:id
 * Get task by ID
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    // Check permissions
    if (req.user.role !== USER_ROLES.ADMIN && 
        req.user.role !== USER_ROLES.MANAGER && 
        task.assigned_to !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/tasks/:id
 * Update task
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    // Check permissions
    const canUpdate = req.user.role === USER_ROLES.ADMIN || 
                     req.user.role === USER_ROLES.MANAGER ||
                     task.assigned_to === req.user.id;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Only managers/admins can assign tasks
    if (req.body.assigned_to && req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.MANAGER) {
      delete req.body.assigned_to;
    }

    const updated = await updateTask(id, req.body);
    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete task (admin/manager only)
 */
router.delete('/:id', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteTask(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tasks/generate-monthly
 * Generate monthly recurring tasks (admin only, typically called by cron)
 */
router.post('/generate-monthly', authenticate, authorize(USER_ROLES.ADMIN), async (req, res) => {
  try {
    const newTasks = await generateMonthlyRecurringTasks();
    res.json({
      success: true,
      data: newTasks,
      message: `Generated ${newTasks.length} monthly recurring tasks`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
