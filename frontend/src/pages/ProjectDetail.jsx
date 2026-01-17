import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI, clientsAPI } from '../services/api';
import ContentGenerator from '../components/ContentGenerator';
import ArticleIdeas from '../components/ArticleIdeas';
import SEOStrategy from '../components/SEOStrategy';
import GoogleAdsStrategy from '../components/GoogleAdsStrategy';
import FacebookAdsStrategy from '../components/FacebookAdsStrategy';
import ContentScheduling from '../components/ContentScheduling';
import EmailNewsletter from '../components/EmailNewsletter';
import ContentRoadmap from '../components/ContentRoadmap';
import StrategyDashboard from '../components/StrategyDashboard';
import ShopifyStoreAnalysis from '../components/ShopifyStoreAnalysis';
import LocalSeoAnalysis from '../components/LocalSeoAnalysis';
import ProgrammaticSeo from '../components/ProgrammaticSeo';
import ClientChat from '../components/ClientChat';
import VideoGeneration from '../components/VideoGeneration';

function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'seo-strategy', 'google-ads-strategy', 'facebook-ads-strategy', 'ideas', 'roadmap', 'generate', 'scheduling', 'email'

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const projectRes = await projectsAPI.getById(projectId);
      if (projectRes.data.success && projectRes.data.data) {
        setProject(projectRes.data.data);
        
        // Load client info if client_id exists
        if (projectRes.data.data.client_id) {
          try {
            const clientRes = await clientsAPI.getById(projectRes.data.data.client_id);
            if (clientRes.data.success && clientRes.data.data) {
              setClient(clientRes.data.data);
            }
          } catch (clientErr) {
            console.error('Error loading client:', clientErr);
            // Continue without client data - don't fail the whole page
          }
        }
      } else {
        setError(projectRes.data.error || 'Project not found');
      }
    } catch (err) {
      console.error('Error loading project:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700">Error: {error}</p>
          <Link to="/projects" className="mt-4 inline-block text-orange-600 hover:text-orange-700">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Project not found</p>
        <Link to="/projects" className="mt-4 inline-block text-orange-600 hover:text-orange-700">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const projectTypes = project.project_types || (project.project_type ? [project.project_type] : []);

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.project_name}</h1>
            {client && (
              <p className="mt-1 text-gray-600">
                Client: <span className="text-orange-600">{client.company_name}</span>
              </p>
            )}
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            project.status === 'completed' ? 'bg-green-100 text-green-700' :
            project.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {project.status}
          </span>
        </div>

        {/* Project Details Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Content Types */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Content Types</h3>
            <div className="flex flex-wrap gap-1">
              {projectTypes.map((type) => (
                <span key={type} className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Keywords</h3>
            <div className="flex flex-wrap gap-1">
              {project.keywords && project.keywords.length > 0 ? (
                project.keywords.map((kw, idx) => (
                  <span key={idx} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                    {kw}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">No keywords set</span>
              )}
            </div>
          </div>

          {/* Content Preferences */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Content Style</h3>
            <span className="text-gray-900 capitalize">{project.content_preferences || 'Professional'}</span>
          </div>

          {/* Target Audience */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Target Audience</h3>
            <p className="text-gray-900 text-sm line-clamp-2">
              {project.target_audience || client?.target_audience || 'Not specified'}
            </p>
          </div>
        </div>

        {/* Unique Angle */}
        {project.unique_angle && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Unique Angle</h3>
            <p className="text-gray-900">{project.unique_angle}</p>
          </div>
        )}
      </div>

      {/* Client Brand Info (if available) */}
      {client && (client.brand_voice || client.brand_tone) && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Brand Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {client.brand_tone && (
              <div>
                <span className="text-sm text-gray-600">Brand Tone:</span>
                <span className="ml-2 text-gray-900 capitalize">{client.brand_tone}</span>
              </div>
            )}
            {client.brand_voice && (
              <div className="md:col-span-2">
                <span className="text-sm text-gray-600 block mb-1">Brand Voice:</span>
                <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded border border-gray-200">{client.brand_voice}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white border border-gray-200 p-2 rounded-xl flex-wrap">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📊 Strategy Dashboard
          <span className="ml-2 text-sm opacity-75">Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('seo-strategy')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'seo-strategy'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🎯 SEO Strategy
          <span className="ml-2 text-sm opacity-75">Comprehensive Plan</span>
        </button>
        <button
          onClick={() => setActiveTab('google-ads-strategy')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'google-ads-strategy'
              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔍 Google Ads
          <span className="ml-2 text-sm opacity-75">Campaign Strategy</span>
        </button>
        <button
          onClick={() => setActiveTab('facebook-ads-strategy')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'facebook-ads-strategy'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📘 Facebook Ads
          <span className="ml-2 text-sm opacity-75">Social Strategy</span>
        </button>
        <button
          onClick={() => setActiveTab('ideas')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'ideas'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          💡 Article Ideas
          <span className="ml-2 text-sm opacity-75">Analyze & Plan</span>
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'generate'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✨ Direct Generate
          <span className="ml-2 text-sm opacity-75">Quick Content</span>
        </button>
        <button
          onClick={() => setActiveTab('scheduling')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'scheduling'
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📅 Schedule
          <span className="ml-2 text-sm opacity-75">Publish Content</span>
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'roadmap'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📅 Content Roadmap
          <span className="ml-2 text-sm opacity-75">12-Month Plan</span>
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'email'
              ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✉️ Email
          <span className="ml-2 text-sm opacity-75">Newsletters</span>
        </button>
        {client?.primary_business_type === 'shopify' && (
          <button
            onClick={() => setActiveTab('shopify-analysis')}
            className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'shopify-analysis'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🛒 Shopify Store
            <span className="ml-2 text-sm opacity-75">SEO Analysis</span>
          </button>
        )}
        {/* Local SEO available for all clients */}
        <button
          onClick={() => setActiveTab('local-seo')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'local-seo'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📍 Local SEO
          <span className="ml-2 text-sm opacity-75">Analysis</span>
        </button>
        {/* Programmatic SEO */}
        <button
          onClick={() => setActiveTab('programmatic-seo')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'programmatic-seo'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔄 Programmatic SEO
          <span className="ml-2 text-sm opacity-75">Service+Location</span>
        </button>
        <button
          onClick={() => setActiveTab('video-generation')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'video-generation'
              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🎬 Video Generation
          <span className="ml-2 text-sm opacity-75">AI Avatar</span>
        </button>
        <button
          onClick={() => setActiveTab('client-chat')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'client-chat'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          💬 Chat
          <span className="ml-2 text-sm opacity-75">Client Chat</span>
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'dashboard' ? (
        <StrategyDashboard 
          projectId={projectId}
          clientData={client}
          projectData={project}
        />
      ) : activeTab === 'seo-strategy' ? (
        <SEOStrategy 
          projectId={projectId}
          clientData={client}
          projectData={project}
        />
      ) : activeTab === 'google-ads-strategy' ? (
        <GoogleAdsStrategy 
          projectId={projectId}
          clientData={client}
          projectData={project}
        />
      ) : activeTab === 'facebook-ads-strategy' ? (
        <FacebookAdsStrategy 
          projectId={projectId}
          clientData={client}
          projectData={project}
        />
      ) : activeTab === 'ideas' ? (
        <ArticleIdeas 
          client={client}
          project={project}
          onArticleGenerated={loadProject}
        />
      ) : activeTab === 'scheduling' ? (
        <ContentScheduling 
          projectId={projectId}
          clientId={client?.id}
        />
      ) : activeTab === 'email' ? (
        <EmailNewsletter 
          projectId={projectId}
        />
      ) : activeTab === 'roadmap' ? (
        <ContentRoadmap 
          projectId={projectId}
          strategy={null}
        />
      ) : activeTab === 'shopify-analysis' ? (
        <ShopifyStoreAnalysis 
          clientId={client?.id}
          clientData={client}
        />
      ) : activeTab === 'local-seo' ? (
        <LocalSeoAnalysis 
          clientId={client?.id}
          projectId={projectId}
          clientData={client}
          projectData={project}
        />
      ) : activeTab === 'programmatic-seo' ? (
        <ProgrammaticSeo 
          clientId={client?.id}
          projectId={projectId}
          clientData={client}
          projectData={project}
        />
      ) : activeTab === 'video-generation' ? (
        <VideoGeneration projectId={projectId} />
      ) : activeTab === 'client-chat' ? (
        <ClientChat clientId={client?.id} projectId={projectId} />
      ) : (
        <ContentGenerator 
          project={project} 
          client={client}
          onContentGenerated={loadProject}
        />
      )}
    </div>
  );
}

export default ProjectDetail;

