import React from 'react';
import { IntelligentSearchResults } from './search/results';
import { logger } from '../utils/logger';
import ConsoleLogger from './debug/ConsoleLogger';
import CSSDebugger from './debug/CSSDebugger';

/**
 * Wrapper component for SearchResults that handles different data formats
 * This component specifically handles the chat history format from VerifiedSearch and OpenSearch
 */
export default function SearchResultsWrapper({ results, onFollowUpSearch, isLoading, error, query = '', showCategories = false }) {
  // If no results, pass through
  if (!results || results.length === 0) {
    return (
      <>
        <IntelligentSearchResults results={[]} query={query} options={{ isLoading, error, onFollowUpSearch, showCategories: true }} />
        <ConsoleLogger />
        <CSSDebugger />
      </>
    );
  }
  
  // Check if we're dealing with chat history format
  const isChatHistory = Array.isArray(results) && 
    results.some(item => item && typeof item === 'object' && (item.type === 'user' || item.type === 'assistant'));
  
  if (isChatHistory) {
    // Extract the latest assistant message content
    const assistantMessages = results.filter(item => item && item.type === 'assistant');
    
    if (assistantMessages.length === 0) {
      // No assistant messages found, return empty results
      return (
        <>
          <IntelligentSearchResults results={[]} query={query} options={{ isLoading, error, onFollowUpSearch, showCategories: true }} />
          <ConsoleLogger />
          <CSSDebugger />
        </>
      );
    }
    
    const latestAssistantMessage = assistantMessages[assistantMessages.length - 1];
    let resultsToUse = [];
    let categoriesToUse = [];
    let actualQuery = query;
    let enhancedOptions = { isLoading, error, onFollowUpSearch };
    
    // Log what we're looking at for debugging
    logger.info('Latest assistant message properties:', {
      hasCategories: !!latestAssistantMessage.categories,
      categoryCount: latestAssistantMessage.categories?.length || 0
    });
    
    // Log what we're displaying for debugging
    logger.info('Displaying search results from chat history', {
      messageType: latestAssistantMessage.type,
      contentType: typeof latestAssistantMessage.content,
      hasMetadata: !!latestAssistantMessage.metadata,
      query: latestAssistantMessage.query || query
    });
    
    // Use query from message if available
    if (latestAssistantMessage.query) {
      actualQuery = latestAssistantMessage.query;
    }
    
    // Extract metadata if available
    if (latestAssistantMessage.metadata && typeof latestAssistantMessage.metadata === 'object') {
      // Add context to options
      if (latestAssistantMessage.metadata.context) {
        enhancedOptions = {
          ...enhancedOptions,
          showContext: true,
          context: latestAssistantMessage.metadata.context,
          mode: latestAssistantMessage.metadata.mode || 'verified'
        };
      }
    }
    
    // Handle different content types
    if (latestAssistantMessage.content) {
      // If content is an array of results
      if (Array.isArray(latestAssistantMessage.content)) {
        resultsToUse = latestAssistantMessage.content;
        
        // Extract categories if available
        if (latestAssistantMessage.categories && Array.isArray(latestAssistantMessage.categories)) {
          categoriesToUse = latestAssistantMessage.categories;
          logger.info(`Found ${categoriesToUse.length} categories in message`);
        }
        
        // Debug info for category flow
        console.log('CATEGORY FLOW DIAGNOSTIC: SearchResultsWrapper passing to IntelligentSearchResults:', {
          categoriesCount: categoriesToUse.length,
          categoryNames: categoriesToUse.map(c => c.name),
          showCategoriesOption: true,
          resultsCount: resultsToUse.length,
          query: actualQuery
        });
        
        return (
          <>
            <IntelligentSearchResults 
              results={resultsToUse} 
              query={actualQuery}
              categories={categoriesToUse}
              options={{
                ...enhancedOptions, 
                showCategories: true,
                displayStyle: 'visual',
                showInResults: true,
                maxCategories: 6,
                categoryDisplay: {
                  style: 'modern',
                  showMetrics: true,
                  position: 'top'
                }
              }}
            />
            <ConsoleLogger />
            <CSSDebugger />
          </>
        );
      }
      
      // If content is a string (error or message)
      if (typeof latestAssistantMessage.content === 'string') {
        // Display error messages with red background
        if (latestAssistantMessage.content.startsWith('Error:')) {
          return (
            <>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 mt-4">
                {latestAssistantMessage.content}
              </div>
              <ConsoleLogger />
              <CSSDebugger />
            </>
          );
        }
        
        // Display other messages with blue background
        return (
          <>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-700 mt-4">
              {latestAssistantMessage.content}
            </div>
            <ConsoleLogger />
            <CSSDebugger />
          </>
        );
      }
    }
    
    // If we couldn't extract specific results, just pass the whole chat history
    // But still attempt to extract categories if available
    if (latestAssistantMessage.categories && Array.isArray(latestAssistantMessage.categories)) {
      categoriesToUse = latestAssistantMessage.categories;
      logger.info(`Using ${categoriesToUse.length} categories from message as fallback`);
    }
    
    console.log('CATEGORY FLOW DIAGNOSTIC: SearchResultsWrapper fallback 1:', {
      categoriesCount: categoriesToUse.length,
      categoryNames: categoriesToUse.map(c => c.name),
      showCategoriesOption: true
    });
    
    return (
      <>
        <IntelligentSearchResults 
          results={results} 
          query={actualQuery}
          categories={categoriesToUse}
          options={{
            ...enhancedOptions, 
            showCategories: true,
            displayStyle: 'visual',
            showInResults: true,
            maxCategories: 6,
            categoryDisplay: {
              style: 'modern',
              showMetrics: true,
              position: 'top'
            }
          }}
        />
        <ConsoleLogger />
        <CSSDebugger />
      </>
    );
  }
  
  // If not chat history format, just pass through as is
  console.log('CATEGORY FLOW DIAGNOSTIC: SearchResultsWrapper direct pass:', {
    resultsCount: results.length,
    query,
    showCategoriesOption: true
  });
  
  return (
    <>
      <IntelligentSearchResults 
        results={results} 
        query={query}
        options={{ 
          isLoading, 
          error, 
          onFollowUpSearch, 
          showCategories: true,
          displayStyle: 'visual',
          showInResults: true,
          maxCategories: 6,
          categoryDisplay: {
            style: 'modern',
            showMetrics: true,
            position: 'top'
          },
          displayOptions: {
            showCategories: true,
            showContext: true,
          }
        }}
      />
      <ConsoleLogger />
      <CSSDebugger />
    </>
  );
}
