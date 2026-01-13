import React, { useState, useEffect } from 'react';
import { articleIdeasAPI } from '../services/api';

/**
 * ArticleIdeas Component
 * 
 * Generates and displays article ideas based on:
 * - Industry analysis
 * - Competitor analysis
 * - Trending topics
 * - Keyword gaps
 */
function ArticleIdeas({ client, project = null, onArticleGenerated }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingArticleId, setGeneratingArticleId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [strategyInsights, setStrategyInsights] = useState(null);

  useEffect(() => {
    if (client?.id) {
      loadIdeas();
    }
  }, [client?.id, project?.id]);

  const loadIdeas = async () => {
    try {
      setLoading(true);
      const response = project?.id 
        ? await articleIdeasAPI.getByProject(project.id)
        : await articleIdeasAPI.getByClient(client.id);
      
      if (response.data.success) {
        setIdeas(response.data.data || []);
      }
    } catch (err) {
      console.error('Error loading ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIdeas = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      const response = await articleIdeasAPI.generate(client.id, project?.id, 10);
      
      if (response.data.success) {
        setIdeas(response.data.data.ideas || []);
        setStrategyInsights(response.data.data.strategyInsights);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateArticle = async (idea) => {
    try {
      setGeneratingArticleId(idea.id);
      setError(null);
      
      const response = await articleIdeasAPI.generateArticle(idea.id, project?.id);
      
      if (response.data.success) {
        // Update the idea in the list
        setIdeas(prev => prev.map(i => 
          i.id === idea.id ? { ...i, status: 'generated' } : i
        ));
        
        // Notify parent
        if (onArticleGenerated) {
          onArticleGenerated(response.data.data.content);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setGeneratingArticleId(null);
    }
  };

  const handleRejectIdea = async (idea) => {
    try {
      await articleIdeasAPI.update(idea.id, { status: 'rejected' });
      setIdeas(prev => prev.map(i => 
        i.id === idea.id ? { ...i, status: 'rejected' } : i
      ));
    } catch (err) {
      console.error('Error rejecting idea:', err);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'low': return 'text-green-400 bg-green-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      case 'high': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getIntentIcon = (intent) => {
    switch (intent?.toLowerCase()) {
      case 'informational': return '📚';
      case 'commercial': return '💼';
      case 'transactional': return '💳';
      case 'navigational': return '🧭';
      default: return '📝';
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'how-to': return '🔧';
      case 'ultimate-guide': return '📖';
      case 'listicle': return '📋';
      case 'comparison': return '⚖️';
      case 'case-study': return '📊';
      case 'news': return '📰';
      case 'tutorial': return '🎓';
      case 'checklist': return '✅';
      case 'review': return '⭐';
      default: return '📝';
    }
  };

  const visibleIdeas = ideas.filter(i => i.status !== 'rejected');

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">💡</span>
              Article Ideas
            </h2>
            <p className="text-gray-400 mt-1">
              AI-generated content opportunities based on industry & competitor analysis
            </p>
          </div>
          
          <button
            onClick={handleGenerateIdeas}
            disabled={generating}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 transition-all shadow-lg"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Analyzing & Generating...
              </span>
            ) : (
              <>🔮 Generate New Ideas</>
            )}
          </button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Strategy Insights */}
        {strategyInsights && (
          <div className="mb-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-800/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📊</span> Strategy Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {strategyInsights.pillarContentRecommendation && (
                <div>
                  <span className="text-gray-400">Pillar Content:</span>
                  <p className="text-gray-200">{strategyInsights.pillarContentRecommendation}</p>
                </div>
              )}
              {strategyInsights.quickWins && strategyInsights.quickWins.length > 0 && (
                <div>
                  <span className="text-gray-400">Quick Wins:</span>
                  <p className="text-gray-200">{strategyInsights.quickWins.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ideas List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <span className="animate-spin text-4xl">⏳</span>
            <p className="mt-4">Loading ideas...</p>
          </div>
        ) : visibleIdeas.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-600 rounded-xl">
            <div className="text-5xl mb-4">💡</div>
            <p className="text-xl text-white font-semibold mb-2">No Article Ideas Yet</p>
            <p className="text-gray-400 mb-6">
              Click "Generate New Ideas" to get AI-powered content suggestions
            </p>
            <div className="text-left max-w-md mx-auto text-sm text-gray-400">
              <p className="mb-2">Ideas are based on:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your industry ({client?.industry || 'Not set'})</li>
                <li>Competitor analysis ({(client?.competitors || []).length} competitors)</li>
                <li>Current trending topics</li>
                <li>Keyword gap opportunities</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleIdeas.map((idea) => (
              <div
                key={idea.id}
                className={`bg-gray-700/50 rounded-xl p-5 border transition-all ${
                  selectedIdea?.id === idea.id 
                    ? 'border-blue-500 shadow-lg shadow-blue-900/20' 
                    : 'border-gray-600 hover:border-gray-500'
                } ${idea.status === 'generated' ? 'opacity-60' : ''}`}
              >
                {/* Idea Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getContentTypeIcon(idea.content_type)}</span>
                      <span className="text-xs text-gray-400 uppercase">{idea.content_type}</span>
                      <span className="text-lg">{getIntentIcon(idea.search_intent)}</span>
                      <span className="text-xs text-gray-400">{idea.search_intent}</span>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{idea.title}</h4>
                    
                    {/* Keyword Info */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded-full">
                        🎯 {idea.primary_keyword}
                      </span>
                      {(idea.secondary_keywords || []).slice(0, 3).map((kw, i) => (
                        <span key={i} className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(idea.trending_score)}`}>
                          {idea.trending_score || 0}
                        </div>
                        <div className="text-xs text-gray-400">Trending</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(idea.competitor_gap_score)}`}>
                          {idea.competitor_gap_score || 0}
                        </div>
                        <div className="text-xs text-gray-400">Gap Score</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(idea.estimated_difficulty)}`}>
                      {idea.estimated_difficulty} difficulty
                    </span>
                  </div>
                </div>

                {/* Unique Angle */}
                {idea.unique_angle && (
                  <div className="mt-3 text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3">
                    <span className="text-gray-400">💡 Unique Angle:</span> {idea.unique_angle}
                  </div>
                )}

                {/* Outline Preview */}
                {idea.outline && (
                  <div className="mt-3">
                    <button
                      onClick={() => setSelectedIdea(selectedIdea?.id === idea.id ? null : idea)}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      {selectedIdea?.id === idea.id ? '▼ Hide Outline' : '▶ View Outline'}
                    </button>
                    
                    {selectedIdea?.id === idea.id && (
                      <div className="mt-2 pl-4 border-l-2 border-gray-600 text-sm text-gray-300">
                        {(typeof idea.outline === 'string' ? JSON.parse(idea.outline) : idea.outline).map((section, i) => (
                          <div key={i} className="py-1">{section}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>📈 {idea.estimated_search_volume}</span>
                    <span>•</span>
                    <span>🏷️ {idea.idea_source}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {idea.status === 'generated' ? (
                      <span className="px-4 py-2 bg-green-900/50 text-green-300 rounded-lg text-sm">
                        ✓ Article Generated
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRejectIdea(idea)}
                          className="px-3 py-2 text-gray-400 hover:text-red-400 text-sm"
                        >
                          ✕ Reject
                        </button>
                        <button
                          onClick={() => handleGenerateArticle(idea)}
                          disabled={generatingArticleId === idea.id}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 transition-all text-sm"
                        >
                          {generatingArticleId === idea.id ? (
                            <span className="flex items-center gap-2">
                              <span className="animate-spin">⏳</span>
                              Generating...
                            </span>
                          ) : (
                            <>✨ Generate Article</>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticleIdeas;

