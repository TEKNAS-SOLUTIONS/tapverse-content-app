import React, { useState, useEffect } from 'react';
import { contentAPI } from '../../../services/api';

function BatchGenerator({ projectId, clientId, project, client, selectedCombinations, onComplete }) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState([]);
  const [error, setError] = useState(null);

  const combinationsToGenerate = selectedCombinations.slice(0, 10);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      setProgress(combinationsToGenerate.map((_, idx) => ({
        index: idx,
        combination: combinationsToGenerate[idx],
        status: 'pending',
        content: null,
      })));

      // Generate content for each combination
      const results = [];
      for (let i = 0; i < combinationsToGenerate.length; i++) {
        const combo = combinationsToGenerate[i];
        try {
          setProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, status: 'generating' } : p
          ));

          const response = await contentAPI.generate('programmatic-seo', {
            project_id: projectId,
            suburb: combo.suburb,
            service: combo.service,
          });

          if (response.data.success) {
            results.push({
              ...combo,
              content: response.data.data,
            });
            setProgress(prev => prev.map((p, idx) => 
              idx === i ? { ...p, status: 'completed', content: response.data.data } : p
            ));
          }
        } catch (err) {
          setProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, status: 'failed', error: err.message } : p
          ));
        }
      }

      onComplete(results);
    } catch (err) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-2xl font-semibold text-white mb-4">Step 4: Batch Generate Content</h2>
      <p className="text-gray-400 mb-6">
        Generate up to 10 pieces of content in one go for selected combinations.
      </p>

      {progress.length === 0 ? (
        <div>
          <div className="mb-4 p-4 bg-slate-800 rounded-lg">
            <p className="text-white mb-2">
              Ready to generate <span className="font-bold">{combinationsToGenerate.length}</span> content pieces:
            </p>
            <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
              {combinationsToGenerate.map((combo, idx) => (
                <li key={idx}>{combo.label}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || combinationsToGenerate.length === 0}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {generating ? 'Generating...' : `Generate ${combinationsToGenerate.length} Pieces`}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {progress.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                item.status === 'completed' ? 'bg-green-900/20 border-green-700' :
                item.status === 'generating' ? 'bg-blue-900/20 border-blue-700' :
                item.status === 'failed' ? 'bg-red-900/20 border-red-700' :
                'bg-slate-800 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{item.combination.label}</p>
                  <p className="text-gray-400 text-sm">
                    {item.status === 'pending' && 'Waiting...'}
                    {item.status === 'generating' && 'Generating...'}
                    {item.status === 'completed' && '✓ Completed'}
                    {item.status === 'failed' && `✗ Failed: ${item.error}`}
                  </p>
                </div>
                {item.status === 'generating' && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                )}
              </div>
            </div>
          ))}
          
          {generating && (
            <div className="mt-4">
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(progress.filter(p => p.status === 'completed').length / progress.length) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm mt-2 text-center">
                {progress.filter(p => p.status === 'completed').length} of {progress.length} completed
              </p>
            </div>
          )}

          {!generating && progress.length > 0 && (
            <button
              onClick={() => onComplete(progress.filter(p => p.status === 'completed').map(p => ({
                ...p.combination,
                content: p.content,
              })))}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              View Generated Content →
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-300">Error: {error}</p>
        </div>
      )}
    </div>
  );
}

export default BatchGenerator;
