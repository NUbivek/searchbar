import { useState } from 'react';
import { Upload } from 'lucide-react';
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';
import { NetworkMonitor } from '../utils/networkMonitor';
import SearchErrorBoundary from './SearchErrorBoundary';

export default function OpenSearch({ selectedModel }) {
  const [query, setQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState(['Web']);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const sourceRows = [
    ['Web', 'LinkedIn', 'X', 'Reddit', 'Substack'],
    ['Crunchbase', 'Pitchbook', 'Medium', 'Verified Sources', 'Files + URL']
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const requestId = NetworkMonitor.startRequest('/api/openSearch', {
      method: 'POST',
      query,
      model: selectedModel
    });

    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://research.bivek.ai/api/openSearch'
      : '/api/openSearch';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({
          query,
          model: selectedModel,
          sources: selectedSources,
          customUrls,
          uploadedFiles
        })
      });

      NetworkMonitor.endRequest(requestId, response);

      // Check for non-JSON response
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data);
    } catch (err) {
      NetworkMonitor.endRequest(requestId, { ok: false, status: 'failed', error: err.message });
      console.error('Search error:', err);
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSourceClick = (source) => {
    if (source === 'Files + URL') {
      setShowUploadPanel(!showUploadPanel);
      return;
    }

    setSelectedSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  return (
    <SearchErrorBoundary>
      <div className="space-y-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query"
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Source Selection Tabs - Two Rows */}
          <div className="space-y-3">
            {sourceRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-3">
                {row.map(source => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => handleSourceClick(source)}
                    className={`px-4 py-2 rounded-lg transition-colors flex-1
                      ${selectedSources.includes(source) || (source === 'Files + URL' && showUploadPanel)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Upload Panel */}
          {showUploadPanel && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <FileUpload onUpload={(files) => setUploadedFiles([...uploadedFiles, ...files])} />
              <UrlInput onSubmit={(url) => setCustomUrls([...customUrls, url])} />
              
              {(customUrls.length > 0 || uploadedFiles.length > 0) && (
                <div className="mt-4 bg-white p-4 rounded-lg border">
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
    </SearchErrorBoundary>
  );
} 