import pool from '../db/index.js';

/**
 * Task Management Service
 * Handles monthly recurring tasks and adhoc tasks with team assignment
 */

/**
 * Ensure tasks table exists
 */
export async function ensureTasksTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('monthly_recurring', 'adhoc')),
        assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
        assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
        priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        due_date DATE,
        completed_at TIMESTAMP,
        recurrence_pattern JSONB, -- For monthly recurring tasks: { day: 1, month: null } for 1st of every month
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)
    `);
  } catch (error) {
    console.error('Error ensuring tasks table:', error);
    throw error;
  }
}

/**
 * Create a new task
 */
export async function createTask(taskData) {
  const {
    clientId,
    projectId,
    title,
    description,
    taskType,
    assignedTo,
    assignedBy,
    priority = 'medium',
    dueDate,
    recurrencePattern,
  } = taskData;

  if (!title || !taskType) {
    throw new Error('Title and task type are required');
  }

  const result = await pool.query(`
    INSERT INTO tasks (
      client_id, project_id, title, description, task_type,
      assigned_to, assigned_by, priority, due_date, recurrence_pattern
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `, [
    clientId || null,
    projectId || null,
    title,
    description || null,
    taskType,
    assignedTo || null,
    assignedBy || null,
    priority,
    dueDate || null,
    recurrencePattern ? JSON.stringify(recurrencePattern) : null,
  ]);

  return result.rows[0];
}

/**
 * Get tasks by client
 */
export async function getTasksByClient(clientId, filters = {}) {
  let query = 'SELECT t.*, u.email as assigned_to_email, u.full_name as assigned_to_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.client_id = $1';
  const params = [clientId];
  let paramIndex = 2;

  if (filters.status) {
    query += ` AND t.status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.taskType) {
    query += ` AND t.task_type = $${paramIndex}`;
    params.push(filters.taskType);
    paramIndex++;
  }

  if (filters.assignedTo) {
    query += ` AND t.assigned_to = $${paramIndex}`;
    params.push(filters.assignedTo);
    paramIndex++;
  }

  query += ' ORDER BY t.due_date ASC, t.created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get tasks assigned to a user
 */
export async function getTasksByUser(userId, filters = {}) {
  let query = 'SELECT t.*, c.company_name as client_name FROM tasks t LEFT JOIN clients c ON t.client_id = c.id WHERE t.assigned_to = $1';
  const params = [userId];
  let paramIndex = 2;

  if (filters.status) {
    query += ` AND t.status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  query += ' ORDER BY t.due_date ASC, t.created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get all tasks (admin/manager)
 */
export async function getAllTasks(filters = {}) {
  let query = `
    SELECT t.*, 
           c.company_name as client_name,
           u.email as assigned_to_email,
           u.full_name as assigned_to_name
    FROM tasks t
    LEFT JOIN clients c ON t.client_id = c.id
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (filters.clientId) {
    query += ` AND t.client_id = $${paramIndex}`;
    params.push(filters.clientId);
    paramIndex++;
  }

  if (filters.status) {
    query += ` AND t.status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.taskType) {
    query += ` AND t.task_type = $${paramIndex}`;
    params.push(filters.taskType);
    paramIndex++;
  }

  query += ' ORDER BY t.due_date ASC, t.created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get task by ID
 */
export async function getTaskById(taskId) {
  const result = await pool.query(`
    SELECT t.*, 
           c.company_name as client_name,
           u.email as assigned_to_email,
           u.full_name as assigned_to_name
    FROM tasks t
    LEFT JOIN clients c ON t.client_id = c.id
    LEFT JOIN users u ON t.assigned_to = u.id
    WHERE t.id = $1
  `, [taskId]);

  return result.rows[0] || null;
}

/**
 * Update task
 */
export async function updateTask(taskId, updates) {
  const allowedFields = ['title', 'description', 'status', 'priority', 'assigned_to', 'due_date'];
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = $${paramIndex}`);
      values.push(updates[field]);
      paramIndex++;
    }
  }

  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }

  // Set completed_at if status is completed
  if (updates.status === 'completed') {
    updateFields.push('completed_at = CURRENT_TIMESTAMP');
  } else if (updates.status && updates.status !== 'completed') {
    updateFields.push('completed_at = NULL');
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(taskId);

  const result = await pool.query(`
    UPDATE tasks
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `, values);

  if (result.rows.length === 0) {
    throw new Error('Task not found');
  }

  return result.rows[0];
}

/**
 * Delete task
 */
export async function deleteTask(taskId) {
  const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [taskId]);
  return result.rows.length > 0;
}

/**
 * Generate monthly recurring tasks
 * Called on the 1st of each month to create recurring tasks
 */
export async function generateMonthlyRecurringTasks() {
  try {
    // Get all monthly recurring tasks
    const result = await pool.query(`
      SELECT * FROM tasks 
      WHERE task_type = 'monthly_recurring' 
      AND status != 'cancelled'
    `);

    const newTasks = [];

    for (const task of result.rows) {
      const recurrencePattern = task.recurrence_pattern || { day: 1 };
      const dayOfMonth = recurrencePattern.day || 1;

      // Create new task for this month
      const currentDate = new Date();
      const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayOfMonth);

      const newTask = await createTask({
        clientId: task.client_id,
        projectId: task.project_id,
        title: task.title,
        description: task.description,
        taskType: 'monthly_recurring',
        assignedTo: task.assigned_to,
        assignedBy: task.assigned_by,
        priority: task.priority,
        dueDate: dueDate.toISOString().split('T')[0],
        recurrencePattern: task.recurrence_pattern,
      });

      newTasks.push(newTask);
    }

    return newTasks;
  } catch (error) {
    console.error('Error generating monthly recurring tasks:', error);
    throw error;
  }
}

// Ensure table exists on import
ensureTasksTable().catch(console.error);

export default {
  ensureTasksTable,
  createTask,
  getTasksByClient,
  getTasksByUser,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  generateMonthlyRecurringTasks,
};
