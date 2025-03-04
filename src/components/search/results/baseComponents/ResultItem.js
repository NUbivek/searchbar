/**
 * ResultItem.js
 * Unified component for rendering individual search result items
 */

import React from 'react';
import styles from '../../../../styles/ResultItem.module.css';
import { detectLLMResult } from './LLMResultHandler';

/**
 * Result Item Component
 * Renders an individual search result with consistent styling
 * 
 * @param {Object} props Component props
 * @param {Object} props.result The result object to render
 * @param {boolean} props.compact Whether to show in compact mode
 * @param {boolean} props.showSource Whether to show source information
 * @param {boolean} props.showMetadata Whether to show additional metadata
 */
const ResultItem = ({
  result,
  compact = false,
  showSource = true,
  showMetadata = true,
  onClick = null
}) => {
  // Skip rendering for LLM results - these should be handled by specialized components
  if (detectLLMResult(result)) {
    return null;
  }
  
  // Handle user query display
  if (result.isUserQuery || result.isFormattedUserQuery || result.type === 'formattedUserQuery' || result.type === 'user') {
    return (
      <div className={styles.userQueryContainer}>
        <span className={styles.userQueryPrefix}>Your search: </span>
        <span className={styles.userQueryContent}>{result.content}</span>
      </div>
    );
  }
  
  // Handle error display
  if (result.isError || result.type === 'error') {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorTitle}>{result.title || 'Error'}</div>
        <div className={styles.errorContent}>{result.content || result.message || 'An unknown error occurred'}</div>
      </div>
    );
  }
  
  // Extract content based on result format
  const getContent = () => {
    if (typeof result.content === 'string') {
      return result.content;
    }
    
    if (typeof result.content === 'object' && result.content !== null) {
      if (result.content.text) {
        return result.content.text;
      }
      
      try {
        return JSON.stringify(result.content, null, 2);
      } catch (e) {
        return 'Unable to display content';
      }
    }
    
    return result.snippet || 'No content available';
  };
  
  // Determine if clicking is supported
  const isClickable = typeof onClick === 'function' || result.url;
  
  // Handle click on result
  const handleClick = (e) => {
    if (typeof onClick === 'function') {
      e.preventDefault();
      onClick(result);
    }
  };
  
  // Render compact version
  if (compact) {
    return (
      <div className={`${styles.compactResult} ${isClickable ? styles.clickable : ''}`} onClick={isClickable ? handleClick : undefined}>
        <div className={styles.compactTitle}>
          {result.url ? (
            <a href={result.url} target="_blank" rel="noopener noreferrer">
              {result.title || 'Untitled Result'}
            </a>
          ) : (
            <span>{result.title || 'Untitled Result'}</span>
          )}
        </div>
        {showSource && result.source && (
          <div className={styles.compactSource}>{result.source}</div>
        )}
        <div className={styles.compactContent}>{getContent()}</div>
      </div>
    );
  }
  
  // Render full version
  return (
    <div className={`${styles.resultItem} ${isClickable ? styles.clickable : ''}`} onClick={isClickable ? handleClick : undefined}>
      <div className={styles.resultHeader}>
        <h3 className={styles.resultTitle}>
          {result.url ? (
            <a href={result.url} target="_blank" rel="noopener noreferrer">
              {result.title || 'Untitled Result'}
            </a>
          ) : (
            <span>{result.title || 'Untitled Result'}</span>
          )}
        </h3>
        
        {showMetadata && (
          <div className={styles.resultMeta}>
            {showSource && result.source && (
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
            
            {(result.accuracy || result.accuracy === 0) && (
              <span className={styles.resultAccuracy}>
                <span className={styles.metadataLabel}>Accuracy:</span> {result.accuracy}%
              </span>
            )}
            
            {(result.credibility || result.credibility === 0) && (
              <span className={styles.resultCredibility}>
                <span className={styles.metadataLabel}>Credibility:</span> {result.credibility}%
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className={styles.resultContent}>
        {getContent()}
      </div>
    </div>
  );
};

export default ResultItem;
