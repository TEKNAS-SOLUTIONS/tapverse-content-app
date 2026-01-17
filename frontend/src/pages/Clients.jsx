import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientsAPI, projectsAPI, tasksAPI, rankTrackingAPI, contentIdeasAPI, exportAPI } from '../services/api';
import ClientForm from '../components/ClientForm';

function Clients() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');

  useEffect(() => {
    loadClients();
    loadMetrics();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadClientMetrics(selectedClientId);
      loadClientProjects(selectedClientId);
      const client = clients.find(c => c.id === selectedClientId);
      setSelectedClient(client);
    } else {
      loadMetrics();
      setSelectedClient(null);
    }
  }, [selectedClientId, clients]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientsAPI.getAll();
      if (response.data.success) {
        setClients(response.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const response = await clientsAPI.getDashboardMetrics();
      if (response.data.success) {
        setMetrics(response.data.data);
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  };

  const loadClientMetrics = async (clientId) => {
    try {
      const response = await clientsAPI.getDashboardMetrics(clientId);
      if (response.data.success) {
        setMetrics(response.data.data);
      }
    } catch (err) {
      console.error('Error loading client metrics:', err);
    }
  };

  const loadClientProjects = async (clientId) => {
    try {
      const response = await projectsAPI.getAll(clientId);
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  // Filter clients based on search query and industry
  useEffect(() => {
    let filtered = [...clients];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(client =>
        client.company_name?.toLowerCase().includes(query) ||
        client.tapverse_client_id?.toLowerCase().includes(query) ||
        client.website_url?.toLowerCase().includes(query) ||
        client.industry?.toLowerCase().includes(query)
      );
    }

    if (filterIndustry) {
      filtered = filtered.filter(client => client.industry === filterIndustry);
    }
  }, [clients, searchQuery, filterIndustry]);

  const handleCreate = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      await clientsAPI.delete(id);
      await loadClients();
      if (selectedClientId === id) {
        setSelectedClientId(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete client');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingClient) {
        await clientsAPI.update(editingClient.id, formData);
      } else {
        await clientsAPI.create(formData);
      }
      setShowForm(false);
      setEditingClient(null);
      await loadClients();
    } catch (err) {
      setError(err.message || 'Failed to save client');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  if (showForm) {
    return (
      <div>
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {editingClient ? 'Edit Client' : 'Create Client'}
          </h1>
        </div>
        <ClientForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingClient}
        />
      </div>
    );
  }

  // Client-specific dashboard view
  if (selectedClientId && selectedClient) {
    return (
      <div>
        {/* Header with Client Selector */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value || null)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.company_name}</option>
              ))}
            </select>
            <h1 className="text-3xl font-bold text-gray-900">{selectedClient.company_name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportAPI.keywords({ clientId: selectedClientId })}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Export
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              + Add Client
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Active Projects</div>
              <div className="text-3xl font-bold text-gray-900">{metrics.activeProjects || 0}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Content Generated</div>
              <div className="text-3xl font-bold text-gray-900">{metrics.contentGenerated || 0}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Keywords Tracked</div>
              <div className="text-3xl font-bold text-gray-900">{metrics.keywordsTracked || 0}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Ranking Changes</div>
              <div className="text-3xl font-bold text-gray-900">{metrics.rankingChanges || 0}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Traffic Est.</div>
              <div className="text-3xl font-bold text-gray-900">{metrics.trafficEstimate || 'N/A'}</div>
            </div>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-6">
          {/* Projects Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Projects ({projects.length})</h2>
              <div className="flex gap-2">
                <Link
                  to={`/clients/${selectedClientId}/projects`}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  View All
                </Link>
                <Link
                  to={`/clients/${selectedClientId}/projects`}
                  className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  + New
                </Link>
              </div>
            </div>
            {projects.length > 0 ? (
              <div className="space-y-2">
                {projects.slice(0, 5).map(project => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{project.project_name}</div>
                    <div className="text-sm text-gray-600">{project.project_type || 'General'}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No projects yet. Create your first project.</p>
            )}
          </div>

          {/* Tasks Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
              <button className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                + New Task
              </button>
            </div>
            <p className="text-gray-600">Task management coming soon...</p>
          </div>

          {/* Keywords Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Keywords ({metrics?.keywordsTracked || 0} tracked)</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportAPI.keywords({ clientId: selectedClientId })}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Export
                </button>
                <button className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  + Add
                </button>
              </div>
            </div>
            <p className="text-gray-600">Keyword rank tracking coming soon...</p>
          </div>

          {/* Content Ideas & Gaps Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Content Ideas & Gaps</h2>
              <button
                onClick={async () => {
                  try {
                    await contentIdeasAPI.generate(selectedClientId);
                    alert('Content ideas generated!');
                  } catch (err) {
                    alert('Error generating content ideas');
                  }
                }}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Generate Ideas
              </button>
            </div>
            <p className="text-gray-600">AI-driven content ideas and upsell opportunities coming soon...</p>
          </div>

          {/* Connections Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Connections</h2>
              <Link
                to="/connections"
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Manage
              </Link>
            </div>
            <p className="text-gray-600">Connection management coming soon...</p>
          </div>

          {/* Local SEO Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Local SEO</h2>
              <Link
                to={`/clients/${selectedClientId}/projects`}
                className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                View Analysis
              </Link>
            </div>
            <p className="text-gray-600">Local SEO analysis available for all clients.</p>
          </div>
        </div>
      </div>
    );
  }

  // All Clients Dashboard View
  return (
    <div>
      {/* Header with Client Selector */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <select
            value={selectedClientId || ''}
            onChange={(e) => setSelectedClientId(e.target.value || null)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.company_name}</option>
            ))}
          </select>
          <h1 className="text-3xl font-bold text-gray-900">Clients Dashboard</h1>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          + Create Client
        </button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Total Clients</div>
            <div className="text-3xl font-bold text-gray-900">{metrics.totalClients || 0}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Active Projects</div>
            <div className="text-3xl font-bold text-gray-900">{metrics.activeProjects || 0}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Content Generated</div>
            <div className="text-3xl font-bold text-gray-900">{metrics.contentGenerated || 0}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Revenue</div>
            <div className="text-3xl font-bold text-gray-900">${metrics.revenue || 0}</div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      {clients.length > 0 && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Clients
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name, ID, website, or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-64">
            <label htmlFor="industry-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Industry
            </label>
            <select
              id="industry-filter"
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Industries</option>
              {[...new Set(clients.map(c => c.industry).filter(Boolean))].sort().map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading clients...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-600 text-lg">
            No clients found.
          </p>
          <button
            onClick={handleCreate}
            className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Create Your First Client
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {clients
            .filter(client => {
              if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                if (!(
                  client.company_name?.toLowerCase().includes(query) ||
                  client.tapverse_client_id?.toLowerCase().includes(query) ||
                  client.website_url?.toLowerCase().includes(query) ||
                  client.industry?.toLowerCase().includes(query)
                )) {
                  return false;
                }
              }
              if (filterIndustry && client.industry !== filterIndustry) {
                return false;
              }
              return true;
            })
            .map((client) => (
              <div key={client.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-orange-200 hover:shadow-md transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {client.company_name}
                      </h3>
                      {client.website_url && (
                        <a
                          href={client.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-orange-600 hover:text-orange-700"
                        >
                          {client.website_url}
                        </a>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                        ID: {client.tapverse_client_id}
                      </span>
                      {client.industry && (
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {client.industry}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedClientId(client.id)}
                      className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      View Dashboard
                    </button>
                    <Link
                      to={`/clients/${client.id}/projects`}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Projects
                    </Link>
                    <button
                      onClick={() => handleEdit(client)}
                      className="px-4 py-2 text-sm bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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

export default Clients;
