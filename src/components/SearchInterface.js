import { useState } from 'react';
import { SearchModes } from '../utils/constants';
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';

export default function SearchInterface({ onSearch }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState(SearchModes.VERIFIED);
  const [customMode, setCustomMode] = useState('verified'); // 'custom' or 'combined'
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query, {
      mode,
      customMode,
      customUrls,
      uploadedFiles
    });
  };

  const handleUrlAdd = (url) => {
    setCustomUrls([...customUrls, url]);
  };

  const handleFileUpload = (files) => {
    setUploadedFiles([...uploadedFiles, ...files]);
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
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Search
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setMode(SearchModes.VERIFIED)}
            className={`px-4 py-2 rounded-lg ${
              mode === SearchModes.VERIFIED ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Verified Sources
          </button>
          <button
            onClick={() => setMode(SearchModes.OPEN)}
            className={`px-4 py-2 rounded-lg ${
              mode === SearchModes.OPEN ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
          >
            Open Research
          </button>
        </div>
      </form>

      {mode === SearchModes.VERIFIED && (
        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Default Verified Sources</h3>
            <ul className="text-sm text-gray-600">
              <li>• Market Data Analytics</li>
              <li>• VC Firms & Partners</li>
              <li>• Investment Banks</li>
              <li>• Research Firms</li>
            </ul>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setCustomMode('custom')}
              className={`px-4 py-2 rounded-lg ${
                customMode === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              Custom Sources
            </button>
            <button
              onClick={() => setCustomMode('combined')}
              className={`px-4 py-2 rounded-lg ${
                customMode === 'combined' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              Custom + Verified Sources
            </button>
          </div>

          <div className="space-y-4 mt-4">
            <FileUpload onUpload={handleFileUpload} />
            <UrlInput onSubmit={handleUrlAdd} />
            
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
        </div>
      )}
    </div>
  );
} 