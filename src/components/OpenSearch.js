import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ModelSelector from './ModelSelector';
import SourceSelector from './SourceSelector';
import SimplifiedLLMResults, { FollowUpChat } from './search/results/SimplifiedLLMResults';
import { isLLMResult } from '../utils/isLLMResult';

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

    try {
      console.log('Performing search for query:', searchQuery);
      console.log('Selected sources:', selectedSources);
      console.log('Using model:', selectedModel);
      
      // Make actual API call to the search endpoint
      const response = await axios.post('/api/search', {
        query: searchQuery,
        mode: 'open',
        model: selectedModel,
        sources: selectedSources,
        customUrls: customUrls,
        files: uploadedFiles.map(f => f.name),
        useLLM: true
      });
      
      // Log the response for debugging
      console.log('Search API response structure:', {
        hasLLMResults: !!response.data.llmResults,
        hasContent: !!response.data.content,
        topLevelKeys: Object.keys(response.data).slice(0, 8),
        llmFlags: response.data.isLLMResults || response.data.isLLMResult || response.data.__isImmutableLLMResult
      });
      
      // Enhanced LLM detection using utility function
      console.log('Performing LLM result detection on response data');
      
      if (isLLMResult(response.data)) {
        console.log('✅ Successfully detected LLM-formatted results');
        
        // Determine if we should use a property or the whole object
        if (response.data.llmResults && isLLMResult(response.data.llmResults)) {
          console.log('Using nested llmResults from response');
          setResults({
            ...response.data.llmResults,
            __isImmutableLLMResult: true,
            isLLMResult: true,
            query: searchQuery
          });
        } else {
          // Use the whole response when it's the LLM result itself
          console.log('Using entire response as LLM result');
          setResults({
            ...response.data,
            __isImmutableLLMResult: true,
            isLLMResult: true,
            query: searchQuery
          });
        }
      } else if (response.data.content && typeof response.data.content === 'string') {
        // Explicitly format as LLM result when content is present
        console.log('Formatting content property as LLM result');
        setResults({
          content: response.data.content,
          isLLMResult: true,
          __isImmutableLLMResult: true,
          query: searchQuery
        });
      } else if (response.data.results) {
        // Fallback to regular results
        console.log('Using regular search results array');
        setResults(response.data.results);
      } else if (typeof response.data === 'string') {
        // Handle case where response might be a plain string
        console.log('Handling string response');
        setResults([response.data]);
      } else {
        // Create empty result if nothing found
        console.log('No recognizable results format');
        setResults([]);
      }
      
      setHasSearched(true);
      
    } catch (err) {
      console.error('Search error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
      // Set empty results
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
        <div ref={resultsContainerRef}>
          {hasSearched && query && (
            <>
              <SimplifiedLLMResults 
                query={query}
                results={results}
                onFollowUpSearch={handleFollowUpSearch}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}