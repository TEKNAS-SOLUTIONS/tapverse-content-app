import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientsAPI } from '../services/api';

function Dashboard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProjects: 0,
    activeProjects: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await clientsAPI.getAll();
      if (response.data.success) {
        const clientsData = response.data.data;
        setClients(clientsData);
        
        // Calculate stats
        let totalProjects = 0;
        let activeProjects = 0;
        clientsData.forEach(client => {
          // This would need to be calculated from actual project data
          // For now, placeholder
        });
        
        setStats({
          totalClients: clientsData.length,
          totalProjects,
          activeProjects,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your content automation system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Clients</p>
              <p className="text-3xl font-bold text-white">{stats.totalClients}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-white">{stats.totalProjects}</p>
            </div>
            <div className="text-4xl">📁</div>
          </div>
        </div>
        
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Active Projects</p>
              <p className="text-3xl font-bold text-white">{stats.activeProjects}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/clients"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Clients
          </Link>
          <Link
            to="/clients?new=true"
            className="px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
          >
            Create New Client
          </Link>
        </div>
      </div>

      {/* Recent Clients */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Clients</h2>
          <Link
            to="/clients"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View All →
          </Link>
        </div>
        
        {clients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No clients yet</p>
            <Link
              to="/clients?new=true"
              className="text-blue-400 hover:text-blue-300"
            >
              Create your first client →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.slice(0, 6).map((client) => (
              <Link
                key={client.id}
                to={`/clients/${client.id}`}
                className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-blue-500 transition-colors"
              >
                <h3 className="text-white font-medium mb-1">{client.company_name}</h3>
                <p className="text-gray-400 text-sm">{client.industry || 'No industry'}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
