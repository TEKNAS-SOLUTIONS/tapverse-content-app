import React from 'react';
import JSZip from 'jszip';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

function BulkExport({ content, type = 'zip' }) {
  const handleExportZip = async () => {
    try {
      const zip = new JSZip();
      
      for (const item of content) {
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: item.title || item.service || 'Content',
                    bold: true,
                    size: 32,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: item.content || '',
                    size: 24,
                  }),
                ],
              }),
            ],
          }],
        });

        const blob = await Packer.toBlob(doc);
        zip.file(`${item.title || item.service || 'content'}.docx`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'content-export.zip');
    } catch (error) {
      console.error('Error exporting ZIP:', error);
      alert('Failed to export ZIP file');
    }
  };

  if (content.length === 0) {
    return null;
  }

  return (
    <button
      onClick={handleExportZip}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
    >
      📦 Export {content.length} as ZIP
    </button>
  );
}

export default BulkExport;
