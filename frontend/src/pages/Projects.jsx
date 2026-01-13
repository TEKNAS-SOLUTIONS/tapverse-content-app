import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectsAPI, clientsAPI } from '../services/api';
import ProjectForm from '../components/ProjectForm';

function Projects() {
  const { clientId } = useParams();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(clientId || '');

  useEffect(() => {
    loadClients();
    loadProjects();
  }, [clientId]);

  const loadClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      if (response.data.success) {
        setClients(response.data.data);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsAPI.getAll(clientId);
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectsAPI.delete(id);
      await loadProjects();
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingProject) {
        await projectsAPI.update(editingProject.id, formData);
      } else {
        await projectsAPI.create(formData);
      }
      setShowForm(false);
      setEditingProject(null);
      await loadProjects();
    } catch (err) {
      setError(err.message || 'Failed to save project');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleClientFilter = (e) => {
    const clientId = e.target.value;
    setSelectedClientId(clientId);
    if (clientId) {
      loadProjects(clientId);
    } else {
      loadProjects();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'processing': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'failed': return 'bg-red-600/20 text-red-400 border-red-600/30';
      default: return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'seo': return '🔍';
      case 'social': return '📱';
      case 'ads': return '📢';
      case 'video': return '🎬';
      default: return '📄';
    }
  };

  if (showForm) {
    return (
      <div>
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white">
            {editingProject ? 'Edit Project' : 'Create Project'}
          </h1>
        </div>
        <ProjectForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingProject}
          clients={clients}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Project
        </button>
      </div>

      {!clientId && (
        <div className="mb-6">
          <label htmlFor="client-filter" className="block text-sm font-medium text-gray-300 mb-2">
            Filter by Client
          </label>
          <select
            id="client-filter"
            value={selectedClientId}
            onChange={handleClientFilter}
            className="block w-full max-w-xs px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-300">Error: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
          <span className="text-6xl mb-4 block">📁</span>
          <p className="text-gray-400 text-lg">No projects found.</p>
          <button
            onClick={handleCreate}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const client = clients.find((c) => c.id === project.client_id);
            return (
              <div key={project.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(project.project_type)}</span>
                      <h3 className="text-xl font-semibold text-white">
                        {project.project_name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-3">
                      {client && (
                        <span className="bg-slate-800 px-2 py-1 rounded">
                          👤 {client.company_name}
                        </span>
                      )}
                      {project.project_type && (
                        <span className="bg-slate-800 px-2 py-1 rounded">
                          {project.project_type.toUpperCase()}
                        </span>
                      )}
                      {project.content_preferences && (
                        <span className="bg-slate-800 px-2 py-1 rounded">
                          {project.content_preferences}
                        </span>
                      )}
                    </div>

                    {project.keywords && project.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.keywords.slice(0, 5).map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded">
                            {keyword}
                          </span>
                        ))}
                        {project.keywords.length > 5 && (
                          <span className="px-2 py-1 text-xs bg-slate-700 text-gray-400 rounded">
                            +{project.keywords.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {project.target_audience && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        <strong>Audience:</strong> {project.target_audience}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      to={`/projects/${project.id}`}
                      className="px-4 py-2 text-sm bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                    >
                      👁️ View
                    </Link>
                    <button
                      onClick={() => handleEdit(project)}
                      className="px-4 py-2 text-sm bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="px-4 py-2 text-sm bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Projects;
