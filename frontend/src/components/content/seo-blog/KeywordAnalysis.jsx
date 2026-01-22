import React, { useState } from 'react';
import { keywordAnalysisAPI } from '../../../services/api';

function KeywordAnalysis({ projectId, clientId, project, client, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await keywordAnalysisAPI.analyze({
        projectId,
        clientId,
        keywords: project.keywords || [],
      });
      
      if (response.data.success) {
        setAnalysis(response.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze keywords');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-2xl font-semibold text-white mb-4">Step 1: Keyword Analysis</h2>
      <p className="text-gray-400 mb-6">
        Analyze keywords for this project to understand search trends, competition, and opportunities.
      </p>

      {!analysis ? (
        <div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Start Keyword Analysis'}
          </button>
          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
              <p className="text-red-300">Error: {error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Analysis Results</h3>
            <pre className="text-gray-300 text-sm overflow-auto">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
          <button
            onClick={() => onComplete(analysis)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Continue to Keyword Gaps →
          </button>
        </div>
      )}
    </div>
  );
}

export default KeywordAnalysis;
