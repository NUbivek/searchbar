import { useState } from 'react';
import { SearchModes } from '../utils/constants';
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';

export default function SearchInterface({ onSearch }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState(SearchModes.VERIFIED);
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query, {
      mode,
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
    <div className="space-y-4">
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
            type="button"
            onClick={() => setMode(SearchModes.VERIFIED)}
            className={`px-4 py-2 rounded-lg ${
              mode === SearchModes.VERIFIED
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100'
            }`}
          >
            Verified Sources
          </button>
          <button
            type="button"
            onClick={() => setMode(SearchModes.OPEN)}
            className={`px-4 py-2 rounded-lg ${
              mode === SearchModes.OPEN
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100'
            }`}
          >
            Open Research
          </button>
        </div>
      </form>

      {mode !== SearchModes.VERIFIED && (
        <div>
          <FileUpload onUpload={handleFileUpload} />
          <UrlInput onSubmit={handleUrlAdd} />
          
          {customUrls.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium">Custom URLs:</h3>
              <ul className="mt-2 space-y-1">
                {customUrls.map((url, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {url}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium">Uploaded Files:</h3>
              <ul className="mt-2 space-y-1">
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 