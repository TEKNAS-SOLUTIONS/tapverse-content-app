import React, { useState, useEffect } from 'react';
import { avatarsAPI } from '../services/api';
import CreateAvatarWizard from '../components/wizards/CreateAvatarWizard';

function MyAvatars() {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [pollingAvatars, setPollingAvatars] = useState(new Set());

  useEffect(() => {
    loadAvatars();
  }, []);

  // Poll for status updates on processing avatars
  useEffect(() => {
    if (pollingAvatars.size === 0) return;

    const interval = setInterval(() => {
      pollingAvatars.forEach(async (avatarId) => {
        try {
          const response = await avatarsAPI.checkStatus(avatarId);
          if (response.data.success) {
            const updatedAvatar = response.data.data;
            setAvatars(prev => 
              prev.map(avatar => 
                avatar.id === avatarId ? updatedAvatar : avatar
              )
            );

            // Stop polling if status is completed or failed
            if (updatedAvatar.status === 'completed' || updatedAvatar.status === 'failed') {
              setPollingAvatars(prev => {
                const next = new Set(prev);
                next.delete(avatarId);
                return next;
              });
            }
          }
        } catch (err) {
          console.error('Error checking avatar status:', err);
        }
      });
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [pollingAvatars]);

  const loadAvatars = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await avatarsAPI.getAll();
      if (response.data.success) {
        const loadedAvatars = response.data.data || [];
        setAvatars(loadedAvatars);

        // Start polling for processing avatars
        const processingIds = loadedAvatars
          .filter(a => a.status === 'processing')
          .map(a => a.id);
        if (processingIds.length > 0) {
          setPollingAvatars(new Set(processingIds));
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load avatars');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowWizard(false);
    loadAvatars();
  };

  const handleDelete = async (avatarId) => {
    if (!confirm('Are you sure you want to delete this avatar?')) {
      return;
    }

    try {
      await avatarsAPI.delete(avatarId);
      setAvatars(prev => prev.filter(avatar => avatar.id !== avatarId));
      setPollingAvatars(prev => {
        const next = new Set(prev);
        next.delete(avatarId);
        return next;
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete avatar');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      processing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (showWizard) {
    return (
      <CreateAvatarWizard 
        onSuccess={handleCreateSuccess}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Avatars</h1>
          <p className="mt-2 text-gray-600">Create and manage your custom HeyGen Instant Avatars</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-sm"
        >
          + Create New Avatar
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading avatars...</p>
        </div>
      ) : avatars.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No avatars yet</h3>
            <p className="text-gray-600 mb-6">Create your first custom avatar to get started</p>
            <button
              onClick={() => setShowWizard(true)}
              className="px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-colors"
            >
              Create New Avatar
            </button>
          </div>
        </div>
      ) : (
        /* Avatar Gallery */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {avatar.thumbnail_url ? (
                  <img 
                    src={avatar.thumbnail_url} 
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                ) : avatar.status === 'processing' ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Processing...</p>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Avatar Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{avatar.name}</h3>
                    {getStatusBadge(avatar.status)}
                  </div>
                </div>

                {/* Error Message */}
                {avatar.status === 'failed' && avatar.error_message && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {avatar.error_message}
                  </div>
                )}

                {/* Metadata */}
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Created: {new Date(avatar.created_at).toLocaleDateString()}</p>
                  {avatar.completed_at && (
                    <p>Completed: {new Date(avatar.completed_at).toLocaleDateString()}</p>
                  )}
                  {avatar.heygen_avatar_id && (
                    <p className="font-mono text-xs">ID: {avatar.heygen_avatar_id.substring(0, 8)}...</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  {avatar.status === 'completed' && (
                    <button
                      className="flex-1 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      disabled
                    >
                      Ready to Use
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(avatar.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

export default MyAvatars;
