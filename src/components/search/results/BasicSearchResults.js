/**
 * BasicSearchResults.js
 * A simplified search results component that displays basic result items with category tabs
 */

import React, { useState, useEffect } from 'react';
import styles from './BasicSearchResults.module.css';
import TabNavigation from './TabNavigation';
import CategoryDisplay from '../categories/CategoryDisplay';
import { getDefaultCategories } from '../categories/types/DefaultCategories';
import SimpleLLMResults from './SimpleLLMResults';

/**
 * BasicSearchResults Component
 * 
 * Displays search results in a simple list format with category tabs
 * 
 * @param {Object} props Component props
 * @param {Array} props.results Array of search result items
 * @param {string} props.query The search query
 * @param {Array} props.categories Categories to display (optional)
 */
const BasicSearchResults = ({ 
  results = [], 
  query = '',
  categories = [],
  onFollowUpSearch = null
}) => {
  // State for tabs and follow-up query
  const [tabs, setTabs] = useState([]);
  // Follow-up query handling removed - now handled at wrapper level
  
  // ENHANCED LLM result detection and preservation
  // This function helps ensure consistent LLM result detection
  const isLLMResult = React.useCallback((result) => {
    if (!result) return false;
    
    return (
      // Check all possible flags that could indicate an LLM result
      result.__isImmutableLLMResult === true || 
      result.isLLMResults === true || 
      result.llmProcessed === true
    );
  }, []);
  
  // Add detailed logging for debugging LLM results rendering
  useEffect(() => {
    // Log detailed information about the results
    console.log('BasicSearchResults component received results:', {
      count: results?.length || 0,
      hasQuery: !!query,
      resultsTypes: Array.isArray(results) ? 
        results.map(r => r.type).join(', ') : 'not-array'
    });
    
    // Log each result with its critical properties
    if (Array.isArray(results) && results.length > 0) {
      console.log('Results summary:', results.map((r, i) => ({
        index: i,
        type: r.type,
        isLLMResults: r.isLLMResults === true,
        isImmutable: r.__isImmutableLLMResult === true || r.__isImmutable === true,
        contentType: Array.isArray(r.content) ? `Array[${r.content.length}]` : typeof r.content,
        resultId: r.resultId || r.messageId || 'none',
        detectedAsLLM: isLLMResult(r)
      })));
    }
  }, [results, query, isLLMResult]);
  
  // Generate tabs when component mounts or categories change
  useEffect(() => {
    // Get categories - use provided ones or default
    const categoryList = categories.length > 0 ? categories : getDefaultCategories();
    const keyInsightsCategory = categoryList.find(cat => cat.name === 'Key Insights') || categoryList[0]; // Get Key Insights or first category
    
    // Create tabs - showing both Results and Key Insights tabs
    const generatedTabs = [
      // Main results tab
      {
        id: 'main-results',
        label: 'Results',
        content: (
          <div className={styles.resultsContainer}>
            {/* REMOVED QUERY DISPLAY */}
            {results && results.length > 0 ? (
              <div className={styles.resultsList}>
                {results.map((result, index) => (
                  <div key={result.id || index} className={`${styles.resultItem} ${result.isUserQuery || result.isFormattedUserQuery ? styles.userQueryItem : ''}`}>
                    {!result.isUserQuery && !result.isFormattedUserQuery && result.type !== 'formattedUserQuery' && (
                      <div className={styles.resultHeader}>
                        <h3 className={styles.resultTitle}>
                          <a href={result.url} target="_blank" rel="noopener noreferrer">
                            {result.title}
                          </a>
                        </h3>
                        <div className={styles.resultMeta}>
                        {result.source && (
                          <span className={styles.resultSource}>
                            <span className={styles.metadataLabel}>Source:</span> {result.source}
                          </span>
                        )}
                        {result.url && (
                          <span className={styles.resultUrl}>
                            <span className={styles.metadataLabel}>URL:</span>
                            <a href={result.url} target="_blank" rel="noopener noreferrer">
                              {result.url.length > 40 ? result.url.substring(0, 40) + '...' : result.url}
                            </a>
                          </span>
                        )}
                        {result.date && (
                          <span className={styles.resultDate}>
                            <span className={styles.metadataLabel}>Date:</span> {result.date}
                          </span>
                        )}
                        {(result.relevance || result.relevance === 0) && (
                          <span className={styles.resultRelevance}>
                            <span className={styles.metadataLabel}>Relevance:</span> {result.relevance}%
                          </span>
                        )}
                      </div>
                    </div>
                    )}
                    <div className={styles.resultContent}>
                      {/* Debug logs for result content type with immutable flag */}
                      {console.log('RENDERING RESULT AT FINAL STAGE:', { 
                        type: result.type, 
                        isLLMResults: result.isLLMResults, 
                        isImmutable: result.__isImmutableLLMResult === true,
                        resultId: result.resultId || 'none',
                        contentType: typeof result.content, 
                        isArray: Array.isArray(result.content),
                        hasLLMProcessedFlag: result.metadata?.llmProcessed === true
                      })}
                      {/* ENHANCED LLM DETECTION: Using centralized detection function */}
                      {isLLMResult(result) ? (
                        <>
                          {console.log('Rendering with SimpleLLMResults component')}
                          {(() => {
                            try {
                              // Enhanced debugging for follow-up LLM results
                              console.log('Rendering LLM results with:', {
                                contentIsArray: Array.isArray(result.content),
                                contentLength: Array.isArray(result.content) ? result.content.length : 0,
                                query: result.query || 'N/A',
                                metadata: result.metadata ? Object.keys(result.metadata).join(', ') : 'none',
                                isLLMProcessed: !!result.metadata?.llmProcessed || !!result.metadata?.processed,
                                isFollowUp: result.isFollowUp || false
                              });
                              
                              // Ensure the content is always a properly formatted array of results
                              let resultsArray = [];
                              
                              if (Array.isArray(result.content)) {
                                console.log('Content is already an array, using directly');
                                resultsArray = result.content;
                                
                                // Quick validation of array items
                                if (resultsArray.length > 0 && typeof resultsArray[0] === 'string') {
                                  console.log('Results array contains strings, converting to objects');
                                  // Convert string items to proper result objects
                                  resultsArray = resultsArray.map((item, i) => ({
                                    title: `Result ${i+1}`,
                                    content: item,
                                    source: 'Search API',
                                    date: new Date().toISOString()
                                  }));
                                }
                              } else if (typeof result.content === 'object' && result.content !== null) {
                                // If content is an object, try to find arrays inside it
                                console.log('Content is an object, searching for arrays inside');
                                const potentialArrays = Object.entries(result.content)
                                  .filter(([key, val]) => Array.isArray(val))
                                  .sort(([,a], [,b]) => b.length - a.length); // Sort by array length (descending)
                                
                                if (potentialArrays.length > 0) {
                                  const [arrayKey, arrayValue] = potentialArrays[0];
                                  resultsArray = arrayValue;
                                  console.log(`Found array at key "${arrayKey}" with length:`, resultsArray.length);
                                } else {
                                  // No arrays found, try to wrap the object in a result
                                  console.log('No arrays found in object, wrapping in result object');
                                  resultsArray = [result.content];
                                }
                              } else {
                                // Create a simplified compact result with no extra metadata
                                console.log('Using simplified compact result format');
                                resultsArray = [{
                                  content: String(result.content || 'No content available'),
                                  // Add a flag to indicate this should be displayed in compact mode
                                  isCompactResult: true
                                }];
                              }

                              return <SimpleLLMResults 
                                results={resultsArray} 
                                categories={categories || []} 
                                query={result.query || ''}
                                showTabs={false} // Don't show tabs when nested inside BasicSearchResults
                              />;
                            } catch (error) {
                              console.error('Error rendering SimpleLLMResults:', error);
                              return <div style={{padding: '10px', border: '1px solid #f0f0f0', borderRadius: '4px'}}>
                                <p>Unable to display these results properly.</p>
                                <p><small style={{color: '#999'}}>Error: {error.message}</small></p>
                              </div>;
                            }
                          })()
                          }
                        </>
                      ) : result.isUserQuery || result.isFormattedUserQuery || result.type === 'formattedUserQuery' || result.type === 'user' ? (
                        <div className={styles.userQueryMessage}>
                          <span className={styles.userQueryPrefix}>Your search: </span>
                          <span className={styles.userQueryContent}>{result.content}</span>
                        </div>
                      ) : (
                        /* Determine if content is a JSON string that should be formatted */
                        (() => {
                          // First try to see if it's a JSON string
                          if (typeof result.content === 'string') {
                            // Check if it starts with [ or { (indicating JSON)
                            if (result.content.trim().startsWith('[') || result.content.trim().startsWith('{')) {
                              try {
                                // Try to parse and format as pretty JSON
                                const parsedContent = JSON.parse(result.content);
                                // Format the search result in a readable way
                                return (
                                  <div className={styles.formattedResult}>
                                    {Array.isArray(parsedContent) && parsedContent.map((item, i) => (
                                      <div key={i} className={styles.resultCardItem}>
                                        {item.title && <h4>{item.title}</h4>}
                                        {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>}
                                        {item.snippet && <p>{item.snippet}</p>}
                                      </div>
                                    ))}
                                  </div>
                                );
                              } catch (e) {
                                // If parsing fails, just display as regular text
                                return <div className={styles.fullContent}>{result.content}</div>;
                              }
                            }
                            // Regular string content
                            return <div className={styles.fullContent}>{result.content}</div>;
                          } else if (Array.isArray(result.content)) {
                            // Handle array content directly - this is for LLM results embedded in the content
                            return <SimpleLLMResults 
                              results={result.content} 
                              categories={categories} 
                              onTabSelect={onTabSelect}
                              onFollowUpSearch={onFollowUpSearch} 
                              query={query}
                            />;
                          }
                          
                          // For non-string content (already an object)
                          return <div className={styles.fullContent}>{JSON.stringify(result.content, null, 2)}</div>;
                        })()
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.errorMessage}>
                <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#3182ce' }}>No Results Found</h3>
                <p>We couldn't find any results for your search. This may be due to:</p>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.5', marginBottom: '15px' }}>
                  <li>Your search terms not matching any available content</li>
                  <li>Limited source selection - try enabling more sources</li>
                  <li>Content not being available in our database</li>
                </ul>
                <p style={{ fontSize: '0.9rem' }}>Try rephrasing your query or using more general terms.</p>
              </div>
            )}
          </div>
        )
      },
      // Key Insights tab
      {
        id: 'key-insights',
        label: 'Key Insights',
        content: <CategoryDisplay category={keyInsightsCategory} />
      }
    ];
    
    // Add additional category tabs
    categoryList.forEach(category => {
      // Skip Key Insights as it's already added
      if (category.name !== 'Key Insights') {
        generatedTabs.push({
          id: category.id,
          label: category.name,
          content: <CategoryDisplay category={category} />
        });
      }
    });
    
    setTabs(generatedTabs);
  }, [categories, results]);
  
  // Create a raw text query display outside any containers
  const renderRawQuery = () => {
    if (!query) return null;
    return (
      <div style={{
        fontSize: '14px',
        fontFamily: 'monospace',
        width: '100%',
        padding: '5px 0',
        margin: '0',
        borderTop: 'none',
        borderBottom: 'none',
        background: 'transparent',
        boxShadow: 'none',
        outline: 'none'
      }}>
        {query}
      </div>
    );
  };
  
  return (
    <>
      {/* Raw query completely separate from LLM results */}
      {renderRawQuery()}
      
      <div className={styles.container} data-testid="basic-search-results">
      
      {/* Only show tabs when a query is entered */}
      {query ? (
        /* Tab Navigation */
        tabs.length > 0 ? (
          <TabNavigation 
            tabs={tabs} 
            defaultTabId="key-insights" // Set Key Insights as the default tab
          />
        ) : (
          <div className={styles.placeholderMessage}>
            <h3>No results available</h3>
            <p>No results were found for your search. Please try a different query.</p>
          </div>
        )
      ) : (
        /* Show placeholder or welcome message when no query */
        <div className={styles.welcomeMessage}>
          <h3>Enter a search query</h3>
          <p>Type your query in the search box above and click Search to begin.</p>
        </div>
      )}
      
      {/* Follow-up chat section removed - now handled at wrapper level */}
    </div>
    </>
  );
};

export default BasicSearchResults;
