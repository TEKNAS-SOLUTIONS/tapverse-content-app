import React, { useState, useEffect } from 'react';
import { keywordAnalysisAPI } from '../../../services/api';

function KeywordSelection({ projectId, clientId, project, client, keywordAnalysis, keywordGaps, onComplete }) {
  const [keywords, setKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate keyword list with ratings based on analysis and gaps
    if (keywordAnalysis || keywordGaps) {
      // This would come from the API, but for now we'll create a mock list
      const keywordList = (project.keywords || []).map((kw, idx) => ({
        keyword: kw,
        score: 70 + Math.random() * 30, // Mock score 70-100
        volume: ['high', 'medium', 'low'][idx % 3],
        difficulty: 30 + Math.random() * 40, // Mock difficulty 30-70
        opportunity: 60 + Math.random() * 40, // Mock opportunity 60-100
      }));
      setKeywords(keywordList);
    }
  }, [keywordAnalysis, keywordGaps, project.keywords]);

  const handleToggleKeyword = (keyword) => {
    setSelectedKeywords(prev => {
      if (prev.find(k => k.keyword === keyword.keyword)) {
        return prev.filter(k => k.keyword !== keyword.keyword);
      } else {
        return [...prev, keyword];
      }
    });
  };

  const handleGenerateIdeas = () => {
    if (selectedKeywords.length === 0) {
      alert('Please select at least one keyword');
      return;
    }
    onComplete(selectedKeywords);
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-2xl font-semibold text-white mb-4">Step 3: Select Keywords</h2>
      <p className="text-gray-400 mb-6">
        Select 5-10 keywords with ratings to use for content generation. Select multiple keywords using checkboxes.
      </p>

      {keywords.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No keywords available. Please complete previous steps.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keywords.map((kw) => {
              const isSelected = selectedKeywords.find(k => k.keyword === kw.keyword);
              return (
                <div
                  key={kw.keyword}
                  onClick={() => handleToggleKeyword(kw)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => handleToggleKeyword(kw)}
                        className="mr-3 w-4 h-4"
                      />
                      <span className="text-white font-medium">{kw.keyword}</span>
                    </label>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      kw.score >= 80 ? 'bg-green-600 text-white' :
                      kw.score >= 60 ? 'bg-yellow-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {Math.round(kw.score)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mt-2">
                    <div>Volume: <span className="text-white">{kw.volume}</span></div>
                    <div>Difficulty: <span className="text-white">{Math.round(kw.difficulty)}</span></div>
                    <div>Opportunity: <span className="text-white">{Math.round(kw.opportunity)}</span></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <p className="text-gray-400">
              Selected: <span className="text-white font-semibold">{selectedKeywords.length}</span> keywords
            </p>
            <button
              onClick={handleGenerateIdeas}
              disabled={selectedKeywords.length === 0 || selectedKeywords.length > 10}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Generate Content Ideas →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default KeywordSelection;
