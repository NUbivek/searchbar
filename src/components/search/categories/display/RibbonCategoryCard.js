import React, { useRef, useEffect } from 'react';
// Don't use CSS modules as they may be failing
// import styles from '../../../../styles/categoryRibbon.module.css';

/**
 * RibbonCategoryCard component for the sleek modern category display
 * This displays a category card with metrics in the ribbon style shown in the screenshot
 * 
 * @param {Object} props Component props
 * @param {Object} props.category The category to display
 * @param {boolean} props.isActive Whether this category is currently active
 * @param {Function} props.onClick Callback when the card is clicked
 * @returns {JSX.Element} Rendered ribbon category card
 */
const RibbonCategoryCard = ({ category, isActive = false, onClick }) => {
  // Ensure category is valid
  if (!category) return null;

  const { 
    id, 
    title, 
    name = title,
    metrics = {}, 
    color = '#4CAF50',  // Default to green if no color provided
    displayMetrics = {},
    scoreBadge = { color: '#4CAF50', label: 'Good' }
  } = category;

  // Extract metrics or use defaults
  const { 
    relevance = displayMetrics.relevance || 85, 
    credibility = displayMetrics.credibility || 88, 
    accuracy = displayMetrics.accuracy || 90,
    overall = displayMetrics.overall || 80
  } = metrics;

  // Format metrics for display
  const formatPercent = (value) => {
    // If the value is already a percentage (0-100), return it directly
    if (value > 1) return `${Math.round(value)}%`;
    // Otherwise, convert from decimal (0-1) to percentage
    return `${Math.round(value * 100)}%`;
  };

  // Generate lighter color for the card background when not active
  const getBackgroundColor = () => {
    if (isActive) {
      return color;
    }
    return '#ffffff'; // White background for inactive cards
  };

  // Generate border color
  const getBorderColor = () => {
    return color;
  };

  // Choose text color based on active state
  const getTextColor = () => {
    return isActive ? '#ffffff' : '#333333';
  };

  const getMetricColor = () => {
    return isActive ? 'rgba(255, 255, 255, 0.8)' : '#666666';
  };

  // Calculate brightness of color to determine if we need white or black text
  const getBrightness = (hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate brightness using the formula (0.299*R + 0.587*G + 0.114*B)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  // Use white text on dark backgrounds, black text on light backgrounds
  const textColor = isActive ? 
    (getBrightness(color) > 0.5 ? '#333333' : '#ffffff') : 
    '#333333';

  // Debug logs to track category card rendering
  console.log(`RibbonCategoryCard rendering for ${name}`, {
    id,
    isActive,
    metrics: {
      overall: overall,
      formatted: formatPercent(overall)
    },
    color
  });

  // Use a ref for direct DOM manipulation if needed
  const cardRef = useRef(null);
  
  // Emergency direct DOM styling
  useEffect(() => {
    if (cardRef.current) {
      // Force visibility through direct DOM manipulation
      cardRef.current.style.display = 'block !important';
      cardRef.current.style.visibility = 'visible !important';
      cardRef.current.style.opacity = '1 !important';
      
      // Add data attributes for debugging
      cardRef.current.setAttribute('data-debug-rendered', 'true');
      cardRef.current.setAttribute('data-category-id', id || '');
      cardRef.current.setAttribute('data-active', isActive ? 'true' : 'false');
    }
  }, [id, isActive]);

  return (
    <div 
      ref={cardRef}
      className="ribbon-category-card" 
      onClick={onClick}
      id={`category-card-${id}`}
      data-category-name={name}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.25)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = isActive ? '0 3px 10px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.1)';
      }}
      style={{
        backgroundColor: getBackgroundColor(),
        borderLeft: `4px solid ${getBorderColor()}`,
        padding: '0.75rem 1rem',
        minWidth: '180px',
        boxShadow: isActive ? '0 3px 10px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.1)',
        position: 'relative', // For the absolute positioned score badge
        border: isActive ? `2px solid ${color}` : '1px solid #cbd5e0',
        borderRadius: '6px',
        margin: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        display: 'block !important', // Force visibility
        visibility: 'visible !important',  // Force visibility
        opacity: 1
      }}
    >
      {/* Score Badge */}
      <div style={{
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        backgroundColor: scoreBadge.color,
        color: '#ffffff',
        borderRadius: '12px',
        padding: '2px 8px',
        fontSize: '0.7rem',
        fontWeight: '600',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
      }}>
        {formatPercent(overall)}
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
        <h3 
          style={{ 
            color: textColor,
            fontSize: '1rem',
            fontWeight: '700',
            margin: '0 0 0.25rem 0',
            textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
            padding: '2px 4px',
            borderRadius: '4px',
            background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent'
          }}
        >
          {name || title}
        </h3>
      </div>
      
      <div 
        style={{ 
          marginTop: '6px',
          width: '100%'
        }}
      >
        {/* Relevance metric bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '0.7rem',
          marginBottom: '2px',
          color: isActive ? (getBrightness(color) > 0.5 ? '#444444' : '#f0f0f0') : '#666666',
        }}>
          <span>Relevance</span>
          <span style={{ fontWeight: '600' }}>{formatPercent(relevance)}</span>
        </div>
        <div style={{ 
          height: '4px', 
          width: '100%', 
          backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
          borderRadius: '2px',
          marginBottom: '6px'
        }}>
          <div style={{ 
            height: '100%', 
            width: `${typeof relevance === 'number' && relevance <= 1 ? relevance * 100 : relevance}%`, 
            backgroundColor: isActive ? '#ffffff' : color,
            borderRadius: '2px'
          }} />
        </div>
        
        {/* Credibility metric bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '0.7rem',
          marginBottom: '2px',
          color: isActive ? (getBrightness(color) > 0.5 ? '#444444' : '#f0f0f0') : '#666666',
        }}>
          <span>Credibility</span>
          <span style={{ fontWeight: '600' }}>{formatPercent(credibility)}</span>
        </div>
        <div style={{ 
          height: '4px', 
          width: '100%', 
          backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
          borderRadius: '2px'
        }}>
          <div style={{ 
            height: '100%', 
            width: `${typeof credibility === 'number' && credibility <= 1 ? credibility * 100 : credibility}%`, 
            backgroundColor: isActive ? '#ffffff' : color,
            borderRadius: '2px'
          }} />
        </div>
      </div>
    </div>
  );
};

export default RibbonCategoryCard;
