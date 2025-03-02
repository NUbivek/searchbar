import React, { useState } from 'react';
import SearchResultItem from '../../results/SearchResultItem';

/**
 * Component for displaying a single category content item with enhanced features
 * @param {Object} props Component props
 * @param {Object} props.item The content item to display
 * @param {string} props.query The search query
 * @param {string} props.categoryId The ID of the parent category
 * @param {number} props.index The index of the item in the category
 * @param {boolean} props.showMetrics Whether to show metrics
 * @returns {JSX.Element} Rendered category content item
 */
const CategoryContentItem = ({ item, query, categoryId, index, showMetrics = true }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!item || typeof item !== 'object') {
    return null;
  }
  
  // Get relevance score if available
  const relevanceScore = typeof item._relevanceScore === 'number' 
    ? item._relevanceScore 
    : (item._metrics && typeof item._metrics.relevance === 'number' 
      ? item._metrics.relevance 
      : null);
  
  // Get overall score if available
  const overallScore = typeof item._overallScore === 'number'
    ? item._overallScore
    : (item._metrics && typeof item._metrics.overall === 'number'
      ? item._metrics.overall
      : null);
  
  // Determine color based on score
  const getScoreColor = (score) => {
    if (typeof score !== 'number') return '#999'; // Default gray
    if (score >= 80) return '#4CAF50'; // Green for high relevance
    else if (score >= 60) return '#2196F3'; // Blue for good relevance
    else if (score >= 40) return '#FF9800'; // Orange for medium relevance
    return '#999'; // Gray for low relevance
  };
  
  // Only show items with sufficient quality (60%+ in relevance or overall)
  const hasMinimumQuality = (relevanceScore && relevanceScore >= 60) || 
                           (overallScore && overallScore >= 60);
  
  if (!hasMinimumQuality && showMetrics) {
    return null;
  }
  
  return (
    <div className="category-content-item" style={{
      marginBottom: '16px',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #eee',
      backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease'
    }}>
      {/* Relevance indicator */}
      {typeof relevanceScore === 'number' && (
        <div className="relevance-indicator" style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '12px',
          color: '#666',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getScoreColor(relevanceScore),
            marginRight: '6px'
          }}></div>
          <span>Relevance: {Math.round(relevanceScore)}%</span>
          
          {typeof overallScore === 'number' && (
            <>
              <span style={{ margin: '0 6px', color: '#ccc' }}>|</span>
              <span>Overall: {Math.round(overallScore)}%</span>
            </>
          )}
        </div>
      )}
      
      {/* Search result item */}
      <SearchResultItem 
        item={item}
        query={query}
        showMetrics={showMetrics}
        index={index}
        categoryId={categoryId}
        expanded={expanded}
        onToggleExpand={() => setExpanded(!expanded)}
      />
    </div>
  );
};

export default CategoryContentItem;
