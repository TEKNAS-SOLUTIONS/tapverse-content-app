import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Clients API
 */
export const clientsAPI = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
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
  
  // Approve content for CMS
  approve: (data) => api.post('/content/approve', data),
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
    api.post('/images/leonardo/img2img', { imageUrl, prompt, ...options }),
  
  // Upscale image
  upscale: (imageId) => api.post('/images/leonardo/upscale', { imageId }),
  
  // Remove background
  removeBackground: (imageId) => api.post('/images/leonardo/remove-bg', { imageId }),
  
  // Get API credits
  getCredits: () => api.get('/images/leonardo/credits'),
  
  // Brand style management
  saveBrandStyle: (clientId, brandStyle) => 
    api.post(`/images/brand-style/${clientId}`, brandStyle),
  
  getBrandStyle: (clientId) => 
    api.get(`/images/brand-style/${clientId}`),
};

/**
 * Video API
 */
export const videoAPI = {
  // Generate video script
  generateScript: (projectId, duration = 60) => 
    api.post('/video/generate-script', { project_id: projectId, duration }),
  
  // Create video with HeyGen
  createVideo: (scriptText, avatarId, voiceId) => 
    api.post('/video/create', { script_text: scriptText, avatar_id: avatarId, voice_id: voiceId }),
  
  // Check video status
  checkStatus: (videoId) => api.get(`/video/status/${videoId}`),
  
  // Get available avatars
  getAvatars: () => api.get('/video/avatars'),
  
  // Get available voices
  getVoices: () => api.get('/video/voices'),
  
  // Generate voiceover
  generateVoiceover: (text, voiceId) => 
    api.post('/video/voiceover', { text, voice_id: voiceId }),
  
  // Create custom avatar from photo
  createAvatarFromPhoto: (formData) => 
    api.post('/video/create-avatar-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Create custom avatar from video
  createAvatarFromVideo: (formData) => 
    api.post('/video/create-avatar-video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Check custom avatar training status
  checkAvatarStatus: (avatarId) => api.get(`/video/avatar-status/${avatarId}`),
  
  // Get custom avatars
  getCustomAvatars: () => api.get('/video/custom-avatars'),
};

/**
 * Keyword Analysis API
 */
export const keywordAnalysisAPI = {
  analyze: (data) => api.post('/keyword-analysis/analyze', data),
  analyzeGaps: (data) => api.post('/keyword-analysis/gaps', data),
  getByProject: (projectId) => api.get(`/keyword-analysis/project/${projectId}`),
};

/**
 * Article Ideas API
 */
export const articleIdeasAPI = {
  // Generate new article ideas for a client
  generate: (clientId, projectId = null, count = 10) => 
    api.post('/article-ideas/generate', { client_id: clientId, project_id: projectId, count }),
  
  // Get ideas for a client
  getByClient: (clientId) => api.get(`/article-ideas/client/${clientId}`),
  
  // Get ideas for a project
  getByProject: (projectId) => api.get(`/article-ideas/project/${projectId}`),
  
  // Generate full article from an idea
  generateArticle: (ideaId, projectId) => 
    api.post(`/article-ideas/${ideaId}/generate-article`, { project_id: projectId }),
  
  // Update idea status
  update: (id, data) => api.patch(`/article-ideas/${id}`, data),
  
  // Delete an idea
  delete: (id) => api.delete(`/article-ideas/${id}`),
  
  // Get trending topics for an industry
  getTrending: (industry, keywords = []) => 
    api.post('/article-ideas/trending', { industry, keywords }),
};

/**
 * SEO Strategy API
 */
export const seoStrategyAPI = {
  // Generate new SEO strategy for a project
  generate: (projectId, clientData = {}, projectData = {}) =>
    api.post('/seo-strategy/generate', { projectId, clientData, projectData }),
  
  // Get strategies for a project
  getByProject: (projectId) => api.get(`/seo-strategy/project/${projectId}`),
  
  // Get specific strategy by ID
  getById: (id) => api.get(`/seo-strategy/${id}`),
  
  // Update strategy
  update: (id, data) => api.put(`/seo-strategy/${id}`, data),
  
  // Delete strategy
  delete: (id) => api.delete(`/seo-strategy/${id}`),
};

/**
 * Google Ads Strategy API
 */
export const googleAdsStrategyAPI = {
  // Generate new Google Ads strategy for a project
  generate: (projectId, clientData = {}, projectData = {}) =>
    api.post('/google-ads-strategy/generate', { projectId, clientData, projectData }),
  
  // Get strategies for a project
  getByProject: (projectId) => api.get(`/google-ads-strategy/project/${projectId}`),
  
  // Get specific strategy by ID
  getById: (id) => api.get(`/google-ads-strategy/${id}`),
  
  // Update strategy
  update: (id, data) => api.put(`/google-ads-strategy/${id}`, data),
  
  // Delete strategy
  delete: (id) => api.delete(`/google-ads-strategy/${id}`),
};

/**
 * Facebook Ads Strategy API
 */
export const facebookAdsStrategyAPI = {
  // Generate new Facebook Ads strategy for a project
  generate: (projectId, clientData = {}, projectData = {}) =>
    api.post('/facebook-ads-strategy/generate', { projectId, clientData, projectData }),
  
  // Get strategies for a project
  getByProject: (projectId) => api.get(`/facebook-ads-strategy/project/${projectId}`),
  
  // Get specific strategy by ID
  getById: (id) => api.get(`/facebook-ads-strategy/${id}`),
  
  // Update strategy
  update: (id, data) => api.put(`/facebook-ads-strategy/${id}`, data),
  
  // Delete strategy
  delete: (id) => api.delete(`/facebook-ads-strategy/${id}`),
};

/**
 * Content Scheduling API
 */
export const schedulingAPI = {
  schedule: (data) => api.post('/scheduling/schedule', data),
  getByProject: (projectId, filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/scheduling/project/${projectId}?${params}`);
  },
  getById: (id) => api.get(`/scheduling/${id}`),
  updateStatus: (id, status, additionalData = {}) =>
    api.put(`/scheduling/${id}/status`, { status, ...additionalData }),
  cancel: (id) => api.post(`/scheduling/${id}/cancel`),
  delete: (id) => api.delete(`/scheduling/${id}`),
};

/**
 * Email Newsletters API
 */
export const emailNewslettersAPI = {
  generate: (projectId, options = {}) =>
    api.post('/email-newsletters/generate', { projectId, ...options }),
  getByProject: (projectId) => api.get(`/email-newsletters/project/${projectId}`),
  getById: (id) => api.get(`/email-newsletters/${id}`),
  update: (id, data) => api.put(`/email-newsletters/${id}`, data),
  delete: (id) => api.delete(`/email-newsletters/${id}`),
};

/**
 * Analytics API
 */
export const analyticsAPI = {
  record: (data) => api.post('/analytics/record', data),
  getByProject: (projectId, dateRange = {}) => {
    const params = new URLSearchParams();
    if (dateRange.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange.endDate) params.append('endDate', dateRange.endDate);
    return api.get(`/analytics/project/${projectId}?${params}`);
  },
  getByClient: (clientId, dateRange = {}) => {
    const params = new URLSearchParams();
    if (dateRange.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange.endDate) params.append('endDate', dateRange.endDate);
    return api.get(`/analytics/client/${clientId}?${params}`);
  },
  getTopContent: (projectId, limit = 10, metric = 'views') =>
    api.get(`/analytics/top-content/${projectId}?limit=${limit}&metric=${metric}`),
  getSummary: (clientId, projectId = null, period = 'monthly') => {
    const params = new URLSearchParams({ clientId, period });
    if (projectId) params.append('projectId', projectId);
    return api.get(`/analytics/summary?${params}`);
  },
  getPlatformBreakdown: (clientId, projectId = null, dateRange = {}) => {
    const params = new URLSearchParams({ clientId });
    if (projectId) params.append('projectId', projectId);
    if (dateRange.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange.endDate) params.append('endDate', dateRange.endDate);
    return api.get(`/analytics/platform-breakdown?${params}`);
  },
};

/**
 * Content Roadmap API
 */
export const contentRoadmapAPI = {
  getByProject: (projectId) => api.get(`/roadmap/${projectId}`),
  reorder: (projectId, articles) => api.put(`/roadmap/${projectId}/reorder`, { articles }),
  generateArticle: (projectId, articleId) => api.post(`/roadmap/${projectId}/generate-article`, { articleId }),
  updateArticle: (projectId, articleId, data) => api.put(`/roadmap/${projectId}/article/${articleId}`, data),
  deleteArticle: (projectId, articleId) => api.delete(`/roadmap/${projectId}/article/${articleId}`),
};

/**
 * Dashboard API
 */
export const dashboardAPI = {
  getByProject: (projectId) => api.get(`/dashboard/${projectId}`),
};

/**
 * Content Evidence API
 * For generating transparent, evidence-based analysis for content
 */
export const contentEvidenceAPI = {
  // Generate enhanced evidence analysis (90%+ confidence without paid APIs)
  generate: (params) => api.post('/content-evidence/generate', params),
  
  // Get evidence for existing content
  getByContentId: (contentId) => api.get(`/content-evidence/${contentId}`),
};

/**
 * Shopify Store API
 * For connecting and analyzing Shopify stores
 */
export const shopifyAPI = {
  // Connect Shopify store
  connect: (clientId, storeUrl, accessToken) =>
    api.post('/shopify/connect', { client_id: clientId, store_url: storeUrl, access_token: accessToken }),
  
  // Get store connection for client
  getStore: (clientId) => api.get(`/shopify/stores/${clientId}`),
  
  // Run store analysis
  analyze: (clientId, options = {}) =>
    api.post(`/shopify/analyze/${clientId}`, { options }),
  
  // Get analysis history
  getAnalyses: (clientId, limit = 10) =>
    api.get(`/shopify/analyses/${clientId}?limit=${limit}`),
  
  // Get specific analysis
  getAnalysis: (analysisId) => api.get(`/shopify/analysis/${analysisId}`),
};

/**
 * Local SEO API
 * For local businesses (dentists, plumbers, salons, etc.)
 */
export const localSeoAPI = {
  // Generate local SEO analysis
  analyze: (clientId, projectId, location, websiteUrl) =>
    api.post('/local-seo/analyze', { clientId, projectId, location, websiteUrl }),
  
  // Generate local schema markup
  generateSchema: (schemaData) =>
    api.post('/local-seo/schema', schemaData),
};

/**
 * API Connections API
 * For managing Google, Facebook, and other API connections
 */
export const connectionsAPI = {
  // Get all connections
  getAll: () => api.get('/connections'),
  
  // Get specific connection
  getById: (id) => api.get(`/connections/${id}`),
  
  // Get all active connections (for assignment to clients)
  getAllAvailable: () => api.get('/connections/all-available'),
  
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

export default api;

