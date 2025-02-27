import React from 'react';
import SearchResults from './search/SearchResults';

/**
 * Wrapper component for SearchResults that handles different data formats
 * This component specifically handles the chat history format from VerifiedSearch
 */
export default function SearchResultsWrapper({ results, onFollowUpSearch, isLoading, error, query = '' }) {
  // Debug log
  console.log("SearchResultsWrapper received:", { results, query });
  
  // If no results, pass through
  if (!results || results.length === 0) {
    return <SearchResults results={[]} onFollowUpSearch={onFollowUpSearch} isLoading={isLoading} error={error} query={query} />;
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
            query={query}
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
            query={query}
          />
        );
      }
      
      // Otherwise, just pass the whole chat history
      return (
        <SearchResults 
          results={results} 
          onFollowUpSearch={onFollowUpSearch}
          isLoading={isLoading}
          error={error}
          query={query}
        />
      );
    }
  }
  
  // If not chat history, just pass through
  return (
    <SearchResults 
      results={results} 
      onFollowUpSearch={onFollowUpSearch}
      isLoading={isLoading}
      error={error}
      query={query}
    />
  );
}
