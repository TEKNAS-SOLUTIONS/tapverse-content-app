import React, { useState, useEffect } from 'react';

// Available services that can be subscribed
const AVAILABLE_SERVICES = [
  { id: 'seo_content', label: 'SEO Content', description: 'Blog posts, articles, landing pages' },
  { id: 'social_media', label: 'Social Media', description: 'LinkedIn, Twitter, Instagram, TikTok posts' },
  { id: 'google_ads', label: 'Google Ads', description: 'Search & Display ad copy' },
  { id: 'facebook_ads', label: 'Facebook/Instagram Ads', description: 'Social ad campaigns' },
  { id: 'ai_content', label: 'AI Content Generation', description: 'Claude-powered content creation' },
  { id: 'ai_video', label: 'AI Video', description: 'HeyGen AI avatar videos' },
  { id: 'voiceover', label: 'Voiceover', description: 'ElevenLabs voice generation' },
  { id: 'email_marketing', label: 'Email Marketing', description: 'Email campaigns & sequences' },
];

const BRAND_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'playful', label: 'Playful' },
];

function ClientForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    // Basic Info
    tapverse_client_id: '',
    company_name: '',
    website_url: '',
    industry: '',
    target_audience: '',
    unique_selling_points: '',
    // Competitors (at client level)
    competitors: [],
    // Subscribed Services
    subscribed_services: [],
    // Brand & Content
    brand_voice: '',
    brand_tone: 'professional',
    content_guidelines: '',
    sample_content: '',
    // Platform IDs - Google
    google_ads_customer_id: '',
    google_search_console_property: '',
    google_analytics_property_id: '',
    // Platform IDs - Facebook/Meta
    facebook_ad_account_id: '',
    facebook_page_id: '',
    instagram_account_id: '',
    // Platform IDs - LinkedIn
    linkedin_page_id: '',
    linkedin_ad_account_id: '',
    // Platform IDs - Twitter
    twitter_handle: '',
    // Platform IDs - TikTok
    tiktok_account_id: '',
  });
  const [competitorInput, setCompetitorInput] = useState('');

  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        subscribed_services: initialData.subscribed_services || [],
        competitors: initialData.competitors || [],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => {
      const services = prev.subscribed_services || [];
      if (services.includes(serviceId)) {
        return {
          ...prev,
          subscribed_services: services.filter((s) => s !== serviceId),
        };
      } else {
        return {
          ...prev,
          subscribed_services: [...services, serviceId],
        };
      }
    });
  };

  const handleAddCompetitor = () => {
    if (competitorInput.trim()) {
      // Validate URL format
      let url = competitorInput.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      setFormData((prev) => ({
        ...prev,
        competitors: [...(prev.competitors || []), url],
      }));
      setCompetitorInput('');
    }
  };

  const handleRemoveCompetitor = (index) => {
    setFormData((prev) => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.tapverse_client_id.trim()) {
      newErrors.tapverse_client_id = 'Tapverse Client ID is required';
    }
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company Name is required';
    }
    if (formData.subscribed_services.length === 0) {
      newErrors.subscribed_services = 'At least one service must be selected';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Switch to the section with errors
      if (newErrors.tapverse_client_id || newErrors.company_name) {
        setActiveSection('basic');
      } else if (newErrors.subscribed_services) {
        setActiveSection('services');
      }
      return;
    }

    onSubmit(formData);
  };

  const sections = [
    { id: 'basic', label: '📋 Basic Info' },
    { id: 'services', label: '⚡ Services' },
    { id: 'brand', label: '🎨 Brand & Content' },
    { id: 'platforms', label: '🔗 Platform IDs' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section Tabs */}
      <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-600'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Basic Info Section */}
      {activeSection === 'basic' && (
        <div className="bg-gray-700 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tapverse_client_id" className="block text-sm font-medium text-gray-300">
                Tapverse Client ID *
              </label>
              <input
                type="text"
                id="tapverse_client_id"
                name="tapverse_client_id"
                value={formData.tapverse_client_id}
                onChange={handleChange}
                placeholder="e.g., TC-001"
                className={`mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.tapverse_client_id ? 'border-red-500' : ''
                }`}
              />
              {errors.tapverse_client_id && (
                <p className="mt-1 text-sm text-red-400">{errors.tapverse_client_id}</p>
              )}
            </div>

            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-300">
                Company Name *
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.company_name ? 'border-red-500' : ''
                }`}
              />
              {errors.company_name && (
                <p className="mt-1 text-sm text-red-400">{errors.company_name}</p>
              )}
            </div>

            <div>
              <label htmlFor="website_url" className="block text-sm font-medium text-gray-300">
                Website URL
              </label>
              <input
                type="url"
                id="website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                placeholder="https://example.com"
                className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-300">
                Industry
              </label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="e.g., Technology, Healthcare, Finance"
                className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="target_audience" className="block text-sm font-medium text-gray-300">
              Target Audience
            </label>
            <textarea
              id="target_audience"
              name="target_audience"
              value={formData.target_audience}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the client's ideal customer demographics, interests, pain points..."
              className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="unique_selling_points" className="block text-sm font-medium text-gray-300">
              Unique Selling Points
            </label>
            <textarea
              id="unique_selling_points"
              name="unique_selling_points"
              value={formData.unique_selling_points}
              onChange={handleChange}
              rows={3}
              placeholder="What makes this client different from competitors?"
              className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Competitors Section */}
          <div className="mt-6 pt-6 border-t border-gray-600">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🎯 Competitors (URLs for analysis)
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Add competitor websites to analyze for content gaps and ideas
            </p>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCompetitor())}
                placeholder="https://competitor-website.com"
                className="flex-1 rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCompetitor}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + Add
              </button>
            </div>
            
            {formData.competitors && formData.competitors.length > 0 && (
              <div className="space-y-2">
                {formData.competitors.map((competitor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-600/50 rounded-lg px-3 py-2"
                  >
                    <span className="text-gray-200 text-sm truncate flex-1">{competitor}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetitor(index)}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services Section */}
      {activeSection === 'services' && (
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Subscribed Services *</h3>
          {errors.subscribed_services && (
            <p className="mb-4 text-sm text-red-400">{errors.subscribed_services}</p>
          )}
          <p className="text-gray-400 text-sm mb-4">Select the services this client has access to:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_SERVICES.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceToggle(service.id)}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  formData.subscribed_services.includes(service.id)
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.subscribed_services.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded bg-gray-600"
                  />
                  <span className="ml-3 text-white font-medium">{service.label}</span>
                </div>
                <p className="mt-1 ml-7 text-sm text-gray-400">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brand & Content Section */}
      {activeSection === 'brand' && (
        <div className="bg-gray-700 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Brand & Content Guidelines</h3>
          <p className="text-gray-400 text-sm mb-4">
            These settings help AI generate consistent, on-brand content for this client.
          </p>

          <div>
            <label htmlFor="brand_tone" className="block text-sm font-medium text-gray-300">
              Brand Tone
            </label>
            <select
              id="brand_tone"
              name="brand_tone"
              value={formData.brand_tone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {BRAND_TONES.map((tone) => (
                <option key={tone.value} value={tone.value}>
                  {tone.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="brand_voice" className="block text-sm font-medium text-gray-300">
              Brand Voice Guidelines
            </label>
            <textarea
              id="brand_voice"
              name="brand_voice"
              value={formData.brand_voice}
              onChange={handleChange}
              rows={4}
              placeholder="Describe how the brand should 'sound'. E.g., 'Speak like a knowledgeable friend, use simple language, avoid jargon, be encouraging but not pushy...'"
              className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="content_guidelines" className="block text-sm font-medium text-gray-300">
              Content Do's & Don'ts
            </label>
            <textarea
              id="content_guidelines"
              name="content_guidelines"
              value={formData.content_guidelines}
              onChange={handleChange}
              rows={4}
              placeholder="DO: Use data-driven insights, mention customer success stories&#10;DON'T: Use competitor names, make unverified claims, use ALL CAPS..."
              className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="sample_content" className="block text-sm font-medium text-gray-300">
              Sample Content (for AI learning)
            </label>
            <textarea
              id="sample_content"
              name="sample_content"
              value={formData.sample_content}
              onChange={handleChange}
              rows={6}
              placeholder="Paste examples of existing content that represents the client's ideal voice and style. This helps AI understand the desired output."
              className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Platform IDs Section */}
      {activeSection === 'platforms' && (
        <div className="bg-gray-700 p-6 rounded-lg space-y-6">
          <h3 className="text-lg font-semibold text-white mb-2">Platform Integration IDs</h3>
          <p className="text-gray-400 text-sm mb-4">
            These are the client's account IDs within Tapverse's master accounts. Leave blank if not applicable.
          </p>

          {/* Google Ads */}
          <div className="bg-gray-600/50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-white mb-3 flex items-center">
              <span className="mr-2">🔍</span> Google Ads
            </h4>
            <div>
              <label htmlFor="google_ads_customer_id" className="block text-sm font-medium text-gray-300">
                Customer ID (under Tapverse MCC)
              </label>
              <input
                type="text"
                id="google_ads_customer_id"
                name="google_ads_customer_id"
                value={formData.google_ads_customer_id}
                onChange={handleChange}
                placeholder="XXX-XXX-XXXX"
                className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Facebook/Meta */}
          <div className="bg-gray-600/50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-white mb-3 flex items-center">
              <span className="mr-2">📘</span> Facebook / Meta
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="facebook_ad_account_id" className="block text-sm font-medium text-gray-300">
                  Ad Account ID
                </label>
                <input
                  type="text"
                  id="facebook_ad_account_id"
                  name="facebook_ad_account_id"
                  value={formData.facebook_ad_account_id}
                  onChange={handleChange}
                  placeholder="act_XXXXXXXXXX"
                  className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="facebook_page_id" className="block text-sm font-medium text-gray-300">
                  Page ID
                </label>
                <input
                  type="text"
                  id="facebook_page_id"
                  name="facebook_page_id"
                  value={formData.facebook_page_id}
                  onChange={handleChange}
                  placeholder="Page ID"
                  className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Instagram */}
          <div className="bg-gray-600/50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-white mb-3 flex items-center">
              <span className="mr-2">📸</span> Instagram
            </h4>
            <div>
              <label htmlFor="instagram_account_id" className="block text-sm font-medium text-gray-300">
                Business Account ID
              </label>
              <input
                type="text"
                id="instagram_account_id"
                name="instagram_account_id"
                value={formData.instagram_account_id}
                onChange={handleChange}
                placeholder="Instagram Business Account ID"
                className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div className="bg-gray-600/50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-white mb-3 flex items-center">
              <span className="mr-2">💼</span> LinkedIn
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="linkedin_page_id" className="block text-sm font-medium text-gray-300">
                  Company Page ID
                </label>
                <input
                  type="text"
                  id="linkedin_page_id"
                  name="linkedin_page_id"
                  value={formData.linkedin_page_id}
                  onChange={handleChange}
                  placeholder="Company Page ID"
                  className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="linkedin_ad_account_id" className="block text-sm font-medium text-gray-300">
                  Ad Account ID
                </label>
                <input
                  type="text"
                  id="linkedin_ad_account_id"
                  name="linkedin_ad_account_id"
                  value={formData.linkedin_ad_account_id}
                  onChange={handleChange}
                  placeholder="LinkedIn Ad Account ID"
                  className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Twitter */}
          <div className="bg-gray-600/50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-white mb-3 flex items-center">
              <span className="mr-2">🐦</span> Twitter / X
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="twitter_handle" className="block text-sm font-medium text-gray-300">
                  Handle
                </label>
                <input
                  type="text"
                  id="twitter_handle"
                  name="twitter_handle"
                  value={formData.twitter_handle}
                  onChange={handleChange}
                  placeholder="@username"
                  className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="twitter_account_id" className="block text-sm font-medium text-gray-300">
                  Account ID
                </label>
                <input
                  type="text"
                  id="twitter_account_id"
                  name="twitter_account_id"
                  value={formData.twitter_account_id}
                  onChange={handleChange}
                  placeholder="Twitter Account ID"
                  className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* TikTok */}
          <div className="bg-gray-600/50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-white mb-3 flex items-center">
              <span className="mr-2">🎵</span> TikTok
            </h4>
            <div>
              <label htmlFor="tiktok_account_id" className="block text-sm font-medium text-gray-300">
                Business Account ID
              </label>
              <input
                type="text"
                id="tiktok_account_id"
                name="tiktok_account_id"
                value={formData.tiktok_account_id}
                onChange={handleChange}
                placeholder="TikTok Business Account ID"
                className="mt-1 block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          {activeSection !== 'platforms' && (
            <button
              type="button"
              onClick={() => {
                const currentIndex = sections.findIndex((s) => s.id === activeSection);
                if (currentIndex < sections.length - 1) {
                  setActiveSection(sections[currentIndex + 1].id);
                }
              }}
              className="text-blue-400 hover:text-blue-300"
            >
              Next: {sections[sections.findIndex((s) => s.id === activeSection) + 1]?.label} →
            </button>
          )}
        </div>
        <div className="flex space-x-3">
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
            💾 Save Client
          </button>
        </div>
      </div>
    </form>
  );
}

export default ClientForm;
