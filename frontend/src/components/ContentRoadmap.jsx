import React, { useState, useEffect } from 'react';
import { contentRoadmapAPI } from '../services/api';

function ContentRoadmap({ projectId, strategy }) {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    pillar: '',
    cluster: '',
    status: '',
    monthRange: { start: 0, end: 11 },
  });
  const [draggedArticle, setDraggedArticle] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadRoadmap();
    }
  }, [projectId]);

  const loadRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contentRoadmapAPI.getByProject(projectId);
      if (response.data.success) {
        setRoadmap(response.data.data);
      }
    } catch (err) {
      console.error('Error loading roadmap:', err);
      setError(err.message || 'Failed to load content roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (article, monthIndex) => {
    setDraggedArticle({ article, monthIndex });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (targetMonthIndex, targetArticleIndex = null) => {
    if (!draggedArticle) return;

    const { article, monthIndex: sourceMonthIndex } = draggedArticle;
    
    // Optimistic update
    const updatedRoadmap = [...roadmap];
    const sourceMonth = updatedRoadmap[sourceMonthIndex];
    const targetMonth = updatedRoadmap[targetMonthIndex];

    // Remove from source
    sourceMonth.articles = sourceMonth.articles.filter(a => a.id !== article.id);
    
    // Add to target
    if (targetArticleIndex !== null) {
      targetMonth.articles.splice(targetArticleIndex, 0, { ...article, month: targetMonth.month });
    } else {
      targetMonth.articles.push({ ...article, month: targetMonth.month });
    }

    setRoadmap(updatedRoadmap);
    setDraggedArticle(null);

    // Save to backend
    try {
      await contentRoadmapAPI.reorder(projectId, updatedRoadmap.flatMap(m => 
        m.articles.map((a, idx) => ({ id: a.id, month: m.month, priority: idx + 1 }))
      ));
    } catch (err) {
      console.error('Error saving roadmap order:', err);
      // Revert on error
      loadRoadmap();
    }
  };

  const handleGenerateArticle = async (articleId) => {
    try {
      await contentRoadmapAPI.generateArticle(projectId, articleId);
      await loadRoadmap();
    } catch (err) {
      console.error('Error generating article:', err);
      setError(err.message || 'Failed to generate article');
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    
    try {
      await contentRoadmapAPI.deleteArticle(projectId, articleId);
      await loadRoadmap();
    } catch (err) {
      console.error('Error deleting article:', err);
      setError(err.message || 'Failed to delete article');
    }
  };

  // Calculate progress
  const totalArticles = roadmap.reduce((sum, month) => sum + month.articles.length, 0);
  const generatedArticles = roadmap.reduce((sum, month) => 
    sum + month.articles.filter(a => a.status === 'generated' || a.status === 'published').length, 0
  );
  const publishedArticles = roadmap.reduce((sum, month) => 
    sum + month.articles.filter(a => a.status === 'published').length, 0
  );
  const generatedPercent = totalArticles > 0 ? Math.round((generatedArticles / totalArticles) * 100) : 0;
  const publishedPercent = totalArticles > 0 ? Math.round((publishedArticles / totalArticles) * 100) : 0;

  // Filter roadmap
  const filteredRoadmap = roadmap.map(month => ({
    ...month,
    articles: month.articles.filter(article => {
      if (filters.pillar && article.pillar !== filters.pillar) return false;
      if (filters.cluster && article.cluster !== filters.cluster) return false;
      if (filters.status && article.status !== filters.status) return false;
      return true;
    }),
  })).filter(month => month.articles.length > 0 || !filters.pillar && !filters.cluster && !filters.status);

  // Get unique pillars and clusters for filters
  const allPillars = [...new Set(roadmap.flatMap(m => m.articles.map(a => a.pillar).filter(Boolean)))];
  const allClusters = [...new Set(roadmap.flatMap(m => m.articles.map(a => a.cluster).filter(Boolean)))];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonth = new Date().getMonth();

  const getPillarColor = (pillar) => {
    const colors = {
      'Pillar 1': 'bg-blue-600',
      'Pillar 2': 'bg-green-600',
      'Pillar 3': 'bg-purple-600',
      'Pillar 4': 'bg-orange-600',
      'Pillar 5': 'bg-pink-600',
    };
    return colors[pillar] || 'bg-gray-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 border-green-200';
      case 'generated': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'planned': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading && roadmap.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading content roadmap...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Roadmap</h2>
          <p className="text-gray-600 text-sm mt-1">12-Month Content Plan</p>
        </div>
      </div>

      {/* Progress Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Total Articles</div>
          <div className="text-2xl font-bold text-gray-900">{totalArticles}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Generated</div>
          <div className="text-2xl font-bold text-gray-900">{generatedArticles}</div>
          <div className="text-xs text-gray-500 mt-1">{generatedPercent}%</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Published</div>
          <div className="text-2xl font-bold text-gray-900">{publishedArticles}</div>
          <div className="text-xs text-gray-500 mt-1">{publishedPercent}%</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 mb-1">Remaining</div>
          <div className="text-2xl font-bold text-gray-900">{totalArticles - generatedArticles}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex flex-wrap gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Pillar</label>
          <select
            value={filters.pillar}
            onChange={(e) => setFilters({ ...filters, pillar: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            <option value="">All Pillars</option>
            {allPillars.map(pillar => (
              <option key={pillar} value={pillar}>{pillar}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Cluster</label>
          <select
            value={filters.cluster}
            onChange={(e) => setFilters({ ...filters, cluster: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            <option value="">All Clusters</option>
            {allClusters.map(cluster => (
              <option key={cluster} value={cluster}>{cluster}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="generated">Generated</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => setFilters({ pillar: '', cluster: '', status: '', monthRange: { start: 0, end: 11 } })}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="overflow-x-auto">
        <div className="flex space-x-4 min-w-max pb-4">
          {filteredRoadmap.map((month, monthIndex) => (
            <div
              key={monthIndex}
              className={`flex-shrink-0 w-80 ${monthIndex === currentMonth ? 'ring-2 ring-orange-500' : ''}`}
            >
              <div className={`bg-white rounded-lg p-4 border border-gray-200 shadow-sm ${monthIndex === currentMonth ? 'bg-orange-50' : ''}`}>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {month.month || months[monthIndex]}
                  {monthIndex === currentMonth && <span className="ml-2 text-orange-600 text-sm">(Current)</span>}
                </h3>
                <div
                  className="space-y-2 min-h-[200px]"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(monthIndex)}
                >
                  {month.articles && month.articles.length > 0 ? (
                    month.articles.map((article, articleIndex) => (
                      <div
                        key={article.id}
                        draggable
                        onDragStart={() => handleDragStart(article, monthIndex)}
                        className={`p-3 rounded-lg border cursor-move transition-all hover:shadow-lg ${
                          getPillarColor(article.pillar)
                        } border-gray-300 text-white`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-white font-medium text-sm line-clamp-2">{article.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(article.status)}`}>
                            {article.status}
                          </span>
                        </div>
                        {article.keyword && (
                          <p className="text-xs text-white/90 mb-1">🔑 {article.keyword}</p>
                        )}
                        {article.pillar && (
                          <p className="text-xs text-white/90 mb-1">📚 {article.pillar}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {article.status === 'planned' && (
                            <button
                              onClick={() => handleGenerateArticle(article.id)}
                              className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
                            >
                              Generate
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                      No articles scheduled
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {roadmap.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-600">No roadmap data available. Generate an SEO strategy first.</p>
        </div>
      )}
    </div>
  );
}

export default ContentRoadmap;

