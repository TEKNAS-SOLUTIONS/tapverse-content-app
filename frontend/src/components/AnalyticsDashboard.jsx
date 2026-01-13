import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

function AnalyticsDashboard({ clientId, projectId = null }) {
  const [summary, setSummary] = useState(null);
  const [platformBreakdown, setPlatformBreakdown] = useState([]);
  const [topContent, setTopContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    if (clientId) {
      loadAnalytics();
    }
  }, [clientId, projectId, period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [summaryRes, breakdownRes] = await Promise.all([
        analyticsAPI.getSummary(clientId, projectId, period),
        analyticsAPI.getPlatformBreakdown(clientId, projectId),
      ]);

      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }

      if (breakdownRes.data.success) {
        setPlatformBreakdown(breakdownRes.data.data);
      }

      if (projectId) {
        const topContentRes = await analyticsAPI.getTopContent(projectId, 5);
        if (topContentRes.data.success) {
          setTopContent(topContentRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading && !summary) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">Content performance insights</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-gray-700 text-white rounded-lg p-2"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Content</h3>
            <p className="text-3xl font-bold text-white">{summary.total_content || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Views</h3>
            <p className="text-3xl font-bold text-white">{formatNumber(summary.total_views || 0)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Engagement</h3>
            <p className="text-3xl font-bold text-white">{formatNumber(summary.total_engagement || 0)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-gray-400 text-sm mb-2">Engagement Rate</h3>
            <p className="text-3xl font-bold text-white">{summary.engagement_rate || 0}%</p>
          </div>
        </div>
      )}

      {/* Platform Breakdown */}
      {platformBreakdown.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Platform Performance</h3>
          <div className="space-y-4">
            {platformBreakdown.map((platform) => (
              <div key={platform.platform} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-semibold capitalize">{platform.platform}</h4>
                  <span className="text-gray-400 text-sm">{platform.content_count} pieces</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Views:</span>
                    <span className="text-white ml-2">{formatNumber(platform.total_views || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Clicks:</span>
                    <span className="text-white ml-2">{formatNumber(platform.total_clicks || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Engagement:</span>
                    <span className="text-white ml-2">{formatNumber(platform.total_engagement || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">CTR:</span>
                    <span className="text-white ml-2">{parseFloat(platform.avg_ctr || 0).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performing Content */}
      {topContent.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Top Performing Content</h3>
          <div className="space-y-3">
            {topContent.map((item, idx) => (
              <div key={item.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                  <div>
                    <p className="text-white font-medium capitalize">{item.platform}</p>
                    <p className="text-gray-400 text-sm">{item.content_type}</p>
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-gray-400">Views:</span>
                    <span className="text-white ml-2">{formatNumber(item.views || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Engagement:</span>
                    <span className="text-white ml-2">
                      {formatNumber((item.likes || 0) + (item.comments || 0) + (item.shares || 0))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!summary && !loading && (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400">No analytics data available yet</p>
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;

