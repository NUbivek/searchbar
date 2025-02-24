import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { searchOpenResearch } from '../utils/sourceIntegration';
import { logger } from '../utils/logger';
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';
import SearchResults from './SearchResults';
import SourceSelector from './SourceSelector';
import { SearchModes } from '../utils/constants';

export default function OpenSearch() {
  const [query, setQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedModel, setSelectedModel] = useState('mixtral-8x7b');
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSourceToggle = (source) => {
    setSelectedSources(prev => 
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleCustomSourceAdd = (url) => {
    if (url && !customUrls.includes(url)) {
      setCustomUrls(prev => [...prev, url]);
    }
  };

  const handleFileUpload = (files) => {
    setUploadedFiles(Array.from(files));
  };

  const handleSearch = useCallback(async (searchQuery = query) => {
    if (!searchQuery) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('query', searchQuery);
      formData.append('model', selectedModel);
      formData.append('sources', JSON.stringify(selectedSources));
      formData.append('urls', JSON.stringify(customUrls));
      
      // Append files if any
      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post('/api/openSearch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setChatHistory(prev => [...prev, {
        role: 'user',
        content: searchQuery
      }, {
        role: 'assistant',
        content: response.data.content,
        sources: response.data.sourceMap
      }]);

    } catch (err) {
      logger.error('Search error:', err);
      setError(err.response?.data?.error || 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  }, [query, selectedModel, selectedSources, customUrls, uploadedFiles]);

  return (
    <div className="space-y-4">
      {/* Main search section with source selector */}
      <div className="space-y-2">
        {/* Search bar with prominent styling */}
        <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
          <div className="flex items-stretch">
            <div className="flex-1 flex items-center px-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across multiple sources..."
                className="flex-1 px-3 py-4 text-lg bg-transparent outline-none placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleSearch();
                  }
                }}
              />
            </div>

            {/* Model selector */}
            <div className="relative bg-gray-50 border-l border-gray-100">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="h-full px-4 py-4 bg-transparent border-none outline-none text-gray-600"
              >
                <option value="mixtral-8x7b">Mixtral-8x7B</option>
                <option value="deepseek-70b">DeepSeek-70B</option>
                <option value="gemma-7b">Gemma-7B</option>
              </select>
            </div>

            {/* Search button */}
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-6 py-4 bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Source selector with subdued styling */}
        <div className="w-full max-w-4xl mx-auto bg-gray-50/80 rounded-lg">
          <SourceSelector
            mode={SearchModes.OPEN}
            selectedSources={selectedSources}
            onSourceToggle={handleSourceToggle}
            onCustomSourceAdd={handleCustomSourceAdd}
            onFileUpload={handleFileUpload}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Search Results and Chat History */}
      <div className="w-full max-w-4xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <SearchResults results={chatHistory} />
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}