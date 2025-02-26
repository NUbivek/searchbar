import React, { useState, useEffect, useRef } from 'react';
import LLMResults from './LLMResults';
import TraditionalResults from './TraditionalResults';
import FollowUpChat from './FollowUpChat';

/**
 * Main search results component that coordinates display of different result types
 */
export default function SearchResults({ results, onFollowUpSearch, isLoading, error = null }) {
  const [expandedContent, setExpandedContent] = useState(false);
  const [previousSearches, setPreviousSearches] = useState([]);
  const resultsContainerRef = useRef(null);
  
  // Ensure results is an array
  const resultsArray = Array.isArray(results) ? results : [];
  
  // Scroll to top when new results come in
  useEffect(() => {
    if (resultsContainerRef.current) {
      resultsContainerRef.current.scrollTop = 0;
    }
  }, [results]);
  
  // Debug log
  useEffect(() => {
    console.log("SearchResults component received:", { results, resultsArray });
  }, [results]);
  
  // No results case
  if (!resultsArray || resultsArray.length === 0) {
    return (
      <div 
        className="w-full max-w-4xl mx-auto mt-4 bg-white rounded-xl shadow-md"
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Results Found</h2>
          <p className="text-gray-600 max-w-md">
            We couldn't find any results matching your search. Please try different keywords or broaden your search criteria.
          </p>
        </div>
      </div>
    );
  }

  // Error case
  if (error) {
    return (
      <div 
        className="w-full max-w-4xl mx-auto mt-4 bg-white rounded-xl shadow-md"
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-red-100 rounded-full p-4 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Search Error</h2>
          <p className="text-gray-600 max-w-md">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // Handle chat history format (from VerifiedSearch)
  const isChatHistoryFormat = resultsArray.some(item => 
    item && typeof item === 'object' && (item.type === 'user' || item.type === 'assistant')
  );

  // If it's chat history format, extract the assistant content
  if (isChatHistoryFormat) {
    const assistantMessages = resultsArray.filter(item => item && item.type === 'assistant');
    
    if (assistantMessages.length > 0) {
      const latestAssistantMessage = assistantMessages[assistantMessages.length - 1];
      
      // If the assistant message has content that's an array, use that as our results
      if (latestAssistantMessage && Array.isArray(latestAssistantMessage.content)) {
        return (
          <div className="w-full max-w-4xl mx-auto mt-4 bg-white rounded-xl shadow-md overflow-hidden">
            {/* Scrollable results container */}
            <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <div className="p-4 space-y-6">
                {/* Traditional Web Results */}
                {latestAssistantMessage.content.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Search Results
                    </h3>
                    <TraditionalResults results={latestAssistantMessage.content} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Follow-up Chat - Fixed at the bottom */}
            <div className="border-t border-gray-200">
              <FollowUpChat 
                onSearch={onFollowUpSearch} 
                isLoading={isLoading}
              />
            </div>
          </div>
        );
      }
    }
  }

  // Check if we have a synthesized answer from LLM
  const hasSynthesizedAnswer = () => {
    return resultsArray.some(result => 
      result.synthesizedAnswer || 
      (result.type === 'assistant' && result.content)
    );
  };

  // Get the synthesized answer if it exists
  const getSynthesizedAnswer = () => {
    const synthesizedResult = resultsArray.find(result => 
      result.synthesizedAnswer || 
      (result.type === 'assistant' && result.content)
    );
    
    if (synthesizedResult) {
      if (synthesizedResult.synthesizedAnswer) {
        return synthesizedResult.synthesizedAnswer;
      }
      if (synthesizedResult.type === 'assistant') {
        return {
          summary: '',
          sections: [],
          sources: [],
          content: synthesizedResult.content
        };
      }
    }
    
    return null;
  };

  // Get traditional web results
  const getTraditionalResults = () => {
    // If we have a specific web_results field, use that
    const webResultsContainer = resultsArray.find(result => result.web_results);
    if (webResultsContainer && Array.isArray(webResultsContainer.web_results)) {
      return webResultsContainer.web_results;
    }
    
    // Otherwise, filter for results that look like web results
    return resultsArray.filter(result => 
      result.title && (result.link || result.url) && 
      (result.snippet || result.content) &&
      !result.synthesizedAnswer &&
      result.type !== 'user' && 
      result.type !== 'assistant'
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 bg-white rounded-xl shadow-md overflow-hidden">
      {/* Scrollable results container */}
      <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <div className="p-4 space-y-6">
          {/* Current Search Results - Always at the top */}
          <div className="space-y-6">
            {/* LLM Synthesized Results */}
            {hasSynthesizedAnswer() && (
              <LLMResults 
                answer={getSynthesizedAnswer()} 
                expanded={expandedContent}
                onToggleExpand={() => setExpandedContent(!expandedContent)}
              />
            )}
            
            {/* Traditional Web Results */}
            {getTraditionalResults().length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Web Results
                </h3>
                <TraditionalResults results={getTraditionalResults()} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Follow-up Chat - Fixed at the bottom */}
      <div className="border-t border-gray-200">
        <FollowUpChat 
          onSearch={onFollowUpSearch} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
