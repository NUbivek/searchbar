import React from 'react';
import SearchResults from './search/SearchResults';

/**
 * Wrapper component for SearchResults that handles different data formats
 * This component specifically handles the chat history format from VerifiedSearch
 */
export default function SearchResultsWrapper({ results, onFollowUpSearch, isLoading, error }) {
  // Debug log
  console.log("SearchResultsWrapper received:", { results });
  
  // If no results, pass through
  if (!results || results.length === 0) {
    return <SearchResults results={[]} onFollowUpSearch={onFollowUpSearch} isLoading={isLoading} error={error} />;
  }
  
  // Check if we're dealing with chat history format
  const isChatHistory = Array.isArray(results) && 
    results.some(item => item && typeof item === 'object' && (item.type === 'user' || item.type === 'assistant'));
  
  if (isChatHistory) {
    // Extract the latest assistant message content
    const assistantMessages = results.filter(item => item && item.type === 'assistant');
    
    if (assistantMessages.length > 0) {
      const latestAssistantMessage = assistantMessages[assistantMessages.length - 1];
      
      // Check if the content is already in the right format
      if (latestAssistantMessage.content && Array.isArray(latestAssistantMessage.content)) {
        return (
          <SearchResults 
            results={latestAssistantMessage.content} 
            onFollowUpSearch={onFollowUpSearch}
            isLoading={isLoading}
            error={error}
          />
        );
      }
      
      // If content has a synthesizedAnswer property, it's already in the right format
      if (latestAssistantMessage.content && 
          Array.isArray(latestAssistantMessage.content) && 
          latestAssistantMessage.content.length > 0 && 
          latestAssistantMessage.content[0].synthesizedAnswer) {
        return (
          <SearchResults 
            results={latestAssistantMessage.content} 
            onFollowUpSearch={onFollowUpSearch}
            isLoading={isLoading}
            error={error}
          />
        );
      }
      
      // If content is an object with summary/content, convert to synthesizedAnswer format
      if (latestAssistantMessage.content && typeof latestAssistantMessage.content === 'object') {
        // Create a synthesized result that SearchResults component expects
        const synthesizedResult = {
          synthesizedAnswer: {
            summary: latestAssistantMessage.content.content || latestAssistantMessage.content.summary || '',
            sections: [],
            sources: latestAssistantMessage.content.sources || []
          }
        };
        
        return (
          <SearchResults 
            results={[synthesizedResult]} 
            onFollowUpSearch={onFollowUpSearch}
            isLoading={isLoading}
            error={error}
          />
        );
      }
      
      // If content is a string, convert to synthesizedAnswer format
      if (latestAssistantMessage.content && typeof latestAssistantMessage.content === 'string') {
        // Create a synthesized result
        const synthesizedResult = {
          synthesizedAnswer: {
            summary: latestAssistantMessage.content,
            sections: [],
            sources: []
          }
        };
        
        return (
          <SearchResults 
            results={[synthesizedResult]} 
            onFollowUpSearch={onFollowUpSearch}
            isLoading={isLoading}
            error={error}
          />
        );
      }
    }
  }
  
  // Default case - pass through the results as is
  return <SearchResults results={results} onFollowUpSearch={onFollowUpSearch} isLoading={isLoading} error={error} />;
}
