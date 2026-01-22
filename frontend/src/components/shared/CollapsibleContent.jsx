import React, { useState } from 'react';

function CollapsibleContent({ title, content, defaultExpanded = false, children }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700 transition-colors"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-gray-400">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      
      {isExpanded && (
        <div className="p-4 border-t border-slate-700">
          {children || (
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-wrap">{content}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CollapsibleContent;
