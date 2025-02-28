import React, { useState, useEffect } from 'react';
import { debug, info, warn, error } from '../../../utils/logger';
import { isBusinessQuery, detectQueryContext } from '../utils/contextDetector';
import { LLMResultsProcessor } from './LLMResultsProcessor';
import CategoryDisplay from '../categories/CategoryDisplay';

// Create a log object for consistent logging
const log = { debug, info, warn, error };

/**
 * Component for displaying intelligent search results with context-aware presentation
 * @param {Object} props Component props
 * @param {Array} props.results The search results to display
 * @param {string} props.query The search query
 * @param {Object} props.options Additional options for display
 * @returns {JSX.Element} Rendered intelligent search results
 */
const IntelligentSearchResults = ({ results, query, options = {} }) => {
  const [processedResults, setProcessedResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [queryContext, setQueryContext] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset state when query or results change
    setIsProcessing(true);
    setProcessedResults(null);
    setError(null);

    // Detect query context
    const context = detectQueryContext(query);
    setQueryContext(context);

    // Process results with LLM if available
    const processResults = async () => {
      try {
        if (!results || !Array.isArray(results) || results.length === 0) {
          setProcessedResults([]);
          setIsProcessing(false);
          return;
        }

        // Create LLM processor
        const processor = new LLMResultsProcessor();
        
        // Process results with context
        const processed = await processor.processResults(results, query, {
          context: context,
          extractBusinessInsights: context.isBusinessQuery || options.extractBusinessInsights,
          enhanceCategories: true,
          calculateMetrics: true,
          useEnhancedView: true
        });
        
        setProcessedResults(processed);
      } catch (err) {
        log.error('Error processing search results:', err);
        setError(err.message || 'Error processing search results');
        // Fall back to original results
        setProcessedResults(results);
      } finally {
        setIsProcessing(false);
      }
    };

    // Start processing
    processResults();
  }, [query, results]);

  // If still processing, show loading state
  if (isProcessing) {
    return (
      <div className="intelligent-search-results-loading">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Analyzing search results for "{query}"...</p>
        </div>
      </div>
    );
  }

  // If error occurred, show error state
  if (error) {
    return (
      <div className="intelligent-search-results-error">
        <div className="error-message">
          <h3>Error Processing Results</h3>
          <p>{error}</p>
          <p>Showing standard search results instead.</p>
        </div>
        <CategoryDisplay 
          categories={results} 
          query={query} 
          options={{ 
            showMetrics: true,
            useEnhancedView: false
          }} 
        />
      </div>
    );
  }

  // If no results, show empty state
  if (!processedResults || !Array.isArray(processedResults) || processedResults.length === 0) {
    return (
      <div className="intelligent-search-results-empty">
        <h3>No Results Found</h3>
        <p>We couldn't find any results for "{query}".</p>
        <p>Try adjusting your search terms or browse our popular categories.</p>
      </div>
    );
  }

  // Determine display options based on query context
  const displayOptions = {
    ...options,
    useEnhancedView: true,
    showMetrics: true,
    extractBusinessInsights: queryContext?.isBusinessQuery || options.extractBusinessInsights,
    businessFocused: queryContext?.isBusinessQuery,
    technicalFocused: queryContext?.isTechnicalQuery,
    financialFocused: queryContext?.isFinancialQuery,
    medicalFocused: queryContext?.isMedicalQuery
  };

  // Render context-aware header
  const renderContextHeader = () => {
    if (!queryContext) return null;

    let headerContent = null;
    
    if (queryContext.isBusinessQuery) {
      headerContent = (
        <div className="context-header business">
          <h2>Business Intelligence Results</h2>
          <p>Showing business-focused results for "{query}" with enhanced metrics and insights.</p>
        </div>
      );
    } else if (queryContext.isFinancialQuery) {
      headerContent = (
        <div className="context-header financial">
          <h2>Financial Intelligence Results</h2>
          <p>Showing financial analysis and data for "{query}" with enhanced metrics.</p>
        </div>
      );
    } else if (queryContext.isTechnicalQuery) {
      headerContent = (
        <div className="context-header technical">
          <h2>Technical Intelligence Results</h2>
          <p>Showing technical information and resources for "{query}" with enhanced context.</p>
        </div>
      );
    } else if (queryContext.isMedicalQuery) {
      headerContent = (
        <div className="context-header medical">
          <h2>Medical Intelligence Results</h2>
          <p>Showing medical information and research for "{query}" with enhanced context.</p>
        </div>
      );
    }

    return headerContent;
  };

  // Render the results
  return (
    <div className="intelligent-search-results">
      {renderContextHeader()}
      
      <CategoryDisplay 
        categories={processedResults} 
        query={query} 
        options={displayOptions} 
      />
    </div>
  );
};

export default IntelligentSearchResults;
