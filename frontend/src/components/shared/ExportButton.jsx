import React from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

function ExportButton({ content, seoMeta, type = 'word' }) {
  const handleExportWord = async () => {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: seoMeta.title || content.title || 'Content',
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: content.content || content || '',
                  size: 24,
                }),
              ],
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${seoMeta.title || 'content'}.docx`);
    } catch (error) {
      console.error('Error exporting to Word:', error);
      alert('Failed to export to Word document');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = `${seoMeta.title || content.title || ''}\n\n${content.content || content || ''}`;
      await navigator.clipboard.writeText(text);
      alert('Content copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy to clipboard');
    }
  };

  if (type === 'word') {
    return (
      <button
        onClick={handleExportWord}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        📄 Export to Word
      </button>
    );
  }

  if (type === 'clipboard') {
    return (
      <button
        onClick={handleCopyToClipboard}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        📋 Copy to Clipboard
      </button>
    );
  }

  return null;
}

export default ExportButton;
