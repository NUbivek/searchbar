import { useState } from 'react';
import { Upload } from 'lucide-react';
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';
import { NetworkMonitor } from '../utils/networkMonitor';
import SearchErrorBoundary from './SearchErrorBoundary';

export default function OpenSearch({ selectedModel, onSearch, isLoading, error, results }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('Web');
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const sourceRows = [
    ['Web', 'LinkedIn', 'X', 'Reddit', 'Substack'],
    ['Crunchbase', 'Pitchbook', 'Medium', 'Verified Sources', <span className="flex items-center gap-1"><Upload size={16} /> Files + URL</span>]
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      onSearch({
        query: searchQuery,
        source: selectedSource,
        customUrls,
        uploadedFiles
      });
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSourceClick = (source) => {
    if (source === 'Files + URL') {
      setShowUploadPanel(!showUploadPanel);
      return;
    }

    setSelectedSource(typeof source === 'string' ? source : 'Files + URL');
  };

  return (
    <SearchErrorBoundary>
      <div className="space-y-6">
        <form onSubmit={handleSubmit}>
          {/* Search Input */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your search query"
              className="flex-1 px-4 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Source Selection Grid */}
          <div className="space-y-2">
            {sourceRows.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-2">
                {row.map((source, colIndex) => (
                  <button
                    key={colIndex}
                    type="button"
                    onClick={() => handleSourceClick(source)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedSource === (typeof source === 'string' ? source : 'Files + URL')
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
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
              <FileUpload onUpload={(files) => setUploadedFiles(files)} />
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
          <div className="mt-4 text-red-600 text-center">{error}</div>
        )}

        {results && (
          <div className="mt-8">
            {results.map((result, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm mb-4">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-lg font-medium"
                >
                  {result.title}
                </a>
                <p className="mt-2 text-gray-600">{result.snippet}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Source: {result.source}
                  {result.author && ` • Author: ${result.author}`}
                  {result.timestamp && ` • ${new Date(result.timestamp).toLocaleDateString()}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SearchErrorBoundary>
  );
}