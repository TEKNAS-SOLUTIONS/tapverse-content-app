import React from 'react';
import { contentAPI } from '../services/api';

function ContentPreview({ content, projectId, onUpdate }) {
  if (!content) {
    return (
      <div className="text-center py-12 text-gray-400">
        No content selected for preview
      </div>
    );
  }

  const {
    id,
    title,
    content: articleContent,
    meta_description,
    keywords = [],
    seo_score = 0,
    readability_score = 0,
    statistics = {},
    ai_search_notes = {},
  } = content;

  const wordCount = statistics.word_count || 0;
  const readingTime = statistics.reading_time || Math.ceil(wordCount / 200);
  const keywordDensity = statistics.keyword_density || 0;
  const fleschKincaidLevel = statistics.flesch_kincaid_level || 0;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-600/20 border-green-600/30';
    if (score >= 60) return 'bg-yellow-600/20 border-yellow-600/30';
    return 'bg-red-600/20 border-red-600/30';
  };

  return (
    <div className="space-y-6">
      {/* Main Content Preview */}
      <div className="bg-white rounded-lg p-8 shadow-xl">
        {/* Title */}
        {title && (
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        )}

        {/* Meta Description */}
        {meta_description && (
          <p className="text-lg text-gray-600 mb-6">{meta_description}</p>
        )}

        {/* Featured Image Placeholder */}
        <div className="w-full h-64 bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
          <span className="text-gray-400">Featured Image</span>
        </div>

        {/* Article Content */}
        {articleContent && (
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {articleContent.split('\n').map((paragraph, idx) => {
                if (paragraph.trim().startsWith('#')) {
                  const level = paragraph.match(/^#+/)?.[0].length || 1;
                  const text = paragraph.replace(/^#+\s*/, '');
                  const HeadingTag = `h${Math.min(level, 6)}`;
                  return (
                    <HeadingTag
                      key={idx}
                      className={`font-bold text-gray-900 mt-6 mb-4 ${
                        level === 1 ? 'text-3xl' :
                        level === 2 ? 'text-2xl' :
                        level === 3 ? 'text-xl' : 'text-lg'
                      }`}
                    >
                      {text}
                    </HeadingTag>
                  );
                }
                if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('*')) {
                  return (
                    <ul key={idx} className="list-disc list-inside mb-4 ml-4">
                      <li>{paragraph.replace(/^[-*]\s*/, '')}</li>
                    </ul>
                  );
                }
                if (paragraph.trim()) {
                  return (
                    <p key={idx} className="mb-4">{paragraph}</p>
                  );
                }
                return <br key={idx} />;
              })}
            </div>
          </div>
        )}
      </div>

      {/* SEO Information & Scores Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SEO Information Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">SEO Information</h3>
            
            {/* Target Keyword */}
            {keywords && keywords.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Target Keyword</label>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Keywords */}
            {keywords && keywords.length > 1 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Related Keywords</label>
                <div className="flex flex-wrap gap-2">
                  {keywords.slice(1).map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Meta Description */}
            {meta_description && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">
                  Meta Description ({meta_description.length}/160)
                </label>
                <p className="text-gray-300 text-sm bg-gray-700 p-3 rounded">
                  {meta_description}
                </p>
              </div>
            )}

            {/* URL Slug */}
            {title && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-400 mb-2 block">URL Slug</label>
                <p className="text-gray-300 text-sm bg-gray-700 p-3 rounded font-mono">
                  /{title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
                </p>
              </div>
            )}

            {/* Internal/External Linking Suggestions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Internal Links</label>
                <p className="text-gray-300 text-sm">3+ recommended</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">External Links</label>
                <p className="text-gray-300 text-sm">2+ recommended</p>
              </div>
            </div>
          </div>

          {/* SEO Scores */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">SEO Scores</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${getScoreBgColor(seo_score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">SEO Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(seo_score)}`}>
                    {seo_score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      seo_score >= 80 ? 'bg-green-600' :
                      seo_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${seo_score}%` }}
                  ></div>
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${getScoreBgColor(readability_score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Readability</span>
                  <span className={`text-2xl font-bold ${getScoreColor(readability_score)}`}>
                    {readability_score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      readability_score >= 80 ? 'bg-green-600' :
                      readability_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${readability_score}%` }}
                  ></div>
                </div>
              </div>
            </div>
            {keywordDensity > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Keyword Density</span>
                  <span className="text-white font-medium">{keywordDensity.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-400">Flesch-Kincaid Level</span>
                  <span className="text-white font-medium">Grade {fleschKincaidLevel.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Statistics Panel */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Word Count</div>
                <div className="text-2xl font-bold text-white">{wordCount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Reading Time</div>
                <div className="text-2xl font-bold text-white">{readingTime} min</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Paragraphs</div>
                <div className="text-2xl font-bold text-white">{statistics.paragraph_count || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Headings</div>
                <div className="text-2xl font-bold text-white">{statistics.heading_count || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Search Optimization Notes */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-6 sticky top-6">
            <h3 className="text-xl font-bold text-white mb-4">AI Search Optimization</h3>
            <div className="space-y-4">
              {ai_search_notes.google_ai_overviews && (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <div className="text-sm font-medium text-white mb-1">Google AI Overviews</div>
                  <p className="text-xs text-gray-400">{ai_search_notes.google_ai_overviews}</p>
                </div>
              )}
              {ai_search_notes.chatgpt_search && (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <div className="text-sm font-medium text-white mb-1">ChatGPT Search</div>
                  <p className="text-xs text-gray-400">{ai_search_notes.chatgpt_search}</p>
                </div>
              )}
              {ai_search_notes.perplexity && (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <div className="text-sm font-medium text-white mb-1">Perplexity</div>
                  <p className="text-xs text-gray-400">{ai_search_notes.perplexity}</p>
                </div>
              )}
              {ai_search_notes.claude_search && (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <div className="text-sm font-medium text-white mb-1">Claude Search</div>
                  <p className="text-xs text-gray-400">{ai_search_notes.claude_search}</p>
                </div>
              )}
              {ai_search_notes.copilot && (
                <div className="p-3 bg-gray-700 rounded-lg">
                  <div className="text-sm font-medium text-white mb-1">Microsoft Copilot</div>
                  <p className="text-xs text-gray-400">{ai_search_notes.copilot}</p>
                </div>
              )}
              {Object.keys(ai_search_notes).length === 0 && (
                <p className="text-sm text-gray-400">No AI search optimization notes available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            ✏️ Edit Content
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
            📥 Download PDF
          </button>
          <button
            onClick={() => {
              const text = `${title}\n\n${meta_description}\n\n${articleContent}`;
              navigator.clipboard.writeText(text);
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            📋 Copy to Clipboard
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
            📅 Schedule Publishing
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
            🌐 View on Website
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContentPreview;

