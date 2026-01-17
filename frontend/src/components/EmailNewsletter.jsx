import React, { useState, useEffect } from 'react';
import { emailNewslettersAPI, contentAPI } from '../services/api';

function EmailNewsletter({ projectId }) {
  const [newsletters, setNewsletters] = useState([]);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadNewsletters();
      loadContent();
    }
  }, [projectId]);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      const response = await emailNewslettersAPI.getByProject(projectId);
      if (response.data.success) {
        setNewsletters(response.data.data);
        if (response.data.data.length > 0 && !selectedNewsletter) {
          setSelectedNewsletter(response.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading newsletters:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async () => {
    try {
      const response = await contentAPI.getByProject(projectId);
      if (response.data.success) {
        setContent(response.data.data.filter(c => c.content_type === 'blog'));
      }
    } catch (err) {
      console.error('Error loading content:', err);
    }
  };

  const generateNewsletter = async (sourceContentId = null) => {
    try {
      setGenerating(true);
      const response = await emailNewslettersAPI.generate({
        projectId,
        sourceContentId,
      });
      if (response.data.success) {
        setNewsletters([response.data.data, ...newsletters]);
        setSelectedNewsletter(response.data.data);
      }
    } catch (err) {
      console.error('Error generating newsletter:', err);
      alert(err.response?.data?.error || 'Failed to generate newsletter');
    } finally {
      setGenerating(false);
    }
  };

  if (loading && newsletters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading newsletters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Newsletters</h2>
          <p className="text-gray-600 text-sm mt-1">Generate email newsletters from blog content</p>
        </div>
        <div className="flex gap-2">
          {content.length > 0 && (
            <select
              onChange={(e) => e.target.value && generateNewsletter(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={generating}
            >
              <option value="">Generate from blog...</option>
              {content.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title || 'Untitled'}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => generateNewsletter()}
            disabled={generating}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          >
            {generating ? 'Generating...' : '+ Generate Newsletter'}
          </button>
        </div>
      </div>

      {generating && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="ml-4 text-gray-600 font-medium">Generating your newsletter...</p>
          </div>
        </div>
      )}

      {newsletters.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
              <h3 className="text-gray-900 font-semibold mb-3">Newsletters</h3>
              {newsletters.map((newsletter) => (
                <button
                  key={newsletter.id}
                  onClick={() => setSelectedNewsletter(newsletter)}
                  className={`w-full text-left p-3 rounded-lg transition-colors border ${
                    selectedNewsletter?.id === newsletter.id
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium truncate">{newsletter.subject_line}</div>
                  <div className={`text-xs mt-1 ${selectedNewsletter?.id === newsletter.id ? 'text-orange-100' : 'text-gray-500'}`}>
                    {new Date(newsletter.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedNewsletter && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Subject Line</h3>
                  <p className="text-gray-700">{selectedNewsletter.subject_line}</p>
                </div>

                {selectedNewsletter.preview_text && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Preview Text</h3>
                    <p className="text-gray-700">{selectedNewsletter.preview_text}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Email Body</h3>
                  <div
                    className="bg-gray-50 rounded-lg p-4 text-gray-900 border border-gray-200"
                    dangerouslySetInnerHTML={{ __html: selectedNewsletter.email_body }}
                  />
                </div>

                {selectedNewsletter.cta_text && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Call to Action</h3>
                    <a
                      href={selectedNewsletter.cta_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      {selectedNewsletter.cta_text}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-600 mb-4">No newsletters generated yet</p>
          <p className="text-gray-500 text-sm mb-6">Generate email newsletters from blog content</p>
          <button
            onClick={() => generateNewsletter()}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            Generate Your First Newsletter
          </button>
        </div>
      )}
    </div>
  );
}

export default EmailNewsletter;

