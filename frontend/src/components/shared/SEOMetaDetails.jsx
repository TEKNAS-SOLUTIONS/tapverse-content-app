import React from 'react';

function SEOMetaDetails({ meta, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...meta,
      [field]: value,
    });
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">SEO Meta Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={meta.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Meta Title
          </label>
          <input
            type="text"
            value={meta.meta_title}
            onChange={(e) => handleChange('meta_title', e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={60}
          />
          <p className="text-xs text-gray-500 mt-1">{meta.meta_title?.length || 0}/60 characters</p>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Meta Description
          </label>
          <textarea
            value={meta.meta_description}
            onChange={(e) => handleChange('meta_description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={160}
          />
          <p className="text-xs text-gray-500 mt-1">{meta.meta_description?.length || 0}/160 characters</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Focus Keyword
          </label>
          <input
            type="text"
            value={meta.focus_keyword}
            onChange={(e) => handleChange('focus_keyword', e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export default SEOMetaDetails;
