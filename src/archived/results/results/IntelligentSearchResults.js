import React, { useState, useEffect } from 'react';
import { debug, info, warn, error } from '../../../utils/logger';
import { isBusinessQuery, detectQueryContext } from '../utils/contextDetector';
import { LLMResultsProcessor } from './LLMResultsProcessor';
import SimpleLLMResults from './SimpleLLMResults';
import ScoreVisualizer from '../metrics/ScoreVisualizer';
import searchResultScorer from '../../../utils/scoring/SearchResultScorer';

// Direct imports for category processing
import { processCategories } from '../categories/processors/CategoryProcessor';
import { getDefaultCategories } from '../categories/types/DefaultCategories';

// Import keyword matching utilities
import { KeywordMatcher } from '../categories/keywords/KeywordMatcher';
import { BusinessKeywords } from '../categories/keywords/BusinessKeywords';
import { MarketKeywords } from '../categories/keywords/MarketKeywords';
import { FinancialKeywords } from '../categories/keywords/FinancialKeywords';

// Theme enhancement removed - simplifying implementation

// Time-based caching for categories
const categoryCacheTime = 5 * 60 * 1000; // Cache for 5 minutes
const categoryCache = {
  timestamp: 0,
  categories: []
};

/**
 * IntelligentSearchResults Component
 * 
 * Displays search results with intelligent categorization and context-aware presentation.
 * 
 * @param {Object} props Component props
 * @param {Array} props.results Array of search result items
 * @param {string} props.query The search query
 * @param {Object} props.apiResponse The original API response
 * @param {Object} props.options Display options
 */
const IntelligentSearchResults = ({ 
  results = [], 
  query = '', 
  apiResponse = {}, 
  options = {} 
}) => {
  // State for processed results and categories
  const [processedResults, setProcessedResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [queryContext, setQueryContext] = useState(null);
  const [aggregateMetrics, setAggregateMetrics] = useState({
    relevance: 0,
    credibility: 0,
    timeliness: 0,
    accuracy: 0,
    overall: 0
  });
  
  // Process the query to detect context
  useEffect(() => {
    if (query) {
      const context = detectQueryContext(query);
      setQueryContext(context);
      debug(`Query context detected: ${context.primaryContext}`);
    }
  }, [query]);
  
  // Process search results when they change
  useEffect(() => {
    if (Array.isArray(results)) {
      // Get processor instance with the results
      const processor = new LLMResultsProcessor(results, query);
      
      // Get processed results
      const enhanced = processor.getEnhancedResults();
      setProcessedResults(enhanced);
      
      // Extract individual items for display
      const extractedItems = processor.extractItems();
      setItems(extractedItems);
      
      // Compute aggregate metrics
      const metrics = searchResultScorer.computeAggregateScores(enhanced);
      setAggregateMetrics(metrics);
      
      // Log result summary
      debug(`Processed ${enhanced.length} result groups with ${extractedItems.length} total items`);
    }
  }, [results, query]);
  
  // Generate categories when results change
  useEffect(() => {
    // Generate categories from the results
    const newCategories = generateCategories();
    
    // Set the categories
    setCategories(newCategories);
    
    // Debug info
    if (newCategories.length > 0) {
      debug(`Generated ${newCategories.length} categories`);
    } else {
      warn('No categories were generated from the results');
    }
  }, [processedResults, apiResponse]);
  
  // Generate categories from the API response or results
  const generateCategories = () => {
    // Check if we already have categories in the API response
    if (apiResponse && apiResponse.categories && Array.isArray(apiResponse.categories) && apiResponse.categories.length > 0) {
      debug(`Using ${apiResponse.categories.length} categories from API response`);
      // Return categories directly without theme enhancement
      return apiResponse.categories;
    }
    
    // Check if we recently generated categories and can use the cache
    const now = Date.now();
    if (now - categoryCache.timestamp < categoryCacheTime && categoryCache.categories.length > 0) {
      debug(`Using ${categoryCache.categories.length} categories from cache`);
      return categoryCache.categories;
    }
    
    // Generate categories from the processed results
    const context = queryContext || detectQueryContext(query);
    const isBusinessRelated = context.isBusinessQuery;
    
    // Use the appropriate processor based on the query context
    const generatedCategories = processCategories(processedResults, {
      query,
      isBusinessQuery: isBusinessRelated,
      includeDefaultCategories: true,
      debug: true
    });
    
    // Cache the categories
    categoryCache.timestamp = now;
    categoryCache.categories = generatedCategories;
    
    debug(`Generated ${generatedCategories.length} categories`);
    return generatedCategories;
  };
  
  // Filter out invalid categories
  const validCategories = (categories || []).filter(cat => 
    cat && cat.name && (cat.content || cat.items || cat.results)
  );
  
  // Render context info for search results
  const renderContextInfo = () => {
    if (!queryContext) return null;
    
    const { primaryContext, secondaryContext, isBusinessQuery, confidence } = queryContext;
    
    // Only show if we have high confidence
    if (confidence < 0.6) return null;
    
    return (
      <div style={{ 
        padding: '0.75rem',
        marginBottom: '1rem',
        backgroundColor: isBusinessQuery ? '#E0F7FA' : '#F3F4F6',
        borderRadius: '0.375rem',
        fontSize: '0.875rem'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
          Context Intelligence
        </div>
        <div>
          This search was processed using our specialized {primaryContext} context engine.
          {secondaryContext && ` Additional ${secondaryContext} context was applied.`}
        </div>
      </div>
    );
  };
  
  // Render a header showing context detection
  const renderContextHeader = () => {
    if (!queryContext || !queryContext.primaryContext) return null;
    
    const { primaryContext, confidence } = queryContext;
    
    // Only show if we have reasonable confidence
    if (confidence < 0.4) return null;
    
    return (
      <div style={{ 
        padding: '0.5rem',
        marginBottom: '0.75rem',
        backgroundColor: '#F3F4F6',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        color: '#4B5563'
      }}>
        <span style={{ fontWeight: 500 }}>
          <strong>{primaryContext.charAt(0).toUpperCase() + primaryContext.slice(1)}</strong> query detected: 
          Results optimized for {primaryContext} context
        </span>
      </div>
    );
  };

  // Render the results
  return (
    <div className="intelligent-search-results">
      {/* Simple context header with important information */}
      {renderContextHeader()}
      
      {/* New clean implementation with tab navigation */}
      <SimpleLLMResults 
        categories={validCategories}
        results={items}
        query={query}
      />
      
      {/* Basic context info - simplified */}
      <div style={{ 
        backgroundColor: '#F9FAFB',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        padding: '12px',
        fontSize: '14px',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Search Context Summary</h4>
        <p style={{ margin: '0 0 8px 0' }}>Your search for <strong>"{query}"</strong> was processed with {queryContext?.primaryContext || 'general'} context optimization.</p>
      </div>

      {/* For debugging purposes - can be removed in production */}
      <div style={{ display: 'none' }}>
        {/* Debug information hidden */}
      </div>
    </div>
  );
};

export default IntelligentSearchResults;
