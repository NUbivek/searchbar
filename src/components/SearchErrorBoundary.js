import React from 'react';

export default function SearchErrorBoundary({ children }) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (hasError) {
      // Log error to monitoring service
      console.error('Search error:', error);
    }
  }, [hasError, error]);

  if (hasError) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-red-600">Search failed</h2>
        <p className="mt-2 text-gray-600">{error?.message}</p>
        <button
          onClick={() => setHasError(false)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <React.Fragment>
      {children}
      <div id="search-error-container" />
    </React.Fragment>
  );
} 