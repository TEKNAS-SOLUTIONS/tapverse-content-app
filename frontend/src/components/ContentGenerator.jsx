import React, { useState, useEffect } from 'react';
import { contentAPI, videoAPI, imagesAPI } from '../services/api';

const CONTENT_TYPE_CONFIG = {
  seo: {
    label: 'SEO Blog Post',
    icon: '📝',
    endpoint: 'blog',
    description: 'Long-form SEO-optimized article',
  },
  social: {
    label: 'Social Media',
    icon: '📱',
    endpoint: 'linkedin',
    description: 'LinkedIn, Twitter, Instagram posts',
  },
  google_ads: {
    label: 'Google Ads',
    icon: '🔍',
    endpoint: 'google-ads',
    description: 'Search & Display ad copy',
  },
  facebook_ads: {
    label: 'Facebook Ads',
    icon: '📘',
    endpoint: 'facebook-ads',
    description: 'Facebook/Instagram ad copy',
  },
  ai_content: {
    label: 'AI Content',
    icon: '🤖',
    endpoint: 'blog',
    description: 'General AI-generated content',
  },
  ai_video: {
    label: 'AI Video',
    icon: '🎬',
    endpoint: 'video',
    description: 'HeyGen AI avatar video',
    isVideo: true,
  },
  video: {
    label: 'Video Script',
    icon: '🎬',
    endpoint: 'video',
    description: 'AI avatar video script',
    isVideo: true,
  },
  email: {
    label: 'Email',
    icon: '✉️',
    endpoint: 'blog',
    description: 'Email marketing content',
  },
  social_creative: {
    label: 'Social Creatives',
    icon: '🎨',
    endpoint: 'image',
    description: 'AI-generated marketing images',
    isImage: true,
  },
};

const VIDEO_DURATION_OPTIONS = [
  { value: '30', label: '30 seconds', description: 'Quick intro or teaser' },
  { value: '60', label: '1 minute', description: 'Standard social video' },
  { value: '90', label: '1.5 minutes', description: 'Detailed explainer' },
  { value: '120', label: '2 minutes', description: 'In-depth presentation' },
  { value: '180', label: '3 minutes', description: 'Comprehensive overview' },
];

const IMAGE_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'google_ads', label: 'Google Ads', icon: '🔍' },
];

const IMAGE_CONTENT_TYPES = {
  instagram: ['post', 'story', 'reel', 'ad'],
  facebook: ['post', 'story', 'ad', 'cover'],
  linkedin: ['post', 'ad', 'cover'],
  twitter: ['post', 'ad', 'cover'],
  tiktok: ['post', 'ad'],
  google_ads: ['display', 'square', 'skyscraper'],
};

const IMAGE_STYLES = [
  { value: 'modern', label: 'Modern & Clean' },
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'vibrant', label: 'Vibrant & Bold' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'professional', label: 'Corporate/Professional' },
  { value: 'artistic', label: 'Artistic' },
];

const IMAGE_MOODS = [
  { value: 'professional', label: 'Professional' },
  { value: 'inspiring', label: 'Inspiring' },
  { value: 'fun', label: 'Fun & Playful' },
  { value: 'urgent', label: 'Urgent/Action' },
  { value: 'calm', label: 'Calm & Trustworthy' },
  { value: 'luxury', label: 'Luxury & Premium' },
];

// Toast notification component
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Handle both string and object formats
  const messageText = typeof message === 'string' ? message : (message?.message || '');
  const toastType = typeof message === 'object' ? message?.type || 'success' : 'success';
  const bgColor = toastType === 'success' ? 'bg-green-600' : toastType === 'error' ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className={`fixed bottom-6 right-6 ${bgColor} text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-2 z-50 animate-slide-up`}>
      <span className="text-lg">{toastType === 'success' ? '✓' : toastType === 'error' ? '✕' : 'ℹ'}</span>
      <span className="font-medium">{messageText}</span>
    </div>
  );
}

// Copy button component with feedback
function CopyButton({ text, label = 'Copy', size = 'md' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <button
      onClick={handleCopy}
      className={`${sizeClasses[size]} ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
      } rounded-md font-medium transition-all duration-200 flex items-center gap-1.5`}
    >
      {copied ? (
        <>
          <span>✓</span>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <span>📋</span>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// Helper to render inline markdown (bold, italic)
function renderInlineMarkdown(text) {
  if (!text) return text;
  
  // Split by bold markers and create elements
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={i} className="font-semibold text-gray-900">{boldText}</strong>;
    }
    return part;
  });
}

// Markdown-like content renderer
function ContentRenderer({ content }) {
  // Parse and render content with proper formatting
  const renderFormattedContent = (text) => {
    if (!text) return null;

    // Split by lines and process
    const lines = text.split('\n');
    const elements = [];
    let currentParagraph = [];
    let inList = false;
    let listItems = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const joinedText = currentParagraph.join(' ');
        elements.push(
          <p key={elements.length} className="text-gray-700 leading-relaxed mb-4">
            {renderInlineMarkdown(joinedText)}
          </p>
        );
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={elements.length} className="list-disc list-inside space-y-2 mb-4 text-gray-700 ml-4">
            {listItems.map((item, i) => (
              <li key={i} className="leading-relaxed">{renderInlineMarkdown(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Skip frontmatter
      if (trimmedLine === '---') return;
      if (trimmedLine.startsWith('title:') || trimmedLine.startsWith('metaDescription:') || trimmedLine.startsWith('keywords:')) return;

      // Headers
      if (trimmedLine.startsWith('### ')) {
        flushParagraph();
        flushList();
        elements.push(
          <h4 key={elements.length} className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {renderInlineMarkdown(trimmedLine.slice(4))}
          </h4>
        );
        return;
      }

      if (trimmedLine.startsWith('## ')) {
        flushParagraph();
        flushList();
        elements.push(
          <h3 key={elements.length} className="text-xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-300">
            {renderInlineMarkdown(trimmedLine.slice(3))}
          </h3>
        );
        return;
      }

      if (trimmedLine.startsWith('# ')) {
        flushParagraph();
        flushList();
        elements.push(
          <h2 key={elements.length} className="text-2xl font-bold text-gray-900 mt-6 mb-4">
            {renderInlineMarkdown(trimmedLine.slice(2))}
          </h2>
        );
        return;
      }

      // List items
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.match(/^\d+\.\s/)) {
        flushParagraph();
        if (!inList) inList = true;
        const itemText = trimmedLine.replace(/^[-*]\s|^\d+\.\s/, '');
        listItems.push(itemText);
        return;
      }

      // Empty lines
      if (!trimmedLine) {
        flushParagraph();
        flushList();
        return;
      }

      // Regular paragraph content
      if (inList) {
        flushList();
      }
      currentParagraph.push(trimmedLine);
    });

    flushParagraph();
    flushList();

    return elements;
  };

  return (
    <div className="prose max-w-none text-gray-700">
      {renderFormattedContent(content)}
    </div>
  );
}

function ContentGenerator({ project, client, onContentGenerated }) {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState(null);
  const [generatedContent, setGeneratedContent] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [expandedSections, setExpandedSections] = useState({ content: true });
  const [videoDuration, setVideoDuration] = useState('60');
  const [showVideoOptions, setShowVideoOptions] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  // Image generation options
  const [imagePlatform, setImagePlatform] = useState('instagram');
  const [imageContentType, setImageContentType] = useState('post');
  const [imageStyle, setImageStyle] = useState('modern');
  const [imageMood, setImageMood] = useState('professional');

  const projectTypes = project.project_types || (project.project_type ? [project.project_type] : []);

  // Load HeyGen voices and avatars when video type is selected
  useEffect(() => {
    const hasVideoType = selectedTypes.includes('ai_video') || selectedTypes.includes('video');
    if (hasVideoType) {
      if (voices.length === 0 && !loadingVoices) {
        loadVoices();
      }
      if (avatars.length === 0 && !loadingAvatars) {
        loadAvatars();
      }
    }
  }, [selectedTypes]);

  // Poll for video status when a video is processing
  useEffect(() => {
    const videoContent = generatedContent['ai_video'] || generatedContent['video'];
    if (videoContent?.videoId && videoContent?.videoStatus === 'processing') {
      const pollInterval = setInterval(async () => {
        try {
          const response = await videoAPI.checkStatus(videoContent.videoId);
          if (response.data.success) {
            const status = response.data.data.status;
            if (status === 'completed' || status === 'failed') {
              clearInterval(pollInterval);
              setGeneratedContent(prev => ({
                ...prev,
                ['ai_video']: {
                  ...prev['ai_video'] || prev['video'],
                  videoStatus: status,
                  videoUrl: response.data.data.video_url,
                  thumbnailUrl: response.data.data.thumbnail_url,
                }
              }));
              if (status === 'completed') {
                setToast({ type: 'success', message: 'Video is ready! 🎉' });
              } else {
                setToast({ type: 'error', message: 'Video creation failed. Please try again.' });
              }
            }
          }
        } catch (err) {
          console.error('Error checking video status:', err);
        }
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(pollInterval);
    }
  }, [generatedContent]);

  const loadVoices = async () => {
    setLoadingVoices(true);
    try {
      const response = await videoAPI.getVoices();
      if (response.data.success) {
        setVoices(response.data.data || []);
        // Select first voice by default
        if (response.data.data?.length > 0) {
          setSelectedVoice(response.data.data[0].voice_id);
        }
      }
    } catch (err) {
      console.error('Failed to load voices:', err);
      // Set default voices if API fails
      setVoices([
        { voice_id: 'default', name: 'Default Voice' },
      ]);
    } finally {
      setLoadingVoices(false);
    }
  };

  const loadAvatars = async () => {
    setLoadingAvatars(true);
    try {
      const response = await videoAPI.getAvatars();
      if (response.data.success) {
        setAvatars(response.data.data || []);
        if (response.data.data?.length > 0) {
          setSelectedAvatar(response.data.data[0].avatar_id);
        }
      }
    } catch (err) {
      console.error('Failed to load avatars:', err);
      setAvatars([
        { avatar_id: 'default', avatar_name: 'Default Avatar' },
      ]);
    } finally {
      setLoadingAvatars(false);
    }
  };

  useEffect(() => {
    setSelectedTypes([...projectTypes]);
    if (projectTypes.length > 0) {
      setActiveTab(projectTypes[0]);
    }
    loadExistingContent();
  }, [project]);

  const loadExistingContent = async () => {
    try {
      const response = await contentAPI.getByProject(project.id);
      if (response.data.success && response.data.data.length > 0) {
        const contentByType = {};
        response.data.data.forEach((item) => {
          const typeMap = {
            'blog': 'seo',
            'linkedin': 'social',
            'google_ads': 'google_ads',
            'facebook_ads': 'facebook_ads',
            'video_script': 'ai_video', // Map video_script to ai_video for display
            'ai_video': 'ai_video',
            'video': 'ai_video',
          };
          const projectType = typeMap[item.content_type] || item.content_type;
          if (!contentByType[projectType]) {
            contentByType[projectType] = item;
          }
        });
        setGeneratedContent(contentByType);
        const firstWithContent = projectTypes.find(t => contentByType[t]);
        if (firstWithContent) {
          setActiveTab(firstWithContent);
        }
      }
    } catch (err) {
      console.error('Error loading existing content:', err);
    }
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  };

  const handleGenerateAll = async () => {
    if (selectedTypes.length === 0) {
      setError('Please select at least one content type');
      return;
    }

    setGenerating(true);
    setError(null);
    const results = {};

    for (const type of selectedTypes) {
      try {
        setGeneratingType(type);
        const content = await generateContent(type);
        results[type] = content;
      } catch (err) {
        results[type] = { error: err.message };
      }
    }

    setGeneratedContent(results);
    setGenerating(false);
    setGeneratingType(null);
    
    const firstSuccess = selectedTypes.find((t) => results[t] && !results[t].error);
    if (firstSuccess) {
      setActiveTab(firstSuccess);
    }

    if (onContentGenerated) {
      onContentGenerated();
    }
  };

  const generateContent = async (type) => {
    const config = CONTENT_TYPE_CONFIG[type];
    if (!config) {
      throw new Error(`Unknown content type: ${type}`);
    }

    // Handle video types separately
    if (config.isVideo || type === 'ai_video' || type === 'video') {
      const response = await videoAPI.generateScript(project.id, parseInt(videoDuration));
      
      if (response.data.success) {
        return {
          ...response.data.data,
          isVideo: true,
          duration: videoDuration,
        };
      } else {
        throw new Error(response.data.error || 'Video script generation failed');
      }
    }

    // Handle image/creative types separately
    if (config.isImage || type === 'social_creative') {
      const response = await imagesAPI.generateSocialCreative({
        platform: imagePlatform || 'instagram',
        contentType: imageContentType || 'post',
        topic: project.project_name,
        brandColors: client?.brand_colors || '',
        style: imageStyle || 'modern',
        mood: imageMood || 'professional',
        includeText: false,
        targetAudience: project.target_audience || client?.target_audience || '',
        preferredApi: 'leonardo',
        numVariations: 4,
        clientId: client?.id,
      });
      
      if (response.data.success) {
        return {
          ...response.data.data,
          isImage: true,
          platform: imagePlatform,
        };
      } else {
        throw new Error(response.data.error || 'Image generation failed');
      }
    }

    const payload = {
      project_id: project.id,
      client_id: project.client_id,
      topic: project.project_name,
      keywords: project.keywords || [],
      target_audience: project.target_audience || client?.target_audience || '',
      tone: project.content_preferences || client?.brand_tone || 'professional',
      brand_voice: client?.brand_voice || '',
      unique_angle: project.unique_angle || '',
      company_name: client?.company_name || '',
      industry: client?.industry || '',
    };

    const response = await contentAPI.generate(config.endpoint, payload);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Generation failed');
    }
  };

  const handleGenerateSingle = async (type) => {
    setGenerating(true);
    setGeneratingType(type);
    setError(null);

    try {
      const content = await generateContent(type);
      setGeneratedContent((prev) => ({
        ...prev,
        [type]: content,
      }));
      setActiveTab(type);
      setToast('Content generated successfully!');
    } catch (err) {
      setError(`Failed to generate ${CONTENT_TYPE_CONFIG[type]?.label}: ${err.message}`);
    } finally {
      setGenerating(false);
      setGeneratingType(null);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const getPlainText = (content) => {
    if (!content) return '';
    
    let text = '';
    if (content.title) text += content.title + '\n\n';
    if (content.meta_description) text += 'Meta Description: ' + content.meta_description + '\n\n';
    if (content.content) text += content.content;
    
    return text;
  };

  const renderContent = (type) => {
    const content = generatedContent[type];
    if (!content) {
      return (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-4xl mb-4">{CONTENT_TYPE_CONFIG[type]?.icon}</div>
          <p className="text-gray-600 mb-6">No {CONTENT_TYPE_CONFIG[type]?.label} generated yet</p>
          <button
            onClick={() => handleGenerateSingle(type)}
            disabled={generating}
            className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2 mx-auto"
          >
            {generating && generatingType === type ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Generate {CONTENT_TYPE_CONFIG[type]?.label}</span>
              </>
            )}
          </button>
        </div>
      );
    }

    if (content.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 font-medium">Generation Failed</span>
          </div>
          <p className="text-red-600 mb-4">{content.error}</p>
          <button
            onClick={() => handleGenerateSingle(type)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    if (type === 'google_ads' || type === 'facebook_ads') {
      return renderAdsContent(content, type);
    }

    if (type === 'ai_video' || type === 'video' || content.isVideo) {
      return renderVideoContent(content, type);
    }

    if (type === 'social_creative' || content.isImage) {
      return renderImageContent(content, type);
    }

    return renderArticleContent(content, type);
  };

  const renderArticleContent = (content, type) => {
    const wordCount = getWordCount(content.content);
    const plainText = getPlainText(content);

    return (
      <div className="space-y-6">
        {/* Stats Bar */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>📊 {wordCount.toLocaleString()} words</span>
            <span>⏱️ ~{Math.ceil(wordCount / 200)} min read</span>
            <span className="text-green-600">✓ {content.status || 'Ready'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={plainText} label="Copy All" size="md" />
            <button
              onClick={() => handleGenerateSingle(type)}
              disabled={generating}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating && generatingType === type ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Regenerate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Title Section */}
        {content.title && (
          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">SEO Title</span>
                <h3 className="text-2xl font-bold text-gray-900 mt-2 leading-tight">{content.title}</h3>
                <span className="text-xs text-gray-600 mt-2 inline-block">{content.title.length}/60 characters</span>
              </div>
              <CopyButton text={content.title} label="Copy" size="sm" />
            </div>
          </div>
        )}

        {/* Meta Description */}
        {content.meta_description && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Meta Description</span>
                <p className="text-gray-700 mt-2 leading-relaxed">{content.meta_description}</p>
                <span className="text-xs text-gray-600 mt-2 inline-block">{content.meta_description.length}/160 characters</span>
              </div>
              <CopyButton text={content.meta_description} label="Copy" size="sm" />
            </div>
          </div>
        )}

        {/* Keywords */}
        {content.keywords && content.keywords.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Target Keywords</span>
            <div className="flex flex-wrap gap-2 mt-3">
              {content.keywords.map((kw, idx) => (
                <span 
                  key={idx} 
                  className="bg-orange-100 text-orange-700 text-sm px-3 py-1.5 rounded-full border border-orange-200 cursor-pointer hover:bg-orange-200 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(kw);
                    setToast(`Copied: ${kw}`);
                  }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        {content.content && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            {/* Section Header */}
            <div 
              className="flex items-center justify-between p-4 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors border-b border-gray-200"
              onClick={() => toggleSection('content')}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{expandedSections.content ? '📖' : '📕'}</span>
                <span className="font-semibold text-gray-900">Article Content</span>
                <span className="text-sm text-gray-600">({wordCount.toLocaleString()} words)</span>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton text={content.content} label="Copy Content" size="sm" />
                <span className="text-gray-600 text-xl">
                  {expandedSections.content ? '▼' : '▶'}
                </span>
              </div>
            </div>
            
            {/* Content Body */}
            {expandedSections.content && (
              <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar bg-white">
                <ContentRenderer content={content.content} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderImageContent = (content, type) => {
    const images = content.images || [];
    const prompt = content.promptUsed || content.prompt || '';
    const platform = content.platform || imagePlatform;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎨</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Social Media Creatives</h3>
              <span className="text-sm text-gray-600">
                {images.length} variations for {IMAGE_PLATFORMS.find(p => p.value === platform)?.label || platform}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleGenerateSingle(type)}
            disabled={generating}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating && generatingType === type ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Regenerate</span>
              </>
            )}
          </button>
        </div>

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {images.map((image, idx) => (
              <div key={idx} className="bg-white rounded-xl overflow-hidden border border-gray-200 group shadow-sm hover:shadow-md transition-shadow">
                {image.url ? (
                  <img
                    src={image.url}
                    alt={`Creative ${idx + 1}`}
                    className="w-full h-48 object-cover"
                  />
                ) : image.base64 ? (
                  <img
                    src={`data:image/png;base64,${image.base64}`}
                    alt={`Creative ${idx + 1}`}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Variation {idx + 1}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          const url = image.url || `data:image/png;base64,${image.base64}`;
                          window.open(url, '_blank');
                        }}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        🔍 View
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const url = image.url || `data:image/png;base64,${image.base64}`;
                            const response = await fetch(url);
                            const blob = await response.blob();
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(blob);
                            link.download = `creative-${platform}-${idx + 1}.png`;
                            link.click();
                          } catch (e) {
                            console.error('Download failed:', e);
                          }
                        }}
                        className="text-xs px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                      >
                        ⬇️ Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Prompt Used */}
        {prompt && (
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Prompt Used</span>
              </div>
              <CopyButton text={prompt} label="Copy" size="sm" />
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{prompt}</p>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 Next Steps</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Click on any image to view full size</li>
            <li>• Download and add text overlays in Canva or Figma</li>
            <li>• Use consistent colors from your brand palette</li>
            <li>• Regenerate if needed with different style/mood options</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderVideoContent = (content, type) => {
    // Parse script if it's stored as JSON string
    let scriptData = content.script || content;
    if (typeof scriptData === 'string') {
      try {
        scriptData = JSON.parse(scriptData);
      } catch (e) {
        scriptData = { script: scriptData };
      }
    }

    const script = scriptData.script || content.content || '';
    const title = scriptData.title || content.title || 'Video Script';
    const hook = scriptData.hook || '';
    const keyPoints = scriptData.key_points || [];
    const cta = scriptData.call_to_action || '';
    const thumbnail = scriptData.thumbnail_suggestion || '';
    const duration = scriptData.duration_estimate || content.duration || '60 seconds';

    return (
      <div className="space-y-6">
        {/* Video Script Header */}
        <div className="flex items-center justify-between bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎬</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <span className="text-sm text-gray-600">Duration: {duration}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={script} label="Copy Script" size="md" />
            <button
              onClick={() => handleGenerateSingle(type)}
              disabled={generating}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating && generatingType === type ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Regenerate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hook Section */}
        {hook && (
          <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className="text-sm font-semibold text-yellow-700 uppercase tracking-wider">Opening Hook</span>
              </div>
              <CopyButton text={hook} label="Copy" size="sm" />
            </div>
            <p className="text-gray-900 text-lg font-medium italic">"{hook}"</p>
          </div>
        )}

        {/* Full Script */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📜</span>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Full Script</span>
            </div>
            <CopyButton text={script} label="Copy" size="sm" />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-200">
            <pre className="text-gray-700 whitespace-pre-wrap font-sans leading-relaxed text-sm">
              {script.split('[PAUSE]').map((segment, idx, arr) => (
                <span key={idx}>
                  {segment}
                  {idx < arr.length - 1 && (
                    <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded mx-1">⏸ PAUSE</span>
                  )}
                </span>
              ))}
            </pre>
          </div>
        </div>

        {/* Key Points */}
        {keyPoints.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📌</span>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Key Points</span>
            </div>
            <ul className="space-y-2">
              {keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-orange-600 mt-1">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Call to Action */}
        {cta && (
          <div className="bg-green-50 rounded-xl p-5 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">Call to Action</span>
              </div>
              <CopyButton text={cta} label="Copy" size="sm" />
            </div>
            <p className="text-gray-900 font-medium">{cta}</p>
          </div>
        )}

        {/* Thumbnail Suggestion */}
        {thumbnail && (
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🖼️</span>
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Thumbnail Suggestion</span>
            </div>
            <p className="text-gray-700">{thumbnail}</p>
          </div>
        )}

        {/* Create Video Section */}
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🎥</span> Create AI Avatar Video
          </h4>
          
          {/* Voice & Avatar Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">🎭 Select Avatar</label>
              <select
                value={selectedAvatar}
                onChange={(e) => setSelectedAvatar(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="">Select avatar...</option>
                {avatars.map((avatar) => (
                  <option key={avatar.avatar_id || avatar.id} value={avatar.avatar_id || avatar.id}>
                    {avatar.avatar_name || avatar.name || avatar.avatar_id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">🎤 Select Voice</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="">Select voice...</option>
                {voices.map((voice) => (
                  <option key={voice.voice_id || voice.id} value={voice.voice_id || voice.id}>
                    {voice.name} {voice.labels?.accent ? `(${voice.labels.accent})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Create Video Button */}
          <button
            onClick={async () => {
              if (!selectedAvatar || !selectedVoice) {
                setError('Please select both an avatar and a voice');
                return;
              }
              try {
                setGenerating(true);
                setGeneratingType('video_creation');
                const response = await videoAPI.createVideo(script, selectedAvatar, selectedVoice);
                if (response.data.success) {
                  setToast({ type: 'success', message: 'Video creation started! Check status in a few minutes.' });
                  // Store video ID for status checking
                  setGeneratedContent(prev => ({
                    ...prev,
                    [type]: {
                      ...prev[type],
                      videoId: response.data.data.video_id,
                      videoStatus: 'processing',
                    }
                  }));
                } else {
                  setError(response.data.error || 'Failed to create video');
                }
              } catch (err) {
                setError('Failed to create video: ' + err.message);
              } finally {
                setGenerating(false);
                setGeneratingType(null);
              }
            }}
            disabled={generating || !selectedAvatar || !selectedVoice}
            className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {generating && generatingType === 'video_creation' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Video...</span>
              </>
            ) : (
              <>
                <span>🎬</span> <span>Create Video with HeyGen</span>
              </>
            )}
          </button>
          
          {/* Video Status */}
          {content.videoId && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Video ID: <code className="text-orange-600 font-mono">{content.videoId}</code>
                </span>
                <span className={`text-sm font-semibold ${
                  content.videoStatus === 'completed' ? 'text-green-600' : 
                  content.videoStatus === 'failed' ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  {content.videoStatus === 'completed' ? '✅ Ready' : 
                   content.videoStatus === 'failed' ? '❌ Failed' : 
                   '⏳ Processing...'}
                </span>
              </div>
              {content.videoUrl && (
                <div className="mt-3 space-y-2">
                  <a 
                    href={content.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg text-center transition-all"
                  >
                    🎥 Watch Video
                  </a>
                  {content.thumbnailUrl && (
                    <div className="mt-2">
                      <img 
                        src={content.thumbnailUrl} 
                        alt="Video thumbnail" 
                        className="w-full rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              )}
              {content.videoStatus === 'processing' && (
                <p className="mt-2 text-xs text-gray-500">
                  Checking status every 10 seconds...
                </p>
              )}
            </div>
          )}
          
          <p className="mt-3 text-xs text-gray-600">
            HeyGen will create an AI avatar video with voiceover. Processing may take 2-5 minutes.
          </p>
        </div>
      </div>
    );
  };

  const renderAdsContent = (content, type) => {
    const ads = content.ads || [content];
    const isGoogle = type === 'google_ads';
    
    return (
      <div className="space-y-6">
        {/* Stats Bar */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>📊 {ads.length} ad variation{ads.length > 1 ? 's' : ''}</span>
            <span className="text-green-600">✓ {content.status || 'Ready'}</span>
          </div>
          <button
            onClick={() => handleGenerateSingle(type)}
            disabled={generating}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating && generatingType === type ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Regenerate</span>
              </>
            )}
          </button>
        </div>

        {/* Headlines (for Google Ads) */}
        {isGoogle && content.headlines && content.headlines.length > 0 && (
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">🔍 Headlines (30 chars max)</span>
              <CopyButton text={content.headlines.join('\n')} label="Copy All" size="sm" />
            </div>
            <div className="space-y-2">
              {content.headlines.map((headline, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                  <span className="text-gray-900 font-medium">{headline}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{headline.length}/30</span>
                    <CopyButton text={headline} label="" size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Descriptions (for Google Ads) */}
        {isGoogle && content.descriptions && content.descriptions.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">📝 Descriptions (90 chars max)</span>
              <CopyButton text={content.descriptions.join('\n\n')} label="Copy All" size="sm" />
            </div>
            <div className="space-y-3">
              {content.descriptions.map((desc, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-gray-700 flex-1">{desc}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-600">{desc.length}/90</span>
                      <CopyButton text={desc} label="" size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Single Ad Format (for Facebook/fallback) */}
        {ads.map((ad, idx) => (
          <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {isGoogle ? '' : `Ad Variation ${idx + 1}`}
              </span>
              <CopyButton 
                text={`${ad.headline || ''}\n\n${ad.body_text || ''}\n\nCTA: ${ad.cta_text || ''}`} 
                label="Copy Ad" 
                size="sm" 
              />
            </div>
            
            {/* Headline */}
            {ad.headline && (
              <div className="mb-4">
                <span className="text-xs text-gray-600 uppercase">Headline</span>
                <div className="flex items-center justify-between mt-1">
                  <h4 className="text-xl font-bold text-gray-900">{ad.headline}</h4>
                  <CopyButton text={ad.headline} label="" size="sm" />
                </div>
              </div>
            )}

            {/* Body */}
            {ad.body_text && (
              <div className="mb-4">
                <span className="text-xs text-gray-600 uppercase">Body Text</span>
                <div className="flex items-start justify-between mt-1 gap-4">
                  <p className="text-gray-700 leading-relaxed flex-1">{ad.body_text}</p>
                  <CopyButton text={ad.body_text} label="" size="sm" />
                </div>
              </div>
            )}

            {/* CTA */}
            {ad.cta_text && (
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-600 uppercase">Call to Action:</span>
                <span className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold">
                  {ad.cta_text}
                </span>
              </div>
            )}

            {/* Keywords */}
            {ad.target_keywords && ad.target_keywords.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <span className="text-xs text-gray-600 uppercase">Target Keywords</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ad.target_keywords.map((kw, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-200">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Toast Notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <span className="text-3xl">🚀</span>
          Content Generator
        </h2>
        <p className="text-gray-600 mt-1">Generate AI-powered content for your project</p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content Type Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Select content types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {projectTypes.map((type) => {
              const config = CONTENT_TYPE_CONFIG[type];
              if (!config) return null;
              
              const hasContent = generatedContent[type] && !generatedContent[type].error;
              
              return (
                <div
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    selectedTypes.includes(type)
                      ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-100'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => handleTypeToggle(type)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded bg-white"
                      />
                      <span className="text-2xl">{config.icon}</span>
                    </div>
                    {hasContent && <span className="text-green-600 text-lg">✓</span>}
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-900 font-medium block">{config.label}</span>
                    <span className="text-gray-600 text-xs">{config.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Options Panel - Show when video types are selected */}
        {(selectedTypes.includes('ai_video') || selectedTypes.includes('video')) && (
          <div className="mb-6 bg-orange-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎬</span>
              <h3 className="text-lg font-semibold text-gray-900">Video Options</h3>
            </div>
            
            <div className="space-y-6">
              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📏 Video Duration
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {VIDEO_DURATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setVideoDuration(option.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        videoDuration === option.value
                          ? 'border-orange-500 bg-orange-100 text-gray-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-lg">{option.label}</div>
                      <div className="text-xs text-gray-600">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎤 Voice (HeyGen)
                </label>
                {loadingVoices ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    <span>Loading voices...</span>
                  </div>
                ) : voices.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {voices.slice(0, 8).map((voice) => (
                      <button
                        key={voice.voice_id}
                        type="button"
                        onClick={() => setSelectedVoice(voice.voice_id)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          selectedVoice === voice.voice_id
                            ? 'border-orange-500 bg-orange-100 text-gray-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium truncate">{voice.name}</div>
                        {voice.labels && (
                          <div className="text-xs text-gray-600 truncate mt-1">
                            {voice.labels.accent || voice.labels.gender || 'Professional'}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-600 text-sm">
                    No voices available. Please configure HeyGen API key in Admin Setup.
                  </div>
                )}
                {voices.length > 8 && (
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="mt-3 w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="">-- All Voices --</option>
                    {voices.map((voice) => (
                      <option key={voice.voice_id} value={voice.voice_id}>
                        {voice.name} {voice.labels?.accent ? `(${voice.labels.accent})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎭 Avatar (HeyGen)
                </label>
                {loadingAvatars ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    <span>Loading avatars...</span>
                  </div>
                ) : avatars.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {avatars.slice(0, 12).map((avatar) => (
                      <button
                        key={avatar.avatar_id}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar.avatar_id)}
                        className={`p-2 rounded-lg border-2 transition-all text-center ${
                          selectedAvatar === avatar.avatar_id
                            ? 'border-orange-500 bg-orange-100'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {avatar.preview_image_url ? (
                          <img
                            src={avatar.preview_image_url}
                            alt={avatar.avatar_name}
                            className="w-full h-16 object-cover rounded-md mb-2"
                          />
                        ) : (
                          <div className="w-full h-16 bg-gray-100 rounded-md mb-2 flex items-center justify-center text-2xl">
                            👤
                          </div>
                        )}
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {avatar.avatar_name || 'Avatar'}
                        </div>
                        {avatar.gender && (
                          <div className="text-xs text-gray-600">{avatar.gender}</div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-600 text-sm">
                    No avatars available. Please configure HeyGen API key in Admin Setup.
                  </div>
                )}
                {avatars.length > 12 && (
                  <select
                    value={selectedAvatar}
                    onChange={(e) => setSelectedAvatar(e.target.value)}
                    className="mt-3 w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="">-- All Avatars --</option>
                    {avatars.map((avatar) => (
                      <option key={avatar.avatar_id} value={avatar.avatar_id}>
                        {avatar.avatar_name} {avatar.gender ? `(${avatar.gender})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-orange-50 rounded-lg p-4 text-sm border border-orange-200">
                <div className="flex items-start gap-3">
                  <span className="text-orange-600">ℹ️</span>
                  <div className="text-gray-700">
                    <p className="mb-2">
                      The AI will generate a video script optimized for{' '}
                      <strong className="text-gray-900">
                        {VIDEO_DURATION_OPTIONS.find(o => o.value === videoDuration)?.label}
                      </strong>
                      {selectedVoice && voices.find(v => v.voice_id === selectedVoice) && (
                        <> with <strong className="text-orange-600">{voices.find(v => v.voice_id === selectedVoice)?.name}</strong> voice</>
                      )}.
                    </p>
                    <p className="text-gray-600">HeyGen will be used to create the final AI avatar video with voiceover.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Options Panel - Show when social_creative is selected */}
        {selectedTypes.includes('social_creative') && (
          <div className="mb-6 bg-orange-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎨</span>
              <h3 className="text-lg font-semibold text-gray-900">Social Media Creative Options</h3>
            </div>
            
            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📱 Platform
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {IMAGE_PLATFORMS.map((platform) => (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => {
                        setImagePlatform(platform.value);
                        setImageContentType(IMAGE_CONTENT_TYPES[platform.value]?.[0] || 'post');
                      }}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        imagePlatform === platform.value
                          ? 'border-orange-500 bg-orange-100 text-gray-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{platform.icon}</div>
                      <div className="text-xs font-medium">{platform.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📐 Format
                </label>
                <div className="flex flex-wrap gap-2">
                  {(IMAGE_CONTENT_TYPES[imagePlatform] || ['post']).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setImageContentType(type)}
                      className={`px-4 py-2 rounded-lg border transition-all capitalize ${
                        imageContentType === type
                          ? 'border-orange-500 bg-orange-100 text-gray-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎭 Visual Style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {IMAGE_STYLES.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setImageStyle(style.value)}
                      className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                        imageStyle === style.value
                          ? 'border-orange-500 bg-orange-100 text-gray-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💫 Mood
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                  {IMAGE_MOODS.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setImageMood(mood.value)}
                      className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                        imageMood === mood.value
                          ? 'border-yellow-500 bg-yellow-100 text-gray-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-orange-50 rounded-lg p-4 text-sm border border-orange-200">
                <div className="flex items-start gap-3">
                  <span className="text-orange-600">ℹ️</span>
                  <div className="text-gray-700">
                    <p className="mb-2">
                      Generating <strong className="text-gray-900">{imageContentType}</strong> for{' '}
                      <strong className="text-orange-600">{IMAGE_PLATFORMS.find(p => p.value === imagePlatform)?.label}</strong>{' '}
                      in <strong className="text-orange-700">{IMAGE_STYLES.find(s => s.value === imageStyle)?.label}</strong> style.
                    </p>
                    <p className="text-gray-600">Leonardo.ai will generate 4 high-quality variations with brand consistency.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="mb-8">
          <button
            onClick={handleGenerateAll}
            disabled={generating || selectedTypes.length === 0}
            className="w-full py-4 bg-orange-600 text-white text-lg font-bold rounded-xl hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating {CONTENT_TYPE_CONFIG[generatingType]?.label || 'Content'}...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">✨</span>
                <span>Generate All Selected Content</span>
              </>
            )}
          </button>
        </div>

        {/* Content Tabs */}
        {Object.keys(generatedContent).length > 0 && (
          <div>
            {/* Tab Headers */}
            <div className="flex space-x-1 bg-gray-100 p-1.5 rounded-xl mb-6 border border-gray-200">
              {projectTypes.map((type) => {
                const config = CONTENT_TYPE_CONFIG[type];
                const hasContent = generatedContent[type];
                const hasError = hasContent?.error;
                
                return (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      activeTab === type
                        ? 'bg-orange-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{config?.icon}</span>
                    <span className="hidden lg:inline">{config?.label}</span>
                    {hasContent && !hasError && <span className="text-green-600 text-sm">✓</span>}
                    {hasError && <span className="text-red-600 text-sm">✗</span>}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab && renderContent(activeTab)}
            </div>
          </div>
        )}

        {/* Empty State */}
        {Object.keys(generatedContent).length === 0 && !generating && (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <div className="text-5xl mb-4">✨</div>
            <p className="text-xl text-gray-900 font-semibold mb-2">Ready to Create Amazing Content</p>
            <p className="text-gray-600">Select content types above and click "Generate All" to get started</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ContentGenerator;
