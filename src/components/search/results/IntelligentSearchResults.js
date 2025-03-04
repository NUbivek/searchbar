/**
 * IntelligentSearchResults.js
 * Component for displaying intelligent search results with context-aware presentation
 * Refactored to use base components for consistency across search results
 */

import React, { useState, useEffect } from 'react';
import { debug, info, warn, error } from '../../../utils/logger';
import { isBusinessQuery, detectQueryContext } from '../utils/contextDetector';
import ModernCategoryDisplay from '../categories/ModernCategoryDisplay';
import LLMCategorizedResults from './LLMCategorizedResults';
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

// Import CategoryFinder for advanced category generation
import { findBestCategories } from '../categories/processors/CategoryFinder';
import CategoryFinder from '../categories/CategoryFinder';

// Import base components
import { 
  SearchResultsBase, 
  ResultTabs,
  detectLLMResult,
  formatLLMResult
} from './baseComponents';

// Create a log object for consistent logging
const log = { debug, info, warn, error };

/**
 * Component for displaying intelligent search results with context-aware presentation
 * @param {Object} props Component props
 * @param {Array} props.results The search results to display
 * @param {string} props.query The search query
 * @param {Array} props.categories Categories from search results
 * @param {Object} props.options Additional options for display
 * @returns {JSX.Element} Rendered intelligent search results
 */
const IntelligentSearchResults = ({ results, query, categories = [], options = {} }) => {
  const [processedResults, setProcessedResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [queryContext, setQueryContext] = useState(null);
  const [error, setError] = useState(null);
  
  // Store categories in state for proper tracking and management
  const [enhancedCategories, setEnhancedCategories] = useState(categories);
  
  // Process and enhance results based on query context
  useEffect(() => {
    if (!query) {
      setIsProcessing(false);
      return;
    }
    
    const processResults = async () => {
      try {
        setIsProcessing(true);
        
        // Detect query context if not explicitly provided
        const context = options.context || detectQueryContext(query);
        setQueryContext(context);
        
        // Process results based on detected context
        let processedData = [];
        let enhancedCats = [...categories];
        
        // Handle different result types
        if (Array.isArray(results)) {
          // Check if results contain LLM content
          const hasLLMResults = results.some(result => detectLLMResult(result));
          
          // Process LLM results
          if (hasLLMResults) {
            processedData = results.map(result => {
              if (detectLLMResult(result)) {
                return formatLLMResult(result);
              }
              return result;
            });
            
            // Generate enhanced categories if we don't have any
            if (enhancedCats.length === 0 && context) {
              const categoryFinder = new CategoryFinder();
              const generatedCategories = await categoryFinder.findCategoriesForResults(
                processedData, 
                query, 
                { 
                  context, 
                  businessFocus: context.includes('business'),
                  maxCategories: 10 // Get more than we need for filtering
                }
              );
              
              // Filter categories by quality threshold (70%)
              const qualityCategories = generatedCategories.filter(category => {
                return (
                  (category.scores?.relevance || 0) >= 0.7 &&
                  (category.scores?.credibility || 0) >= 0.7 &&
                  (category.scores?.accuracy || 0) >= 0.7
                );
              });
              
              // Apply relevance-first approach with weighting
              const weightedCategories = qualityCategories.map(category => ({
                ...category,
                weightedScore: (category.scores?.relevance * 2 || 0) + 
                               (category.scores?.credibility || 0) + 
                               (category.scores?.accuracy || 0)
              }));
              
              // Sort by weighted score and limit to 6 categories
              enhancedCats = weightedCategories
                .sort((a, b) => b.weightedScore - a.weightedScore)
                .slice(0, 6);
              
              // Check if we have Key Insights category with sufficient quality
              const hasKeyInsights = enhancedCats.some(cat => cat.id === 'keyInsights');
              
              // Handle edge cases
              if (enhancedCats.length < 3) {
                // If we have fewer than 3 categories, lower threshold to 65%
                if (qualityCategories.length === 0) {
                  const lowerQualityCategories = generatedCategories.filter(category => (
                    (category.scores?.relevance || 0) >= 0.65 &&
                    (category.scores?.credibility || 0) >= 0.65 &&
                    (category.scores?.accuracy || 0) >= 0.65
                  )).slice(0, 6);
                  
                  if (lowerQualityCategories.length > 0) {
                    enhancedCats = lowerQualityCategories;
                  }
                }
                
                // If still no categories, ensure at least Key Insights
                if (enhancedCats.length === 0) {
                  const keyInsights = generatedCategories.find(cat => cat.id === 'keyInsights');
                  if (keyInsights) {
                    enhancedCats = [keyInsights];
                  }
                }
              }
            }
          } else {
            // For non-LLM results, just process as-is
            processedData = results;
          }
        }
        
        setProcessedResults(processedData);
        setEnhancedCategories(enhancedCats);
        setIsProcessing(false);
      } catch (err) {
        console.error('Error processing results:', err);
        setError(`Error processing results: ${err.message}`);
        setIsProcessing(false);
      }
    };
    
    processResults();
  }, [results, query, categories, options.context]);
  
  // Handle follow-up search
  const handleFollowUpSearch = (text) => {
    if (options.onFollowUpSearch && typeof options.onFollowUpSearch === 'function') {
      options.onFollowUpSearch(text);
    }
  };
  
  // Determine which result component to use based on context and content
  const getResultComponent = () => {
    if (error) {
      return (
        <div className="error-container">
          <h3 className="error-title">Error</h3>
          <p className="error-message">{error}</p>
        </div>
      );
    }
    
    if (isProcessing) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Processing results...</p>
        </div>
      );
    }
    
    if (!processedResults || processedResults.length === 0) {
      return (
        <div className="no-results">
          <h3>No results found</h3>
          <p>We couldn't find any results for your search query. Please try different keywords.</p>
        </div>
      );
    }
    
    // Check if results are primarily LLM content
    const hasLLMResults = Array.isArray(processedResults) && 
      processedResults.some(result => detectLLMResult(result));
    
    // Use specialized components based on content type
    if (hasLLMResults) {
      // Business context with categories -> LLMCategorizedResults
      if (queryContext?.includes('business') && enhancedCategories.length > 0) {
        return (
          <LLMCategorizedResults
            results={processedResults}
            query={query}
            categories={enhancedCategories}
            onFollowUpSearch={handleFollowUpSearch}
            options={{
              showMetrics: options.showMetrics,
              businessFocus: true
            }}
          />
        );
      }
      
      // Has categories but not business -> SimpleLLMResults with tabs
      if (enhancedCategories.length > 0) {
        return (
          <SimpleLLMResults
            results={processedResults}
            query={query}
            categories={enhancedCategories}
            onFollowUpSearch={handleFollowUpSearch}
            showTabs={true}
          />
        );
      }
      
      // Simple LLM display without categories
      return (
        <SimpleLLMResults
          results={processedResults}
          query={query}
          onFollowUpSearch={handleFollowUpSearch}
        />
      );
    }
    
    // For non-LLM results, use Modern Category Display
    return (
      <ModernCategoryDisplay
        results={processedResults}
        categories={enhancedCategories}
        query={query}
      />
    );
  };
  
  // Render the component
  return (
    <div className="intelligent-search-results">
      {getResultComponent()}
    </div>
  );
};

export default IntelligentSearchResults;
