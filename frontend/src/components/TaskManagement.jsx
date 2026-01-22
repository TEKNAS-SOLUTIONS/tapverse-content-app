import React, { useState, useEffect } from 'react';
import { tasksAPI, authAPI } from '../services/api';

function TaskManagement({ clientId, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ status: '', taskType: '' });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskType: 'adhoc',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    recurrencePattern: null,
  });

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, [clientId, filters]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksAPI.getByClient(clientId, filters);
      if (response.data.success) {
        setTasks(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      taskType: 'adhoc',
      assignedTo: '',
      priority: 'medium',
      dueDate: '',
      recurrencePattern: null,
    });
    setShowForm(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      taskType: task.task_type || 'adhoc',
      assignedTo: task.assigned_to || '',
      priority: task.priority || 'medium',
      dueDate: task.due_date ? task.due_date.split('T')[0] : '',
      recurrencePattern: task.recurrence_pattern || null,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const taskData = {
        clientId,
        title: formData.title,
        description: formData.description,
        taskType: formData.taskType,
        assignedTo: formData.assignedTo || null,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        recurrencePattern: formData.taskType === 'monthly_recurring' ? { day: 1 } : null,
      };

      if (editingTask) {
        await tasksAPI.update(editingTask.id, taskData);
      } else {
        await tasksAPI.create(taskData);
      }

      setShowForm(false);
      setEditingTask(null);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save task');
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    try {
      await tasksAPI.update(taskId, { status });
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update task');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await tasksAPI.delete(taskId);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete task');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-orange-600',
      high: 'text-red-600',
      urgent: 'text-red-700 font-semibold',
    };
    return colors[priority] || 'text-gray-600';
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingTask ? 'Edit Task' : 'Create Task'}
          </h3>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
            className="text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Type *</label>
            <select
              required
              value={formData.taskType}
              onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="adhoc">Ad-hoc</option>
              <option value="monthly_recurring">Monthly Recurring</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {editingTask ? 'Update' : 'Create'} Task
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingTask(null);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filters.taskType}
          onChange={(e) => setFilters({ ...filters, taskType: e.target.value })}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">All Types</option>
          <option value="monthly_recurring">Monthly Recurring</option>
          <option value="adhoc">Ad-hoc</option>
        </select>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-2 text-sm">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-gray-600 text-sm">No tasks found. Create your first task.</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="bg-gray-200 px-2 py-1 rounded">
                      {task.task_type === 'monthly_recurring' ? 'Monthly' : 'Ad-hoc'}
                    </span>
                    {task.assigned_to_name && (
                      <span>Assigned to: {task.assigned_to_name}</span>
                    )}
                    {task.due_date && (
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {task.status !== 'completed' && (
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                      className="px-2 py-1 text-xs bg-white border border-gray-300 rounded text-gray-900 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                  <button
                    onClick={() => handleEdit(task)}
                    className="px-2 py-1 text-xs bg-orange-50 text-orange-600 rounded hover:bg-orange-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskManagement;
