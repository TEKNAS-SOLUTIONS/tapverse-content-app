import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientsAPI } from '../services/api';
import ClientForm from '../components/ClientForm';

function Clients() {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientsAPI.getAll();
      if (response.data.success) {
        setClients(response.data.data);
        setFilteredClients(response.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  // Filter clients based on search query and industry
  useEffect(() => {
    let filtered = [...clients];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(client =>
        client.company_name?.toLowerCase().includes(query) ||
        client.tapverse_client_id?.toLowerCase().includes(query) ||
        client.website_url?.toLowerCase().includes(query) ||
        client.industry?.toLowerCase().includes(query)
      );
    }

    // Industry filter
    if (filterIndustry) {
      filtered = filtered.filter(client => client.industry === filterIndustry);
    }

    setFilteredClients(filtered);
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
          <h1 className="text-3xl font-bold text-white">
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

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Clients</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          + Create Client
        </button>
      </div>

      {/* Search and Filter Bar */}
      {!showForm && clients.length > 0 && (
        <div className="mb-6 bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
              Search Clients
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name, ID, website, or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:w-64">
            <label htmlFor="industry-filter" className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Industry
            </label>
            <select
              id="industry-filter"
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-300">Error: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
          <span className="text-6xl mb-4 block">
            {clients.length === 0 ? '👥' : '🔍'}
          </span>
          <p className="text-gray-400 text-lg">
            {clients.length === 0 ? 'No clients found.' : 'No clients match your search criteria.'}
          </p>
          {clients.length === 0 ? (
            <button
              onClick={handleCreate}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Client
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterIndustry('');
              }}
              className="mt-4 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClients.length > 0 && clients.length > filteredClients.length && (
            <div className="text-sm text-gray-400 mb-2">
              Showing {filteredClients.length} of {clients.length} clients
            </div>
          )}
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-white">
                      {client.company_name}
                    </h3>
                    {client.website_url && (
                      <a
                        href={client.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        {client.website_url}
                      </a>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                    <span className="bg-slate-800 px-2 py-1 rounded">
                      ID: {client.tapverse_client_id}
                    </span>
                    {client.industry && (
                      <span className="bg-slate-800 px-2 py-1 rounded">
                        {client.industry}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/clients/${client.id}`}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleEdit(client)}
                    className="px-4 py-2 text-sm bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="px-4 py-2 text-sm bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
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
