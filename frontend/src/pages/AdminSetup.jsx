import React, { useState, useEffect } from 'react';
import { settingsAPI, authAPI } from '../services/api';

const API_CATEGORIES = {
  content_generation: {
    title: 'Content Generation',
    description: 'AI services for generating content',
    icon: '🤖',
    keys: ['anthropic_api_key', 'claude_model']
  },
  image_generation: {
    title: 'Image Generation',
    description: 'AI image generation for marketing creatives',
    icon: '🎨',
    keys: ['openai_api_key', 'leonardo_api_key', 'stability_api_key', 'ideogram_api_key']
  },
  video_generation: {
    title: 'Video Generation',
    description: 'AI avatar and voiceover services',
    icon: '🎬',
    keys: ['heygen_api_key', 'elevenlabs_api_key']
  },
  ads_platforms: {
    title: 'Ads Platforms',
    description: 'Google and Facebook advertising APIs',
    icon: '📢',
    keys: ['google_ads_client_id', 'google_ads_client_secret', 'google_ads_developer_token', 'facebook_access_token']
  },
  social_media: {
    title: 'Social Media',
    description: 'Social media platform APIs',
    icon: '📱',
    keys: [
      'linkedin_client_id', 'linkedin_client_secret',
      'twitter_api_key', 'twitter_api_secret', 'twitter_access_token', 'twitter_access_secret',
      'instagram_access_token',
      'tiktok_client_key', 'tiktok_client_secret'
    ]
  }
};

export default function AdminSetup() {
  const [activeTab, setActiveTab] = useState('api-keys');
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState({});
  
  // User management state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'user',
  });

  useEffect(() => {
    loadSettings();
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAll();
      setSettings(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getValue = (key) => {
    if (editedValues[key] !== undefined) {
      return editedValues[key];
    }
    const setting = settings.find(s => s.setting_key === key);
    return setting?.setting_value || '';
  };

  const getSetting = (key) => {
    return settings.find(s => s.setting_key === key);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const settingsToUpdate = Object.entries(editedValues).map(([key, value]) => ({
        key,
        value
      }));
      
      if (settingsToUpdate.length === 0) {
        setError('No changes to save');
        return;
      }
      
      await settingsAPI.bulkUpdate(settingsToUpdate);
      setSuccess('Settings saved successfully!');
      setEditedValues({});
      await loadSettings();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await authAPI.getAllUsers();
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormData({ email: '', password: '', fullName: '', role: 'user' });
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      email: user.email,
      password: '',
      fullName: user.fullName || '',
      role: user.role,
    });
    setShowUserForm(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await authAPI.updateUser(editingUser.id, {
          full_name: userFormData.fullName,
          role: userFormData.role,
          is_active: true,
        });
        setSuccess('User updated successfully');
      } else {
        await authAPI.register({
          email: userFormData.email,
          password: userFormData.password,
          fullName: userFormData.fullName,
          role: userFormData.role,
        });
        setSuccess('User created successfully');
      }
      setShowUserForm(false);
      await loadUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await authAPI.deleteUser(userId);
      setSuccess('User deleted successfully');
      await loadUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleTestConnection = async (key) => {
    try {
      setTesting(prev => ({ ...prev, [key]: true }));
      setTestResults(prev => ({ ...prev, [key]: null }));
      
      // If there's an edited value, save it first
      if (editedValues[key]) {
        await settingsAPI.update(key, editedValues[key]);
        setEditedValues(prev => {
          const newValues = { ...prev };
          delete newValues[key];
          return newValues;
        });
      }
      
      const response = await settingsAPI.testConnection(key);
      setTestResults(prev => ({
        ...prev,
        [key]: response.data
      }));
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [key]: { success: false, message: err.response?.data?.error || 'Test failed' }
      }));
    } finally {
      setTesting(prev => ({ ...prev, [key]: false }));
    }
  };

  const renderSettingInput = (key) => {
    const setting = getSetting(key);
    const value = getValue(key);
    const isSecret = setting?.is_secret;
    const isEdited = editedValues[key] !== undefined;
    const testResult = testResults[key];
    const isTesting = testing[key];

    // Format the label
    const label = key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace('Api', 'API')
      .replace('Id', 'ID');

    return (
      <div key={key} className="mb-4 p-4 bg-gray-800 rounded-lg">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {setting?.description && (
            <span className="text-xs text-gray-500 ml-2">({setting.description})</span>
          )}
        </label>
        <div className="flex gap-2">
          <input
            type={isSecret ? 'password' : 'text'}
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={isSecret ? '••••••••' : 'Enter value...'}
            className={`flex-1 px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isEdited ? 'border-yellow-500' : 'border-gray-600'
            }`}
          />
          {(key === 'anthropic_api_key' || key === 'heygen_api_key' || key === 'elevenlabs_api_key' || key === 'openai_api_key' || key === 'leonardo_api_key') && (
            <button
              onClick={() => handleTestConnection(key)}
              disabled={isTesting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isTesting ? 'Testing...' : 'Test'}
            </button>
          )}
        </div>
        {testResult && (
          <div className={`mt-2 text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
            {testResult.success ? '✅' : '❌'} {testResult.message}
          </div>
        )}
        {isEdited && (
          <div className="mt-1 text-xs text-yellow-400">
            Unsaved changes
          </div>
        )}
      </div>
    );
  };

  const renderCategory = (categoryKey, category) => {
    return (
      <div key={categoryKey} className="mb-8 bg-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-3">{category.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-white">{category.title}</h2>
            <p className="text-sm text-gray-400">{category.description}</p>
          </div>
        </div>
        <div className="space-y-2">
          {category.keys.map(key => renderSettingInput(key))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasChanges = Object.keys(editedValues).length > 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
          <p className="text-gray-400 mt-1">Configure API keys, integrations, and user management</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            hasChanges
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-900/50 border border-green-500 text-green-300 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-700">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'api-keys'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            User Management
          </button>
        </div>
      </div>

      {activeTab === 'api-keys' && (
        <>
          {hasChanges && (
            <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-500 text-yellow-300 rounded-lg flex items-center">
              <span className="mr-2">⚠️</span>
              You have unsaved changes. Click "Save All Changes" to apply them.
            </div>
          )}

          <div className="space-y-6">
            {Object.entries(API_CATEGORIES).map(([key, category]) => 
              renderCategory(key, category)
            )}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <button
              onClick={handleCreateUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add User
            </button>
          </div>

          {showUserForm && (
            <div className="mb-6 p-6 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    disabled={!!editingUser}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <input
                      type="password"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={userFormData.fullName}
                    onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                  <button
                    onClick={() => {
                      setShowUserForm(false);
                      setEditingUser(null);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {loadingUsers ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Last Login</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-300">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{user.fullName || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' ? 'bg-red-900/50 text-red-300' :
                          user.role === 'manager' ? 'bg-blue-900/50 text-blue-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">📋 API Documentation Links</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <a href="https://docs.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            → Anthropic Claude API Docs
          </a>
          <a href="https://platform.openai.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            → OpenAI (DALL-E) API Docs
          </a>
          <a href="https://docs.leonardo.ai/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            → Leonardo.ai API Docs
          </a>
          <a href="https://docs.heygen.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            → HeyGen API Docs
          </a>
          <a href="https://elevenlabs.io/docs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            → ElevenLabs API Docs
          </a>
          <a href="https://developers.google.com/google-ads/api" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            → Google Ads API Docs
          </a>
          <a href="https://developers.facebook.com/docs/marketing-apis" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            → Facebook Marketing API Docs
          </a>
          <a href="https://developer.twitter.com/en/docs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            → Twitter API Docs
          </a>
        </div>
      </div>
    </div>
  );
}

