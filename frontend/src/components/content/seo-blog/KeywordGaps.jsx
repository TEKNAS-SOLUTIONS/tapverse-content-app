import React, { useState } from 'react';
import { keywordAnalysisAPI } from '../../../services/api';

function KeywordGaps({ projectId, clientId, project, client, keywordAnalysis, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [gaps, setGaps] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyzeGaps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await keywordAnalysisAPI.analyzeGaps({
        projectId,
        clientId,
        keywordAnalysis,
      });
      
      if (response.data.success) {
        setGaps(response.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze keyword gaps');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-2xl font-semibold text-white mb-4">Step 2: Keyword Gaps Analysis</h2>
      <p className="text-gray-400 mb-6">
        Identify content gaps and opportunities based on the keyword analysis.
      </p>

      {!gaps ? (
        <div>
          <button
            onClick={handleAnalyzeGaps}
            disabled={loading || !keywordAnalysis}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing Gaps...' : 'Analyze Keyword Gaps'}
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
            <h3 className="text-lg font-semibold text-white mb-2">Gap Analysis Results</h3>
            <pre className="text-gray-300 text-sm overflow-auto">
              {JSON.stringify(gaps, null, 2)}
            </pre>
          </div>
          <button
            onClick={() => onComplete(gaps)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Continue to Keyword Selection →
          </button>
        </div>
      )}
    </div>
  );
}

export default KeywordGaps;
