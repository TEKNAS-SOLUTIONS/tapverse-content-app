import React, { useState } from 'react';
import CollapsibleContent from '../../shared/CollapsibleContent';
import SEOMetaDetails from '../../shared/SEOMetaDetails';
import ExportButton from '../../shared/ExportButton';
import ApprovalWorkflow from '../../shared/ApprovalWorkflow';

function ContentDisplay({ projectId, clientId, project, client, generatedContent, onComplete }) {
  const [content, setContent] = useState(generatedContent);
  const [seoMeta, setSeoMeta] = useState({
    title: content?.title || '',
    meta_title: content?.meta_title || content?.title || '',
    meta_description: content?.meta_description || '',
    focus_keyword: content?.focus_keyword || '',
  });

  if (!content) {
    return (
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <p className="text-gray-400">No content generated yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-2xl font-semibold text-white mb-4">Step 6: Content Display</h2>
        
        {/* SEO Meta Details */}
        <div className="mb-6">
          <SEOMetaDetails
            meta={seoMeta}
            onChange={setSeoMeta}
          />
        </div>

        {/* Collapsible Content */}
        <CollapsibleContent
          title={content.title || 'Generated Content'}
          content={content.content || content}
          defaultExpanded={true}
        />

        {/* Export Options */}
        <div className="mt-6 flex gap-4">
          <ExportButton
            content={content}
            seoMeta={seoMeta}
            type="word"
          />
          <ExportButton
            content={content}
            seoMeta={seoMeta}
            type="clipboard"
          />
        </div>

        {/* Approval Workflow */}
        <div className="mt-6">
          <ApprovalWorkflow
            content={content}
            seoMeta={seoMeta}
            projectId={projectId}
            clientId={clientId}
            contentType="seo_blog"
          />
        </div>
      </div>
    </div>
  );
}

export default ContentDisplay;
