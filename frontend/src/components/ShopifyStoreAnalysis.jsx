import React, { useState, useEffect } from 'react';
import { shopifyAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

function ShopifyStoreAnalysis({ clientId, clientData }) {
  const { showToast } = useToast();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [formData, setFormData] = useState({
    store_url: '',
    access_token: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (clientId) {
      loadStore();
      loadAnalyses();
    }
  }, [clientId]);

  const loadStore = async () => {
    try {
      setLoading(true);
      const response = await shopifyAPI.getStore(clientId);
      if (response.data.success) {
        setStore(response.data.data);
        setShowConnectForm(false);
      }
    } catch (err) {
      // Store not connected - this is okay
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalyses = async () => {
    try {
      const response = await shopifyAPI.getAnalyses(clientId);
      if (response.data.success) {
        setAnalyses(response.data.data);
        // Load latest analysis if available
        if (response.data.data.length > 0) {
          loadAnalysis(response.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading analyses:', err);
    }
  };

  const loadAnalysis = async (analysisId) => {
    try {
      const response = await shopifyAPI.getAnalysis(analysisId);
      if (response.data.success) {
        setAnalysis(response.data.data.analysis_data);
      }
    } catch (err) {
      console.error('Error loading analysis:', err);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validation
    const errors = {};
    if (!formData.store_url.trim()) {
      errors.store_url = 'Store URL is required';
    } else if (!formData.store_url.includes('myshopify.com') && !formData.store_url.includes('shopify')) {
      errors.store_url = 'Invalid Shopify store URL';
    }
    if (!formData.access_token.trim()) {
      errors.access_token = 'Access token is required';
    } else if (!formData.access_token.startsWith('shpat_')) {
      errors.access_token = 'Access token should start with "shpat_"';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setConnecting(true);
      const response = await shopifyAPI.connect(
        clientId,
        formData.store_url,
        formData.access_token
      );

      if (response.data.success) {
        showToast('Shopify store connected successfully!', 'success');
        setStore(response.data.data);
        setShowConnectForm(false);
        setFormData({ store_url: '', access_token: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to connect store', 'error');
    } finally {
      setConnecting(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      showToast('Starting store analysis... This may take a few minutes.', 'info');
      
      const response = await shopifyAPI.analyze(clientId, {
        analyzeProducts: true,
        analyzeCollections: true,
        maxProducts: 100,
        includeDataForSeo: true,
      });

      if (response.data.success) {
        showToast('Store analysis completed!', 'success');
        setAnalysis(response.data.data);
        loadAnalyses(); // Refresh list
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to analyze store', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    );
  }

  // Show connect form if no store connected
  if (!store && !showConnectForm) {
    return (
      <div className="bg-white rounded-lg p-8 text-center border border-gray-200 shadow-sm">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Shopify Store</h2>
        <p className="text-gray-600 mb-6">
          Connect your store to analyze products, get SEO recommendations, and identify sales opportunities.
        </p>
        <button
          onClick={() => setShowConnectForm(true)}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          Connect Store
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Store Connection Status */}
      {store && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🛒</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{store.store_name || 'Shopify Store'}</h2>
                  <p className="text-gray-600 text-sm">{store.store_url}</p>
                </div>
              </div>
              {store.last_sync_at && (
                <p className="text-gray-500 text-sm mt-2">
                  Last synced: {new Date(store.last_sync_at).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
        </div>
      )}

      {/* Connect Form */}
      {showConnectForm && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Connect Shopify Store</h3>
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store URL *
              </label>
              <input
                type="text"
                value={formData.store_url}
                onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
                placeholder="store.myshopify.com"
                className={`w-full px-4 py-2 bg-white text-gray-900 rounded-lg border ${
                  formErrors.store_url ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
              {formErrors.store_url && (
                <p className="mt-1 text-sm text-red-600">{formErrors.store_url}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter your Shopify store domain (e.g., store.myshopify.com)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin API Access Token *
              </label>
              <input
                type="password"
                value={formData.access_token}
                onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                placeholder="shpat_xxxxxxxxxxxxx"
                className={`w-full px-4 py-2 bg-white text-gray-900 rounded-lg border ${
                  formErrors.access_token ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
              {formErrors.access_token && (
                <p className="mt-1 text-sm text-red-600">{formErrors.access_token}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Create a Private App in Shopify Admin → Settings → Apps → Develop apps
                <br />
                Required scopes: read_products, read_content
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={connecting}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {connecting ? 'Connecting...' : 'Connect Store'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConnectForm(false);
                  setFormData({ store_url: '', access_token: '' });
                  setFormErrors({});
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Analysis Status */}
      {analyzing && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900">Analyzing Store...</h3>
              <p className="text-orange-700 text-sm">
                Fetching products, analyzing SEO, and generating recommendations. This may take a few minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Store Summary */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Store Analysis Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">SEO Score</p>
                <p className="text-3xl font-bold text-gray-900">{analysis.seo_score || 0}</p>
                <p className="text-xs text-gray-500 mt-1">out of 100</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Products Analyzed</p>
                <p className="text-3xl font-bold text-gray-900">{analysis.store_summary?.total_products || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Collections</p>
                <p className="text-3xl font-bold text-gray-900">{analysis.store_summary?.total_collections || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Recommendations</p>
                <p className="text-3xl font-bold text-gray-900">{analysis.overall_recommendations?.length || 0}</p>
              </div>
            </div>

            {/* Data Source Info */}
            {analysis.metadata && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="text-gray-900 font-medium">Data Source:</span>{' '}
                  {analysis.metadata.message}
                  {analysis.metadata.fallback_used && (
                    <span className="ml-2 text-yellow-700">⚠️ Fallback to AI</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Overall Recommendations */}
          {analysis.overall_recommendations && analysis.overall_recommendations.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Priority Recommendations</h3>
              <div className="space-y-3">
                {analysis.overall_recommendations
                  .sort((a, b) => {
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                  })
                  .slice(0, 10)
                  .map((rec, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            rec.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : rec.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {rec.priority} priority
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{rec.description}</p>
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>Impact: {rec.impact}</span>
                        <span>Effort: {rec.effort}</span>
                        {rec.affected_count && <span>Affects: {rec.affected_count} products</span>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Product Analyses */}
          {analysis.product_analyses && analysis.product_analyses.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Product SEO Analysis</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analysis.product_analyses
                  .sort((a, b) => (b.seo_score || 0) - (a.seo_score || 0))
                  .slice(0, 20)
                  .map((product, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{product.product_title}</h4>
                          {product.product_url && (
                            <a
                              href={product.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-600 text-sm hover:text-orange-700"
                            >
                              View Product →
                            </a>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{product.seo_score || 0}</div>
                          <div className="text-xs text-gray-600">SEO Score</div>
                        </div>
                      </div>

                      {/* Title Recommendation */}
                      {product.title_recommendation && (
                        <div className="mt-3 p-3 bg-gray-100 rounded border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Title Optimization</p>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700">
                              <span className="text-gray-500">Current:</span> {product.title_recommendation.current}
                            </p>
                            <p className="text-sm text-gray-900 font-medium">
                              <span className="text-green-600">Suggested:</span>{' '}
                              {product.title_recommendation.optimized}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Keyword Opportunities */}
                      {product.keyword_opportunities && product.keyword_opportunities.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-2">Keyword Opportunities</p>
                          <div className="flex flex-wrap gap-2">
                            {product.keyword_opportunities.slice(0, 3).map((kw, kwIdx) => (
                              <div
                                key={kwIdx}
                                className="bg-orange-50 px-3 py-1 rounded text-sm border border-orange-200"
                              >
                                <span className="text-orange-700 font-medium">{kw.keyword}</span>
                                {kw.search_volume && (
                                  <span className="text-orange-600 text-xs ml-2">
                                    {kw.search_volume.toLocaleString()}/mo
                                  </span>
                                )}
                                {kw.cpc && (
                                  <span className="text-green-600 text-xs ml-2">${kw.cpc}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Sales Opportunities */}
          {analysis.sales_opportunities && analysis.sales_opportunities.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Sales Opportunities</h3>
              <div className="space-y-3">
                {analysis.sales_opportunities.slice(0, 10).map((opp, idx) => (
                  <div key={idx} className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-700 mb-1">{opp.product_title}</h4>
                        <p className="text-gray-700 text-sm mb-2">{opp.recommendation}</p>
                        {opp.keyword && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Keyword:</span>
                            <span className="text-gray-900 font-medium">{opp.keyword}</span>
                            {opp.cpc && (
                              <span className="text-green-600">CPC: ${opp.cpc}</span>
                            )}
                            {opp.search_volume && (
                              <span className="text-gray-600">
                                {opp.search_volume.toLocaleString()} searches/month
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analysis History */}
          {analyses.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Analysis History</h3>
              <div className="space-y-2">
                {analyses.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => loadAnalysis(a.id)}
                    className="w-full text-left bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-900 font-medium">
                          Analysis from {new Date(a.created_at).toLocaleString()}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {a.products_analyzed || 0} products • SEO Score: {a.seo_score || 0}
                        </p>
                      </div>
                      <span className="text-orange-600">View →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Analysis Yet */}
      {store && !analysis && !analyzing && analyses.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200 shadow-sm">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Analyze</h3>
          <p className="text-gray-600 mb-6">
            Run your first store analysis to get SEO recommendations and sales opportunities.
          </p>
          <button
            onClick={handleAnalyze}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Run Analysis
          </button>
        </div>
      )}
    </div>
  );
}

export default ShopifyStoreAnalysis;
