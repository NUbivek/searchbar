/**
 * LLMResultsDisplay.js
 * 
 * Handles the rendering of LLM results with category tabs and content.
 * Implements "show more" functionality and inline hyperlinks to sources.
 */

import React, { useState } from 'react';
import CategoryProgressBars from './CategoryProgressBars';

/**
 * Creates hyperlinks in text to sources
 * @param {string} text Text to process
 * @param {Array} sources Sources to link to
 * @param {string} sourceType Type of source (verified or open)
 * @returns {string} HTML string with hyperlinks
 */
const createHyperlinks = (text, sources = [], sourceType = 'verified') => {
  if (!text || !sources || sources.length === 0) {
    return text;
  }
  
  let processedText = text;
  
  // Find important terms, numbers, quotes to hyperlink
  sources.forEach((source, index) => {
    if (!source.title && !source.url) return;
    
    // Extract keywords from source title
    const keywords = source.title
      ? source.title.split(' ')
          .filter(word => word.length > 4)
          .map(word => word.replace(/[^\w\s]/gi, ''))
      : [];
      
    // Add hyperlinks for each keyword (limit to prevent over-linking)
    keywords.slice(0, 3).forEach(keyword => {
      if (keyword && keyword.length > 4) {
        // Create regex that handles word boundaries and is case insensitive
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        
        // Replace only the first occurrence
        let replaced = false;
        processedText = processedText.replace(regex, match => {
          if (!replaced && source.url) {
            replaced = true;
            return `<a href="${source.url}" target="_blank" class="source-link ${sourceType}-source">${match}</a>`;
          }
          return match;
        });
      }
    });
    
    // Look for numbers and statistics
    const numberRegex = /\b\d+(\.\d+)?%?\b/g;
    let matches = processedText.match(numberRegex);
    
    if (matches && !processedText.includes('href=') && source.url) {
      // Replace only one number
      const numberToReplace = matches[0];
      processedText = processedText.replace(numberToReplace, 
        `<a href="${source.url}" target="_blank" class="source-link ${sourceType}-source">${numberToReplace}</a>`);
    }
  });
  
  return processedText;
};

/**
 * LLM Results Display component
 * @param {Object} props Component props
 * @param {Array} props.categories Categories to display
 * @param {string} props.activeCategory Active category ID
 * @param {Function} props.onCategoryChange Function to call when category changes
 * @param {Array} props.sources Sources for hyperlinking
 * @param {string} props.sourceType Type of source (verified or open)
 * @param {Object} props.options Display options
 * @returns {JSX.Element} Rendered LLM results
 */
const LLMResultsDisplay = ({
  categories = [],
  activeCategory,
  onCategoryChange,
  sources = [],
  sourceType = 'verified',
  options = {}
}) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // If no active category but we have categories, use the first one
  const effectiveActiveCategory = activeCategory || (categories.length > 0 ? categories[0].id : null);
  
  // Options with defaults
  const {
    showTabs = true,
    showMetrics = true,
    maxPreviewLength = 300,
    useCardView = false
  } = options;
  
  // Toggle expanded state for a category
  const toggleExpanded = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // Check if a category is expanded
  const isExpanded = (categoryId) => expandedCategories[categoryId] || false;
  
  // Render category tabs
  const renderCategoryTabs = () => {
    if (!showTabs || categories.length === 0) return null;
    
    return (
      <div className="category-tabs" style={{ 
        marginBottom: '15px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${effectiveActiveCategory === category.id ? 'active' : ''}`}
            style={{
              padding: '8px 15px',
              borderRadius: '20px',
              border: 'none',
              background: effectiveActiveCategory === category.id ? category.color : '#f0f0f0',
              color: effectiveActiveCategory === category.id ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: effectiveActiveCategory === category.id ? 'bold' : 'normal',
              transition: 'all 0.2s ease'
            }}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.title}
          </button>
        ))}
      </div>
    );
  };
  
  // Render category content
  const renderCategoryContent = () => {
    if (categories.length === 0) return null;
    
    // Find the active category
    const activeCategoryObj = categories.find(cat => cat.id === effectiveActiveCategory) || categories[0];
    
    if (!activeCategoryObj) return null;
    
    // Process content to add hyperlinks
    const processedContent = createHyperlinks(
      activeCategoryObj.content,
      sources,
      sourceType
    );
    
    // Determine if content should be truncated
    const contentIsTruncated = 
      !isExpanded(activeCategoryObj.id) && 
      activeCategoryObj.content.length > maxPreviewLength;
    
    // Truncate content if needed
    const displayContent = contentIsTruncated 
      ? processedContent.substring(0, maxPreviewLength) + '...'
      : processedContent;
    
    return (
      <div className="category-content" style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        maxHeight: isExpanded(activeCategoryObj.id) ? 'none' : '500px',
        overflowY: 'auto'
      }}>
        <h3 className="category-title" style={{
          margin: '0 0 15px 0',
          color: activeCategoryObj.color,
          borderBottom: `2px solid ${activeCategoryObj.color}`,
          paddingBottom: '8px'
        }}>
          {activeCategoryObj.title}
        </h3>
        
        {/* Metrics display */}
        {showMetrics && activeCategoryObj.metrics && (
          <CategoryProgressBars 
            metrics={activeCategoryObj.metrics}
            options={{}}
          />
        )}
        
        {/* Category content */}
        <div 
          className="category-content-text"
          style={{ lineHeight: '1.6' }}
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
        
        {/* Show more/less button */}
        {activeCategoryObj.content.length > maxPreviewLength && (
          <button
            className="show-more-button"
            style={{
              marginTop: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              color: activeCategoryObj.color,
              cursor: 'pointer',
              fontWeight: 'bold',
              padding: '5px 0'
            }}
            onClick={() => toggleExpanded(activeCategoryObj.id)}
          >
            {isExpanded(activeCategoryObj.id) ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
    );
  };
  
  // Card view rendering
  const renderCardView = () => {
    if (!useCardView || categories.length === 0) return null;
    
    return (
      <div className="category-cards" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '20px'
      }}>
        {categories.map(category => {
          // Process content to add hyperlinks
          const processedContent = createHyperlinks(
            category.content,
            sources,
            sourceType
          );
          
          // Determine if content should be truncated
          const contentIsTruncated = 
            !isExpanded(category.id) && 
            category.content.length > maxPreviewLength;
          
          // Truncate content if needed
          const displayContent = contentIsTruncated 
            ? processedContent.substring(0, maxPreviewLength) + '...'
            : processedContent;
          
          return (
            <div 
              key={category.id}
              className="category-card"
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: `1px solid ${category.color}`,
                borderTop: `4px solid ${category.color}`
              }}
            >
              <div className="card-header" style={{
                padding: '15px',
                borderBottom: '1px solid #eee'
              }}>
                <h3 style={{
                  margin: 0,
                  color: category.color
                }}>
                  {category.title}
                </h3>
                
                {/* Metrics display */}
                {showMetrics && category.metrics && (
                  <CategoryProgressBars 
                    metrics={category.metrics}
                    options={{ height: 4 }}
                  />
                )}
              </div>
              
              <div className="card-body" style={{
                padding: '15px'
              }}>
                <div 
                  className="category-content-text"
                  style={{ lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: displayContent }}
                />
                
                {/* Show more/less button */}
                {category.content.length > maxPreviewLength && (
                  <button
                    className="show-more-button"
                    style={{
                      marginTop: '10px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: category.color,
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      padding: '5px 0'
                    }}
                    onClick={() => toggleExpanded(category.id)}
                  >
                    {isExpanded(category.id) ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="llm-results-display">
      {useCardView ? (
        <>
          {renderCardView()}
        </>
      ) : (
        <>
          {renderCategoryTabs()}
          {renderCategoryContent()}
        </>
      )}
    </div>
  );
};

export default LLMResultsDisplay;
