import React, { useState, useEffect } from 'react';
import { facebookAdsStrategyAPI } from '../services/api';

function FacebookAdsStrategy({ projectId, clientData, projectData }) {
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
      const response = await facebookAdsStrategyAPI.getByProject(projectId);
      if (response.data.success) {
        setStrategies(response.data.data);
        if (response.data.data.length > 0 && !selectedStrategy) {
          setSelectedStrategy(response.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading Facebook Ads strategies:', err);
      setError(err.message || 'Failed to load Facebook Ads strategies');
    } finally {
      setLoading(false);
    }
  };

  const generateStrategy = async () => {
    try {
      setGenerating(true);
      setError(null);
      const response = await facebookAdsStrategyAPI.generate(projectId, clientData, projectData);
      if (response.data.success) {
        const newStrategy = response.data.data;
        setStrategies([newStrategy, ...strategies]);
        setSelectedStrategy(newStrategy);
      }
    } catch (err) {
      console.error('Error generating Facebook Ads strategy:', err);
      setError(err.message || 'Failed to generate Facebook Ads strategy');
    } finally {
      setGenerating(false);
    }
  };

  if (loading && strategies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading Facebook Ads strategies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Facebook & Instagram Ads Strategy</h2>
          <p className="text-gray-400 text-sm mt-1">
            Comprehensive social media advertising strategies powered by Claude
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
              Generate Facebook Ads Strategy
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
                            <span>Objective: {campaign.objective}</span>
                            <span>Ad Sets: {campaign.ad_sets}</span>
                          </div>
                          {campaign.description && (
                            <p className="text-gray-300 text-sm mt-2">{campaign.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audience Targeting */}
                {selectedStrategy.audience_targeting && selectedStrategy.audience_targeting.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Audience Targeting</h3>
                    <div className="space-y-3">
                      {selectedStrategy.audience_targeting.map((audience, idx) => (
                        <div key={idx} className="bg-gray-700 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-2">{audience.name}</h4>
                          <div className="text-sm text-gray-300 space-y-1">
                            {audience.demographics && (
                              <p><span className="text-gray-400">Demographics:</span> {audience.demographics}</p>
                            )}
                            {audience.interests && audience.interests.length > 0 && (
                              <p><span className="text-gray-400">Interests:</span> {audience.interests.join(', ')}</p>
                            )}
                            {audience.behaviors && audience.behaviors.length > 0 && (
                              <p><span className="text-gray-400">Behaviors:</span> {audience.behaviors.join(', ')}</p>
                            )}
                            {audience.description && (
                              <p className="mt-2 text-gray-300">{audience.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Audiences */}
                {selectedStrategy.custom_audiences && selectedStrategy.custom_audiences.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Custom Audiences</h3>
                    <div className="space-y-2">
                      {selectedStrategy.custom_audiences.map((audience, idx) => (
                        <div key={idx} className="bg-gray-700 rounded-lg p-3">
                          <h4 className="text-white font-medium">{audience.type}</h4>
                          {audience.description && (
                            <p className="text-gray-300 text-sm mt-1">{audience.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lookalike Audiences */}
                {selectedStrategy.lookalike_audiences && selectedStrategy.lookalike_audiences.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Lookalike Audiences</h3>
                    <div className="space-y-2">
                      {selectedStrategy.lookalike_audiences.map((audience, idx) => (
                        <div key={idx} className="bg-gray-700 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-white font-medium">Source: {audience.source}</h4>
                              <p className="text-gray-300 text-sm mt-1">{audience.description}</p>
                            </div>
                            <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                              {audience.percentage}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ad Creative Concepts */}
                {selectedStrategy.ad_creative_concepts && selectedStrategy.ad_creative_concepts.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Ad Creative Concepts</h3>
                    <div className="space-y-4">
                      {selectedStrategy.ad_creative_concepts.map((creative, idx) => (
                        <div key={idx} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-white font-semibold">{creative.type} Ad</h4>
                            <span className="px-2 py-1 bg-pink-600 text-white text-xs rounded">
                              {creative.type}
                            </span>
                          </div>
                          {creative.concept && (
                            <p className="text-gray-300 text-sm mb-2"><span className="text-gray-400">Concept:</span> {creative.concept}</p>
                          )}
                          {creative.copy && (
                            <div className="bg-gray-600 rounded p-3 mb-2">
                              <p className="text-white text-sm">{creative.copy}</p>
                            </div>
                          )}
                          {creative.cta && (
                            <p className="text-blue-400 font-medium">{creative.cta}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Placement Recommendations */}
                {selectedStrategy.placement_recommendations && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Placement Recommendations</h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-line">
                        {selectedStrategy.placement_recommendations}
                      </p>
                    </div>
                  </div>
                )}

                {/* Budget Strategy */}
                {selectedStrategy.budget_strategy && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Budget Strategy</h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-line">
                        {selectedStrategy.budget_strategy}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bidding Strategy */}
                {selectedStrategy.bidding_strategy && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Bidding Strategy</h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-line">
                        {selectedStrategy.bidding_strategy}
                      </p>
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
          <p className="text-gray-400 mb-4">No Facebook Ads strategies generated yet</p>
          <button
            onClick={generateStrategy}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Generate Your First Facebook Ads Strategy
          </button>
        </div>
      )}
    </div>
  );
}

export default FacebookAdsStrategy;

