import React, { useEffect } from 'react';

/**
 * RibbonCategoryCard component that uses inline styles instead of CSS modules
 */
const RibbonCategoryCard = ({ category, isActive = false, onClick }) => {
  // Ensure category is valid
  if (!category) return null;

  const { 
    id, 
    title, 
    name = title,
    metrics = {}, 
    color = '#4CAF50',
    scoreBadge = { color: '#4CAF50', label: 'Good' }
  } = category;

  // Extract metrics or use defaults
  const { 
    overall = 80
  } = metrics;

  // Format metrics for display
  const formatPercent = (value) => {
    if (value > 1) return `${Math.round(value)}%`;
    return `${Math.round(value * 100)}%`;
  };

  console.log(`Direct Style RibbonCategoryCard rendering for ${name}`, { isActive, id });

  return (
    <div 
      onClick={onClick}
      id={`direct-category-card-${id}`}
      data-category-name={name}
      style={{
        backgroundColor: isActive ? color : '#ffffff',
        borderLeft: `4px solid ${color}`,
        padding: '0.75rem 1rem',
        minWidth: '180px',
        boxShadow: isActive ? '0 3px 10px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.1)',
        position: 'relative',
        border: isActive ? `2px solid ${color}` : '1px solid #cbd5e0',
        borderRadius: '6px',
        margin: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        display: 'block',
        visibility: 'visible',
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
            color: isActive ? '#ffffff' : '#333333',
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
    </div>
  );
};

/**
 * CategoryRibbonDirectStyle component that uses direct inline styles instead of CSS modules
 */
const CategoryRibbonDirectStyle = ({ categories = [], activeCategory = null, onCategoryChange = () => {} }) => {
  useEffect(() => {
    console.log('CategoryRibbonDirectStyle mounted with categories:', categories);
  }, [categories]);
  
  // ENHANCED DEBUG LOGGING
  console.log('CategoryRibbonDirectStyle rendering with direct styles:', {
    categoriesCount: Array.isArray(categories) ? categories.length : 'not array',
    categoryNames: Array.isArray(categories) ? categories.map(c => c.name) : [],
    activeCategory,
    hasCategoryChangeHandler: !!onCategoryChange
  });
  
  if (!Array.isArray(categories) || categories.length === 0) {
    console.warn('CategoryRibbonDirectStyle received no categories or invalid categories');
    return (
      <div style={{
        padding: '10px',
        backgroundColor: '#fff0f0',
        border: '1px solid #f87171',
        borderRadius: '4px',
        marginBottom: '10px',
        color: '#ef4444',
        fontSize: '14px'
      }}>
        <p><strong>Category Ribbon Debug:</strong> No categories to display!</p>
        <p>This component would normally show category tabs here.</p>
        <p>Check browser console for more debugging information.</p>
      </div>
    );
  }
  
  // Ensure we have a valid active category, or default to first one
  const effectiveActiveCategory = categories.some(cat => cat.id === activeCategory) 
    ? activeCategory 
    : categories[0]?.id;
  
  return (
    <div 
      id="direct-category-ribbon-main-container"
      style={{
        background: '#f8fafc',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        margin: '1.5rem 0',
        border: '2px solid #3182ce',
        display: 'block',
        visibility: 'visible'
      }}
    >
      <h3 style={{ 
        fontSize: '1.25rem', 
        fontWeight: '600',
        marginBottom: '1rem',
        color: '#2d3748',
        textAlign: 'center',
        borderBottom: '1px solid #3182ce',
        paddingBottom: '0.5rem'
      }}>
        Categories ({categories.length})
      </h3>
      
      {/* Added debug info */}
      <div style={{ 
        padding: '5px', 
        marginBottom: '10px', 
        backgroundColor: '#ebf8ff', 
        fontSize: '12px', 
        borderRadius: '4px' 
      }}>
        Available: {categories.map(c => c.name).join(', ')}
      </div>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1rem',
        justifyContent: 'center'
      }}>
        {categories.map(category => (
          <RibbonCategoryCard 
            key={category.id}
            category={category}
            isActive={category.id === effectiveActiveCategory}
            onClick={() => onCategoryChange(category.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryRibbonDirectStyle;
