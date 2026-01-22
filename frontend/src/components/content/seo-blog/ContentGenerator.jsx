import React, { useState } from 'react';
import { contentAPI } from '../../../services/api';

function ContentGenerator({ projectId, clientId, project, client, selectedIdea, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contentAPI.generate('blog', {
        project_id: projectId,
        idea: selectedIdea,
      });
      
      if (response.data.success) {
        onComplete(response.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-2xl font-semibold text-white mb-4">Step 5: Generate Content</h2>
      <p className="text-gray-400 mb-6">
        Generate content for the selected idea. This will create one article at a time.
      </p>

      {selectedIdea && (
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Selected Idea:</h3>
          <p className="text-gray-300">{selectedIdea.title || selectedIdea.description || 'Idea'}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-300">Error: {error}</p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !selectedIdea}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Generating Content...' : 'Generate Content'}
      </button>

      {loading && (
        <div className="mt-4">
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-gray-400 text-sm mt-2">This may take a few minutes...</p>
        </div>
      )}
    </div>
  );
}

export default ContentGenerator;
