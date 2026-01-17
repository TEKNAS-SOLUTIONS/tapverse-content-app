import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { connectionsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

function GoogleOAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        showToast(`OAuth error: ${error}`, 'error');
        setTimeout(() => navigate('/connections'), 2000);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        showToast('Missing authorization code or state', 'error');
        setTimeout(() => navigate('/connections'), 2000);
        return;
      }

      // Get stored state and type from sessionStorage
      const storedState = sessionStorage.getItem('oauth_state');
      const connectionType = sessionStorage.getItem('oauth_type');

      if (state !== storedState) {
        setStatus('error');
        showToast('Invalid state token', 'error');
        setTimeout(() => navigate('/connections'), 2000);
        return;
      }

      try {
        setStatus('connecting');
        
        const response = await connectionsAPI.handleGoogleCallback(
          code,
          state,
          connectionType,
          null // connectionName - can be set later
        );

        if (response.data.success) {
          setStatus('success');
          showToast('Google account connected successfully!', 'success');
          
          // Clean up sessionStorage
          sessionStorage.removeItem('oauth_state');
          sessionStorage.removeItem('oauth_type');
          
          setTimeout(() => navigate('/connections'), 2000);
        }
      } catch (err) {
        setStatus('error');
        showToast(err.response?.data?.error || 'Failed to complete connection', 'error');
        setTimeout(() => navigate('/connections'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, showToast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8 text-center max-w-md">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Authorization</h2>
            <p className="text-gray-600">Completing Google OAuth connection...</p>
          </>
        )}
        
        {status === 'connecting' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Connecting</h2>
            <p className="text-gray-600">Setting up your connection...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Successful!</h2>
            <p className="text-gray-600">Redirecting to connections page...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-gray-600">Redirecting back...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default GoogleOAuthCallback;
