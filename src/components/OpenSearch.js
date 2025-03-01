import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { logger } from '../utils/logger';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SearchModes, SourceTypes } from '../utils/constants';
import { processWithLLM } from '../utils/search';
import { getAllVerifiedSources } from '../utils/verifiedDataSources';
import { safeStringify } from '../utils/reactUtils';
import { executeSearch, getSourcesFromSelection } from '../utils/search/searchFlowHelper';

// Components
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';
import SourceSelector from './SourceSelector';
import SearchResultsWrapper from './SearchResultsWrapper';
import { IntelligentSearchResults } from './search/results';

export default function OpenSearch({ selectedModel, setSelectedModel }) {
  const [query, setQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState(['web']);
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [searchMode, setSearchMode] = useState(SearchModes.OPEN);
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

  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  const handleFollowUpSearch = (followUpQuery) => {
    handleSearch(followUpQuery);
  };

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Add user message to chat history
    setChatHistory(prev => [...prev, { type: 'user', content: searchQuery }]);

    try {
      // Get actual source identifiers from the selected source types
      const sourcesToUse = getSourcesFromSelection(selectedSources);
      
      // Execute search using our helper function
      const searchResponse = await executeSearch({
        query: searchQuery,
        mode: 'open',
        model: selectedModel,
        sources: sourcesToUse,
        customUrls: customUrls,
        files: uploadedFiles,
        useLLM: true,
        // Pass additional parameters for source selection
        includeVerifiedSources: selectedSources.includes('verified'),
        includeWeb: selectedSources.includes('web'),
        includeReddit: selectedSources.includes('reddit'),
        includeLinkedIn: selectedSources.includes('linkedin'),
        includeTwitter: selectedSources.includes('twitter')
      });
      
      // Check for errors
      if (searchResponse.error) {
        throw new Error(searchResponse.message || 'An error occurred during search');
      }
      
      // Add results to chat history
      if (searchResponse.results && searchResponse.results.length > 0) {
        setChatHistory(prev => [...prev, { 
          type: 'assistant', 
          content: searchResponse.results,
          query: searchQuery,
          metadata: searchResponse.metadata,
          timestamp: new Date().toISOString()
        }]);
      } else {
        // Handle empty results
        setChatHistory(prev => [...prev, { 
          type: 'assistant', 
          content: 'No results found for this query. Please try a different search term or select more sources.',
          query: searchQuery,
          metadata: searchResponse.metadata,
          timestamp: new Date().toISOString()
        }]);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || 'An error occurred during search');
      
      // Add error message to chat history
      setChatHistory(prev => [...prev, { 
        type: 'assistant', 
        content: `Error: ${error.message || 'An error occurred during search'}`,
        query: searchQuery,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
      
      // Scroll to bottom of chat
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

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
                <option value="none">No LLM Processing</option>
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
            mode={searchMode}
            selectedSources={selectedSources}
            onSourceToggle={handleSourceToggle}
            onCustomSourceAdd={handleCustomSourceAdd}
            onFileUpload={handleFileUpload}
            isLoading={loading}
            onSearchModeChange={(mode) => setSearchMode(mode)}
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
          <SearchResultsWrapper 
            results={chatHistory.map(msg => ({
              ...msg,
              content: typeof msg.content === 'string' ? msg.content : safeStringify(msg.content)
            }))} 
            onFollowUpSearch={handleFollowUpSearch}
            isLoading={loading}
            query={query}
          />
          
          {/* Only render IntelligentSearchResults if there's a query */}
          {query && query.trim() !== '' && (
            <IntelligentSearchResults 
              results={
                chatHistory.length > 0 && chatHistory[chatHistory.length - 1].content 
                  ? typeof chatHistory[chatHistory.length - 1].content === 'string'
                    ? chatHistory[chatHistory.length - 1].content
                    : safeStringify(chatHistory[chatHistory.length - 1].content)
                  : null
              } 
              query={query}
              options={{
                showTabs: true,
                tabsOptions: {},
                metricsOptions: {},
                setActiveCategory: () => {},
                sourceType: "open"
              }}
            />
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}