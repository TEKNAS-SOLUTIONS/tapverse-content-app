import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { contentAPI } from '../../services/api';

function ApprovalWorkflow({ content, seoMeta, projectId, clientId, contentType }) {
  const [selected, setSelected] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);

  const handleApprove = async () => {
    try {
      setApproving(true);
      
      // Store in approved_content table via API
      const response = await contentAPI.approve({
        contentId: content.id,
        projectId,
        clientId,
        contentType,
        title: seoMeta.title || content.title,
        content: content.content || content,
        meta_title: seoMeta.meta_title,
        meta_description: seoMeta.meta_description,
        focus_keyword: seoMeta.focus_keyword,
        ...seoMeta,
      });
      
      if (response.data.success) {
        setApproved(true);
        toast.success('Content approved and stored in CMS-ready format!');
      }
    } catch (error) {
      console.error('Error approving content:', error);
      alert('Failed to approve content');
    } finally {
      setApproving(false);
    }
  };

  if (approved) {
    return (
      <div className="bg-green-900/50 border border-green-700 rounded-lg p-4">
        <p className="text-green-300">✓ Content approved and stored in CMS-ready format</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => setSelected(e.target.checked)}
            className="mr-3 w-4 h-4"
          />
          <span className="text-white">Select for approval</span>
        </label>
        <button
          onClick={handleApprove}
          disabled={!selected || approving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {approving ? 'Approving...' : 'Approve Selected'}
        </button>
      </div>
      <p className="text-gray-400 text-sm mt-2">
        Approved content will be stored in CMS-ready format for automatic pull
      </p>
    </div>
  );
}

export default ApprovalWorkflow;
