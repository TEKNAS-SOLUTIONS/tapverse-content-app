import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientsAPI } from '../services/api';
import ClientForm from '../components/ClientForm';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

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
      }
    } catch (err) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Clients</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          + Create Client
        </button>
      </div>

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
      ) : clients.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
          <span className="text-6xl mb-4 block">👥</span>
          <p className="text-gray-400 text-lg">No clients found.</p>
          <button
            onClick={handleCreate}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Client
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
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
                    to={`/clients/${client.id}/projects`}
                    className="px-4 py-2 text-sm bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    📁 Projects
                  </Link>
                  <button
                    onClick={() => handleEdit(client)}
                    className="px-4 py-2 text-sm bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="px-4 py-2 text-sm bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                  >
                    🗑️ Delete
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
