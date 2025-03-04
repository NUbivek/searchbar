/**
 * BasicSearchResults.js
 * A simplified search results component that displays basic result items with category tabs
 * Refactored to use base components for consistency across search results
 */

import React, { useState, useEffect } from 'react';
import styles from './BasicSearchResults.module.css';
import CategoryDisplay from '../categories/CategoryDisplay';
import { getDefaultCategories } from '../categories/types/DefaultCategories';
import SimpleLLMResults from './SimpleLLMResults';
import FollowUpChat from '../../search/FollowUpChat';
import { 
  SearchResultsBase,
  ResultTabs,
  ResultItem,
  detectLLMResult
} from './baseComponents';
import { debug, info, warn, error } from '../../../utils/logger';

const log = { debug, info, warn, error };

/**
 * BasicSearchResults Component
 * 
 * Displays search results in a simple list format with category tabs
 * Refactored to use base components for better maintainability
 * 
 * @param {Object} props Component props
 * @param {Array} props.results Array of search result items
 * @param {string} props.query The search query
 * @param {Array} props.categories Categories to display (optional)
 * @param {Function} props.onFollowUpSearch Callback for handling follow-up searches
 */
const BasicSearchResults = ({ 
  results = [], 
  query = '',
  categories = [],
  onFollowUpSearch = null
}) => {
  // Prepare tabs based on processed results and categories
  const prepareTabs = (processedResults, categories) => {
    // Log detailed information about the results
    log.debug('Preparing tabs for BasicSearchResults', {
      resultCount: processedResults?.length || 0,
      categoryCount: categories?.length || 0
    });
    
    // Create tabs array starting with the All Results tab
    const tabs = [
      {
        id: 'all-results',
        label: 'All Results',
        count: processedResults.length,
        content: renderResultsList(processedResults)
      }
    ];
    
    // Add tabs for each category if provided
    if (Array.isArray(categories) && categories.length > 0) {
      categories.forEach(category => {
        // Skip categories with no items
        if (!category.items || category.items.length === 0) return;
        
        tabs.push({
          id: category.id || `category-${Math.random().toString(36).substring(2, 9)}`,
          label: category.name || category.title || 'Category',
          count: category.items.length,
          content: (
            <div className={styles.categoryContent}>
              {category.description && (
                <div className={styles.categoryDescription}>{category.description}</div>
              )}
              {renderResultsList(category.items)}
            </div>
          )
        });
      });
    }
    
    return tabs;
  };
  
  // Process the search results before display with enhanced LLM detection
  const processResults = (results) => {
    if (!results || !Array.isArray(results)) {
      return [];
    }
    
    return results.map(result => {
      // Ultra-enhanced LLM result detection with multiple strategies
      if (detectLLMResult(result) || 
          // Check all possible flag names
          result.__isImmutableLLMResult === true || 
          result.llmProcessed === true || 
          result.isLLMResults === true ||
          result.shouldUseLLM === true ||
          result.useLLM === true ||
          result.forceLLM === true ||
          // Check content patterns
          (result.content && typeof result.content === 'string' && (
            result.content.includes('<div class="error-message">') ||
            result.content.includes('<h2>') ||
            result.content.includes('<h3>') ||
            result.content.includes('summary') ||
            result.content.includes('key points') ||
            result.content.length > 300
          )) ||
          // Check specific structures
          (result.categories && Object.keys(result.categories).length > 0) ||
          (result.content && Array.isArray(result.content) && result.content.length > 0)) {
        log.debug('Detected LLM result in BasicSearchResults', {
          hasFlags: result.__isImmutableLLMResult || result.llmProcessed || result.isLLMResults,
          hasCategories: result.categories && Object.keys(result.categories).length > 0,
          contentType: typeof result.content
        });
        return result;
      }
      
      // For regular results, ensure they have required fields
      return {
        ...result,
        id: result.id || Math.random().toString(36).substring(2),
        title: result.title || 'Untitled Result',
        content: result.content || result.snippet || '',
        source: result.source || 'Unknown Source',
        url: result.url || '#'
      };
    });
  };

  // Render a list of results
  const renderResultsList = (results) => {
    if (!results || !Array.isArray(results) || results.length === 0) {
      return (
        <div className={styles.noResults}>
          <h3>No results found</h3>
          <p>We couldn't find any results matching your search criteria. This may be due to:</p>
          <ul>
            <li>Your search terms not matching any available content</li>
            <li>Limited source selection - try enabling more sources</li>
            <li>Content not being available in our database</li>
          </ul>
          <p>Try rephrasing your query or using more general terms.</p>
        </div>
      );
    }
    
    return (
      <div className={styles.resultsList}>
        {results.map((result, index) => {
          // Improved LLM result detection:
          // 1. Direct flag detection with isLLMResults
          // 2. Use the detectLLMResult utility for deeper inspection
          const isLLM = result.isLLMResults === true || detectLLMResult(result);
          const isExplicitlyNonLLM = result.isLLMResults === false;

          // Handle LLM results with SimpleLLMResults component
          if (isLLM && !isExplicitlyNonLLM) {
            console.log('DEBUG: Rendering as LLM result:', {
              resultType: result.type || 'unknown',
              hasContent: !!result.content,
              isDetectedAsLLM: detectLLMResult(result)
            });
            return (
              <div key={`llm-result-${index}`} className={styles.llmResultContainer}>
                <SimpleLLMResults 
                  results={[result]} 
                  query={query}
                  onFollowUpSearch={onFollowUpSearch}
                />
              </div>
            );
          }
          
          // Use our base ResultItem component for standard results
          return (
            <ResultItem
              key={`result-${index}`}
              result={result}
              showSource={true}
              showMetadata={true}
            />
          );
        })}
      </div>
    );
  };

  // We'll use the standalone FollowUpChat component instead

  // Render the search component using our base components
  return (
    <SearchResultsBase
      results={results}
      query={query}
      resultProcessor={processResults}
    >
      {({ results: processedResults, isProcessing, error }) => (
        <div className={styles.basicSearchResults}>
          {/* Query display header */}
          {query && (
            <div className={styles.queryContainer}>
              <span className={styles.queryLabel}>Search:</span>
              <span className={styles.queryText}>{query}</span>
            </div>
          )}
          
          {/* Loading state */}
          {isProcessing && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Processing results...</p>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className={styles.errorContainer}>
              <h3 className={styles.errorTitle}>Error</h3>
              <p className={styles.errorMessage}>{error}</p>
            </div>
          )}
          
          {/* Scrollable Results section */}
          {!isProcessing && !error && (
            <div className={styles.scrollableResults}>
              <ResultTabs
                tabs={prepareTabs(processedResults, categories)}
                defaultTab="all-results"
              showTabs={true}
              />
            </div>
          )}

          {/* Static Follow-up Chat - always visible */}
          {onFollowUpSearch && (
            <div className={styles.staticFollowUpContainer}>
              <FollowUpChat 
                onSearch={onFollowUpSearch} 
                isLoading={isProcessing}
              />
            </div>
          )}
        </div>
      )}
    </SearchResultsBase>
  );
};

export default BasicSearchResults;
