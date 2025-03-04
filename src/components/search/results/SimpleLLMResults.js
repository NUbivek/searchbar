/**
 * SimpleLLMResults.js
 * A clean, minimalist approach to displaying LLM search results with tabs
 * Refactored to use base components for consistency across search results
 */

import React, { useState, useEffect } from 'react';
import styles from './SimpleLLMResults.module.css';
import { 
  SearchResultsBase, 
  ResultTabs,
  formatLLMResult,
  detectLLMResult
} from './baseComponents';
import FollowUpChat from '../../search/FollowUpChat';
import { processLLMResults } from '../../../utils/llm/resultDetector';
import { debug, info, warn, error } from '../../../utils/logger';

const log = { debug, info, warn, error };

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
      // First check for common text content properties
      if (content.text) return content.text;
      if (content.html) return content.html;
      if (content.content) {
        if (typeof content.content === 'string') {
          return content.content;
        } else if (Array.isArray(content.content)) {
          // Join array content with paragraph breaks
          return content.content
            .map(item => typeof item === 'string' ? item : JSON.stringify(item))
            .join('\n\n');
        }
        return JSON.stringify(content.content, null, 2);
      }
      
      // Check for source information to enhance display
      if (content.source) {
        let sourceInfo = '';
        if (typeof content.source === 'string') {
          sourceInfo = `Source: ${content.source}`;
        } else if (content.source.name || content.source.url) {
          sourceInfo = `Source: ${content.source.name || ''} ${content.source.url ? `(${content.source.url})` : ''}`;
        }
        
        if (sourceInfo && (content.text || content.html)) {
          return `${content.text || content.html}\n\n${sourceInfo}`;
        }
      }
      
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
  
  // Create intelligent hyperlinks for important entities
  const createIntelligentHyperlinks = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    // Process text in multiple passes to handle different entity types
    let processedText = text;
    
    // 1. Find URLs and make them clickable
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    processedText = processedText.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0066cc; text-decoration:none; border-bottom:1px dotted #0066cc;">${url}</a>`;
    });
    
    // 2. Find citations and source references
    const citationRegex = /\[(\d+)\]|\[([A-Za-z0-9\s]+)\]/g;
    processedText = processedText.replace(citationRegex, (match, number, name) => {
      const citationText = number || name;
      return `<span style="color:#0066cc; cursor:pointer; border-bottom:1px dotted #0066cc;" title="Click to view source">${match}</span>`;
    });
    
    // 3. Find company names, financial terms, and key entities
    const entityRegex = /\b((?:[A-Z][a-z]*\s?){2,}|(?:\$\d+(?:\.\d+)?(?:\s?[mb]illion)?)|(?:\d+(?:\.\d+)?%)|(?:[A-Z]{2,}))\b/g;
    
    // Replace matching entities with hyperlinks (using appropriate URLs)
    processedText = processedText.replace(entityRegex, (match) => {
      // Skip if already part of an HTML tag
      if (/<[^>]*$/.test(processedText.substring(0, processedText.indexOf(match))) || 
          /^[^<]*>/.test(processedText.substring(processedText.indexOf(match) + match.length))) {
        return match;
      }
      
      // Create a realistic looking URL based on the entity
      let url = "#";
      
      // If it's a company name, link to appropriate source
      if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(match)) {
        url = `https://www.bloomberg.com/quote/search?query=${encodeURIComponent(match)}`;
      }
      // If it's a financial figure with $, link to financial data
      else if (/\$/.test(match)) {
        url = `https://www.marketwatch.com/search?q=${encodeURIComponent(match)}`;
      }
      // If it's a percentage, link to trend data
      else if (/%/.test(match)) {
        url = `https://trends.google.com/trends/explore?q=${encodeURIComponent(match)}`;
      }
      // If it's an acronym, link to definition
      else if (/^[A-Z]{2,}$/.test(match)) {
        url = `https://www.investopedia.com/search?q=${encodeURIComponent(match)}`;
      }
      
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0066cc; text-decoration:none; border-bottom:1px dotted #0066cc;">${match}</a>`;
    });
    
    return processedText;
  };
  
  const processedContent = processContent();
  const contentLength = processedContent.length;
  
  // Should we show the expand button?
  const shouldShowExpandButton = contentLength > initialDisplayLength;
  
  // The actual content to display, with intelligent hyperlinks
  const rawDisplayContent = expanded ? processedContent : processedContent.substring(0, initialDisplayLength);
  const displayContent = createIntelligentHyperlinks(rawDisplayContent);
  
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
          style={{
            background: 'none',
            border: '1px solid #2c73d2',
            borderRadius: '4px',
            color: '#2c73d2',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            padding: '4px 12px',
            marginTop: '8px'
          }}
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
 * Refactored to use base components for better maintainability
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
// Process results using the LLM result processor
/**
 * Enhanced LLM results formatter with prioritization
 * This formatter ensures LLM results are always properly formatted
 * and prioritized over regular search results
 * 
 * @param {Object|Array} results - The results to process
 * @returns {Array} Formatted and prioritized results
 */
const formatLocalLLMResults = (results) => {
  // Return empty array for null/undefined results
  if (!results) {
    log.debug('formatLocalLLMResults: empty results');
    return [];
  }
  
  // Log info for debugging
  log.debug('formatLocalLLMResults: processing results', {
    isArray: Array.isArray(results),
    resultsLength: Array.isArray(results) ? results.length : 'single object',
    hasLLMFlags: !Array.isArray(results) 
      ? !!(results.__isImmutableLLMResult || results.isLLMResults || results.llmProcessed)
      : 'N/A (array)'
  });
  
  // Handle non-array results (convert to array with single item)
  if (!Array.isArray(results)) {
    const result = results;
    // Always format LLM results to ensure proper rendering
    if (detectLLMResult(result)) {
      log.debug('formatLocalLLMResults: single LLM result detected');
      return [formatLLMResult(result)];
    }
    return [result];
  }
  
  // Handle empty array
  if (results.length === 0) {
    return [];
  }
  
  // Process array of results with prioritization
  log.debug(`formatLocalLLMResults: processing ${results.length} results in array`);
  
  // First, separate LLM results from regular search results
  const llmResults = [];
  const standardResults = [];
  
  // Process each result and categorize
  results.forEach(result => {
    if (detectLLMResult(result)) {
      // Format LLM results for consistent display
      llmResults.push(formatLLMResult(result));
    } else {
      standardResults.push(result);
    }
  });
  
  log.debug('formatLocalLLMResults: categorized results', {
    llmResultsCount: llmResults.length,
    standardResultsCount: standardResults.length
  });
  
  // Prioritize LLM results by placing them first in the array
  return [...llmResults, ...standardResults];
};

// Prepare tabs from categories
const prepareTabs = (processedResults, categories, onFollowUpSearch) => {
  // Log detailed information about results and categories
  log.debug('Preparing tabs for SimpleLLMResults', {
    resultCount: processedResults?.length || 0,
    categoryCount: categories?.length || 0
  });
  
  // Start with a results tab
  const tabs = [
    {
      id: 'results',
      label: 'Results',
      count: processedResults.length,
      content: (
        <div className={styles.llmResultsContainer}>
          {processedResults.map((result, index) => {
            const isErrorResult = result.isError || 
              (result.type === 'error') || 
              (result.error && Object.keys(result.error).length > 0);
            
            // Apply appropriate styling based on content type
            const resultClassName = isErrorResult 
              ? styles.errorResult 
              : styles.standardResult;
            
            // Render the result content
            return (
              <div key={`result-${index}`} className={resultClassName}>
                {result.title && (
                  <div className={styles.resultTitle}>{result.title}</div>
                )}
                <div className={styles.resultContent}>
                  <ExpandableContent content={result.content || result.text || result} />
                </div>
                {/* Follow-up button removed per user request */}
              </div>
            );
          })}
        </div>
      )
    }
  ];
  
  // Create tabs for each category
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
              {category.items.map((item, index) => (
                <div key={`cat-item-${index}`} className={styles.categoryItem}>
                  <ExpandableContent content={item.content || item.text || item} />
                </div>
              ))}
            </div>
          </div>
        )
      });
    });
  }
  
  return tabs;
};

const SimpleLLMResults = ({ 
  categories = [], 
  results = [],
  query = '',
  showTabs = true,
  forceShowTabs = false,
  defaultTab = 'Results',
  onFollowUpSearch = null
}) => {
  // Add debugging to inspect the results
  console.log('DEBUG: SimpleLLMResults received props:', {
    hasResults: results?.length > 0,
    resultsCount: results?.length || 0,
    hasCategories: categories?.length > 0,
    categoriesCount: categories?.length || 0,
    firstResult: results?.[0] ? {
      hasContent: !!results[0].content,
      contentType: typeof results[0].content,
      hasLLMFlags: !!(results[0].__isImmutableLLMResult || results[0].isLLMResults || results[0].llmProcessed)
    } : 'No results'
  });
  
  // Handle special case for a single LLM result without categories
  const shouldShowTabs = (showTabs && (forceShowTabs || categories.length > 0 || results.length > 1));
  
  // Simplified display for a single result when not showing tabs
  /**
 * Enhanced rendering of a single result with improved LLM support
 * This function handles various content formats with special attention to LLM outputs
 * 
 * @param {Object} result - The result to render
 * @returns {JSX.Element|null} The rendered component
 */
const renderSingleResult = (result) => {
    if (!result) return null;
    
    // IMPORTANT: Always preserve the original structure of LLM results
    // Log extended debug information about the result
    log.debug('renderSingleResult received:', {
      hasContent: !!result.content,
      contentType: typeof result.content,
      contentLength: typeof result.content === 'string' ? result.content.length : 
                    Array.isArray(result.content) ? result.content.length : 'N/A',
      isLLMResult: detectLLMResult(result),
      flags: {
        __isImmutableLLMResult: result.__isImmutableLLMResult,
        isLLMResults: result.isLLMResults,
        llmProcessed: result.llmProcessed,
        isLLMResult: result.isLLMResult
      }
    });
    
    // Format if needed but preserve structure for already-formatted LLM results
    const formattedResult = result.__isImmutableLLMResult ? result : formatLLMResult(result);
    const isErrorResult = formattedResult.isError || formattedResult.type === 'error';
    
    // Add a special class for LLM results vs regular search results
    const isLLM = detectLLMResult(formattedResult);
    const resultClass = isLLM ? 
      (isErrorResult ? styles.llmErrorResult : styles.llmStandardResult) : 
      (isErrorResult ? styles.errorResult : styles.standardResult);
    
    // Extract content for display with enhanced support for raw LLM content
    let contentToDisplay;
    
    // IMPORTANT: For LLM results, we need to prioritize the exact content format that came from the LLM API
    if (typeof formattedResult.content === 'string' && formattedResult.content.trim().length > 0) {
      // Raw string content from LLM - preserve HTML formatting
      contentToDisplay = <div className={styles.llmRawContent} dangerouslySetInnerHTML={{ __html: formattedResult.content }} />;
    } else if (Array.isArray(formattedResult.content)) {
      // Handle array content with special attention to content types
      contentToDisplay = (
        <div className={styles.llmFormattedContent}>
          {formattedResult.content.map((item, index) => {
            // Handle string content
            if (typeof item === 'string') {
              return <p key={index} dangerouslySetInnerHTML={{ __html: item }} />;
            }
            
            // Handle different content types with appropriate formatting
            else if (item && typeof item === 'object') {
              // Text content
              if (item.text) {
                return <p key={index} dangerouslySetInnerHTML={{ __html: item.text }} />;
              }
              
              // Pre-formatted HTML
              else if (item.html) {
                return <div key={index} className={styles.llmHtmlContent} dangerouslySetInnerHTML={{ __html: item.html }} />;
              }
              
              // Code blocks
              else if (item.type === 'code' && item.code) {
                return (
                  <pre key={index} className={styles.codeBlock}>
                    <code>{item.code}</code>
                  </pre>
                );
              }
              
              // Assistant messages (common in LLM responses)
              else if ((item.type === 'assistant' || item.role === 'assistant') && item.content) {
                return (
                  <div key={index} className={styles.assistantMessage}>
                    {typeof item.content === 'string' ? 
                      <div dangerouslySetInnerHTML={{ __html: item.content }} /> : 
                      <p>{JSON.stringify(item.content)}</p>}
                  </div>
                );
              }
            }
            
            // Fallback for unknown formats
            return <p key={index}>{JSON.stringify(item)}</p>;
          })}
        </div>
      );
    } else if (formattedResult.text) {
      // Handle text field
      contentToDisplay = <div className={styles.textContent} dangerouslySetInnerHTML={{ __html: formattedResult.text }} />;
    } else if (formattedResult.snippet) {
      // Handle snippet field for web results
      contentToDisplay = <div className={styles.snippetContent} dangerouslySetInnerHTML={{ __html: formattedResult.snippet }} />;
    } else {
      // Fallback - use ExpandableContent to handle various formats
      contentToDisplay = <ExpandableContent content={formattedResult.content || formattedResult.text || formattedResult} />;
    }
    
    // Create source attribution if available
    const sourceAttribution = formattedResult.sourceMap && Object.keys(formattedResult.sourceMap).length > 0 && (
      <div className={styles.sourceAttribution}>
        <h4>Sources:</h4>
        <ul>
          {Object.entries(formattedResult.sourceMap).map(([id, source]) => (
            <li key={id}>
              {source.url ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title || source.url}
                </a>
              ) : (
                source.title || id
              )}
            </li>
          ))}
        </ul>
      </div>
    );
    
    // Handle follow-up questions if available
    const followUpQuestions = formattedResult.followUpQuestions?.length > 0 && (
      <div className={styles.followUpQuestions}>
        <h4>Follow-up Questions:</h4>
        <ul>
          {formattedResult.followUpQuestions.map((question, index) => (
            <li key={index}>{question}</li>
          ))}
        </ul>
      </div>
    );
    
    return (
      <div className={resultClass}>
        {formattedResult.title && (
          <div className={styles.resultTitle}>
            {formattedResult.url ? (
              <a href={formattedResult.url} target="_blank" rel="noopener noreferrer" className={styles.resultTitleLink}>
                {formattedResult.title}
              </a>
            ) : (
              formattedResult.title
            )}
          </div>
        )}
        
        <div className={styles.resultContent}>
          {contentToDisplay}
        </div>
        
        {/* Display sources if available */}
        {sourceAttribution}
        
        {/* Display follow-up questions if available */}
        {followUpQuestions}
        
        {formattedResult.url && !formattedResult.title && (
          <div className={styles.resultSource}>
            <a href={formattedResult.url} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
              {formattedResult.source || formattedResult.url}
            </a>
          </div>
        )}
      </div>
    );
  };
  
  // Render the LLM results component using our base components
  // We'll use the standalone FollowUpChat component instead

  // Add debug logs to better understand component state
  log.debug('SimpleLLMResults received props', { 
    resultsLength: Array.isArray(results) ? results.length : (results ? 'single object' : 'none'), 
    hasQuery: !!query,
    showTabs,
    defaultTab
  });
  
  return (
    <SearchResultsBase
      results={results}
      query={query}
      resultProcessor={formatLocalLLMResults}
      options={{ forceSingleObject: !Array.isArray(results) }}
    >
      {({ results: processedResults, isProcessing, error }) => (
        <div className={styles.simpleLLMResults}>
          {/* Loading state */}
          {isProcessing && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Processing results...</p>
            </div>
          )}
          
          {/* Enhanced Error state */}
          {error && (
            <div className={styles.errorContainer}>
              <h3 className={styles.errorTitle}>Error</h3>
              {error.includes('<div class="error-message">') ? (
                <div dangerouslySetInnerHTML={{ __html: error }} />
              ) : (
                <p className={styles.errorMessage}>
                  {error}
                  {error.toLowerCase().includes('api') && (
                    <span>
                      <br /><br />
                      Please check your API key configuration in .env.local and make sure your API keys are valid.
                    </span>
                  )}
                </p>
              )}
            </div>
          )}
          
          {/* Scrollable Results display (tabbed or single) */}
          {!isProcessing && !error && (
            <div className={styles.scrollableResultsContainer}>
              {shouldShowTabs ? (
                <ResultTabs
                  tabs={prepareTabs(processedResults, categories, onFollowUpSearch)}
                  defaultTab="results"
                  showTabs={true}
                />
              ) : (
                Array.isArray(processedResults) && processedResults.length === 1 ? 
                  renderSingleResult(processedResults[0]) : 
                  <ResultTabs
                    tabs={prepareTabs(processedResults, categories, onFollowUpSearch)} 
                    defaultTab="results"
                    showTabs={false}
                  />
              )}
            </div>
          )}
          
          {/* Static Follow-up Chat Option - always visible */}
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

export default SimpleLLMResults;
