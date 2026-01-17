import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Auth API
 */
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getAllUsers: () => api.get('/auth/users'),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  updatePassword: (id, currentPassword, newPassword) => 
    api.post(`/auth/users/${id}/password`, { currentPassword, newPassword }),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

/**
 * Clients API
 */
export const clientsAPI = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  getDashboardMetrics: (clientId = null) => 
    api.get('/clients/dashboard/metrics', { params: clientId ? { clientId } : {} }),
};

/**
 * Projects API
 */
export const projectsAPI = {
  getAll: (clientId) => 
    clientId 
      ? api.get(`/projects?client_id=${clientId}`)
      : api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

/**
 * Settings API
 */
export const settingsAPI = {
  getAll: () => api.get('/settings'),
  getByCategory: (category) => api.get(`/settings/category/${category}`),
  update: (key, value) => api.put(`/settings/${key}`, { value }),
  bulkUpdate: (settings) => api.put('/settings', { settings }),
  testConnection: (key) => api.post(`/settings/test/${key}`),
};

/**
 * Content Generation API
 */
export const contentAPI = {
  // Generate different content types
  generate: (type, data) => api.post(`/content/generate/${type}`, data),
  
  // Get generated content for a project
  getByProject: (projectId) => api.get(`/content/project/${projectId}`),
  
  // Get ads for a project
  getAdsByProject: (projectId) => api.get(`/content/ads/${projectId}`),
  
  // Update content
  update: (id, data) => api.put(`/content/${id}`, data),
  
  // Update content status
  updateStatus: (id, status, options = {}) => 
    api.put(`/content/${id}/status`, { status, ...options }),
  
  // Get status history
  getStatusHistory: (id) => api.get(`/content/${id}/status-history`),
};

/**
 * Image Generation API
 */
export const imagesAPI = {
  // Generate prompt
  generatePrompt: (requirements, clientId) => 
    api.post('/images/generate-prompt', { requirements, clientId }),
  
  // Generate with DALL-E 3
  generateWithDallE: (prompt, options = {}) => 
    api.post('/images/generate/dalle', { prompt, ...options }),
  
  // Generate with Leonardo.ai (async)
  generateWithLeonardo: (prompt, options = {}) => 
    api.post('/images/generate/leonardo', { prompt, ...options }),
  
  // Generate with Leonardo.ai (sync - waits for completion)
  generateWithLeonardoSync: (prompt, options = {}) => 
    api.post('/images/generate/leonardo/sync', { prompt, ...options }),
  
  // Check Leonardo generation status
  checkLeonardoStatus: (generationId) => 
    api.get(`/images/leonardo/status/${generationId}`),
  
  // Generate social media creative (full workflow)
  generateSocialCreative: (options) => 
    api.post('/images/generate/social', options),
  
  // Get available models
  getModels: () => api.get('/images/leonardo/models'),
  
  // Get style elements
  getElements: () => api.get('/images/leonardo/elements'),
  
  // Get presets
  getPresets: () => api.get('/images/presets'),
  
  // Image to image (variations)
  imageToImage: (imageUrl, prompt, options = {}) => 
    api.post('/images/image-to-image', { imageUrl, prompt, ...options }),
};

/**
 * Custom Avatars API
 */
export const avatarsAPI = {
  // Create Instant Avatar
  createInstantAvatar: (formData) => api.post('/avatars/create-instant-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  // Get all custom avatars for current user
  getAll: () => api.get('/avatars'),
  // Get avatar by ID
  getById: (id) => api.get(`/avatars/${id}`),
  // Check avatar status
  checkStatus: (id) => api.post(`/avatars/${id}/check-status`),
  // Delete avatar
  delete: (id) => api.delete(`/avatars/${id}`),
};

/**
 * Video Generation API
 */
export const videoAPI = {
  // Generate video script
  generateScript: (projectId) => 
    api.post('/video/generate-script', { project_id: projectId }),
  
  // Create video with HeyGen
  create: (scriptId, scriptText, avatarId, voiceId) => 
    api.post('/video/create', { script_id: scriptId, script_text: scriptText, avatar_id: avatarId, voice_id: voiceId }),
  
  // Check video generation status
  checkStatus: (videoId) => api.get(`/video/status/${videoId}`),
  
  // Get videos for a project
  getByProject: (projectId) => api.get(`/video/project/${projectId}`),
  
  // Delete video
  delete: (videoId) => api.delete(`/video/${videoId}`),
  
  // Get available avatars
  getAvatars: () => api.get('/video/avatars'),
  
  // Get available voices
  getVoices: () => api.get('/video/voices'),
};

/**
 * Article Ideas API
 */
export const articleIdeasAPI = {
  generate: (data) => api.post('/article-ideas/generate', data),
  getByProject: (projectId) => api.get(`/article-ideas/project/${projectId}`),
  update: (id, data) => api.put(`/article-ideas/${id}`, data),
  delete: (id) => api.delete(`/article-ideas/${id}`),
  generateArticle: (ideaId) => api.post(`/article-ideas/${ideaId}/generate-article`),
};

/**
 * SEO Strategy API
 */
export const seoStrategyAPI = {
  generate: (data) => api.post('/seo-strategy/generate', data),
  getByProject: (projectId) => api.get(`/seo-strategy/project/${projectId}`),
  update: (id, data) => api.put(`/seo-strategy/${id}`, data),
};

/**
 * Google Ads Strategy API
 */
export const googleAdsStrategyAPI = {
  generate: (data) => api.post('/google-ads-strategy/generate', data),
  getByProject: (projectId) => api.get(`/google-ads-strategy/project/${projectId}`),
  update: (id, data) => api.put(`/google-ads-strategy/${id}`, data),
};

/**
 * Facebook Ads Strategy API
 */
export const facebookAdsStrategyAPI = {
  generate: (data) => api.post('/facebook-ads-strategy/generate', data),
  getByProject: (projectId) => api.get(`/facebook-ads-strategy/project/${projectId}`),
  update: (id, data) => api.put(`/facebook-ads-strategy/${id}`, data),
};

/**
 * Scheduling API
 */
export const schedulingAPI = {
  schedule: (data) => api.post('/scheduling/schedule', data),
  getByProject: (projectId) => api.get(`/scheduling/project/${projectId}`),
  update: (id, data) => api.put(`/scheduling/${id}`, data),
  delete: (id) => api.delete(`/scheduling/${id}`),
};

/**
 * Email Newsletters API
 */
export const emailNewslettersAPI = {
  generate: (data) => api.post('/email-newsletters/generate', data),
  getByProject: (projectId) => api.get(`/email-newsletters/project/${projectId}`),
};

/**
 * Analytics API
 */
export const analyticsAPI = {
  getByClient: (clientId) => api.get(`/analytics/client/${clientId}`),
  getByProject: (projectId) => api.get(`/analytics/project/${projectId}`),
  getByContent: (contentId) => api.get(`/analytics/content/${contentId}`),
  track: (data) => api.post('/analytics/track', data),
};

/**
 * Content Roadmap API
 */
export const contentRoadmapAPI = {
  generate: (data) => api.post('/roadmap/generate', data),
  getByProject: (projectId) => api.get(`/roadmap/project/${projectId}`),
};

/**
 * Dashboard API
 */
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getByProject: (projectId) => api.get(`/dashboard/${projectId}`),
};

/**
 * Content Evidence API
 */
export const contentEvidenceAPI = {
  generate: (data) => api.post('/content-evidence/generate', data),
};

/**
 * Shopify API
 */
export const shopifyAPI = {
  analyze: (data) => api.post('/shopify/analyze', data),
  getByClient: (clientId) => api.get(`/shopify/client/${clientId}`),
};

/**
 * Local SEO API
 */
export const localSeoAPI = {
  analyze: (clientId, projectId, location, websiteUrl) => 
    api.post('/local-seo/analyze', { clientId, projectId, location, websiteUrl }),
  generateSchema: (data) => api.post('/local-seo/schema', data),
};

/**
 * Connections API
 */
export const connectionsAPI = {
  // Get all connections
  getAll: () => api.get('/connections'),
  
  // Get connections for a client
  getByClient: (clientId) => api.get(`/connections/client/${clientId}`),
  
  // Get available connections for a client
  getAvailableForClient: (clientId) => api.get(`/connections/available/${clientId}`),
  
  // Assign connections to a client
  assignToClient: (clientId, connectionIds, defaultConnectionId) =>
    api.post('/connections/assign', { clientId, connectionIds, defaultConnectionId }),
  
  // Check Google OAuth status
  getGoogleOAuthStatus: () => api.get('/connections/google/status'),
  
  // Generate Google OAuth URL
  getGoogleAuthUrl: (connectionType) => api.post('/connections/google/auth-url', { connectionType }),
  
  // Handle Google OAuth callback
  handleGoogleCallback: (code, state, connectionType, connectionName) =>
    api.post('/connections/google/callback', { code, state, connectionType, connectionName }),
  
  // Re-discover resources for a connection
  discoverResources: (connectionId) => api.post(`/connections/${connectionId}/discover`),
  
  // Delete connection
  delete: (id) => api.delete(`/connections/${id}`),
};

/**
 * Programmatic SEO API
 */
export const programmaticSeoAPI = {
  getSuggestions: (input, types) => api.get('/programmatic-seo/suggestions', { params: { input, types } }),
  generate: (data) => api.post('/programmatic-seo/generate', data),
  generateBatch: (data) => api.post('/programmatic-seo/generate-batch', data),
  getByProject: (projectId) => api.get(`/programmatic-seo/project/${projectId}`),
};

/**
 * Tasks API
 */
export const tasksAPI = {
  create: (data) => api.post('/tasks', data),
  getAll: (filters) => api.get('/tasks', { params: filters }),
  getByClient: (clientId, filters) => api.get(`/tasks/client/${clientId}`, { params: filters }),
  getMyTasks: (filters) => api.get('/tasks/my-tasks', { params: filters }),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  generateMonthly: () => api.post('/tasks/generate-monthly'),
};

/**
 * Export API
 */
export const exportAPI = {
  keywords: (params) => {
    const queryString = new URLSearchParams(params).toString();
    window.open(`/api/export/keywords?${queryString}`, '_blank');
  },
  content: (params) => {
    const queryString = new URLSearchParams(params).toString();
    window.open(`/api/export/content?${queryString}`, '_blank');
  },
  tasks: (params) => {
    const queryString = new URLSearchParams(params).toString();
    window.open(`/api/export/tasks?${queryString}`, '_blank');
  },
};

/**
 * Rank Tracking API
 */
export const rankTrackingAPI = {
  record: (data) => api.post('/rank-tracking/record', data),
  getByClient: (clientId, filters) => api.get(`/rank-tracking/client/${clientId}`, { params: filters }),
  getTrends: (clientId, months = 6) => api.get(`/rank-tracking/client/${clientId}/trends`, { params: { months } }),
  getSummary: (clientId) => api.get(`/rank-tracking/client/${clientId}/summary`),
};

/**
 * Reports API
 */
export const reportsAPI = {
  generateMonthly: (data) => api.post('/reports/monthly/generate', data),
  saveMonthly: (data) => api.post('/reports/monthly/save', data),
  getMonthlyByClient: (clientId) => api.get(`/reports/monthly/client/${clientId}`),
  getMonthlyById: (id) => api.get(`/reports/monthly/${id}`),
  updateMonthly: (id, data) => api.put(`/reports/monthly/${id}`, data),
};

/**
 * Content Ideas & Gaps API
 */
export const contentIdeasAPI = {
  generate: (clientId, projectId = null) => api.post('/content-ideas/generate', { clientId, projectId }),
};

/**
 * Chat API
 */
export const chatAPI = {
  createConversation: (data) => api.post('/chat/conversations', data),
  getConversations: (chatType, clientId = null) => 
    api.get('/chat/conversations', { params: { chatType, clientId } }),
  getConversation: (id) => api.get(`/chat/conversations/${id}`),
  getMessages: (id) => api.get(`/chat/conversations/${id}/messages`),
  sendMessage: (id, message, options = {}) => 
    api.post(`/chat/conversations/${id}/messages`, { message, ...options }),
  updateTitle: (id, title) => api.put(`/chat/conversations/${id}/title`, { title }),
  deleteConversation: (id) => api.delete(`/chat/conversations/${id}`),
};

/**
 * Admin Chat API
 */
export const adminChatAPI = {
  sendMessage: (id, message, model) => api.post(`/admin-chat/conversations/${id}/messages`, { message, model }),
  getInsights: (filters) => api.get('/admin-chat/insights', { params: filters }),
  generateRecommendations: () => api.post('/admin-chat/generate-recommendations'),
};

export default api;
