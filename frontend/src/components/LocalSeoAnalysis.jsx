import React, { useState } from 'react';
import { localSeoAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

function LocalSeoAnalysis({ clientId, projectId, clientData, projectData }) {
  const { showToast } = useToast();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(clientData?.location || projectData?.location || '');
  const [websiteUrl, setWebsiteUrl] = useState(clientData?.website || projectData?.website_url || '');

  const handleAnalyze = async () => {
    if (!location.trim()) {
      showToast('Please enter a location', 'error');
      return;
    }

    try {
      setLoading(true);
      showToast('Generating local SEO analysis... This may take a minute.', 'info');

      const response = await localSeoAPI.analyze(clientId, projectId, location, websiteUrl);

      if (response.data.success) {
        setAnalysis(response.data.data);
        showToast('Local SEO analysis completed!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to generate analysis', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Form */}
      {!analysis && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📍 Local SEO Analysis</h2>
          <p className="text-gray-600 mb-6">
            Get comprehensive local SEO insights including keyword research, local pack analysis, content recommendations, and schema markup.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, NY or Los Angeles, CA"
                className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter your primary business location (city, state)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL (Optional)
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Your website URL for on-page audit
              </p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !location.trim()}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing...' : 'Generate Local SEO Analysis'}
            </button>
          </div>

          {/* Limitations Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ What We Can't Automate:</p>
            <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
              <li>Google Business Profile updates (manual work required)</li>
              <li>Citation building (manual work required)</li>
              <li>Continuous ranking tracking (one-time snapshots only)</li>
              <li>Review management (strategy only)</li>
            </ul>
            <p className="text-xs text-yellow-700 mt-2">
              We provide recommendations and data, but some tasks require manual implementation.
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900">Analyzing Local SEO...</h3>
              <p className="text-orange-700 text-sm">
                Fetching keyword data, analyzing local pack, and generating recommendations...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Local SEO Score */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Local SEO Score</h2>
                <p className="text-gray-600">Overall local SEO health assessment</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-gray-900">{analysis.local_seo_score || 0}</div>
                <div className="text-sm text-gray-600">out of 100</div>
              </div>
            </div>

            {/* Score Breakdown */}
            {analysis.score_breakdown && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {Object.entries(analysis.score_breakdown).map(([category, score]) => (
                  <div key={category} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1 capitalize">
                      {category.replace(/_/g, ' ')}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-900 font-semibold">{score}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Data Source Info */}
            {analysis.metadata && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="text-gray-900 font-medium">Data Source:</span>{' '}
                  {analysis.metadata.message}
                  {analysis.metadata.fallback_used && (
                    <span className="ml-2 text-yellow-700">⚠️ Fallback to AI</span>
                  )}
                </p>
                {analysis.metadata.location && (
                  <p className="text-sm text-gray-600 mt-1">
                    Location: {analysis.metadata.location} (Code: {analysis.metadata.location_code})
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Local Keyword Research */}
          {analysis.local_keyword_research && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🔍 Local Keyword Research</h3>

              {/* Primary Keywords */}
              {analysis.local_keyword_research.primary_keywords && 
               analysis.local_keyword_research.primary_keywords.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Primary Keywords</h4>
                  <div className="space-y-3">
                    {analysis.local_keyword_research.primary_keywords.map((kw, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold text-gray-900">{kw.keyword}</h5>
                          {kw.opportunity && (
                            <span className={`px-2 py-1 rounded text-xs ${
                              kw.opportunity === 'high' ? 'bg-green-100 text-green-700' :
                              kw.opportunity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {kw.opportunity} opportunity
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          {kw.search_volume && (
                            <div>
                              <span className="text-gray-600">Search Volume:</span>
                              <span className="ml-2 text-gray-900 font-medium">
                                {kw.search_volume.toLocaleString()}/mo
                              </span>
                            </div>
                          )}
                          {kw.difficulty !== undefined && (
                            <div>
                              <span className="text-gray-600">Difficulty:</span>
                              <span className="ml-2 text-gray-900 font-medium">{kw.difficulty}/100</span>
                            </div>
                          )}
                          {kw.cpc && (
                            <div>
                              <span className="text-gray-600">CPC:</span>
                              <span className="ml-2 text-green-600 font-medium">${kw.cpc}</span>
                            </div>
                          )}
                        </div>
                        {kw.recommendation && (
                          <p className="text-gray-700 text-sm mt-2">{kw.recommendation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyword Opportunities */}
              {analysis.local_keyword_research.keyword_opportunities && 
               analysis.local_keyword_research.keyword_opportunities.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Keyword Opportunities</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.local_keyword_research.keyword_opportunities.map((opp, idx) => (
                      <div
                        key={idx}
                        className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-200"
                      >
                        <span className="text-orange-700 font-medium">{opp.keyword || opp}</span>
                        {opp.search_volume && (
                          <span className="text-orange-600 text-xs ml-2">
                            {opp.search_volume.toLocaleString()}/mo
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Local SERP Analysis */}
          {analysis.local_serp_analysis && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🗺️ Local Pack Analysis</h3>

              {/* Local Pack Competitors */}
              {analysis.local_serp_analysis.local_pack_competitors && 
               analysis.local_serp_analysis.local_pack_competitors.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Current Local Pack (Top 3)</h4>
                  <div className="space-y-3">
                    {analysis.local_serp_analysis.local_pack_competitors.map((competitor, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-1">
                              #{idx + 1} {competitor.title || competitor.name || 'Business'}
                            </h5>
                            {competitor.address && (
                              <p className="text-gray-700 text-sm mb-1">{competitor.address}</p>
                            )}
                            <div className="flex gap-4 text-sm text-gray-600">
                              {competitor.rating && (
                                <span>⭐ {competitor.rating}/5</span>
                              )}
                              {competitor.reviews && (
                                <span>📝 {competitor.reviews} reviews</span>
                              )}
                              {competitor.phone && (
                                <span>📞 {competitor.phone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimization Opportunities */}
              {analysis.local_serp_analysis.optimization_opportunities && 
               analysis.local_serp_analysis.optimization_opportunities.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Optimization Opportunities</h4>
                  <ul className="space-y-2">
                    {analysis.local_serp_analysis.optimization_opportunities.map((opp, idx) => (
                      <li key={idx} className="text-gray-700 text-sm flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.local_serp_analysis.competitor_insights && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">{analysis.local_serp_analysis.competitor_insights}</p>
                </div>
              )}
            </div>
          )}

          {/* Content Recommendations */}
          {analysis.content_recommendations && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📝 Content Recommendations</h3>

              {/* Location Pages */}
              {analysis.content_recommendations.location_pages && 
               analysis.content_recommendations.location_pages.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Location Pages</h4>
                  <div className="space-y-2">
                    {analysis.content_recommendations.location_pages.map((page, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-900 font-medium">{page.title || page}</p>
                        {page.description && (
                          <p className="text-gray-700 text-sm mt-1">{page.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Local Content Ideas */}
              {analysis.content_recommendations.local_content_ideas && 
               analysis.content_recommendations.local_content_ideas.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Local Content Ideas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.content_recommendations.local_content_ideas.map((idea, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-gray-900 text-sm">{idea.title || idea}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Schema Markup */}
          {analysis.schema_markup && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🏷️ Schema Markup</h3>
              
              {analysis.schema_markup.local_business_schema && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">LocalBusiness Schema</h4>
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs text-gray-700 border border-gray-200">
                    {JSON.stringify(analysis.schema_markup.local_business_schema, null, 2)}
                  </pre>
                  <p className="text-gray-600 text-sm mt-2">
                    Add this JSON-LD to your website's &lt;head&gt; section
                  </p>
                </div>
              )}
            </div>
          )}

          {/* On-Page Audit */}
          {analysis.on_page_audit && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🔍 On-Page Local SEO Audit</h3>

              {/* NAP Consistency */}
              {analysis.on_page_audit.nap_consistency && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">NAP Consistency</h4>
                    <span className={`px-3 py-1 rounded text-sm ${
                      analysis.on_page_audit.nap_consistency.status === 'good' ? 'bg-green-100 text-green-700' :
                      analysis.on_page_audit.nap_consistency.status === 'needs_improvement' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {analysis.on_page_audit.nap_consistency.status}
                    </span>
                  </div>
                  {analysis.on_page_audit.nap_consistency.recommendations && (
                    <p className="text-gray-700 text-sm mt-2">
                      {analysis.on_page_audit.nap_consistency.recommendations}
                    </p>
                  )}
                </div>
              )}

              {/* Schema Presence */}
              {analysis.on_page_audit.schema_presence && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">Schema Markup</h4>
                    <span className={`px-3 py-1 rounded text-sm ${
                      analysis.on_page_audit.schema_presence.has_schema ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {analysis.on_page_audit.schema_presence.has_schema ? 'Present' : 'Missing'}
                    </span>
                  </div>
                  {analysis.on_page_audit.schema_presence.recommendations && (
                    <p className="text-gray-700 text-sm mt-2">
                      {analysis.on_page_audit.schema_presence.recommendations}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Priority Recommendations */}
          {analysis.priority_recommendations && analysis.priority_recommendations.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Priority Recommendations</h3>
              <div className="space-y-3">
                {analysis.priority_recommendations
                  .sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                  })
                  .map((rec, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            rec.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : rec.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {rec.priority} priority
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{rec.description}</p>
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>Impact: {rec.impact}</span>
                        <span>Effort: {rec.effort}</span>
                      </div>
                      {rec.steps && rec.steps.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-1">Implementation Steps:</p>
                          <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700">
                            {rec.steps.map((step, stepIdx) => (
                              <li key={stepIdx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Limitations */}
          {analysis.limitations && analysis.limitations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Limitations</h4>
              <ul className="space-y-1 text-xs text-yellow-700 list-disc list-inside">
                {analysis.limitations.map((limitation, idx) => (
                  <li key={idx}>{limitation}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Regenerate Button */}
          <div className="flex gap-3">
            <button
              onClick={() => setAnalysis(null)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              ← Back to Form
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Regenerate Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocalSeoAnalysis;
