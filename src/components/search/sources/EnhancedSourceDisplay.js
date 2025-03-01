/**
 * EnhancedSourceDisplay.js
 * 
 * Component for displaying sources with reputation badges and additional metadata.
 */

import React, { useState } from 'react';
import { scoreSourceReputation, getSourceBadge } from './SourceReputationScorer';

/**
 * Enhanced source display component
 * @param {Object} props Component props
 * @param {Array} props.sources Array of source objects
 * @param {Object} props.options Display options
 * @returns {JSX.Element} Rendered source display
 */
const EnhancedSourceDisplay = ({ 
  sources = [], 
  options = {} 
}) => {
  const [expandedSources, setExpandedSources] = useState(false);
  
  // Extract options with defaults
  const {
    maxDisplayed = 3,
    showBadges = true,
    compact = false,
    showMetadata = true,
    includeDate = true
  } = options;
  
  // No sources case
  if (!sources || sources.length === 0) {
    return null;
  }
  
  // Process sources with reputation data
  const processedSources = sources.map(source => {
    const reputationData = scoreSourceReputation(source);
    const badge = getSourceBadge(reputationData);
    
    return {
      ...source,
      reputation: reputationData,
      badge
    };
  });
  
  // Sort by reputation score (highest first)
  processedSources.sort((a, b) => 
    (b.reputation?.score || 0) - (a.reputation?.score || 0)
  );
  
  // Determine how many sources to display
  const displayedSources = expandedSources
    ? processedSources
    : processedSources.slice(0, maxDisplayed);
  
  const remainingCount = processedSources.length - maxDisplayed;
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setExpandedSources(prev => !prev);
  };
  
  // Render source list in compact mode
  if (compact) {
    return (
      <div className="source-display-compact">
        <div className="sources-list" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginTop: '10px'
        }}>
          {displayedSources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: '16px',
                fontSize: '12px',
                textDecoration: 'none',
                color: source.badge.color,
                backgroundColor: source.badge.background || '#f0f0f0',
                border: `1px solid ${source.badge.color}`
              }}
            >
              {showBadges && (
                <span className="badge-icon" style={{ marginRight: '5px' }}>
                  {source.badge.icon}
                </span>
              )}
              <span className="source-title">
                {source.title || source.url || 'Unknown Source'}
              </span>
            </a>
          ))}
          
          {/* Show more button */}
          {remainingCount > 0 && !expandedSources && (
            <button
              onClick={toggleExpanded}
              className="show-more-button"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              +{remainingCount} more
            </button>
          )}
          
          {/* Show less button */}
          {expandedSources && processedSources.length > maxDisplayed && (
            <button
              onClick={toggleExpanded}
              className="show-less-button"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '12px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              Show less
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Render detailed source list
  return (
    <div className="enhanced-source-display">
      <h4 className="sources-heading" style={{
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#666',
        marginBottom: '10px'
      }}>
        Sources
      </h4>
      
      <ul className="sources-list" style={{
        listStyle: 'none',
        padding: 0,
        margin: 0
      }}>
        {displayedSources.map((source, index) => (
          <li 
            key={index}
            className="source-item"
            style={{
              marginBottom: '12px',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #eee',
              backgroundColor: '#fafafa'
            }}
          >
            {/* Source title and badge */}
            <div className="source-header" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '5px' 
            }}>
              {showBadges && (
                <div 
                  className="source-badge"
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: source.badge.color,
                    backgroundColor: source.badge.background || '#f0f0f0',
                    marginRight: '10px'
                  }}
                >
                  <span className="badge-icon" style={{ marginRight: '4px' }}>
                    {source.badge.icon}
                  </span>
                  <span className="badge-label">
                    {source.badge.label}
                  </span>
                </div>
              )}
              
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="source-title"
                style={{
                  fontWeight: 'bold',
                  color: '#1a73e8',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {source.title || source.url || 'Unknown Source'}
              </a>
            </div>
            
            {/* Metadata */}
            {showMetadata && (
              <div className="source-meta" style={{
                fontSize: '12px',
                color: '#666',
                display: 'flex',
                gap: '15px'
              }}>
                {/* Domain */}
                {source.reputation.originalDomain && (
                  <div className="source-domain">
                    {source.reputation.originalDomain}
                  </div>
                )}
                
                {/* Category */}
                {source.reputation.category !== 'unknown' && (
                  <div className="source-category">
                    {source.reputation.category.charAt(0).toUpperCase() + source.reputation.category.slice(1)}
                  </div>
                )}
                
                {/* Date */}
                {includeDate && source.date && (
                  <div className="source-date">
                    {new Date(source.date).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      
      {/* Show more/less button */}
      {remainingCount > 0 && !expandedSources && (
        <button
          onClick={toggleExpanded}
          className="show-more-button"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#1a73e8',
            cursor: 'pointer',
            padding: '5px 0',
            fontSize: '13px',
            fontWeight: 'bold'
          }}
        >
          Show {remainingCount} more sources
        </button>
      )}
      
      {expandedSources && processedSources.length > maxDisplayed && (
        <button
          onClick={toggleExpanded}
          className="show-less-button"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#1a73e8',
            cursor: 'pointer',
            padding: '5px 0',
            fontSize: '13px',
            fontWeight: 'bold'
          }}
        >
          Show less
        </button>
      )}
    </div>
  );
};

export default EnhancedSourceDisplay;
