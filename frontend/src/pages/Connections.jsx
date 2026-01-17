import React, { useState, useEffect } from 'react';
import { connectionsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

function Connections() {
  const { showToast } = useToast();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [oauthError, setOauthError] = useState(null);
  const [oauthConfigured, setOauthConfigured] = useState(null);

  useEffect(() => {
    loadConnections();
    checkOAuthStatus();
  }, []);

  const checkOAuthStatus = async () => {
    try {
      const response = await connectionsAPI.getGoogleOAuthStatus();
      if (response.data.success) {
        setOauthConfigured(response.data.data.configured);
        if (!response.data.data.configured) {
          setOauthError(response.data.data.message);
        }
      }
    } catch (err) {
      console.error('Error checking OAuth status:', err);
    }
  };

  const loadConnections = async () => {
    try {
      setLoading(true);
      const response = await connectionsAPI.getAll();
      if (response.data.success) {
        setConnections(response.data.data);
      }
    } catch (err) {
      showToast('Failed to load connections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async (connectionType) => {
    try {
      setConnecting(true);
      setSelectedType(connectionType);
      setOauthError(null);

      // Get OAuth URL
      const response = await connectionsAPI.getGoogleAuthUrl(connectionType);
      
      if (response.data.success) {
        const { authUrl, stateToken } = response.data.data;
        
        // Store state token in sessionStorage for callback
        sessionStorage.setItem('oauth_state', stateToken);
        sessionStorage.setItem('oauth_type', connectionType);
        
        // Redirect to OAuth URL (better than popup for OAuth)
        window.location.href = authUrl;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to initiate OAuth';
      setOauthError(errorMsg);
      showToast(errorMsg, 'error');
      setConnecting(false);
      
      // Check if it's a configuration error
      if (errorMsg.includes('client ID') || errorMsg.includes('not configured')) {
        setOauthError(
          'Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file. See GOOGLE_OAUTH_SETUP.md for instructions.'
        );
      }
    }
  };

  const handleDiscoverResources = async (connectionId) => {
    try {
      showToast('Discovering resources...', 'info');
      const response = await connectionsAPI.discoverResources(connectionId);
      
      if (response.data.success) {
        showToast('Resources discovered successfully', 'success');
        loadConnections();
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to discover resources', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this connection?')) {
      return;
    }

    try {
      const response = await connectionsAPI.delete(id);
      if (response.data.success) {
        showToast('Connection deleted successfully', 'success');
        loadConnections();
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete connection', 'error');
    }
  };

  const getConnectionTypeLabel = (type) => {
    const labels = {
      'google_ads': 'Google Ads',
      'google_search_console': 'Google Search Console',
      'google_analytics': 'Google Analytics',
      'google_my_business': 'Google My Business',
      'google_all': 'Google (All Services)',
      'facebook_ads': 'Facebook Ads',
    };
    return labels[type] || type;
  };

  const getProviderIcon = (provider) => {
    if (provider === 'google') return '🔵';
    if (provider === 'facebook') return '📘';
    return '🔌';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading connections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Connections</h1>
        <p className="text-gray-600">
          Manage API connections for Google, Facebook, and other services. These connections are available for assignment to clients.
        </p>
      </div>

      {/* Connect New Services */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Connect New Service</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Google Ads */}
          <button
            onClick={() => handleConnectGoogle('google_ads')}
            disabled={connecting}
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔵</span>
              <span className="font-semibold text-gray-900">Google Ads</span>
            </div>
            <p className="text-sm text-gray-600">
              Connect to manage Google Ads accounts
            </p>
          </button>

          {/* Google Search Console */}
          <button
            onClick={() => handleConnectGoogle('google_search_console')}
            disabled={connecting}
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔵</span>
              <span className="font-semibold text-gray-900">Search Console</span>
            </div>
            <p className="text-sm text-gray-600">
              Connect to access website properties
            </p>
          </button>

          {/* Google Analytics */}
          <button
            onClick={() => handleConnectGoogle('google_analytics')}
            disabled={connecting}
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔵</span>
              <span className="font-semibold text-gray-900">Google Analytics</span>
            </div>
            <p className="text-sm text-gray-600">
              Connect to access analytics data
            </p>
          </button>

          {/* Google All Services */}
          <button
            onClick={() => handleConnectGoogle('google_all')}
            disabled={connecting}
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🔵</span>
              <span className="font-semibold text-gray-900">Google (All)</span>
            </div>
            <p className="text-sm text-gray-600">
              Connect to all Google services at once
            </p>
          </button>
        </div>

        {connecting && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              Redirecting to Google authorization... Please complete the authorization.
            </p>
          </div>
        )}

        {oauthError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-semibold mb-2">⚠️ OAuth Configuration Error</p>
            <p className="text-red-600 text-sm mb-2">{oauthError}</p>
            <p className="text-red-700 text-xs">
              See <code className="bg-red-100 px-2 py-1 rounded">GOOGLE_OAUTH_SETUP.md</code> for setup instructions.
            </p>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">📋 Setup Required</h3>
          <p className="text-xs text-gray-600 mb-2">
            Before connecting Google services, you need to configure OAuth credentials:
          </p>
          <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside ml-2">
            <li>Create OAuth credentials in Google Cloud Console</li>
            <li>Enable required APIs (Google Ads, Search Console, Analytics)</li>
            <li>Add credentials to your <code className="bg-gray-100 px-1 rounded">.env</code> file</li>
            <li>See <code className="bg-gray-100 px-1 rounded">GOOGLE_OAUTH_SETUP.md</code> for detailed instructions</li>
          </ol>
        </div>
      </div>

      {/* Existing Connections */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Connected Services ({connections.length})
        </h2>

        {connections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No connections yet. Connect a service above to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((conn) => {
              const connectionData = typeof conn.connection_data === 'string' 
                ? JSON.parse(conn.connection_data || '{}')
                : conn.connection_data || {};

              return (
                <div key={conn.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getProviderIcon(conn.provider)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{conn.connection_name}</h3>
                          <p className="text-sm text-gray-600">
                            {getConnectionTypeLabel(conn.connection_type)}
                          </p>
                        </div>
                      </div>
                      
                      {conn.account_email && (
                        <p className="text-sm text-gray-600 mb-1">
                          📧 {conn.account_email}
                        </p>
                      )}
                      
                      {conn.account_name && (
                        <p className="text-sm text-gray-600">
                          Account: {conn.account_name}
                        </p>
                      )}

                      {/* Discovered Resources */}
                      <div className="mt-3 space-y-2">
                        {connectionData.googleAdsAccounts && connectionData.googleAdsAccounts.length > 0 && (
                          <div className="text-sm">
                            <span className="text-gray-600">Google Ads Accounts: </span>
                            <span className="text-gray-900">
                              {connectionData.googleAdsAccounts.length} account(s)
                            </span>
                            <div className="ml-4 mt-1 space-y-1">
                              {connectionData.googleAdsAccounts.slice(0, 3).map((acc, idx) => (
                                <div key={idx} className="text-xs text-gray-700">
                                  • {acc.customerName} ({acc.customerId})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {connectionData.searchConsoleProperties && connectionData.searchConsoleProperties.length > 0 && (
                          <div className="text-sm">
                            <span className="text-gray-600">Search Console Properties: </span>
                            <span className="text-gray-900">
                              {connectionData.searchConsoleProperties.length} property(ies)
                            </span>
                            <div className="ml-4 mt-1 space-y-1">
                              {connectionData.searchConsoleProperties.slice(0, 3).map((prop, idx) => (
                                <div key={idx} className="text-xs text-gray-700">
                                  • {prop.propertyUrl}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {connectionData.analyticsAccounts && connectionData.analyticsAccounts.length > 0 && (
                          <div className="text-sm">
                            <span className="text-gray-600">Analytics Accounts: </span>
                            <span className="text-gray-900">
                              {connectionData.analyticsAccounts.length} account(s)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDiscoverResources(conn.id)}
                        className="px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
                      >
                        🔄 Refresh
                      </button>
                      <button
                        onClick={() => handleDelete(conn.id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
                    <span>Status: {conn.is_active ? '✅ Active' : '❌ Inactive'}</span>
                    {conn.last_synced_at && (
                      <span>Last synced: {new Date(conn.last_synced_at).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Connections;
