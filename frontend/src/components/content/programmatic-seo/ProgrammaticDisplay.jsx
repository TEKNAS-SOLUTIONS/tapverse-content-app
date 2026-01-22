import React, { useState } from 'react';
import CollapsibleContent from '../../shared/CollapsibleContent';
import SEOMetaDetails from '../../shared/SEOMetaDetails';
import ExportButton from '../../shared/ExportButton';
import BulkExport from '../../shared/BulkExport';
import ApprovalWorkflow from '../../shared/ApprovalWorkflow';

function ProgrammaticDisplay({ projectId, clientId, project, client, generatedContent, onComplete }) {
  const [selectedContent, setSelectedContent] = useState([]);
  const [seoMeta, setSeoMeta] = useState({});

  const handleToggleContent = (content) => {
    setSelectedContent(prev => {
      if (prev.find(c => c.id === content.id)) {
        return prev.filter(c => c.id !== content.id);
      } else {
        return [...prev, content];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedContent(generatedContent);
  };

  if (!generatedContent || generatedContent.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <p className="text-gray-400">No content generated yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-white">Step 5: Content Display</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
            >
              Select All
            </button>
            <BulkExport
              content={selectedContent}
              type="zip"
            />
          </div>
        </div>

        <p className="text-gray-400 mb-6">
          All generated content displayed in collapsible sections. Select individual or multiple pieces to approve.
        </p>

        {/* Content List - Collapsible */}
        <div className="space-y-4">
          {generatedContent.map((content, idx) => {
            const isSelected = selectedContent.find(c => c.id === content.id);
            const contentMeta = seoMeta[content.id] || {
              title: content.title || `${content.service} in ${content.suburb}`,
              meta_title: content.meta_title || content.title,
              meta_description: content.meta_description || '',
              focus_keyword: `${content.service} ${content.suburb}`,
            };

            return (
              <div key={content.id || idx} className="bg-slate-800 rounded-lg border border-slate-700">
                <div className="p-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => handleToggleContent(content)}
                        className="w-4 h-4"
                      />
                      <h3 className="text-lg font-semibold text-white">
                        {content.service} in {content.suburb}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <ExportButton
                        content={content}
                        seoMeta={contentMeta}
                        type="word"
                      />
                      <ExportButton
                        content={content}
                        seoMeta={contentMeta}
                        type="clipboard"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <SEOMetaDetails
                    meta={contentMeta}
                    onChange={(meta) => setSeoMeta(prev => ({ ...prev, [content.id || idx]: meta }))}
                  />

                  <div className="mt-4">
                    <CollapsibleContent
                      title="Content"
                      content={content.content || content}
                      defaultExpanded={false}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bulk Approval */}
        {selectedContent.length > 0 && (
          <div className="mt-6">
            <ApprovalWorkflow
              content={selectedContent}
              seoMeta={seoMeta}
              projectId={projectId}
              clientId={clientId}
              contentType="programmatic_seo"
              multiple={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgrammaticDisplay;
