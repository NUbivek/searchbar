import { useState } from 'react';
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';

export default function VerifiedSearch({ selectedModel }) {
  const [query, setQuery] = useState('');
  const [customMode, setCustomMode] = useState('verified');
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verifiedSearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          model: selectedModel,
          customMode,
          customUrls,
          uploadedFiles
        }),
      });

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query"
            className="flex-1 px-6 py-3 text-lg border rounded-lg shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white text-lg rounded-lg
              hover:bg-blue-700 transition-colors shadow-sm"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => setCustomMode('custom')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              customMode === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Custom Sources
          </button>
          <button
            type="button"
            onClick={() => setCustomMode('combined')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              customMode === 'combined' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Custom + Verified Sources
          </button>
        </div>

        {(customMode === 'custom' || customMode === 'combined') && (
          <div className="space-y-4">
            <FileUpload onUpload={(files) => setUploadedFiles([...uploadedFiles, ...files])} />
            <UrlInput onSubmit={(url) => setCustomUrls([...customUrls, url])} />
            
            {(customUrls.length > 0 || uploadedFiles.length > 0) && (
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Added Sources</h4>
                {customUrls.map((url, i) => (
                  <div key={i} className="text-sm text-gray-600">{url}</div>
                ))}
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="text-sm text-gray-600">{file.name}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </form>

      {error && (
        <div className="text-red-600 text-center">{error}</div>
      )}

      {results && (
        <div className="mt-8 space-y-8">
          {results.sources?.map((result, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {result.source}
              </h3>
              <p className="mt-2 text-gray-600">{result.content}</p>
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                >
                  View Source →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 