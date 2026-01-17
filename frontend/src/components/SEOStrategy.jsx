import React, { useState, useEffect } from 'react';
import { seoStrategyAPI } from '../services/api';
import { downloadCSV, downloadJSON, downloadPDF } from '../utils/export';

function SEOStrategy({ projectId, clientData, projectData }) {
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Detect business type
  const businessTypes = clientData?.business_types || ['general'];
  const primaryBusinessType = clientData?.primary_business_type || businessTypes[0] || 'general';
  const location = clientData?.location || '';

  useEffect(() => {
    if (projectId) {
      loadStrategies();
    }
  }, [projectId]);

  const loadStrategies = async () => {
    try {
      setLoading(true);
      const response = await seoStrategyAPI.getByProject(projectId);
      if (response.data.success) {
        setStrategies(response.data.data);
        if (response.data.data.length > 0 && !selectedStrategy) {
          setSelectedStrategy(response.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading SEO strategies:', err);
      setError(err.message || 'Failed to load SEO strategies');
    } finally {
      setLoading(false);
    }
  };

  const generateStrategy = async () => {
    try {
      setGenerating(true);
      setError(null);
      const response = await seoStrategyAPI.generate(projectId, clientData, projectData);
      if (response.data.success) {
        const newStrategy = response.data.data;
        setStrategies([newStrategy, ...strategies]);
        setSelectedStrategy(newStrategy);
      }
    } catch (err) {
      console.error('Error generating SEO strategy:', err);
      setError(err.message || 'Failed to generate SEO strategy');
    } finally {
      setGenerating(false);
    }
  };

  if (loading && strategies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading SEO strategies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Strategy</h2>
          <p className="text-gray-600 text-sm mt-1">
            Comprehensive SEO strategies powered by Claude Sonnet
          </p>
        </div>
        <button
          onClick={generateStrategy}
          disabled={generating}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              Generate SEO Strategy
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Strategy List */}
      {strategies.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strategy Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
              <h3 className="text-gray-900 font-semibold mb-3">Strategies</h3>
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy)}
                  className={`w-full text-left p-3 rounded-lg transition-colors border ${
                    selectedStrategy?.id === strategy.id
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {new Date(strategy.created_at).toLocaleDateString()}
                  </div>
                  <div className={`text-xs mt-1 ${selectedStrategy?.id === strategy.id ? 'text-orange-100' : 'text-gray-500'}`}>
                    {strategy.primary_keywords?.length || 0} primary keywords
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Strategy Details */}
          <div className="lg:col-span-2">
            {selectedStrategy && (
              <div className="space-y-6">
                {/* Export Buttons */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      const strategyText = JSON.stringify(selectedStrategy, null, 2);
                      navigator.clipboard.writeText(strategyText);
                      alert('Strategy copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Copy JSON
                  </button>
                  <button
                    onClick={() => {
                      const keywords = [
                        ...(selectedStrategy.primary_keywords || []),
                        ...(selectedStrategy.secondary_keywords || [])
                      ];
                      downloadCSV([{ keywords: keywords.join(', ') }], 'seo-strategy-keywords');
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => {
                      const htmlContent = `
                        <h1>SEO Strategy Report</h1>
                        <h2>Executive Summary</h2>
                        <p>${selectedStrategy.executive_summary || 'N/A'}</p>
                        <h2>Primary Keywords</h2>
                        <p>${(selectedStrategy.primary_keywords || []).join(', ')}</p>
                        <h2>Secondary Keywords</h2>
                        <p>${(selectedStrategy.secondary_keywords || []).join(', ')}</p>
                      `;
                      downloadPDF(htmlContent, 'SEO Strategy');
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Export PDF
                  </button>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                {/* Executive Summary */}
                {selectedStrategy.executive_summary && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-bold text-gray-900">Executive Summary</h3>
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedStrategy.executive_summary)}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{selectedStrategy.executive_summary}</p>
                  </div>
                )}

                {/* Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-2">Primary Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStrategy.primary_keywords?.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-semibold mb-2">Secondary Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStrategy.secondary_keywords?.slice(0, 10).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                      {selectedStrategy.secondary_keywords?.length > 10 && (
                        <span className="px-3 py-1 text-gray-600 text-sm">
                          +{selectedStrategy.secondary_keywords.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Pillars */}
                {selectedStrategy.content_pillars && selectedStrategy.content_pillars.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Content Pillars</h3>
                    <div className="space-y-4">
                      {selectedStrategy.content_pillars.map((pillar, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="text-gray-900 font-semibold mb-2">{pillar.theme}</h4>
                          {pillar.target_keywords && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {pillar.target_keywords.map((kw, kwIdx) => (
                                <span
                                  key={kwIdx}
                                  className="px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                          {pillar.goals && (
                            <p className="text-gray-700 text-sm">{pillar.goals}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical SEO */}
                {selectedStrategy.technical_seo_recommendations && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Technical SEO Recommendations</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-line">
                        {selectedStrategy.technical_seo_recommendations}
                      </p>
                    </div>
                  </div>
                )}

                {/* Local Business Specific Sections */}
                {primaryBusinessType === 'local' && (
                  <>
                    {location && (
                      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-600/30 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                          📍 Location Information
                        </h3>
                        <p className="text-gray-700">Location: <span className="font-semibold">{location}</span></p>
                        <p className="text-gray-400 text-sm mt-2">
                          Focus on local pack rankings, Google My Business optimization, and local citations.
                        </p>
                      </div>
                    )}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-gray-900 font-semibold mb-2">Local SEO Focus Areas</h4>
                      <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                        <li>Google My Business optimization</li>
                        <li>Local pack rankings</li>
                        <li>Local citations and directories</li>
                        <li>Review strategy and reputation management</li>
                        <li>Location-based keyword targeting</li>
                        <li>Service area pages</li>
                      </ul>
                    </div>
                  </>
                )}

                {/* Shopify Specific Sections */}
                {primaryBusinessType === 'shopify' && (
                  <>
                    {clientData?.shopify_url && (
                      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                          🛒 Shopify Store
                        </h3>
                        <p className="text-gray-700">
                          Store URL: <a href={clientData.shopify_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">{clientData.shopify_url}</a>
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Focus on product page optimization, category strategy, and conversion optimization.
                        </p>
                      </div>
                    )}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-gray-900 font-semibold mb-2">E-commerce SEO Focus Areas</h4>
                      <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                        <li>Product page optimization</li>
                        <li>Category page strategy</li>
                        <li>Commercial keyword targeting</li>
                        <li>Product schema markup</li>
                        <li>Conversion rate optimization</li>
                        <li>Buying guides and product comparisons</li>
                      </ul>
                    </div>
                  </>
                )}

                {/* General Business Specific Sections */}
                {primaryBusinessType === 'general' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-gray-900 font-semibold mb-2">General Business SEO Focus Areas</h4>
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      <li>Thought leadership content</li>
                      <li>Brand authority building</li>
                      <li>Informational and navigational keywords</li>
                      <li>Long-form articles and whitepapers</li>
                      <li>Industry expertise positioning</li>
                      <li>Organic traffic growth</li>
                    </ul>
                  </div>
                )}

                {/* Content Calendar */}
                {selectedStrategy.content_calendar && selectedStrategy.content_calendar.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Content Calendar</h3>
                    <div className="space-y-3">
                      {selectedStrategy.content_calendar.map((month, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="text-gray-900 font-semibold mb-2">{month.month}</h4>
                          <p className="text-gray-700 text-sm mb-2">Theme: {month.theme}</p>
                          {month.priority_pieces && month.priority_pieces.length > 0 && (
                            <div>
                              <p className="text-gray-600 text-xs mb-1">Priority Pieces:</p>
                              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                                {month.priority_pieces.map((piece, pIdx) => (
                                  <li key={pIdx}>{piece}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Link Building Opportunities */}
                {selectedStrategy.link_building_opportunities && selectedStrategy.link_building_opportunities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Link Building Opportunities</h3>
                    <div className="space-y-2">
                      {selectedStrategy.link_building_opportunities.map((opp, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex justify-between items-start">
                          <div>
                            <p className="text-gray-900 font-medium">{opp.opportunity}</p>
                            <p className="text-gray-600 text-xs mt-1">
                              Type: {opp.type} | Priority: {opp.priority}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Gap Analysis */}
                {selectedStrategy.content_gap_analysis && selectedStrategy.content_gap_analysis.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Content Gap Analysis</h3>
                    <div className="space-y-2">
                      {selectedStrategy.content_gap_analysis.map((gap, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-gray-900 font-medium">{gap.topic}</h4>
                            <span className={`px-2 py-1 rounded text-xs ${
                              gap.priority === 'high' ? 'bg-red-600 text-white' :
                              gap.priority === 'medium' ? 'bg-yellow-600 text-white' :
                              'bg-gray-200 text-gray-700'
                            }`}>
                              {gap.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs">
                            Type: {gap.content_type} | Keyword: {gap.target_keyword}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Competitor Gaps */}
                {selectedStrategy.competitor_gaps && selectedStrategy.competitor_gaps.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Competitor Content Gaps</h3>
                    <div className="space-y-2">
                      {selectedStrategy.competitor_gaps.map((gap, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-gray-900 font-medium">{gap.opportunity}</h4>
                            <span className={`px-2 py-1 rounded text-xs ${
                              gap.priority === 'high' ? 'bg-red-600 text-white' :
                              gap.priority === 'medium' ? 'bg-yellow-600 text-white' :
                              'bg-gray-200 text-gray-700'
                            }`}>
                              {gap.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs">
                            Competitor: {gap.competitor} | Type: {gap.content_type}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Audience Analysis */}
                {selectedStrategy.target_audience_analysis && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Target Audience Analysis</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-line">
                        {selectedStrategy.target_audience_analysis}
                      </p>
                    </div>
                  </div>
                )}

                {/* Competitor Analysis Summary */}
                {selectedStrategy.competitor_analysis_summary && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Competitor Analysis Summary</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-line">
                        {selectedStrategy.competitor_analysis_summary}
                      </p>
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {strategies.length === 0 && !generating && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-600 mb-4">No SEO strategies generated yet</p>
          <p className="text-gray-500 text-sm mb-6">Comprehensive SEO strategies powered by Claude Sonnet</p>
          <button
            onClick={generateStrategy}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            Generate Your First SEO Strategy
          </button>
        </div>
      )}
    </div>
  );
}

export default SEOStrategy;

