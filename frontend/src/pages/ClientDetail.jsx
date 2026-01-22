import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clientsAPI, projectsAPI } from '../services/api';
import ClientForm from '../components/ClientForm';

function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

  useEffect(() => {
    if (clientId) {
      loadClientData();
    }
  }, [clientId]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const clientRes = await clientsAPI.getById(clientId);
      if (clientRes.data.success) {
        setClient(clientRes.data.data);
      }
      
      const projectsRes = await projectsAPI.getAll(clientId);
      if (projectsRes.data.success) {
        setProjects(projectsRes.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClient = async (formData) => {
    try {
      await clientsAPI.update(clientId, formData);
      setShowForm(false);
      await loadClientData();
    } catch (err) {
      setError(err.message || 'Failed to update client');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading client...</p>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-300">Error: {error}</p>
          <Link to="/clients" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
            ← Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setShowForm(false)}
            className="text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">Edit Client</h1>
        </div>
        <ClientForm
          onSubmit={handleUpdateClient}
          onCancel={() => setShowForm(false)}
          initialData={client}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <Link
                to="/clients"
                className="text-blue-400 hover:text-blue-300"
              >
                ← Back to Clients
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{client?.company_name}</h1>
            {client?.website_url && (
              <a
                href={client.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                {client.website_url}
              </a>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {client?.industry && (
                <span className="bg-slate-800 px-3 py-1 rounded text-sm text-gray-300">
                  {client.industry}
                </span>
              )}
              <span className="bg-slate-800 px-3 py-1 rounded text-sm text-gray-300">
                ID: {client?.tapverse_client_id}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Client
            </button>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Projects</h2>
          <button
            onClick={() => setShowProjectForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No projects yet</p>
            <button
              onClick={() => setShowProjectForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/clients/${clientId}/projects/${project.id}`}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{project.project_name}</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.project_types && Array.isArray(project.project_types) && project.project_types.map((type, idx) => (
                    <span key={idx} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                      {type}
                    </span>
                  ))}
                </div>
                <p className="text-gray-400 text-sm mt-3">
                  Status: <span className="text-white">{project.status || 'active'}</span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDetail;
