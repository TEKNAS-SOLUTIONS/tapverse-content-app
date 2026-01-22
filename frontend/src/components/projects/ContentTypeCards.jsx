import React from 'react';

function ContentTypeCards({ projectTypes, onSelectType }) {
  // Only show active content types (SEO Blog and Programmatic SEO for now)
  const activeTypes = {
    'seo_blog': { label: 'SEO Blog Content', icon: '📝', color: 'from-blue-500 to-blue-600' },
    'programmatic_seo': { label: 'Programmatic SEO', icon: '🔍', color: 'from-purple-500 to-purple-600' },
  };

  // Filter to only show types that are in project types
  const availableTypes = projectTypes
    .filter(type => activeTypes[type])
    .map(type => ({ type, ...activeTypes[type] }));

  if (availableTypes.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <p className="text-gray-400">No active content types for this project</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-lg font-semibold text-white mb-4">Content Types</h2>
      <div className="flex flex-wrap gap-4">
        {availableTypes.map(({ type, label, icon, color }) => (
          <button
            key={type}
            onClick={() => onSelectType(type)}
            className={`flex items-center gap-3 px-6 py-4 bg-gradient-to-r ${color} rounded-lg text-white font-medium hover:opacity-90 transition-opacity min-w-[200px]`}
          >
            <span className="text-2xl">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ContentTypeCards;
