import React, { useState, useEffect } from 'react';

// Available project types (content to generate)
const PROJECT_TYPES = [
  { id: 'seo', label: 'SEO Content', icon: '📝', description: 'Blog posts, articles, landing pages' },
  { id: 'local_seo', label: 'Local SEO', icon: '📍', description: 'Local search optimization, Google My Business, local citations' },
  { id: 'social', label: 'Social Media', icon: '📱', description: 'Posts for LinkedIn, Twitter, Instagram, TikTok' },
  { id: 'google_ads', label: 'Google Ads', icon: '🔍', description: 'Search & Display ad copy' },
  { id: 'facebook_ads', label: 'Facebook/Instagram Ads', icon: '📘', description: 'Social media ad campaigns' },
  { id: 'ai_content', label: 'AI Content', icon: '🤖', description: 'General AI-generated content' },
  { id: 'ai_video', label: 'AI Video', icon: '🎬', description: 'HeyGen avatar videos with ElevenLabs voice' },
  { id: 'social_creative', label: 'Social Creatives', icon: '🎨', description: 'AI-generated marketing images (Leonardo.ai)' },
  { id: 'email', label: 'Email Marketing', icon: '✉️', description: 'Email campaigns & sequences' },
];

const CONTENT_PREFERENCES = [
  { value: 'professional', label: 'Professional', description: 'Formal business tone' },
  { value: 'casual', label: 'Casual', description: 'Relaxed, conversational' },
  { value: 'technical', label: 'Technical', description: 'Detailed, expert-level' },
  { value: 'creative', label: 'Creative', description: 'Engaging, storytelling' },
];

function ProjectForm({ onSubmit, onCancel, initialData = null, clients = [] }) {
  const [formData, setFormData] = useState({
    client_id: '',
    project_name: '',
    project_types: [], // Array of selected types
    keywords: [],
    competitors: [],
    target_audience: '',
    unique_angle: '',
    content_preferences: 'professional',
    status: 'draft',
  });

  const [keywordsInput, setKeywordsInput] = useState('');
  const [competitorsInput, setCompetitorsInput] = useState('');
  const [errors, setErrors] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    if (initialData) {
      // Handle both old project_type and new project_types
      const projectTypes = initialData.project_types || 
        (initialData.project_type ? [initialData.project_type] : []);
      
      setFormData({
        ...initialData,
        project_types: projectTypes,
      });
      setKeywordsInput(initialData.keywords?.join(', ') || '');
      setCompetitorsInput(initialData.competitors?.join(', ') || '');
      
      // Find the selected client
      const client = clients.find(c => c.id === initialData.client_id);
      setSelectedClient(client);
    }
  }, [initialData, clients]);

  // Auto-populate competitors from client when client changes (for new projects)
  useEffect(() => {
    if (selectedClient && !initialData) {
      // Only auto-populate for new projects, not when editing
      const clientCompetitors = selectedClient.competitors || [];
      if (clientCompetitors.length > 0 && formData.competitors.length === 0) {
        setFormData(prev => ({
          ...prev,
          competitors: clientCompetitors,
        }));
        setCompetitorsInput(clientCompetitors.join(', '));
      }
    }
  }, [selectedClient, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // When client changes, update selectedClient
    if (name === 'client_id') {
      const client = clients.find(c => c.id === value);
      setSelectedClient(client);
    }
    
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleProjectTypeToggle = (typeId) => {
    setFormData((prev) => {
      const types = prev.project_types || [];
      if (types.includes(typeId)) {
        return {
          ...prev,
          project_types: types.filter((t) => t !== typeId),
        };
      } else {
        return {
          ...prev,
          project_types: [...types, typeId],
        };
      }
    });
    
    if (errors.project_types) {
      setErrors((prev) => ({
        ...prev,
        project_types: '',
      }));
    }
  };

  const handleKeywordsChange = (e) => {
    const value = e.target.value;
    setKeywordsInput(value);
    const keywords = value.split(',').map((k) => k.trim()).filter((k) => k);
    setFormData((prev) => ({
      ...prev,
      keywords,
    }));
  };

  const handleCompetitorsChange = (e) => {
    const value = e.target.value;
    setCompetitorsInput(value);
    const competitors = value.split(',').map((c) => c.trim()).filter((c) => c);
    setFormData((prev) => ({
      ...prev,
      competitors,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.client_id) {
      newErrors.client_id = 'Client is required';
    }
    if (!formData.project_name.trim()) {
      newErrors.project_name = 'Project Name is required';
    }
    if (!formData.project_types || formData.project_types.length === 0) {
      newErrors.project_types = 'At least one content type must be selected';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Include project_type for backward compatibility
    const submitData = {
      ...formData,
      project_type: formData.project_types[0] || null,
    };

    onSubmit(submitData);
  };

  // Filter project types based on client's subscribed services
  const getAvailableProjectTypes = () => {
    if (!selectedClient || !selectedClient.subscribed_services) {
      return PROJECT_TYPES;
    }
    
    const serviceToTypes = {
      'seo_content': ['seo'],
      'social_media': ['social'],
      'google_ads': ['google_ads'],
      'facebook_ads': ['facebook_ads'],
      'ai_content': ['ai_content'],
      'ai_video': ['ai_video'],
      'social_creative': ['social_creative'],
      'email_marketing': ['email'],
    };
    
    const availableTypes = new Set();
    selectedClient.subscribed_services.forEach(service => {
      const types = serviceToTypes[service] || [];
      types.forEach(t => availableTypes.add(t));
    });
    
    // If no services defined, show all types
    if (availableTypes.size === 0) {
      return PROJECT_TYPES;
    }
    
    return PROJECT_TYPES.filter(pt => availableTypes.has(pt.id));
  };

  const availableProjectTypes = getAvailableProjectTypes();

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
      {/* Client & Project Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="client_id" className="block text-sm font-medium text-gray-300">
            Client *
          </label>
          <select
            id="client_id"
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.client_id ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company_name} ({client.tapverse_client_id})
              </option>
            ))}
          </select>
          {errors.client_id && (
            <p className="mt-1 text-sm text-red-400">{errors.client_id}</p>
          )}
        </div>

        <div>
          <label htmlFor="project_name" className="block text-sm font-medium text-gray-300">
            Project Name *
          </label>
          <input
            type="text"
            id="project_name"
            name="project_name"
            value={formData.project_name}
            onChange={handleChange}
            placeholder="e.g., Q1 2026 Content Campaign"
            className={`mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.project_name ? 'border-red-500' : ''
            }`}
          />
          {errors.project_name && (
            <p className="mt-1 text-sm text-red-400">{errors.project_name}</p>
          )}
        </div>
      </div>

      {/* Selected Client Info */}
      {selectedClient && (
        <div className="bg-gray-700/50 p-3 rounded-lg">
          <div className="text-sm text-gray-400">
            <span className="font-medium text-gray-300">{selectedClient.company_name}</span>
            {selectedClient.industry && <span> • {selectedClient.industry}</span>}
            {selectedClient.subscribed_services && selectedClient.subscribed_services.length > 0 && (
              <div className="mt-1">
                Services: {selectedClient.subscribed_services.map(s => 
                  <span key={s} className="inline-block bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded mr-1">
                    {s.replace('_', ' ')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Types (Multi-select) */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Content Types to Generate *
        </label>
        {errors.project_types && (
          <p className="mb-2 text-sm text-red-400">{errors.project_types}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableProjectTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleProjectTypeToggle(type.id)}
              className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                formData.project_types.includes(type.id)
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.project_types.includes(type.id)}
                  onChange={() => handleProjectTypeToggle(type.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded bg-gray-600"
                />
                <span className="ml-2 text-lg">{type.icon}</span>
                <span className="ml-2 text-white font-medium">{type.label}</span>
              </div>
              <p className="mt-1 ml-8 text-xs text-gray-400">{type.description}</p>
            </div>
          ))}
        </div>
        {availableProjectTypes.length === 0 && (
          <p className="text-yellow-400 text-sm">
            No content types available. Please ensure the client has subscribed services configured.
          </p>
        )}
      </div>

      {/* Keywords & Competitors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-300">
            Target Keywords (comma-separated)
          </label>
          <input
            type="text"
            id="keywords"
            name="keywords"
            value={keywordsInput}
            onChange={handleKeywordsChange}
            placeholder="SEO, content marketing, digital marketing"
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {formData.keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {formData.keywords.map((kw, idx) => (
                <span key={idx} className="bg-gray-600 text-gray-200 text-xs px-2 py-1 rounded">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="competitors" className="block text-sm font-medium text-gray-300">
            Competitor URLs (comma-separated)
          </label>
          <input
            type="text"
            id="competitors"
            name="competitors"
            value={competitorsInput}
            onChange={handleCompetitorsChange}
            placeholder="https://competitor1.com, https://competitor2.com"
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {selectedClient?.competitors?.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Client competitors (auto-loaded):</p>
              <div className="flex flex-wrap gap-1">
                {selectedClient.competitors.map((comp, idx) => (
                  <span key={idx} className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          )}
          {formData.competitors.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Project competitors:</p>
              <div className="flex flex-wrap gap-1">
                {formData.competitors.map((comp, idx) => (
                  <span key={idx} className="bg-gray-600 text-gray-200 text-xs px-2 py-1 rounded flex items-center gap-1">
                    {comp}
                    <button
                      type="button"
                      onClick={() => {
                        const newCompetitors = formData.competitors.filter((_, i) => i !== idx);
                        setFormData(prev => ({ ...prev, competitors: newCompetitors }));
                        setCompetitorsInput(newCompetitors.join(', '));
                      }}
                      className="text-gray-400 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Target Audience & Unique Angle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="target_audience" className="block text-sm font-medium text-gray-300">
            Target Audience (Project-specific)
          </label>
          <textarea
            id="target_audience"
            name="target_audience"
            value={formData.target_audience}
            onChange={handleChange}
            rows={3}
            placeholder="Override or add to client's target audience for this specific project..."
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="unique_angle" className="block text-sm font-medium text-gray-300">
            Unique Angle for This Project
          </label>
          <textarea
            id="unique_angle"
            name="unique_angle"
            value={formData.unique_angle}
            onChange={handleChange}
            rows={3}
            placeholder="What's special about this campaign? Key messaging, seasonal theme, product launch..."
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content Preferences */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Content Style
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CONTENT_PREFERENCES.map((pref) => (
            <label
              key={pref.value}
              className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                formData.content_preferences === pref.value
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="content_preferences"
                  value={pref.value}
                  checked={formData.content_preferences === pref.value}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 bg-gray-600"
                />
                <span className="ml-2 text-white font-medium">{pref.label}</span>
              </div>
              <p className="mt-1 ml-6 text-xs text-gray-400">{pref.description}</p>
            </label>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          💾 Save Project
        </button>
      </div>
    </form>
  );
}

export default ProjectForm;
