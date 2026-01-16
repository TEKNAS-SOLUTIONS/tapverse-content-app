import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clientsAPI, projectsAPI } from '../services/api';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

function Analytics() {
  const { clientId: urlClientId, projectId: urlProjectId } = useParams();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(urlClientId || '');
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId || '');
  const [client, setClient] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load all clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  // Load client and project data when selection changes
  useEffect(() => {
    loadSelectedData();
  }, [selectedClientId, selectedProjectId]);

  // Load projects when client changes
  useEffect(() => {
    if (selectedClientId) {
      loadProjects(selectedClientId);
    } else {
      setProjects([]);
      setSelectedProjectId('');
    }
  }, [selectedClientId]);

  const loadClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      if (response.data.success) {
        setClients(response.data.data);
        // If we have URL client ID, set it
        if (urlClientId) {
          setSelectedClientId(urlClientId);
        }
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (clientId) => {
    try {
      const response = await projectsAPI.getAll(clientId);
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const loadSelectedData = async () => {
    try {
      if (selectedClientId) {
        const clientRes = await clientsAPI.getById(selectedClientId);
        if (clientRes.data.success) {
          setClient(clientRes.data.data);
        }
      } else {
        setClient(null);
      }
      if (selectedProjectId) {
        const projectRes = await projectsAPI.getById(selectedProjectId);
        if (projectRes.data.success) {
          setProject(projectRes.data.data);
        }
      } else {
        setProject(null);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-gray-400 mt-1">View content performance and insights</p>
      </div>

      {/* Client & Project Selector */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="client-select" className="block text-sm font-medium text-gray-300 mb-2">
              Select Client *
            </label>
            <select
              id="client-select"
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setSelectedProjectId(''); // Reset project when client changes
              }}
              className="block w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a Client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} ({c.tapverse_client_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="project-select" className="block text-sm font-medium text-gray-300 mb-2">
              Select Project (Optional)
            </label>
            <select
              id="project-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={!selectedClientId}
              className="block w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">-- All Projects --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {client && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="font-medium text-white">{client.company_name}</span>
              {client.industry && <span className="bg-slate-800 px-2 py-1 rounded">{client.industry}</span>}
              {project && <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded">{project.project_name}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Analytics Content */}
      {selectedClientId ? (
        <AnalyticsDashboard clientId={selectedClientId} projectId={selectedProjectId || null} />
      ) : (
        <div className="text-center py-16 bg-slate-900 rounded-xl border border-slate-800">
          <span className="text-6xl mb-4 block">📊</span>
          <p className="text-gray-400 text-lg">Select a client to view analytics</p>
          <p className="text-gray-500 text-sm mt-2">Choose from the dropdown above to see content performance</p>
        </div>
      )}
    </div>
  );
}

export default Analytics;

