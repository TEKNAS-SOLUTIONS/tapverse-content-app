import React, { useState, useEffect } from 'react';
import { clientsAPI, projectsAPI } from '../services/api';
import api from '../services/api';
import ContentEvidence from '../components/ContentEvidence';

function KeywordAnalysis() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('opportunities');

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadProjects(selectedClientId);
      const client = clients.find(c => c.id === selectedClientId);
      setSelectedClient(client);
    } else {
      setProjects([]);
      setSelectedClient(null);
    }
  }, [selectedClientId, clients]);

  const loadClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      if (response.data.success) {
        setClients(response.data.data);
      }
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  const loadProjects = async (clientId) => {
    try {
      const response = await projectsAPI.getAll(clientId);
      if (response.data.success) {
        setProjects(response.data.data);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const runAnalysis = async () => {
    if (!selectedClientId) {
      setError('Please select a client');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Use keyword-analysis API endpoint
      const response = await api.post('/keyword-analysis/analyze', {
        clientId: selectedClientId,
        projectId: selectedProjectId || null,
      });

      if (response.data.success) {
        const analysisData = response.data.data;
        setAnalysis(analysisData);
      } else {
        setError(response.data.error || 'Failed to generate analysis');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate analysis');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-700 bg-green-100';
    if (score >= 40) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 30) return 'text-green-600';
    if (difficulty <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-gray-200 text-gray-700 border-gray-300',
    };
    return colors[priority] || colors.medium;
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'rising': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const tabs = [
    { id: 'opportunities', label: '🎯 Opportunities', count: analysis?.keyword_opportunities?.length },
    { id: 'competitors', label: '🔍 Competitor Gaps', count: analysis?.competitor_gaps?.length },
    { id: 'trends', label: '📈 Industry Trends', count: analysis?.industry_trends?.length },
    { id: 'longtail', label: '🔗 Long-Tail', count: analysis?.long_tail_opportunities?.length },
    { id: 'clusters', label: '📦 Clusters', count: analysis?.keyword_clusters?.length },
    { id: 'quickwins', label: '⚡ Quick Wins', count: analysis?.quick_wins?.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Keyword Analysis</h1>
        <p className="text-gray-600 mt-1">Analyze keywords, competitors, and industry trends</p>
      </div>

      {/* Client & Project Selector */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Client *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setSelectedProjectId('');
                setAnalysis(null);
              }}
              className="block w-full px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">-- Select a Client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} ({c.tapverse_client_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project (Optional)
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={!selectedClientId}
              className="block w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">-- All Projects --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={runAnalysis}
              disabled={!selectedClientId || loading}
              className="w-full px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>🔍 Run Analysis</>
              )}
            </button>
          </div>
        </div>

        {/* Client Info */}
        {selectedClient && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-medium text-gray-900">{selectedClient.company_name}</span>
              {selectedClient.industry && (
                <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{selectedClient.industry}</span>
              )}
              {selectedClient.competitors?.length > 0 && (
                <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded">
                  {selectedClient.competitors.length} competitors
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">❌ {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Analyzing keywords and competitors...</p>
          <p className="text-gray-600 text-sm mt-2">This may take 30-60 seconds</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !loading && (
        <div className="space-y-6">
          {/* Summary Card */}
          {analysis.summary && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Analysis Summary</h2>
              <p className="text-gray-700 mb-4">{analysis.summary.overall_strategy}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Top Priority Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.summary.top_priorities?.map((kw, idx) => (
                      <span key={idx} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Expected Timeline</h3>
                  <p className="text-gray-900">{analysis.summary.timeline}</p>
                </div>
              </div>
            </div>
          )}

          {/* Evidence Dashboard - Shows WHY we made these recommendations */}
          {analysis.evidence && (
            <ContentEvidence 
              evidence={analysis.evidence} 
              contentType="keyword analysis"
            />
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex overflow-x-auto border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-orange-600 text-white border-b-2 border-orange-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-4">
              {/* Keyword Opportunities */}
              {activeTab === 'opportunities' && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Keyword Opportunities</h3>
                  {analysis.keyword_opportunities?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-700 text-sm border-b border-gray-200">
                            <th className="pb-3 pr-4">Keyword</th>
                            <th className="pb-3 pr-4">Volume</th>
                            <th className="pb-3 pr-4">Difficulty</th>
                            <th className="pb-3 pr-4">Strength</th>
                            <th className="pb-3 pr-4">Intent</th>
                            <th className="pb-3 pr-4">Priority</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.keyword_opportunities.map((kw, idx) => (
                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-3 pr-4">
                                <div>
                                  <span className="text-gray-900 font-medium">{kw.keyword}</span>
                                  {kw.rationale && (
                                    <p className="text-gray-600 text-xs mt-1 max-w-xs">{kw.rationale}</p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 pr-4 text-gray-700 capitalize">{kw.search_volume}</td>
                              <td className="py-3 pr-4">
                                <span className={getDifficultyColor(kw.difficulty)}>{kw.difficulty}/100</span>
                              </td>
                              <td className="py-3 pr-4">
                                <span className={`px-2 py-1 rounded ${getScoreColor(kw.strength_score)}`}>
                                  {kw.strength_score}
                                </span>
                              </td>
                              <td className="py-3 pr-4 text-gray-700 capitalize">{kw.intent}</td>
                              <td className="py-3 pr-4">
                                <span className={`px-2 py-1 rounded text-xs border ${getPriorityBadge(kw.priority)}`}>
                                  {kw.priority}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-600">No keyword opportunities found</p>
                  )}
                </div>
              )}

              {/* Competitor Gaps */}
              {activeTab === 'competitors' && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-white mb-4">Competitor Keyword Gaps</h3>
                  {analysis.competitor_gaps?.length > 0 ? (
                    <div className="grid gap-4">
                      {analysis.competitor_gaps.map((gap, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-gray-900 font-medium">{gap.keyword}</span>
                              <p className="text-gray-600 text-sm mt-1">
                                Competitor: <span className="text-purple-400">{gap.competitor}</span>
                              </p>
                            </div>
                            <div className="flex gap-3 text-sm">
                              <div className="text-center">
                                <p className="text-gray-600">Difficulty</p>
                                <p className={getDifficultyColor(gap.difficulty)}>{gap.difficulty}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-500">Opportunity</p>
                                <p className={`px-2 py-1 rounded ${getScoreColor(gap.opportunity_score)}`}>
                                  {gap.opportunity_score}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No competitor gaps identified</p>
                  )}
                </div>
              )}

              {/* Industry Trends */}
              {activeTab === 'trends' && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-white mb-4">Industry Trends</h3>
                  {analysis.industry_trends?.length > 0 ? (
                    <div className="grid gap-4">
                      {analysis.industry_trends.map((trend, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getTrendIcon(trend.trend_direction)}</span>
                              <span className="text-gray-900 font-medium">{trend.topic}</span>
                            </div>
                            <span className={`px-2 py-1 rounded ${getScoreColor(trend.relevance_score)}`}>
                              {trend.relevance_score}% relevant
                            </span>
                          </div>
                          {trend.keywords?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {trend.keywords.map((kw, i) => (
                                <span key={i} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No industry trends identified</p>
                  )}
                </div>
              )}

              {/* Long-Tail */}
              {activeTab === 'longtail' && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-white mb-4">Long-Tail Opportunities</h3>
                  {analysis.long_tail_opportunities?.length > 0 ? (
                    <div className="grid gap-3">
                      {analysis.long_tail_opportunities.map((lt, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                          <span className="text-gray-900">{lt.keyword}</span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">Vol: {lt.search_volume}</span>
                            <span className={getDifficultyColor(lt.difficulty)}>Diff: {lt.difficulty}</span>
                            <span className={`px-2 py-1 rounded ${
                              lt.conversion_potential === 'high' ? 'bg-green-100 text-green-700' :
                              lt.conversion_potential === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-200 text-gray-700'
                            }`}>
                              {lt.conversion_potential} conversion
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No long-tail opportunities found</p>
                  )}
                </div>
              )}

              {/* Clusters */}
              {activeTab === 'clusters' && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-white mb-4">Keyword Clusters</h3>
                  {analysis.keyword_clusters?.length > 0 ? (
                    <div className="grid gap-4">
                      {analysis.keyword_clusters.map((cluster, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="text-gray-900 font-medium mb-2">{cluster.cluster_name}</h4>
                          <div className="mb-3">
                            <span className="text-gray-600 text-sm">Primary: </span>
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm">
                              {cluster.primary_keyword}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {cluster.supporting_keywords?.map((kw, i) => (
                              <span key={i} className="bg-slate-700 text-gray-300 px-2 py-1 rounded text-sm">
                                {kw}
                              </span>
                            ))}
                          </div>
                          {cluster.content_recommendation && (
                            <p className="text-gray-700 text-sm">
                              💡 {cluster.content_recommendation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No keyword clusters identified</p>
                  )}
                </div>
              )}

              {/* Quick Wins */}
              {activeTab === 'quickwins' && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-white mb-4">Quick Wins</h3>
                  <p className="text-gray-600 text-sm mb-4">Low-difficulty keywords with high potential for fast rankings</p>
                  {analysis.quick_wins?.length > 0 ? (
                    <div className="grid gap-3">
                      {analysis.quick_wins.map((qw, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-green-50 to-gray-50 rounded-lg p-4 flex items-center justify-between border border-green-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">⚡</span>
                            <span className="text-gray-900 font-medium">{qw.keyword}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-gray-600 text-xs">Difficulty</p>
                              <p className="text-green-600 font-medium">{qw.difficulty}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600 text-xs">Traffic</p>
                              <p className="text-gray-700">{qw.potential_traffic}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600 text-xs">Time to Rank</p>
                              <p className="text-orange-600">{qw.time_to_rank}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No quick wins identified</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !loading && !error && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-gray-700 text-lg">Select a client and run analysis</p>
          <p className="text-gray-600 text-sm mt-2">
            Get AI-powered keyword research, competitor gaps, and industry trends
          </p>
        </div>
      )}
    </div>
  );
}

export default KeywordAnalysis;
