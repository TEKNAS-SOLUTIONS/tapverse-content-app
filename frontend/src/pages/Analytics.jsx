import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clientsAPI, projectsAPI } from '../services/api';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

function Analytics() {
  const { clientId, projectId } = useParams();
  const [client, setClient] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [clientId, projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (clientId) {
        const clientRes = await clientsAPI.getById(clientId);
        if (clientRes.data.success) {
          setClient(clientRes.data.data);
        }
      }
      if (projectId) {
        const projectRes = await projectsAPI.getById(projectId);
        if (projectRes.data.success) {
          setProject(projectRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
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

  const finalClientId = client?.id || clientId;
  const finalProjectId = project?.id || projectId;

  if (!finalClientId) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Client ID is required</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        {client && (
          <p className="text-gray-400 mt-1">Client: {client.company_name}</p>
        )}
        {project && (
          <p className="text-gray-400">Project: {project.project_name}</p>
        )}
      </div>
      <AnalyticsDashboard clientId={finalClientId} projectId={finalProjectId} />
    </div>
  );
}

export default Analytics;

