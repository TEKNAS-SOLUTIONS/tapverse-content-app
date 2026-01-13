import React, { useState, useEffect } from 'react';
import { googleAdsStrategyAPI } from '../services/api';

function GoogleAdsStrategy({ projectId, clientData, projectData }) {
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadStrategies();
    }
  }, [projectId]);

  const loadStrategies = async () => {
    try {
      setLoading(true);
      const response = await googleAdsStrategyAPI.getByProject(projectId);
      if (response.data.success) {
        setStrategies(response.data.data);
        if (response.data.data.length > 0 && !selectedStrategy) {
          setSelectedStrategy(response.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading Google Ads strategies:', err);
      setError(err.message || 'Failed to load Google Ads strategies');
    } finally {
      setLoading(false);
    }
  };

  const generateStrategy = async () => {
    try {
      setGenerating(true);
      setError(null);
      const response = await googleAdsStrategyAPI.generate(projectId, clientData, projectData);
      if (response.data.success) {
        const newStrategy = response.data.data;
        setStrategies([newStrategy, ...strategies]);
        setSelectedStrategy(newStrategy);
      }
    } catch (err) {
      console.error('Error generating Google Ads strategy:', err);
      setError(err.message || 'Failed to generate Google Ads strategy');
    } finally {
      setGenerating(false);
    }
  };

  if (loading && strategies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading Google Ads strategies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Google Ads Strategy</h2>
          <p className="text-gray-400 text-sm mt-1">
            Comprehensive Google Ads strategies powered by Claude
          </p>
        </div>
        <button
          onClick={generateStrategy}
          disabled={generating}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <span>✨</span>
              Generate Google Ads Strategy
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Strategy List */}
      {strategies.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strategy Selector */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <h3 className="text-white font-semibold mb-3">Strategies</h3>
              {strategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedStrategy?.id === strategy.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {new Date(strategy.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs mt-1 opacity-75">
                    {strategy.campaign_structure?.length || 0} campaigns
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Strategy Details */}
          <div className="lg:col-span-2">
            {selectedStrategy && (
              <div className="bg-gray-800 rounded-lg p-6 space-y-6">
                {/* Executive Summary */}
                {selectedStrategy.executive_summary && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Executive Summary</h3>
                    <p className="text-gray-300 leading-relaxed">{selectedStrategy.executive_summary}</p>
                  </div>
                )}

                {/* Campaign Structure */}
                {selectedStrategy.campaign_structure && selectedStrategy.campaign_structure.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Campaign Structure</h3>
                    <div className="space-y-4">
                      {selectedStrategy.campaign_structure.map((campaign, idx) => (
                        <div key={idx} className="bg-gray-700 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-2">{campaign.name}</h4>
                          <div className="flex gap-4 text-sm text-gray-300">
                            <span>Type: {campaign.type}</span>
                            <span>Ad Groups: {campaign.ad_groups}</span>
                          </div>
                          {campaign.description && (
                            <p className="text-gray-300 text-sm mt-2">{campaign.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {selectedStrategy.primary_keywords && selectedStrategy.primary_keywords.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Primary Keywords</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedStrategy.primary_keywords.map((kw, idx) => (
                        <div key={idx} className="bg-gray-700 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-white font-medium">{kw.keyword}</span>
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                              {kw.match_type}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {kw.estimated_cpc && <span>CPC: {kw.estimated_cpc}</span>}
                            {kw.search_volume && <span className="ml-2">Volume: {kw.search_volume}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Negative Keywords */}
                {selectedStrategy.negative_keywords && selectedStrategy.negative_keywords.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Negative Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStrategy.negative_keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-red-900/50 text-red-300 text-sm rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ad Copy Variations */}
                {selectedStrategy.ad_copy_variations && selectedStrategy.ad_copy_variations.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Ad Copy Variations</h3>
                    <div className="space-y-4">
                      {selectedStrategy.ad_copy_variations.map((ad, idx) => (
                        <div key={idx} className="bg-gray-700 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-3">Variation {idx + 1}</h4>
                          {ad.headlines && ad.headlines.length > 0 && (
                            <div className="mb-3">
                              <p className="text-gray-400 text-sm mb-1">Headlines:</p>
                              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                                {ad.headlines.map((headline, hIdx) => (
                                  <li key={hIdx}>{headline}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {ad.descriptions && ad.descriptions.length > 0 && (
                            <div className="mb-3">
                              <p className="text-gray-400 text-sm mb-1">Descriptions:</p>
                              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                                {ad.descriptions.map((desc, dIdx) => (
                                  <li key={dIdx}>{desc}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {ad.cta && (
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Call to Action:</p>
                              <p className="text-white font-medium">{ad.cta}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Landing Page Recommendations */}
                {selectedStrategy.landing_page_recommendations && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Landing Page Recommendations</h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-line">
                        {selectedStrategy.landing_page_recommendations}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bid Strategy */}
                {selectedStrategy.bid_strategy_recommendations && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Bid Strategy Recommendations</h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-line">
                        {selectedStrategy.bid_strategy_recommendations}
                      </p>
                    </div>
                  </div>
                )}

                {/* Budget Allocation */}
                {selectedStrategy.budget_allocation && selectedStrategy.budget_allocation.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Budget Allocation</h3>
                    <div className="space-y-3">
                      {selectedStrategy.budget_allocation.map((budget, idx) => (
                        <div key={idx} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-white font-semibold">{budget.campaign}</h4>
                            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                              {budget.percentage}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                            <div>
                              <span className="text-gray-400">Daily:</span> {budget.daily_budget}
                            </div>
                            <div>
                              <span className="text-gray-400">Monthly:</span> {budget.monthly_budget}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* A/B Testing Suggestions */}
                {selectedStrategy.ab_testing_suggestions && selectedStrategy.ab_testing_suggestions.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">A/B Testing Suggestions</h3>
                    <div className="space-y-2">
                      {selectedStrategy.ab_testing_suggestions.map((test, idx) => (
                        <div key={idx} className="bg-gray-700 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-white font-medium">{test.test_type}</h4>
                          </div>
                          <p className="text-gray-300 text-sm">{test.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Target Audience Analysis */}
                {selectedStrategy.target_audience_analysis && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Target Audience Analysis</h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-line">
                        {selectedStrategy.target_audience_analysis}
                      </p>
                    </div>
                  </div>
                )}

                {/* Competitor Analysis */}
                {selectedStrategy.competitor_analysis && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Competitor Analysis</h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-line">
                        {selectedStrategy.competitor_analysis}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {strategies.length === 0 && !generating && (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400 mb-4">No Google Ads strategies generated yet</p>
          <button
            onClick={generateStrategy}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Generate Your First Google Ads Strategy
          </button>
        </div>
      )}
    </div>
  );
}

export default GoogleAdsStrategy;

