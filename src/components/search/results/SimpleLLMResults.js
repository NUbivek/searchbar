/**
 * SimpleLLMResults.js
 * A clean, minimalist approach to displaying LLM search results with tabs
 */

import React, { useState, useEffect } from 'react';
import TabNavigation from './TabNavigation';
import styles from '../../../styles/SimpleLLMResults.module.css';

/**
 * ExpandableContent Component
 * Handles expandable content with show more/less functionality
 * Now with support for different content types
 */
const ExpandableContent = ({ content }) => {
  const [expanded, setExpanded] = useState(false);
  const initialDisplayLength = 1000; // Characters to display initially
  
  // Handle different content types
  const processContent = () => {
    // If content is null or undefined, return empty string
    if (content === null || content === undefined) {
      console.log('ExpandableContent: content is null or undefined');
      return '';
    }
    
    // If content is already a string, use it directly
    if (typeof content === 'string') {
      return content;
    }
    
    // If content is an object with text or html property, use that
    if (typeof content === 'object') {
      if (content.text) return content.text;
      if (content.html) return content.html;
      if (content.content) return content.content;
      
      // Try to stringify the object
      try {
        return JSON.stringify(content, null, 2);
      } catch (e) {
        console.error('Failed to stringify content:', e);
        return 'Unable to display content';
      }
    }
    
    // For any other type, convert to string
    return String(content);
  };
  
  const processedContent = processContent();
  const contentLength = processedContent.length;
  
  // Should we show the expand button?
  const shouldShowExpandButton = contentLength > initialDisplayLength;
  
  // The actual content to display
  const displayContent = expanded ? processedContent : processedContent.substring(0, initialDisplayLength);
  
  return (
    <div className={styles.expandableContent}>
      <div 
        className={styles.fullContent}
        dangerouslySetInnerHTML={{ 
          __html: displayContent + (shouldShowExpandButton && !expanded ? '...' : '') 
        }} 
      />
      
      {shouldShowExpandButton && (
        <button 
          className={styles.expandButton}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

/**
 * SimpleLLMResults Component
 * Displays LLM search results with a clean tab interface
 * 
 * @param {Object} props Component props
 * @param {Array} props.categories - Array of category objects
 * @param {Array} props.results - Array of search result items
 * @param {string} props.query - The search query
 * @param {boolean} props.showTabs - Whether to show tabs or not
 * @param {boolean} props.forceShowTabs - Override to force showing tabs even if only one tab exists
 * @param {string} props.defaultTab - Name of the default tab to show
 * @param {Function} props.onFollowUpSearch - Callback for handling follow-up searches
 */
const SimpleLLMResults = ({ 
  categories = [], 
  results = [],
  query = '',
  showTabs = true,
  forceShowTabs = false,
  defaultTab = 'Results',
  onFollowUpSearch = null
}) => {
  // Format categories for display
  const [formattedCategories, setFormattedCategories] = useState([]);
  const [allResultsTab, setAllResultsTab] = useState(null);
  
  // Log when forceShowTabs changes to aid debugging
  useEffect(() => {
    console.log(`ForceShowTabs prop is ${forceShowTabs ? 'ENABLED' : 'disabled'} with defaultTab="${defaultTab}"`);
  }, [forceShowTabs, defaultTab]);
  
  // SUPER-ENHANCED data validation with comprehensive LLM result detection
  const validResults = React.useMemo(() => {
    if (Array.isArray(results)) {
      // Check if any results are error objects
      const hasErrors = results.some(item => 
        item && (item.isError === true || item.type === 'error')
      );
      
      // Log errors if found
      if (hasErrors) {
        console.log('⚠️ Error detected in results:', results.filter(item => 
          item && (item.isError === true || item.type === 'error')
        ));
      }
      
      return results;
    }
    return [];
  }, [results]);
  
  // Error detection for special handling
  const hasErrorResults = React.useMemo(() => {
    if (!Array.isArray(validResults)) return false;
    
    return validResults.some(item => 
      item && (
        (typeof item === 'object' && (item.isError === true || item.type === 'error')) ||
        (typeof item === 'string' && (
          item.includes('API key error') || 
          item.includes('authentication error') ||
          item.includes('error occurred')
        ))
      )
    );
  }, [validResults]);

  // Create a default "Results" tab that will always be present
  const [resultsTab, setResultsTab] = useState(null);
  
  // Create tabs based on categories
  useEffect(() => {
    // Create tabs based on results
    if (Array.isArray(validResults) && validResults.length > 0) {
      // Create a Results tab
      setResultsTab({
        id: 'results-tab',
        label: defaultTab,
        content: (
          <div className={styles.resultsContainer}>
            {validResults.map((result, index) => (
              <div key={`result-${index}`} className={styles.resultItem}>
                <div className={styles.resultContent}>
                  {typeof result === 'string' ? result : 
                   typeof result.content === 'string' ? result.content :
                   JSON.stringify(result)}
                </div>
              </div>
            ))}
          </div>
        )
      });
    }
  }, [validResults, defaultTab]);
  
  // Format categories into tabs
  useEffect(() => {
    const createTabs = () => {
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
                  <div dangerouslySetInnerHTML={{ __html: category.content }} />
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
  }, [categories]);
  
  // Combine all tabs for the navigation component
  const allTabs = React.useMemo(() => {
    // Always start with the resultsTab if it exists
    const tabs = [];
    
    // Add the Results tab first if it exists
    if (resultsTab) {
      tabs.push(resultsTab);
    }
    
    // Add category tabs
    if (formattedCategories && formattedCategories.length > 0) {
      tabs.push(...formattedCategories);
    }
    
    // ALWAYS create a default tab when forceShowTabs is true regardless of other conditions
    if (forceShowTabs || tabs.length === 0) {
      tabs.push({
        id: 'default-results-tab',
        label: defaultTab,
        content: (
          <div className={styles.resultsContainer}>
            {validResults.map((result, index) => (
              <div key={`emergency-result-${index}`} className={styles.resultItem}>
                <div className={styles.resultContent}>
                  {typeof result === 'string' ? result : 
                   typeof result.content === 'string' ? result.content :
                   JSON.stringify(result)}
                </div>
              </div>
            ))}
          </div>
        )
      });
    }
    
    return tabs;
  }, [resultsTab, formattedCategories, validResults, forceShowTabs, defaultTab]);

  // Debug logging for tab state
  useEffect(() => {
    console.log('SimpleLLMResults FINAL RENDER with props:', {
      showTabs,
      forceShowTabs,
      defaultTab,
      resultsCount: Array.isArray(results) ? results.length : 'not array',
      hasQuery: Boolean(query),
      allTabsCount: allTabs?.length || 0,
      formattedCategoriesCount: formattedCategories?.length || 0
    });
  }, [showTabs, forceShowTabs, defaultTab, results, query, allTabs, formattedCategories]);
  
  // Force-create an empty tab if needed for display
  const ensuredTabs = allTabs && allTabs.length > 0 ? allTabs : [{
    id: 'force-created-tab',
    label: defaultTab || 'Results',
    content: (
      <div className={styles.resultsContainer}>
        <div className={styles.noResultsMessage}>
          {Array.isArray(validResults) && validResults.length > 0 ? (
            <div>
              {validResults.map((result, index) => (
                <div key={`last-resort-${index}`} className={styles.resultItem}>
                  {typeof result === 'object' ? JSON.stringify(result) : String(result)}
                </div>
              ))}
            </div>
          ) : (
            "No results available for this search."
          )}
        </div>
      </div>
    )
  }];

  console.log('FINAL TABS STATE:', {
    tabCount: ensuredTabs.length,
    forceShowTabs,
    showTabs,
    names: ensuredTabs.map(t => t.label)
  });
  
  // Apply error styling if there are error results
  const containerStyle = hasErrorResults ? {
    border: '2px solid #ef4444',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#fef2f2'
  } : {};
  
  console.log('FINAL RENDER DECISIONS:', {
    hasErrorResults,
    forceShowTabs,
    showTabs,
    tabCount: ensuredTabs.length,
    defaultTab
  });
  
  // Create a default tab when no tabs are available
  const defaultResultsTab = [
    {
      id: 'default-results-tab',
      label: defaultTab || 'Results',
      content: (
        <div className={styles.resultsContainer}>
          {validResults && validResults.length > 0 ? (
            validResults.map((result, index) => (
              <div key={`result-${index}`} className={styles.resultItem}>
                <div className={styles.resultContent}>
                  {typeof result === 'string' ? result : 
                   typeof result.content === 'string' ? result.content :
                   JSON.stringify(result)}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResultsMessage}>
              No results available for this search.
            </div>
          )}
        </div>
      )
    }
  ];

  // Determine which tabs to show, with fallbacks if needed
  const effectiveTabs = ensuredTabs.length > 0 ? ensuredTabs : 
                     (allTabs && allTabs.length > 0 ? allTabs : defaultResultsTab);
  
  // Always force showing tabs if requested explicitly
  const tabsToShow = forceShowTabs ? effectiveTabs : 
                   (showTabs ? effectiveTabs : [effectiveTabs[0]]);
  
  console.log('Tab configuration:', {
    tabsAvailable: effectiveTabs.length,
    forceShowTabs,
    showTabs,
    finalTabCount: tabsToShow.length,
    tabNames: tabsToShow.map(t => t.label || 'Unnamed')
  });
  
  // Helper function to ensure tab visibility in rendered output
  if (typeof window !== 'undefined') {
    window.__ensureTabVisibility = function() {
      const tabContainers = document.querySelectorAll('[data-testid="tab-navigation"]');
      if (tabContainers.length > 0) {
        console.log(`Found ${tabContainers.length} tab navigation containers`); 
        tabContainers.forEach(container => {
          container.style.display = 'block';
          container.style.visibility = 'visible';
        });
      }
    };
    
    // Execute after a short delay to ensure DOM is ready
    setTimeout(() => {
      if (window.__ensureTabVisibility) {
        window.__ensureTabVisibility();
      }
    }, 500);
  }
  
  // Simple helper styles applied directly to elements
  const tabStyles = {
    display: 'block',
    visibility: 'visible'
  };
  
  return (
    <div 
      className={`${styles.container} ${styles.tabVisibilityHelper}`} 
      data-testid="simple-llm-results"
      style={{
        border: hasErrorResults ? '1px solid #f87171' : '1px solid #e5e7eb',
        padding: '16px', 
        borderRadius: '8px', 
        margin: '16px 0',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* No inline style tag needed anymore */}
      
      {/* Status bar - minimal and informative */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <div>
          <span className={styles.statusLabel}>{query ? `"${query}"` : 'Results'}</span>
        </div>
        <div style={{fontSize: '12px', color: '#9ca3af'}}>
          {validResults?.length || 0} result(s) available
        </div>
      </div>
      
      {/* Alert box for API errors if detected */}
      {hasErrorResults && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #f87171',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '16px',
          color: '#b91c1c',
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '500' }}>API Error</h4>
          <p style={{ margin: '0', fontSize: '14px' }}>
            An error occurred with the Together API. This may be due to an invalid API key.
            Please check your API key configuration or try again later.
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{...tabStyles, marginBottom: '16px'}}>
        <TabNavigation 
          tabs={tabsToShow} 
          defaultTabId={tabsToShow[0]?.id}
          onTabChange={(tabId) => console.log('Tab changed to:', tabId)}
        />
      </div>
    </div>
  );
};

export default SimpleLLMResults;
