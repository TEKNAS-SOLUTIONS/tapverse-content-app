import React, { useState } from 'react';

/**
 * ContentEvidence Component
 * 
 * Displays the analysis, reasoning, and evidence behind AI-generated content.
 * Shows why the content was created this way and what data supports it.
 */
function ContentEvidence({ evidence, contentType = 'article' }) {
  const [expandedSection, setExpandedSection] = useState('summary');

  if (!evidence) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
        <p className="text-yellow-300 text-sm">
          ⚠️ No evidence data available for this content. Consider regenerating with analysis enabled.
        </p>
      </div>
    );
  }

  const sections = [
    { id: 'summary', label: '📊 Summary', icon: '📊' },
    { id: 'keywords', label: '🔑 Keyword Analysis', icon: '🔑' },
    { id: 'competitors', label: '🏆 Competitor Analysis', icon: '🏆' },
    { id: 'trends', label: '📈 Trend Analysis', icon: '📈' },
    { id: 'serp', label: '🔍 SERP Insights', icon: '🔍' },
    { id: 'reasoning', label: '🧠 AI Reasoning', icon: '🧠' },
  ];

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-400 bg-green-900/30 border-green-600/30';
    if (score >= 40) return 'text-yellow-400 bg-yellow-900/30 border-yellow-600/30';
    return 'text-red-400 bg-red-900/30 border-red-600/30';
  };

  const getConfidenceLabel = (score) => {
    if (score >= 80) return { label: 'High Confidence', color: 'text-green-400' };
    if (score >= 60) return { label: 'Medium Confidence', color: 'text-yellow-400' };
    return { label: 'Low Confidence', color: 'text-red-400' };
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              🔬 Content Evidence & Analysis
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Why this {contentType} was created and the data supporting it
            </p>
          </div>
          {evidence.overall_confidence && (
            <div className={`px-4 py-2 rounded-lg border ${getScoreColor(evidence.overall_confidence)}`}>
              <div className="text-2xl font-bold">{evidence.overall_confidence}</div>
              <div className={`text-xs ${getConfidenceLabel(evidence.overall_confidence).color}`}>
                {getConfidenceLabel(evidence.overall_confidence).label}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setExpandedSection(section.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              expandedSection === section.id
                ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="p-4">
        {/* Summary Section */}
        {expandedSection === 'summary' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* SEO Potential */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-gray-400 text-sm mb-2">SEO Potential</h4>
                <div className={`text-3xl font-bold ${evidence.seo_potential >= 70 ? 'text-green-400' : evidence.seo_potential >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {evidence.seo_potential || 'N/A'}/100
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {evidence.seo_potential >= 70 ? 'High ranking potential' : 
                   evidence.seo_potential >= 40 ? 'Moderate ranking potential' : 'May need optimization'}
                </p>
              </div>

              {/* Competition Level */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-gray-400 text-sm mb-2">Competition Level</h4>
                <div className={`text-3xl font-bold ${evidence.competition_level === 'low' ? 'text-green-400' : evidence.competition_level === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {evidence.competition_level?.toUpperCase() || 'N/A'}
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {evidence.competition_level === 'low' ? 'Good opportunity' : 
                   evidence.competition_level === 'medium' ? 'Competitive but achievable' : 'Highly competitive'}
                </p>
              </div>

              {/* Trend Status */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-gray-400 text-sm mb-2">Topic Trend</h4>
                <div className={`text-3xl font-bold ${evidence.trend_direction === 'rising' ? 'text-green-400' : evidence.trend_direction === 'stable' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {evidence.trend_direction === 'rising' ? '📈 Rising' : 
                   evidence.trend_direction === 'stable' ? '➡️ Stable' : '📉 Declining'}
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {evidence.trend_reason || 'Based on industry analysis'}
                </p>
              </div>
            </div>

            {/* Key Insights */}
            {evidence.key_insights && (
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">💡 Key Insights</h4>
                <ul className="space-y-2">
                  {evidence.key_insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-blue-400 mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Data Sources Used */}
            {evidence.data_sources && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-gray-400 text-sm mb-2">📚 Data Sources Used</h4>
                <div className="flex flex-wrap gap-2">
                  {evidence.data_sources.map((source, idx) => (
                    <span key={idx} className="bg-slate-700 text-gray-300 px-2 py-1 rounded text-xs">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Keyword Analysis Section */}
        {expandedSection === 'keywords' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">🎯 Primary Keywords Targeting</h4>
              {evidence.keyword_analysis?.primary_keywords?.length > 0 ? (
                <div className="space-y-3">
                  {evidence.keyword_analysis.primary_keywords.map((kw, idx) => (
                    <div key={idx} className="bg-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{kw.keyword}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getScoreColor(kw.score)}`}>
                          Score: {kw.score}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Search Volume: </span>
                          <span className="text-gray-300">{kw.volume || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Difficulty: </span>
                          <span className={kw.difficulty <= 30 ? 'text-green-400' : kw.difficulty <= 60 ? 'text-yellow-400' : 'text-red-400'}>
                            {kw.difficulty || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Intent: </span>
                          <span className="text-gray-300">{kw.intent || 'N/A'}</span>
                        </div>
                      </div>
                      {kw.why_chosen && (
                        <p className="text-gray-500 text-xs mt-2 italic">
                          Why: {kw.why_chosen}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No keyword data available</p>
              )}
            </div>

            {/* Keyword Selection Reasoning */}
            {evidence.keyword_analysis?.selection_reasoning && (
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-medium mb-2">🧠 Why These Keywords?</h4>
                <p className="text-gray-300 text-sm">{evidence.keyword_analysis.selection_reasoning}</p>
              </div>
            )}
          </div>
        )}

        {/* Competitor Analysis Section */}
        {expandedSection === 'competitors' && (
          <div className="space-y-4">
            {evidence.competitor_analysis?.competitors?.length > 0 ? (
              <>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">🏆 Competitors Analyzed</h4>
                  <div className="space-y-3">
                    {evidence.competitor_analysis.competitors.map((comp, idx) => (
                      <div key={idx} className="bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{comp.name || comp.url}</span>
                          {comp.domain_authority && (
                            <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded text-xs">
                              DA: {comp.domain_authority}
                            </span>
                          )}
                        </div>
                        {comp.strengths && (
                          <div className="mb-2">
                            <span className="text-gray-500 text-xs">Strengths: </span>
                            <span className="text-green-400 text-xs">{comp.strengths}</span>
                          </div>
                        )}
                        {comp.weaknesses && (
                          <div>
                            <span className="text-gray-500 text-xs">Gaps we can exploit: </span>
                            <span className="text-yellow-400 text-xs">{comp.weaknesses}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitive Advantage */}
                {evidence.competitor_analysis?.our_advantage && (
                  <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                    <h4 className="text-green-400 font-medium mb-2">✅ Our Competitive Advantage</h4>
                    <p className="text-gray-300 text-sm">{evidence.competitor_analysis.our_advantage}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  ⚠️ No competitor data available. Consider adding competitor URLs to the client profile for better analysis.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Trend Analysis Section */}
        {expandedSection === 'trends' && (
          <div className="space-y-4">
            {evidence.trend_analysis ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h4 className="text-gray-400 text-sm mb-2">📅 Seasonal Relevance</h4>
                    <div className="text-white font-medium">{evidence.trend_analysis.seasonal_relevance || 'Year-round'}</div>
                    {evidence.trend_analysis.best_time_to_publish && (
                      <p className="text-gray-500 text-xs mt-1">
                        Best time: {evidence.trend_analysis.best_time_to_publish}
                      </p>
                    )}
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <h4 className="text-gray-400 text-sm mb-2">📊 Industry Growth</h4>
                    <div className={`text-white font-medium ${evidence.trend_analysis.industry_growth === 'growing' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {evidence.trend_analysis.industry_growth?.toUpperCase() || 'STABLE'}
                    </div>
                  </div>
                </div>

                {/* Related Trends */}
                {evidence.trend_analysis.related_trends?.length > 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">📈 Related Trending Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {evidence.trend_analysis.related_trends.map((trend, idx) => (
                        <span key={idx} className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm">
                          {trend}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trend Reasoning */}
                {evidence.trend_analysis.reasoning && (
                  <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium mb-2">🧠 Trend Analysis Reasoning</h4>
                    <p className="text-gray-300 text-sm">{evidence.trend_analysis.reasoning}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  ⚠️ No trend data available. Connect Google Trends API for real-time trend analysis.
                </p>
              </div>
            )}
          </div>
        )}

        {/* SERP Insights Section */}
        {expandedSection === 'serp' && (
          <div className="space-y-4">
            {evidence.serp_analysis ? (
              <>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">🔍 Current SERP Landscape</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 block">Avg. Word Count</span>
                      <span className="text-white font-medium">{evidence.serp_analysis.avg_word_count || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Avg. DA of Top 10</span>
                      <span className="text-white font-medium">{evidence.serp_analysis.avg_da || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Featured Snippet</span>
                      <span className={evidence.serp_analysis.has_featured_snippet ? 'text-green-400' : 'text-gray-400'}>
                        {evidence.serp_analysis.has_featured_snippet ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Content Type</span>
                      <span className="text-white font-medium">{evidence.serp_analysis.dominant_content_type || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Top Ranking Content */}
                {evidence.serp_analysis.top_results?.length > 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">🥇 Top Ranking Content</h4>
                    <div className="space-y-2">
                      {evidence.serp_analysis.top_results.map((result, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <span className="bg-slate-700 text-gray-400 w-6 h-6 rounded flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          <span className="text-gray-300 truncate flex-1">{result.title}</span>
                          {result.word_count && (
                            <span className="text-gray-500">{result.word_count} words</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Our Strategy */}
                {evidence.serp_analysis.strategy && (
                  <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                    <h4 className="text-green-400 font-medium mb-2">🎯 Our Ranking Strategy</h4>
                    <p className="text-gray-300 text-sm">{evidence.serp_analysis.strategy}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  ⚠️ No SERP data available. Connect SerpAPI or DataForSEO for real SERP analysis.
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Reasoning Section */}
        {expandedSection === 'reasoning' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">🧠 AI Decision Process</h4>
              
              {/* Step by Step Reasoning */}
              {evidence.ai_reasoning?.steps?.length > 0 ? (
                <div className="space-y-3">
                  {evidence.ai_reasoning.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-900/30 rounded-full flex items-center justify-center text-blue-400 text-sm font-medium">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-white font-medium text-sm">{step.title}</h5>
                        <p className="text-gray-400 text-sm mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Reasoning steps not available</p>
              )}
            </div>

            {/* Assumptions Made */}
            {evidence.ai_reasoning?.assumptions?.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <h4 className="text-yellow-400 font-medium mb-2">⚠️ Assumptions Made</h4>
                <ul className="space-y-1">
                  {evidence.ai_reasoning.assumptions.map((assumption, idx) => (
                    <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      {assumption}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Data Limitations */}
            {evidence.ai_reasoning?.limitations?.length > 0 && (
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                <h4 className="text-red-400 font-medium mb-2">🔴 Data Limitations</h4>
                <ul className="space-y-1">
                  {evidence.ai_reasoning.limitations.map((limitation, idx) => (
                    <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Missing Data Warnings */}
      {evidence.missing_data?.length > 0 && (
        <div className="bg-slate-800 p-4 border-t border-slate-700">
          <h4 className="text-yellow-400 text-sm font-medium mb-2">🔧 Improve Analysis Accuracy</h4>
          <div className="flex flex-wrap gap-2">
            {evidence.missing_data.map((item, idx) => (
              <span key={idx} className="bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded text-xs">
                + Add {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ContentEvidence;
