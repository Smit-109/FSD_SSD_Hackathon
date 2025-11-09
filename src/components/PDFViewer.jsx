import { useState } from 'react';
import { X, Download, ExternalLink, Loader } from 'lucide-react';

function PDFViewer({ pdfUrl, title, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("PDFViewer received URL:", pdfUrl);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${title || 'book'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  if (!pdfUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-dark-900">Read Book</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-red-600 text-lg">PDF file not available for this book.</p>
            <p className="text-gray-600 text-sm mt-4">The book hasn't been uploaded with a PDF file yet. Please contact the library administrator.</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-dark-900 truncate">{title || 'Book Reader'}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">New Tab</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader className="h-8 w-8 animate-spin text-primary-600" />
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-center">
                <p className="text-red-600 text-lg mb-4">{error}</p>
                <button
                  onClick={handleOpenInNewTab}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Open in Browser
                </button>
              </div>
            </div>
          )}

          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-none"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Failed to load PDF. Click "Open in Browser" to view it.');
            }}
            title="PDF Viewer"
          />
        </div>

        <div className="p-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
          <p>💡 Tip: Use keyboard shortcuts (arrow keys) to navigate pages. Press Ctrl+A to select all.</p>
        </div>
      </div>
    </div>
  );
}

export default PDFViewer;
