import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { logger } from '../utils/logger';
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';
import SearchResults from './SearchResults';
import SourceSelector from './SourceSelector';
import { SearchModes, SourceTypes } from '../utils/constants';
import { processWithLLM } from '../utils/search';
import { getAllVerifiedSources } from '../utils/verifiedDataSources';

export default function OpenSearch() {
  const [query, setQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState(['web']);
  const [selectedModel, setSelectedModel] = useState('mixtral-8x7b');
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

    try {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL || '';
      
      // Determine which API endpoint to use based on search mode
      let endpoint = '';
      let requestData = {
        query: searchQuery,
        model: selectedModel,
        customUrls,
        uploadedFiles
      };
      
      // Add sources based on search mode
      if (searchMode === SearchModes.VERIFIED) {
        endpoint = '/api/search/verified';
        // Include all standard verified sources
        requestData.sources = ['fmp', 'sec', 'edgar', 
          // Include custom verified sources from categories
          'strategy_consulting', 'investment_banks', 'market_data', 'vc_firms', 
          'professional_services', 'research_firms',
          // Include additional data sources
          'financial_market_data', 'industry_market_data', 'vc_firms_data',
          // Include social media platforms
          'x', 'linkedin', 'reddit', 'substack',
          // Include website scraping for specific domains
          'carta', 'crunchbase', 'pitchbook', 'cbinsights',
          // Include employee social media handles
          'employee_handles'];
        // Pass additional verified data sources
        requestData.verifiedDataSources = getAllVerifiedSources();
      } else if (searchMode === SearchModes.WEB) {
        endpoint = '/api/search/web';
      } else if (searchMode === SearchModes.OPEN) {
        endpoint = '/api/search/open';
        requestData.sources = selectedSources;
      }

      // Step 1: Get search results
      const response = await axios.post(`${baseUrl}${endpoint}`, requestData);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Add the search query to chat history
      const newChatEntry = {
        type: 'user',
        content: searchQuery
      };
      
      // Step 2: Process results with LLM if needed
      let processedResults = response.data.results;
      
      try {
        if (selectedModel && selectedModel !== 'none' && processedResults && processedResults.length > 0) {
          const llmResponse = await processWithLLM(
            searchQuery, 
            processedResults, 
            selectedModel
          );
          
          if (llmResponse && llmResponse.content) {
            processedResults = {
              summary: llmResponse.content,
              sources: processedResults,
              followUpQuestions: llmResponse.followUpQuestions || [],
              isLLMProcessed: true
            };
          }
        } else if (processedResults && processedResults.length === 0) {
          // Handle empty results
          processedResults = {
            summary: "I couldn't find any relevant information for your query. Please try a different search term or select different sources.",
            sources: [],
            followUpQuestions: [
              "Could you try rephrasing your question?",
              "Would you like to search in different sources?",
              "Can you provide more specific details in your query?"
            ],
            isLLMProcessed: true
          };
        }
      } catch (llmError) {
        console.error('LLM processing error:', llmError);
        // Continue with unprocessed results if LLM fails
      }
      
      // Add the results to chat history
      const resultsEntry = {
        type: 'assistant',
        content: processedResults || []
      };
      
      setChatHistory(prev => [...prev, newChatEntry, resultsEntry]);
      
    } catch (error) {
      console.error('[Error]', 'Search error:', error);
      setError(error.message || 'An error occurred during search');
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
          <SearchResults 
            results={chatHistory} 
            onFollowUpSearch={handleFollowUpSearch}
            loading={loading}
          />
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}