/**
 * SearchResultsBase.js
 * Base component for search results that provides common functionality
 * This serves as a foundation for all search result display components
 */

import React, { useState, useEffect } from 'react';
import { isLLMResult, processLLMResults } from '../../../../utils/llm/resultDetector';
import { debug, info, warn, error } from '../../../../utils/logger';
import { detectLLMResult } from './LLMResultHandler';

const log = { debug, info, warn, error };

/**
 * Search Results Base Component
 * Provides common functionality for processing and displaying search results
 * 
 * @param {Object} props Component props
 * @param {Array} props.results Search results to display
 * @param {string} props.query The search query
 * @param {Function} props.resultProcessor Optional custom result processor
 * @param {Object} props.options Additional options
 * @param {Function} props.onResultsProcessed Callback when results are processed
 */
const SearchResultsBase = ({
  results = [],
  query = '',
  resultProcessor = null,
  options = {},
  onResultsProcessed = null,
  children
}) => {
  const [processedResults, setProcessedResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  
  // Process results when component mounts or when inputs change
  useEffect(() => {
    // Log when the effect runs
    log.debug('SearchResultsBase effect triggered', {
      hasResults: !!results,
      isArray: Array.isArray(results),
      resultCount: Array.isArray(results) ? results.length : (results ? 'single object' : 'none'),
      hasQuery: !!query,
      hasProcessor: !!resultProcessor
    });
    
    // Reset state
    setIsProcessing(true);
    setProcessedResults(null);
    setError(null);
    
    // Always force processing to complete after 5 seconds if not done
    // This is a failsafe mechanism
    const failsafeTimeout = setTimeout(() => {
      if (isProcessing) {
        log.warn('Failsafe: forced processing completion after timeout');
        setIsProcessing(false);
      }
    }, 5000);
    
    const processResultsData = async () => {
      try {
        // Force timeout after 10 seconds to prevent infinite processing
        const processingTimeout = setTimeout(() => {
          if (isProcessing) {
            log.error('Processing timeout exceeded - forcing completion');
            setProcessedResults(results || []);
            setError('Processing timeout exceeded. Please try again or check your API key configuration.');
            setIsProcessing(false);
          }
        }, 10000);
        
        // Handle empty results
        if (!results || (!Array.isArray(results) && !results.content && !results.error) || 
            (Array.isArray(results) && results.length === 0)) {
          setProcessedResults([]);
          setIsProcessing(false);
          clearTimeout(processingTimeout);
          return;
        }
        
        // Check if the result is an error object
        if (results.error || results.errorType || 
            (results.content && typeof results.content === 'string' && results.content.includes('error-message'))) {
          log.error('Error detected in results:', results);
          setError(results.errorMessage || results.message || 'An error occurred during search');
          setProcessedResults([]);
          setIsProcessing(false);
          clearTimeout(processingTimeout);
          return;
        }
        
        log.debug('Processing search results in base component', { 
          resultCount: results.length,
          hasQuery: !!query
        });
        
        // Check if the content contains LLM results that should be prioritized
        const hasLLMResults = (() => {
          // Check direct LLM result
          if (detectLLMResult(results)) {
            log.debug('Direct LLM result detected in SearchResultsBase');
            return true;
          }
          
          // Check for LLM results in an array
          if (Array.isArray(results)) {
            const llmResults = results.filter(item => detectLLMResult(item));
            if (llmResults.length > 0) {
              log.debug(`Found ${llmResults.length} LLM results in array of ${results.length}`);
              return true;
            }
          }
          
          // Check for LLM results in a nested structure
          if (results && results.results && Array.isArray(results.results)) {
            const nestedLLMResults = results.results.filter(item => detectLLMResult(item));
            if (nestedLLMResults.length > 0) {
              log.debug(`Found ${nestedLLMResults.length} LLM results in nested results structure`);
              return true;
            }
          }
          
          return false;
        })();
        
        // Use custom processor if provided, otherwise use default processing
        let processed;
        if (typeof resultProcessor === 'function') {
          processed = await resultProcessor(results, query, options);
        } else {
          // Default processing with LLM prioritization
          if (Array.isArray(results)) {
            // For array results, possibly reorder to prioritize LLM content
            const llmResults = results.filter(item => detectLLMResult(item));
            const regularResults = results.filter(item => !detectLLMResult(item));
            
            // If we have LLM results, place them first in the processed array
            const prioritizedResults = hasLLMResults ? 
              [...llmResults, ...regularResults] : 
              results;
            
            processed = prioritizedResults.map(result => {
              // Make sure result has required fields
              return {
                ...result,
                id: result.id || Math.random().toString(36).substring(2),
                title: result.title || 'Untitled Result',
                content: result.content || '',
                source: result.source || 'Unknown',
                url: result.url || '#',
                timestamp: result.timestamp || new Date().toISOString(),
                // Mark as LLM result if detected
                isLLMResult: detectLLMResult(result)
              };
            });
          } else {
            // Handle non-array results by converting to array with single item
            const result = results;
            processed = [{
              ...result,
              id: result.id || Math.random().toString(36).substring(2),
              title: result.title || 'Untitled Result',
              content: result.content || '',
              source: result.source || 'Unknown',
              url: result.url || '#',
              timestamp: result.timestamp || new Date().toISOString(),
              // Mark as LLM result if detected
              isLLMResult: detectLLMResult(result)
            }];
          }
        }
        
        setProcessedResults(processed);
        
        // Notify parent if callback provided
        if (typeof onResultsProcessed === 'function') {
          onResultsProcessed(processed);
        }
        // Clear timeout on successful processing
        clearTimeout(processingTimeout);
      } catch (err) {
        log.error('Error processing search results in base component:', err);
        setError(err.message || 'Error processing search results');
        // Fallback to original results
        setProcessedResults(results);
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Start processing
    processResultsData();
    
    // Cleanup function to clear timeouts
    return () => {
      clearTimeout(failsafeTimeout);
    };
  }, [query, results, resultProcessor, options, onResultsProcessed]);
  
  // Make the processed results, loading state, and error available to children
  const childProps = {
    results: processedResults || [],
    isProcessing,
    error,
    query
  };
  
  // Render children with processed results
  return children ? (
    typeof children === 'function' ? 
      children(childProps) : 
      React.cloneElement(children, childProps)
  ) : null;
};

export default SearchResultsBase;
