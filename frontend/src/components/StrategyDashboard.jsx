import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { Link } from 'react-router-dom';

function StrategyDashboard({ projectId, clientData, projectData }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadDashboard();
    }
  }, [projectId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getByProject(projectId);
      if (response.data.success) {
        setDashboard(response.data.data);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading strategy dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
        <p className="text-gray-600">No dashboard data available. Generate strategies first.</p>
      </div>
    );
  }

  const { project, strategies, summary } = dashboard;
  const businessTypes = project?.business_types || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'optimizing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const calculateProgress = (strategy) => {
    if (!strategy) return 0;
    if (strategy.metrics?.articles_planned) {
      const generated = strategy.metrics.articles_generated || 0;
      const planned = strategy.metrics.articles_planned || 1;
      return Math.round((generated / planned) * 100);
    }
    return strategy.status === 'active' ? 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Strategy Dashboard</h2>
          <p className="text-gray-600 text-sm mt-1">Overview of all strategies for this project</p>
        </div>
        <div className="flex gap-2">
          {businessTypes.length > 0 && (
            <div className="flex gap-1">
              {businessTypes.map((type) => (
                <span
                  key={type}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    type === project.primary_business_type
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {type === 'local' ? 'Local' : type === 'shopify' ? 'Shopify' : 'General'}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Strategy Overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Project</h3>
            <p className="text-xl font-bold text-gray-900">{project?.name || projectData?.project_name}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Total Strategies</h3>
            <p className="text-xl font-bold text-gray-900">
              {Object.values(strategies || {}).filter(s => s).length}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Last Updated</h3>
            <p className="text-xl font-bold text-gray-900">
              {project?.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SEO Strategy Card */}
        {strategies?.seo && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">SEO Strategy</h3>
                  <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(strategies.seo.status)}`}>
                    {strategies.seo.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900 font-medium">{calculateProgress(strategies.seo)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${calculateProgress(strategies.seo)}%` }}
                ></div>
              </div>
            </div>

            {strategies.seo.metrics && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Articles Planned</span>
                  <span className="text-gray-900 font-medium">{strategies.seo.metrics.articles_planned || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Articles Generated</span>
                  <span className="text-gray-900 font-medium">{strategies.seo.metrics.articles_generated || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Articles Published</span>
                  <span className="text-gray-900 font-medium">{strategies.seo.metrics.articles_published || 0}</span>
                </div>
                {strategies.seo.metrics.expected_traffic && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Traffic</span>
                    <span className="text-gray-900 font-medium">{strategies.seo.metrics.expected_traffic}/month</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Link
                to={`/projects/${projectId}?tab=seo-strategy`}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-center text-sm transition-colors"
              >
                View Strategy
              </Link>
            </div>
          </div>
        )}

        {/* Google Ads Strategy Card */}
        {strategies?.google_ads && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Google Ads Strategy</h3>
                  <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(strategies.google_ads.status)}`}>
                    {strategies.google_ads.status}
                  </span>
                </div>
              </div>
            </div>

            {strategies.google_ads.metrics && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Monthly Budget</span>
                  <span className="text-gray-900 font-medium">${strategies.google_ads.metrics.estimated_monthly_budget || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Monthly Clicks</span>
                  <span className="text-gray-900 font-medium">{strategies.google_ads.metrics.estimated_monthly_clicks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Conversions</span>
                  <span className="text-gray-900 font-medium">{strategies.google_ads.metrics.estimated_monthly_conversions || 0}</span>
                </div>
                {strategies.google_ads.metrics.estimated_roi && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. ROI</span>
                    <span className="text-gray-900 font-medium">{strategies.google_ads.metrics.estimated_roi}%</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Link
                to={`/projects/${projectId}?tab=google-ads-strategy`}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-center text-sm transition-colors"
              >
                View Strategy
              </Link>
            </div>
          </div>
        )}

        {/* Facebook Ads Strategy Card */}
        {strategies?.facebook_ads && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Facebook Ads Strategy</h3>
                  <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(strategies.facebook_ads.status)}`}>
                    {strategies.facebook_ads.status}
                  </span>
                </div>
              </div>
            </div>

            {strategies.facebook_ads.metrics && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Monthly Budget</span>
                  <span className="text-gray-900 font-medium">${strategies.facebook_ads.metrics.estimated_monthly_budget || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Monthly Reach</span>
                  <span className="text-gray-900 font-medium">{strategies.facebook_ads.metrics.estimated_monthly_reach || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Conversions</span>
                  <span className="text-gray-900 font-medium">{strategies.facebook_ads.metrics.estimated_monthly_conversions || 0}</span>
                </div>
                {strategies.facebook_ads.metrics.estimated_cost_per_result && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Cost/Result</span>
                    <span className="text-gray-900 font-medium">${strategies.facebook_ads.metrics.estimated_cost_per_result}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Link
                to={`/projects/${projectId}?tab=facebook-ads-strategy`}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-center text-sm transition-colors"
              >
                View Strategy
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Summary */}
      {summary && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Metrics Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Articles Planned</div>
              <div className="text-2xl font-bold text-gray-900">{summary.total_articles_planned || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Articles Generated</div>
              <div className="text-2xl font-bold text-gray-900">{summary.total_articles_generated || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Articles Published</div>
              <div className="text-2xl font-bold text-gray-900">{summary.total_articles_published || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Expected Monthly Traffic</div>
              <div className="text-2xl font-bold text-gray-900">{summary.total_expected_traffic || 0}</div>
            </div>
            {summary.total_expected_conversions && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Expected Conversions</div>
                <div className="text-2xl font-bold text-gray-900">{summary.total_expected_conversions}</div>
              </div>
            )}
            {summary.total_expected_revenue && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Expected Revenue</div>
                <div className="text-2xl font-bold text-gray-900">${summary.total_expected_revenue}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/projects/${projectId}?tab=roadmap`}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            View Full Roadmap
          </Link>
          <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
            Download Strategy (PDF)
          </button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Status Timeline</h3>
        <div className="space-y-3">
          {strategies?.seo && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <span className="text-gray-900 font-medium">SEO Strategy</span>
                <p className="text-sm text-gray-600">
                  Created: {new Date(strategies.seo.created_at).toLocaleDateString()}
                  {strategies.seo.updated_at && ` | Updated: ${new Date(strategies.seo.updated_at).toLocaleDateString()}`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded text-sm border ${getStatusColor(strategies.seo.status)}`}>
                {strategies.seo.status}
              </span>
            </div>
          )}
          {strategies?.google_ads && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <span className="text-gray-900 font-medium">Google Ads Strategy</span>
                <p className="text-sm text-gray-600">
                  Created: {new Date(strategies.google_ads.created_at).toLocaleDateString()}
                  {strategies.google_ads.updated_at && ` | Updated: ${new Date(strategies.google_ads.updated_at).toLocaleDateString()}`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded text-sm border ${getStatusColor(strategies.google_ads.status)}`}>
                {strategies.google_ads.status}
              </span>
            </div>
          )}
          {strategies?.facebook_ads && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <span className="text-gray-900 font-medium">Facebook Ads Strategy</span>
                <p className="text-sm text-gray-600">
                  Created: {new Date(strategies.facebook_ads.created_at).toLocaleDateString()}
                  {strategies.facebook_ads.updated_at && ` | Updated: ${new Date(strategies.facebook_ads.updated_at).toLocaleDateString()}`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded text-sm border ${getStatusColor(strategies.facebook_ads.status)}`}>
                {strategies.facebook_ads.status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StrategyDashboard;

