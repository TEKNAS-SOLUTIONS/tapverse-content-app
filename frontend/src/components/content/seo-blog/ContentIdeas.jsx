import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { articleIdeasAPI } from '../../../services/api';

function ContentIdeas({ projectId, clientId, project, client, selectedKeywords, onComplete, onRerunIdeas }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedKeywords && selectedKeywords.length > 0) {
      generateIdeas();
    }
  }, []);

  const generateIdeas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await articleIdeasAPI.generate(clientId, projectId, 5);
      
      if (response.data.success) {
        setIdeas(response.data.data || []);
        toast.success('Content ideas generated successfully!');
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to generate content ideas';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRerun = () => {
    setIdeas([]);
    generateIdeas();
  };

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Generating content ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Step 4: Content Ideas</h2>
        <button
          onClick={handleRerun}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          Rerun Ideas
        </button>
      </div>
      <p className="text-gray-400 mb-6">
        Generated 3-5 content ideas based on selected keywords. Select one to generate content.
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-300">Error: {error}</p>
        </div>
      )}

      {ideas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No ideas generated yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea, idx) => (
            <div
              key={idx}
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => onComplete(idea)}
            >
              <h3 className="text-lg font-semibold text-white mb-2">{idea.title || `Idea ${idx + 1}`}</h3>
              <p className="text-gray-400 text-sm">{idea.description || idea.content || 'No description'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContentIdeas;
