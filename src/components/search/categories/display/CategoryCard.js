import React, { useState } from 'react';
import MetricsProgressBar from '../../metrics/display/MetricsProgressBar';
import BulletPointDisplay from './BulletPointDisplay';
import NumberHighlighter from './NumberHighlighter';
import { extractKeyPoints, extractKeyNumbers } from '../../utils/contentExtractor';

/**
 * Component for displaying a category as a card with expandable content
 * @param {Object} props Component props
 * @param {Object} props.category The category to display
 * @param {string} props.query The search query
 * @param {Object} props.options Additional options for display
 * @returns {JSX.Element} Rendered category card
 */
const CategoryCard = ({ category, query, options = {} }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Ensure category is valid
  if (!category || typeof category !== 'object') {
    return null;
  }
  
  // Extract category data with fallbacks
  const name = category.name || 'Untitled Category';
  const description = category.description || '';
  const icon = category.icon || 'info-circle';
  const color = category.color || '#0066cc';
  const content = Array.isArray(category.content) ? category.content : [];
  const metrics = category.metrics || { relevance: 0, accuracy: 0, credibility: 0 };
  const insights = Array.isArray(category.insights) ? category.insights : [];
  
  // Only show categories with content or insights
  if (content.length === 0 && insights.length === 0) {
    return null;
  }
  
  // Extract key points and numbers from content
  const allContentText = content.map(item => {
    return [
      item.title || '',
      item.description || item.snippet || '',
      item.content || ''
    ].join(' ');
  }).join(' ');
  
  const keyPoints = extractKeyPoints(allContentText, query);
  const keyNumbers = extractKeyNumbers(allContentText);
  
  // Extract business insights if this is a business-related category
  let businessInsights = [];
  if (category.businessInsights && Array.isArray(category.businessInsights)) {
    businessInsights = category.businessInsights;
  } else if (
    name.toLowerCase().includes('business') || 
    name.toLowerCase().includes('financial') || 
    name.toLowerCase().includes('market') || 
    name.toLowerCase().includes('economic') ||
    name.toLowerCase().includes('company') ||
    name.toLowerCase().includes('industry')
  ) {
    try {
      const { extractBusinessInsights } = require('../../utils/contentExtractor');
      businessInsights = extractBusinessInsights(allContentText, query, { 
        maxInsights: 5,
        categoryName: name
      });
    } catch (error) {
      console.error('Error extracting business insights in CategoryCard:', error);
    }
  }
  
  // Create intelligent hyperlinks for content
  const createIntelligentHyperlinks = (text, item) => {
    if (!text || typeof text !== 'string' || !item) return text;
    
    // Get source information
    const sourceType = item.sourceType || 'web';
    const sourceUrl = item.url || item.link || '';
    
    // Skip if no URL
    if (!sourceUrl) return text;
    
    // Find important terms to hyperlink
    const importantTerms = [];
    
    // Add numbers with context
    const numberRegex = /(\$?\d+(?:[,.]\d+)?(?:\s*(?:million|billion|trillion|k|M|B|T))?(?:\s*(?:USD|EUR|GBP|JPY|CNY))?)/g;
    let match;
    while ((match = numberRegex.exec(text)) !== null) {
      const start = Math.max(0, match.index - 20);
      const end = Math.min(text.length, match.index + match[0].length + 20);
      const context = text.substring(start, end);
      importantTerms.push({
        term: match[0],
        context: context,
        index: match.index
      });
    }
    
    // Add quoted text
    const quoteRegex = /"([^"]*)"/g;
    while ((match = quoteRegex.exec(text)) !== null) {
      importantTerms.push({
        term: match[1],
        context: match[0],
        index: match.index
      });
    }
    
    // Sort by index
    importantTerms.sort((a, b) => a.index - b.index);
    
    // Create hyperlinked text
    let result = '';
    let lastIndex = 0;
    
    for (const term of importantTerms) {
      // Add text before this term
      result += text.substring(lastIndex, term.index);
      
      // Add hyperlinked term
      result += `<a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" 
                    style="color: ${color}; text-decoration: underline; font-weight: 500;">
                    ${term.term}
                 </a>`;
      
      // Update last index
      lastIndex = term.index + term.term.length;
    }
    
    // Add remaining text
    result += text.substring(lastIndex);
    
    return result;
  };
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Render business insights section if available
  const renderBusinessInsights = () => {
    if (!businessInsights || businessInsights.length === 0) return null;
    
    return (
      <div className="category-card-business-insights">
        <h4 style={{ 
          marginTop: '16px', 
          marginBottom: '8px',
          color: '#1976d2',
          display: 'flex',
          alignItems: 'center'
        }}>
          <i className="fas fa-chart-line" style={{ marginRight: '8px' }}></i>
          Business Insights
        </h4>
        <BulletPointDisplay 
          points={businessInsights}
          bulletStyle={{ color: '#1976d2' }}
          textStyle={{ fontWeight: 'normal' }}
        />
      </div>
    );
  };
  
  // Render content based on type
  const renderContent = (item) => {
    // Handle LLM summary content
    if (item.isLLMSummary || item.type === 'summary') {
      return (
        <div className="category-card-summary">
          <div className="summary-content">
            {typeof item.content === 'string' ? item.content : 'No summary content available'}
          </div>
        </div>
      );
    }
    
    // Handle regular content
    const title = item.title;
    const url = item.url || item.link || '';
    const source = item.source || item.sourceType || 'Unknown';
    const content = item.description || item.snippet || item.content || '';
    
    return (
      <>
        {/* Title */}
        {title && (
          <h3 className="category-card-title">
            {url ? (
              <a href={url} target="_blank" rel="noopener noreferrer">
                {title}
              </a>
            ) : (
              title
            )}
          </h3>
        )}
        
        {/* Source */}
        {source && (
          <div className="category-card-source">
            Source: {source}
          </div>
        )}
        
        {/* Content */}
        {content && (
          <div className="category-card-content">
            {createIntelligentHyperlinks(content, item)}
          </div>
        )}
      </>
    );
  };
  
  return (
    <div className="category-card" style={{
      border: `1px solid ${color}20`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
      backgroundColor: 'white',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    }}>
      {/* Card Header */}
      <div className="category-card-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <i className={`fas fa-${icon}`} style={{ 
            color: color, 
            marginRight: '12px',
            fontSize: '20px'
          }}></i>
          <h3 style={{ 
            margin: 0, 
            color: color,
            fontSize: '18px',
            fontWeight: 600
          }}>{name}</h3>
        </div>
        
        {/* Expand/Collapse Button */}
        <button 
          onClick={toggleExpanded}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
        >
          {expanded ? 'Show Less' : 'Show More'}
          <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`} style={{ marginLeft: '6px' }}></i>
        </button>
      </div>
      
      {/* Metrics Display */}
      <div className="category-card-metrics">
        <MetricsProgressBar 
          metrics={metrics} 
          showLabels={true}
          compact={!expanded}
        />
      </div>
      
      {/* Card Description */}
      {description && (
        <div className="category-card-description" style={{
          marginBottom: '16px',
          color: '#555',
          fontSize: '14px'
        }}>
          {description}
        </div>
      )}
      
      {/* Key Insights */}
      {insights.length > 0 && (
        <div className="category-card-insights" style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: `${color}10`,
          borderRadius: '4px',
          borderLeft: `4px solid ${color}`
        }}>
          <h4 style={{ 
            marginTop: 0, 
            marginBottom: '8px', 
            color: color,
            fontSize: '16px'
          }}>Key Insights</h4>
          <BulletPointDisplay 
            points={insights} 
            color={color}
            expanded={expanded}
            maxPoints={expanded ? insights.length : 3}
          />
        </div>
      )}
      
      {/* Business Insights */}
      {renderBusinessInsights()}
      
      {/* Key Points */}
      {keyPoints.length > 0 && expanded && (
        <div className="category-card-key-points" style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
        }}>
          <h4 style={{ 
            marginTop: 0, 
            marginBottom: '8px', 
            color: '#333',
            fontSize: '16px'
          }}>Key Points</h4>
          <BulletPointDisplay 
            points={keyPoints} 
            color="#555"
            expanded={true}
            maxPoints={keyPoints.length}
          />
        </div>
      )}
      
      {/* Key Numbers */}
      {keyNumbers.length > 0 && expanded && (
        <div className="category-card-numbers" style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
        }}>
          <h4 style={{ 
            marginTop: 0, 
            marginBottom: '8px', 
            color: '#333',
            fontSize: '16px'
          }}>Key Data Points</h4>
          <NumberHighlighter 
            numbers={keyNumbers} 
            color={color}
            maxNumbers={expanded ? keyNumbers.length : 5}
          />
        </div>
      )}
      
      {/* Content Preview */}
      <div className="category-card-content">
        {content.slice(0, expanded ? content.length : 2).map((item, index) => (
          <div key={`content-${index}`} className="content-item" style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
            borderRadius: '4px',
            border: '1px solid #eee',
          }}>
            {renderContent(item)}
          </div>
        ))}
        
        {/* Show more content indicator */}
        {!expanded && content.length > 2 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666',
            fontSize: '14px',
            marginTop: '8px'
          }}>
            {content.length - 2} more items available
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;