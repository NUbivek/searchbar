import React, { useState, useEffect } from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

export default function SearchErrorBoundary({ children }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleSearchError = (event) => {
      const { error } = event.detail;
      setError(error);
    };

    window.addEventListener('search-error', handleSearchError);
    return () => window.removeEventListener('search-error', handleSearchError);
  }, []);

  return (
    <React.Fragment>
      {children}
      {error && (
        <div id="search-error-container" className="fixed bottom-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900">Search Error</h3>
              <p className="mt-1 text-sm text-red-700">{error.message || 'An error occurred while processing your search.'}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-red-600 hover:text-red-700"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}