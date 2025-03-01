/**
 * CardView.js
 * 
 * Component for displaying search results in a card-based layout
 * with enhanced visual presentation.
 */

import React, { useState } from 'react';
import { scoreSourceReputation, getSourceBadge } from '../sources/SourceReputationScorer';

// Default card colors for categories
const DEFAULT_CATEGORY_COLORS = {
  general: '#E8F0FE',
  summary: '#E6F4EA',
  information: '#FCE8E6',
  definition: '#D2E3FC',
  example: '#FEF7E0',
  step_by_step: '#E8F0FE',
  comparison: '#F3E8FD',
  pros_cons: '#FFE0B2',
  history: '#E0F2F1',
  news: '#FEE7E8',
  opinion: '#E8EAED',
  fact_check: '#FFEBEE',
  technical: '#E4F7FB',
  tutorial: '#E6F9FF',
  reference: '#F0F4C3',
  default: '#F1F3F4'
};

/**
 * Component for rendering search results in a card layout
 * @param {Object} props Component props
 * @param {Array} props.categories Categories to display as cards
 * @param {Function} props.onCardSelect Callback when a card is selected
 * @param {Object} props.options Display options
 * @returns {JSX.Element} Rendered card view
 */
const CardView = ({
  categories = [],
  onCardSelect,
  options = {}
}) => {
  const [selectedCard, setSelectedCard] = useState(null);
  
  // Extract options with defaults
  const {
    layout = 'grid',      // 'grid' or 'carousel'
    cardSize = 'medium',  // 'small', 'medium', or 'large'
    showSourceBadges = true,
    animateCards = true,
    maxSourcesPerCard = 2
  } = options;
  
  // No categories case
  if (!categories || categories.length === 0) {
    return (
      <div className="empty-card-view">
        <p style={{ textAlign: 'center', color: '#666' }}>No categories available</p>
      </div>
    );
  }
  
  // Get card size dimensions
  const getCardDimensions = () => {
    switch (cardSize) {
      case 'small':
        return { width: '220px', height: '180px' };
      case 'large':
        return { width: '320px', height: '280px' };
      case 'medium':
      default:
        return { width: '280px', height: '220px' };
    }
  };
  
  const cardDimensions = getCardDimensions();
  
  // Handle card selection
  const handleCardClick = (categoryId) => {
    setSelectedCard(categoryId);
    if (onCardSelect) {
      onCardSelect(categoryId);
    }
  };
  
  // Get animation class based on index
  const getAnimationDelay = (index) => {
    if (!animateCards) return {};
    
    return {
      animationDelay: `${index * 0.1}s`
    };
  };
  
  // Extract and process sources for a category
  const processSourcesForCard = (category) => {
    if (!category.sources || !Array.isArray(category.sources)) {
      return [];
    }
    
    return category.sources.slice(0, maxSourcesPerCard).map(source => {
      const reputationData = scoreSourceReputation(source);
      const badge = getSourceBadge(reputationData);
      
      return {
        ...source,
        reputation: reputationData,
        badge
      };
    });
  };
  
  // Get content preview for cards
  const getContentPreview = (content, maxLength = 120) => {
    if (!content) return '';
    
    const plainContent = typeof content === 'string' 
      ? content 
      : JSON.stringify(content);
      
    if (plainContent.length <= maxLength) {
      return plainContent;
    }
    
    return plainContent.substring(0, maxLength) + '...';
  };
  
  // Determine card background color
  const getCardColor = (category) => {
    if (category.color) {
      return category.color;
    }
    
    const categoryId = category.id?.toLowerCase() || '';
    
    for (const [key, color] of Object.entries(DEFAULT_CATEGORY_COLORS)) {
      if (categoryId.includes(key)) {
        return color;
      }
    }
    
    return DEFAULT_CATEGORY_COLORS.default;
  };
  
  // Determine if card is selected
  const isCardSelected = (categoryId) => {
    return selectedCard === categoryId;
  };
  
  // Render grid layout
  if (layout === 'grid') {
    return (
      <div className="card-grid" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${cardDimensions.width}, 1fr))`,
        gap: '20px',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        {categories.map((category, index) => {
          const sources = processSourcesForCard(category);
          const cardColor = getCardColor(category);
          const isSelected = isCardSelected(category.id);
          
          return (
            <div
              key={category.id || index}
              className={`card ${isSelected ? 'selected' : ''} ${animateCards ? 'animate-in' : ''}`}
              style={{
                width: '100%',
                height: cardDimensions.height,
                borderRadius: '12px',
                backgroundColor: cardColor,
                padding: '16px',
                boxShadow: isSelected 
                  ? '0 8px 16px rgba(0,0,0,0.15)'
                  : '0 2px 8px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isSelected ? 'translateY(-4px)' : 'none',
                overflow: 'hidden',
                position: 'relative',
                ...getAnimationDelay(index)
              }}
              onClick={() => handleCardClick(category.id)}
            >
              {/* Card header */}
              <div className="card-header" style={{
                marginBottom: '12px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#202124'
                }}>
                  {category.title || category.id || `Category ${index + 1}`}
                </h3>
              </div>
              
              {/* Card content */}
              <div className="card-content" style={{
                fontSize: '14px',
                color: '#5f6368',
                height: '50%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 5,
                WebkitBoxOrient: 'vertical'
              }}>
                {getContentPreview(category.content)}
              </div>
              
              {/* Card footer with sources */}
              {showSourceBadges && sources.length > 0 && (
                <div className="card-sources" style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  right: '16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-badge"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        textDecoration: 'none',
                        color: source.badge.color,
                        backgroundColor: source.badge.background || '#f0f0f0',
                        border: `1px solid ${source.badge.color}`
                      }}
                    >
                      <span className="badge-icon" style={{ marginRight: '4px' }}>
                        {source.badge.icon}
                      </span>
                      <span className="source-title">
                        {source.title || 'Source'}
                      </span>
                    </a>
                  ))}
                  
                  {category.sources && category.sources.length > maxSourcesPerCard && (
                    <div className="more-sources" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#5f6368',
                      backgroundColor: '#f0f0f0'
                    }}>
                      +{category.sources.length - maxSourcesPerCard} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  
  // Render carousel layout
  return (
    <div className="card-carousel" style={{
      display: 'flex',
      overflowX: 'auto',
      gap: '16px',
      padding: '10px 0',
      marginBottom: '20px',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'thin',
      msOverflowStyle: 'none'
    }}>
      {categories.map((category, index) => {
        const sources = processSourcesForCard(category);
        const cardColor = getCardColor(category);
        const isSelected = isCardSelected(category.id);
        
        return (
          <div
            key={category.id || index}
            className={`card ${isSelected ? 'selected' : ''} ${animateCards ? 'animate-in' : ''}`}
            style={{
              minWidth: cardDimensions.width,
              height: cardDimensions.height,
              borderRadius: '12px',
              backgroundColor: cardColor,
              padding: '16px',
              boxShadow: isSelected 
                ? '0 8px 16px rgba(0,0,0,0.15)'
                : '0 2px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: isSelected ? 'translateY(-4px)' : 'none',
              flexShrink: 0,
              overflow: 'hidden',
              position: 'relative',
              ...getAnimationDelay(index)
            }}
            onClick={() => handleCardClick(category.id)}
          >
            {/* Card header */}
            <div className="card-header" style={{
              marginBottom: '12px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#202124'
              }}>
                {category.title || category.id || `Category ${index + 1}`}
              </h3>
            </div>
            
            {/* Card content */}
            <div className="card-content" style={{
              fontSize: '14px',
              color: '#5f6368',
              height: '50%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 5,
              WebkitBoxOrient: 'vertical'
            }}>
              {getContentPreview(category.content)}
            </div>
            
            {/* Card footer with sources */}
            {showSourceBadges && sources.length > 0 && (
              <div className="card-sources" style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="source-badge"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      textDecoration: 'none',
                      color: source.badge.color,
                      backgroundColor: source.badge.background || '#f0f0f0',
                      border: `1px solid ${source.badge.color}`
                    }}
                  >
                    <span className="badge-icon" style={{ marginRight: '4px' }}>
                      {source.badge.icon}
                    </span>
                    <span className="source-title">
                      {source.title || 'Source'}
                    </span>
                  </a>
                ))}
                
                {category.sources && category.sources.length > maxSourcesPerCard && (
                  <div className="more-sources" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#5f6368',
                    backgroundColor: '#f0f0f0'
                  }}>
                    +{category.sources.length - maxSourcesPerCard} more
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CardView;
