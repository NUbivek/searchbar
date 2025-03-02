import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ModelSelector from './ModelSelector';
import SourceSelector from './SourceSelector';
import SearchResults from './SearchResults';

export default function OpenSearch({ selectedModel, setSelectedModel }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Only select web by default
  const [selectedSources, setSelectedSources] = useState(['web']);
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const resultsContainerRef = useRef(null);

  // Scroll to bottom of results when new results are loaded
  const scrollToBottom = () => {
    if (resultsContainerRef.current) {
      resultsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    if (results.length > 0) {
      scrollToBottom();
    }
  }, [results]);

  const handleSourceToggle = (source) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter(s => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const handleCustomSourceAdd = (url) => {
    if (!customUrls.includes(url)) {
      setCustomUrls([...customUrls, url]);
    }
  };

  const handleFileUpload = (files) => {
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  const handleFollowUpSearch = (followUpQuery) => {
    setQuery(followUpQuery);
    handleSearch(followUpQuery);
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Construct search request with only selected sources
      const searchRequest = {
        query: searchQuery,
        sources: selectedSources,
        model: selectedModel
      };

      // Add custom URLs if any
      if (customUrls.length > 0) {
        searchRequest.urls = customUrls;
      }

      // Add uploaded files if any
      if (uploadedFiles.length > 0) {
        searchRequest.files = uploadedFiles.map(f => f.name);
      }

      console.log('Sending search request:', searchRequest);

      // Make the API call using axios
      const response = await axios.post('/api/search', searchRequest);

      // Process the response
      if (response.data && response.data.results) {
        console.log('Received search results:', response.data.results);
        setResults(response.data.results);
      } else {
        console.error('No results in response:', response.data);
        setError('No results found. Please try a different query or select different sources.');
        setResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || 'An error occurred while searching. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        {/* Search interface */}
        <div className="mb-4">
          <div className="flex w-full">
            <div className="flex-grow bg-gray-100 rounded-l-md border border-gray-300">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search across sources..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 px-4 py-2"
              />
            </div>
            <div className="flex">
              <div className="w-[150px] bg-gray-100 border-y border-r border-gray-300">
                <ModelSelector 
                  selectedModel={selectedModel} 
                  onChange={handleModelChange}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Source selector */}
        <SourceSelector
          mode="open"
          selectedSources={selectedSources}
          onSourceToggle={handleSourceToggle}
          onCustomSourceAdd={handleCustomSourceAdd}
          onFileUpload={handleFileUpload}
          isLoading={loading}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Searching... This may take a moment.</p>
        </div>
      ) : (
        results.length > 0 && (
          <div ref={resultsContainerRef}>
            <SearchResults 
              results={results} 
              onFollowUpSearch={handleFollowUpSearch}
              query={query}
            />
          </div>
        )
      )}
    </div>
  );
}