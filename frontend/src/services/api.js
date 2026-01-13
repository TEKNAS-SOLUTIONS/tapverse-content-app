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

export default api;

