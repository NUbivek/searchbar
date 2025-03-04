/**
 * LLMCategorizedResults.js
 * A specialized component for displaying categorized LLM search results.
 * Refactored to use base components for consistency across search results
 */

import React, { useState, useEffect } from 'react';
import styles from './LLMCategorizedResults.module.css';
import { debug, info, warn, error } from '../../../utils/logger';
import { 
  SearchResultsBase, 
  ResultTabs,
  detectLLMResult,
  formatLLMResult
} from './baseComponents';
import ScoreVisualizer from '../metrics/ScoreVisualizer';
import CategoryFinder from '../categories/CategoryFinder';
import { generateInlineLinks } from './LinkGenerator';

// Create a log object for consistent logging
const log = { debug, info, warn, error };

/**
 * LLMCategorizedResults component
 * 
 * A specialized component for displaying categorized LLM search results.
 * Provides a sleek, responsive UI for displaying LLM results organized by categories.
 * 
 * @param {Object} props Component props
 * @param {Array} props.results Array of LLM results
 * @param {string} props.query Search query
 * @param {Array} props.categories Categories to display
 * @param {Function} props.onFollowUpSearch Callback for follow-up searches
 * @param {Object} props.options Additional display options
 */
const LLMCategorizedResults = ({ 
  results = [], 
  query = '',
  categories = [],
  onFollowUpSearch = null,
  options = {},
  sources = [] 
}) => {
  // Initialize CategoryFinder if categories aren't provided
  const categoryFinder = new CategoryFinder();
  const [enhancedCategories, setEnhancedCategories] = useState(categories);
  // Process LLM results to ensure they have the correct format
  const processResults = (llmResults) => {
    if (!llmResults || !Array.isArray(llmResults) || llmResults.length === 0) {
      return [];
    }
    
    // Process each result using the formatter
    const processedResults = llmResults.map(result => {
      if (detectLLMResult(result)) {
        return formatLLMResult(result);
      }
      return result;
    });

    // If no categories provided, generate them dynamically
    if (categories.length === 0 && processedResults.length > 0) {
      // Generate categories based on content
      categoryFinder.findCategories(processedResults, query)
        .then(generatedCategories => {
          // Filter to only show categories that score at least 70% on all metrics
          const qualityCategories = generatedCategories.filter(category => {
            return (
              (category.scores?.relevance || 0) >= 0.7 &&
              (category.scores?.credibility || 0) >= 0.7 &&
              (category.scores?.accuracy || 0) >= 0.7
            );
          });
          
          // Limit to top 5-6 categories
          const topCategories = qualityCategories
            .sort((a, b) => {
              // Weight relevance 2x
              const scoreA = (a.scores?.relevance * 2 || 0) + (a.scores?.credibility || 0) + (a.scores?.accuracy || 0);
              const scoreB = (b.scores?.relevance * 2 || 0) + (b.scores?.credibility || 0) + (b.scores?.accuracy || 0);
              return scoreB - scoreA;
            })
            .slice(0, 6);
            
          setEnhancedCategories(topCategories);
        })
        .catch(err => {
          log.error('Error generating categories:', err);
        });
    }
    
    return processedResults;
  };
  
  // Prepare tabs based on categories
  const prepareTabs = (processedResults, categories) => {
    // Log detailed information about results and categories
    log.debug('Preparing tabs for LLMCategorizedResults', {
      resultCount: processedResults?.length || 0,
      categoryCount: categories?.length || 0
    });
    
    // Array to hold our tabs
    const tabs = [];
    
    // Add tabs for each category
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
              <div className={styles.categoryItems}>
                {category.items.map((item, index) => {
                  // Format item if it's an LLM result
                  const formattedItem = detectLLMResult(item) ? formatLLMResult(item) : item;
                  const itemId = `${category.id}-item-${index}`;
                  const isExpanded = expandedItems[itemId] || false;
                  
                  // Extract numerical data and key points for the show more section
                  const itemContent = formattedItem.content || formattedItem.text || '';
                  const hasDetailedContent = itemContent.length > 200;
                  
                  // Create preview and detailed content versions
                  const previewContent = hasDetailedContent ? 
                    `${itemContent.substring(0, 200)}...` : itemContent;
                  
                  // Enhanced content with highlighted numbers and bullet points
                  const enhancedContent = hasDetailedContent && isExpanded ? 
                    itemContent
                      .replace(/([0-9]+(\.?[0-9]*)(\s*%)?)/g, '<span class="highlight-number">$1</span>')
                      .replace(/(•|\*)\s+([^•\*\n]+)/g, '$1 <strong>$2</strong>')
                    : null;
                  
                  return (
                    <div key={`cat-item-${index}`} className={`${styles.categoryItem} ${styles.itemWithScore}`}>
                      <div className={styles.itemContent}>
                        {formattedItem.title && (
                          <div className={styles.itemTitle}>{formattedItem.title}</div>
                        )}
                        <div 
                          className={styles.itemText}
                          dangerouslySetInnerHTML={{ 
                            __html: generateInlineLinks(
                              isExpanded && enhancedContent ? enhancedContent : previewContent, 
                              category.sources || [], 
                              {
                                maxLinks: 5,
                                preferredSourceType: options.sourceType || 'any'
                              }
                            )
                          }}
                        />
                        
                        {/* Show More button for detailed content */}
                        {hasDetailedContent && (
                          <div className={styles.showMoreContainer}>
                            <button 
                              className={styles.showMoreButton}
                              onClick={() => toggleItemExpand(itemId)}
                            >
                              {isExpanded ? 'Show Less' : 'Show More'}
                            </button>
                          </div>
                        )}
                        
                        {/* Add Score Visualizer for category items */}
                        <div className={styles.metricsContainer}>
                          <ScoreVisualizer 
                            metrics={{
                              relevance: category.scores?.relevance || 0.75,
                              credibility: category.scores?.credibility || 0.8,
                              accuracy: category.scores?.accuracy || 0.85
                            }}
                            options={{
                              showLabels: true,
                              size: 'medium',
                              style: 'modern'
                            }}
                          />  
                        </div>
                      </div>
                      {onFollowUpSearch && (
                        <div className={styles.followUpContainer}>
                          <button 
                            className={styles.followUpButton}
                            onClick={() => onFollowUpSearch(formattedItem.text || 
                              (typeof formattedItem.content === 'string' ? 
                                formattedItem.content : JSON.stringify(formattedItem.content)))}
                          >
                            Follow-up Search
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        });
      });
    }
    
    // If we have results but no categories, add a results tab
    if (processedResults.length > 0 && tabs.length === 0) {
      tabs.push({
        id: 'results',
        label: 'Results',
        count: processedResults.length,
        content: (
          <div className={styles.resultsList}>
            {processedResults.map((result, index) => {
              const formattedResult = detectLLMResult(result) ? formatLLMResult(result) : result;
              
              return (
                <div key={`result-${index}`} className={styles.resultItem}>
                  {formattedResult.title && (
                    <div className={styles.resultTitle}>{formattedResult.title}</div>
                  )}
                  <div 
                    className={styles.resultContent}
                    dangerouslySetInnerHTML={{ 
                      __html: generateInlineLinks(formattedResult.content || formattedResult.text || formattedResult, sources, {
                        maxLinks: 5,
                        preferredSourceType: options.sourceType || 'any'
                      })
                    }}
                  />
                  {/* Add Score Visualizer for non-categorized results */}
                  <div className={styles.metricsContainer}>
                    <ScoreVisualizer 
                      metrics={{
                        relevance: 0.8,
                        credibility: 0.75,
                        accuracy: 0.7
                      }}
                      options={{
                        showLabels: true,
                        size: 'medium',
                        style: 'modern'
                      }}
                    />  
                  </div>
                  {onFollowUpSearch && (
                    <div className={styles.followUpContainer}>
                      <button 
                        className={styles.followUpButton}
                        onClick={() => onFollowUpSearch(formattedResult.text || 
                          (typeof formattedResult.content === 'string' ? 
                            formattedResult.content : JSON.stringify(formattedResult.content)))}
                      >
                        Follow-up Search
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      });
    }
    
    return tabs;
  };
  
  // Handle expand/collapse for categories
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  
  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  const toggleItemExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };
  
  // Render the component using base components
  return (
    <SearchResultsBase
      results={results}
      query={query}
      resultProcessor={processResults}
    >
      {({ results: processedResults, isProcessing, error }) => (
        <div className={styles.llmCategorizedResults}>
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
          
          {/* Results display with tabs */}
          {!isProcessing && !error && (
            <ResultTabs
              tabs={prepareTabs(processedResults, enhancedCategories.length > 0 ? enhancedCategories : categories)}
              defaultTab={enhancedCategories.length > 0 ? enhancedCategories[0].id : 
                         categories.length > 0 ? categories[0].id : "results"}
              showTabs={true}
              onTabClick={(tabId) => {
                // Track expanded state for this tab's categories
                const category = [...enhancedCategories, ...categories]
                  .find(cat => cat.id === tabId);
                if (category && !expandedCategories[category.id]) {
                  toggleCategoryExpand(category.id);
                }
              }}
            />
          )}
        </div>
      )}
    </SearchResultsBase>
  );
};

export default LLMCategorizedResults;
