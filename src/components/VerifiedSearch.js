import React, { useState, useRef } from 'react';
import axios from 'axios';
import { logger } from '../utils/logger';
import SearchResults from './SearchResults';
import { SearchModes } from '../utils/constants';
import { processWithLLM } from '../utils/search';
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';
import { getAllVerifiedSources } from '../utils/verifiedDataSources';
import { ALL_VERIFIED_SOURCES } from '../utils/allVerifiedSources';

export default function VerifiedSearch() {
  const [query, setQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('mixtral-8x7b');
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);
  const [isCustomSourcesExpanded, setIsCustomSourcesExpanded] = useState(false);
  const [verifiedSourcesEnabled, setVerifiedSourcesEnabled] = useState(true);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleCustomSourceAdd = (url) => {
    if (url && !customUrls.includes(url)) {
      setCustomUrls(prev => [...prev, url]);
    }
  };

  const handleFileUpload = (files) => {
    setUploadedFiles(Array.from(files));
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
        
      // Get all verified sources
      const allVerifiedSources = verifiedSourcesEnabled ? 
        // Include all standard verified sources
        ALL_VERIFIED_SOURCES : [];
      
      // Step 1: Get search results - use all verified sources if enabled
      const response = await axios.post(`${baseUrl}/api/search/verified`, {
        query: searchQuery,
        sources: allVerifiedSources,
        model: selectedModel,
        customUrls,
        uploadedFiles,
        // Pass additional verified data sources
        verifiedDataSources: verifiedSourcesEnabled ? getAllVerifiedSources() : []
      });

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

  const handleFollowUpSearch = (followUpQuery) => {
    handleSearch(followUpQuery);
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
                placeholder="Search verified sources..."
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

        {/* Custom sources section with subdued styling */}
        <div className="w-full max-w-4xl mx-auto bg-gray-50/80 rounded-lg">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              {/* Custom Sources Dropdown on the left */}
              <button
                onClick={() => setIsCustomSourcesExpanded(!isCustomSourcesExpanded)}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className="font-medium">Custom Sources</span>
                {isCustomSourcesExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="m18 15-6-6-6 6"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                )}
              </button>

              {/* Verified Sources Toggle on the right */}
              <div className="flex items-center gap-2">
                <label htmlFor="verified-toggle" className="text-sm font-medium text-gray-600">
                  Verified Sources
                </label>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    id="verified-toggle"
                    checked={verifiedSourcesEnabled}
                    onChange={() => setVerifiedSourcesEnabled(!verifiedSourcesEnabled)}
                    className="sr-only"
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${verifiedSourcesEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${verifiedSourcesEnabled ? 'translate-x-4' : ''}`}></div>
                </div>
              </div>
            </div>
            
            {isCustomSourcesExpanded && (
              <div className="space-y-3">
                {/* URL Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Enter URL to add source"
                    className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCustomSourceAdd(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousSibling;
                      handleCustomSourceAdd(input.value);
                      input.value = '';
                    }}
                    className="px-3 py-1.5 text-sm bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    Add URL
                  </button>
                </div>
                
                {/* File Upload */}
                <div>
                  <label className="cursor-pointer px-3 py-1.5 text-sm bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center border border-gray-200">
                    Upload Files
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      disabled={loading}
                    />
                  </label>
                </div>
                
                {/* Display added URLs */}
                {customUrls.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Added URLs:</div>
                    <div className="flex flex-wrap gap-1">
                      {customUrls.map((url, index) => (
                        <div key={index} className="px-2 py-1 bg-gray-100 rounded text-xs flex items-center">
                          <span className="truncate max-w-[150px]">{url}</span>
                          <button 
                            className="ml-1 text-gray-500 hover:text-gray-700"
                            onClick={() => setCustomUrls(prev => prev.filter(u => u !== url))}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Display added files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Added Files:</div>
                    <div className="flex flex-wrap gap-1">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="px-2 py-1 bg-gray-100 rounded text-xs flex items-center">
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button 
                            className="ml-1 text-gray-500 hover:text-gray-700"
                            onClick={() => setUploadedFiles(prev => prev.filter(f => f.name !== file.name))}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
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