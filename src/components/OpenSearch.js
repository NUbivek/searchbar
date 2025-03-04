import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ModelSelector from './ModelSelector';
import SourceSelector from './SourceSelector';
import SimplifiedLLMResults, { FollowUpChat } from './search/results/SimplifiedLLMResults';

export default function OpenSearch({ selectedModel, setSelectedModel }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Only select Web by default
  const [selectedSources, setSelectedSources] = useState(['Web']);
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const resultsContainerRef = useRef(null);

  // Scroll to bottom of results when new results are loaded
  const scrollToBottom = () => {
    if (resultsContainerRef.current) {
      resultsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    if (query) {
      scrollToBottom();
    }
  }, [query]);

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

  // Follow-up search functionality temporarily disabled
  const handleFollowUpSearch = (followUpQuery) => {
    setQuery(followUpQuery);
    setHasSearched(true); // Make sure to set hasSearched to true
    handleSearch(followUpQuery);
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    // Simulate a search with a timeout - no actual API call
    try {
      console.log('Simulating search for query:', searchQuery);
      console.log('Selected sources:', selectedSources);
      
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This function doesn't actually do any searching or processing
      // It simply updates the UI to show the simplified LLM results tabs
      setHasSearched(true);
      
    } catch (err) {
      console.error('Search simulation error:', err);
      setError('An error occurred. Please try again.');
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
        <div ref={resultsContainerRef}>
          {hasSearched && query && (
            <>
              <SimplifiedLLMResults 
                query={query}
                onFollowUpQuery={handleFollowUpSearch}
              />
              <FollowUpChat onSubmit={handleFollowUpSearch} />
            </>
          )}
        </div>
      )}
    </div>
  );
}