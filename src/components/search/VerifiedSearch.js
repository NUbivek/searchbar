import React, { useState, useEffect } from 'react';
import { IntelligentSearchResults } from './results';
import FollowUpChat from './FollowUpChat';
import SearchResultsWrapper from '../SearchResultsWrapper';

// Add this to your VerifiedSearch.js file

// Update the handleSearch function to handle errors better
const handleSearch = async (query, options = {}) => {
  setIsSearching(true);
  setSearchError(null);
  setSearchResults([]);
  setLlmResults(null);
  
  try {
    // Call search API
    const searchResponse = await callSearchAPI(query, options);
    setSearchResults(searchResponse);
    
    // Process with LLM if we have search results
    if (searchResponse && searchResponse.length > 0) {
      try {
        const llmResponse = await callLLMAPI(query, searchResponse, selectedModel);
        setLlmResults(llmResponse);
      } catch (llmError) {
        console.error('Search error:', llmError);
        // Create a fallback response for LLM errors
        setLlmResults({
          categories: {
            key_insights: `We encountered an error processing your query "${query}" with our AI. The search returned ${searchResponse.length} results that you can review directly.`
          },
          metrics: {
            relevance: 60,
            accuracy: 60,
            credibility: 60
          }
        });
      }
    } else {
      // No search results
      setLlmResults({
        categories: {
          key_insights: `No search results were found for "${query}". Please try a different search query or check your search settings.`
        },
        metrics: {
          relevance: 0,
          accuracy: 0,
          credibility: 0
        }
      });
    }
  } catch (error) {
    console.error('Search error:', error);
    setSearchError(error.message || 'An error occurred during search');
    
    // Create a fallback response for search errors
    setLlmResults({
      categories: {
        key_insights: `We encountered an error searching for "${query}". Please try again or refine your search.`
      },
      metrics: {
        relevance: 0,
        accuracy: 0,
        credibility: 0
      }
    });
  } finally {
    setIsSearching(false);
  }
}; 

// Find the section where the search results are rendered
// It might look something like this:
return (
  <div className="search-results-container">
    {/* This is where we need to ensure IntelligentSearchResults comes before FollowUpChat */}
    <div className="results-section" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Intelligent Search Results - Force this to be first */}
      <div style={{ order: 1 }}>
        <IntelligentSearchResults results={llmResults} query={query} />
      </div>
      
      {/* Follow-up Chat - Force this to be second */}
      <div style={{ order: 2 }}>
        <FollowUpChat 
          onSearch={handleFollowUpSearch} 
          isLoading={isSearching}
        />
      </div>
    </div>
  </div>
); 

// Remove the redundant "You" and "AI Assistant" sections from the chat history
const VerifiedSearch = ({ query, onSearch, results, isSearching, error }) => {
  // Filter out the user and assistant messages from the chat history display
  const filteredResults = Array.isArray(results) 
    ? results.filter(result => !(result.type === 'user' || result.type === 'assistant'))
    : results;
  
  return (
    <div className="verified-search-container">
      <SearchResultsWrapper 
        results={filteredResults}
        onFollowUpSearch={onSearch}
        isLoading={isSearching}
        error={error}
        query={query}
      />
    </div>
  );
};

export default VerifiedSearch; 