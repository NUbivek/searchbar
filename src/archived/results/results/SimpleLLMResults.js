/**
 * SimpleLLMResults.js
 * A clean, minimalist approach to displaying LLM search results with tabs
 */

import React, { useState, useEffect } from 'react';
import TabNavigation from './TabNavigation';
import styles from './SimpleLLMResults.module.css';

/**
 * SimpleLLMResults Component
 * Displays LLM search results with a clean tab interface
 * 
 * @param {Object} props Component props
 * @param {Array} props.categories - Array of category objects
 * @param {Array} props.results - Array of search result items
 * @param {string} props.query - The search query
 */
const SimpleLLMResults = ({ 
  categories = [], 
  results = [],
  query = '' 
}) => {
  // Format categories for display
  const [formattedCategories, setFormattedCategories] = useState([]);
  const [allResultsTab, setAllResultsTab] = useState(null);

  useEffect(() => {
    // Build tabs data
    const createTabs = () => {
      // Always include an "All Results" tab
      const allResults = {
        id: 'all-results',
        label: 'All Results',
        content: (
          <div className={styles.resultsContainer}>
            {results.length > 0 ? (
              results.map((result, index) => (
                <div key={`result-${index}`} className={styles.resultItem}>
                  <h3 className={styles.resultTitle}>{result.title || 'Result'}</h3>
                  <div className={styles.resultContent}>
                    {typeof result.content === 'string' ? (
                      <div dangerouslySetInnerHTML={{ __html: result.content }} />
                    ) : (
                      <div>{JSON.stringify(result.content)}</div>
                    )}
                  </div>
                  {result.source && (
                    <div className={styles.resultSource}>Source: {result.source}</div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noResultsMessage}>
                No results available for this search.
              </div>
            )}
          </div>
        )
      };
      
      setAllResultsTab(allResults);
      
      // Create tabs from categories
      if (Array.isArray(categories) && categories.length > 0) {
        const categoryTabs = categories.map((category) => {
          // Ensure category has necessary properties
          const id = category.id || `category-${Math.random().toString(36).substr(2, 9)}`;
          const label = category.name || category.title || 'Category';
          
          return {
            id,
            label,
            content: (
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryTitle}>{label}</h3>
                {category.content ? (
                  typeof category.content === 'string' ? (
                    <div dangerouslySetInnerHTML={{ __html: category.content }} />
                  ) : Array.isArray(category.content) ? (
                    <div className={styles.categoryItems}>
                      {category.content.map((item, i) => (
                        <div key={`item-${i}`} className={styles.categoryItem}>
                          {typeof item === 'string' ? (
                            <div dangerouslySetInnerHTML={{ __html: item }} />
                          ) : (
                            <div>{JSON.stringify(item)}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>{JSON.stringify(category.content)}</div>
                  )
                ) : (
                  <div className={styles.noContentMessage}>
                    No content available for this category.
                  </div>
                )}
              </div>
            )
          };
        });
        
        setFormattedCategories(categoryTabs);
      } else {
        setFormattedCategories([]);
      }
    };
    
    createTabs();
  }, [categories, results]);
  
  // Combine all tabs for the navigation component
  const allTabs = allResultsTab ? [allResultsTab, ...formattedCategories] : formattedCategories;

  return (
    <div className={styles.container} data-testid="simple-llm-results">
      {query && (
        <div className={styles.queryInfo}>
          <span className={styles.queryLabel}>Search Query:</span> 
          <span className={styles.queryText}>{query}</span>
        </div>
      )}
      
      <TabNavigation 
        tabs={allTabs} 
        defaultTabId={allResultsTab?.id || (formattedCategories.length > 0 ? formattedCategories[0].id : null)}
      />
      
      <div className={styles.resultsInfo}>
        <div className={styles.statsItem}>
          <span className={styles.statsLabel}>Categories:</span> {categories.length}
        </div>
        <div className={styles.statsItem}>
          <span className={styles.statsLabel}>Results:</span> {results.length}
        </div>
      </div>
    </div>
  );
};

export default SimpleLLMResults;
