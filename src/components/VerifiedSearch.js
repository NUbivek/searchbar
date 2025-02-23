import { useState } from 'react';
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';

export default function VerifiedSearch({ selectedModel, onSearch, isLoading, error }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState('custom');
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSearch({
      query: searchQuery,
      mode,
      customUrls,
      uploadedFiles
    });
  };

  return (
    <div>
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
            Search
          </button>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Custom Sources
          </button>
          <button
            type="button"
            onClick={() => setMode('combined')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'combined' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Custom + Verified Sources
          </button>
        </div>

        {/* File Upload and URL Input */}
        {mode === 'custom' && (
          <div className="space-y-4">
            <FileUpload
              files={uploadedFiles}
              onFilesChange={setUploadedFiles}
            />
            <UrlInput
              urls={customUrls}
              onUrlsChange={setCustomUrls}
            />
          </div>
        )}
      </form>

      {error && (
        <div className="mt-4 text-red-600 text-center">{error}</div>
      )}
    </div>
  );
}