import React, { useEffect, useRef } from 'react';
import RibbonCategoryCard from './RibbonCategoryCard';
// Don't use CSS modules as they may be failing
// import styles from '../../../../styles/categoryRibbon.module.css';

/**
 * CategoryRibbon component displays a horizontal ribbon of category cards
 * with relevant metrics and styling based on the screenshot
 * 
 * @param {Object} props Component props
 * @param {Array} props.categories List of categories with metrics
 * @param {string} props.activeCategory Currently active category
 * @param {Function} props.onCategoryChange Callback when a category is selected
 * @returns {JSX.Element} Rendered category ribbon
 */
const CategoryRibbon = ({ categories = [], activeCategory, onCategoryChange }) => {
  // Force logging every render to debug category display issues
  useEffect(() => {
    console.log('CategoryRibbon MOUNTED with:', {
      categoriesCount: Array.isArray(categories) ? categories.length : 'not array',
      categoryNames: Array.isArray(categories) ? categories.map(c => c.name) : [],
      activeCategory,
      hasCategoryChangeHandler: !!onCategoryChange
    });
    
    // Ensure visibility by logging to the DOM directly
    const debugElement = document.createElement('div');
    debugElement.id = 'category-ribbon-debug';
    debugElement.style.cssText = 'position: fixed; top: 10px; right: 10px; background: rgba(255,255,255,0.9); padding: 10px; border: 1px solid #000; z-index: 9999; max-width: 300px; font-size: 12px;';
    
    if (Array.isArray(categories) && categories.length > 0) {
      debugElement.innerHTML = `<strong>Categories Available:</strong> ${categories.length}<br/>${categories.map(c => c.name).join(', ')}`;
    } else {
      debugElement.innerHTML = '<strong>No Categories Available!</strong>';
    }
    
    // Only add if it doesn't exist
    if (!document.getElementById('category-ribbon-debug')) {
      document.body.appendChild(debugElement);
    }
    
    return () => {
      if (document.getElementById('category-ribbon-debug')) {
        document.body.removeChild(document.getElementById('category-ribbon-debug'));
      }
    };
  }, [categories]);
  
  // ENHANCED DEBUG LOGGING
  console.log('CategoryRibbon rendering:', {
    categoriesCount: Array.isArray(categories) ? categories.length : 'not array',
    categoryNames: Array.isArray(categories) ? categories.map(c => c.name) : [],
    activeCategory,
    hasCategoryChangeHandler: !!onCategoryChange
  });
  
  if (!Array.isArray(categories) || categories.length === 0) {
    console.warn('CategoryRibbon received no categories or invalid categories');
    // Return debug information instead of null
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

  // Use a ref for direct DOM access for emergency styling
  const ribbonRef = useRef(null);
  
  // Apply emergency styles directly in useEffect
  useEffect(() => {
    if (ribbonRef.current) {
      // Store categories in the DOM for emergency access
      ribbonRef.current.setAttribute('data-categories', JSON.stringify(categories));
      
      // Apply emergency inline styles directly to the DOM to bypass CSS modules
      Object.assign(ribbonRef.current.style, {
        display: 'block !important',
        visibility: 'visible !important',
        background: '#f8fafc !important',
        padding: '1rem !important',
        borderRadius: '8px !important',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15) !important',
        margin: '1.5rem 0 !important',
        border: '2px solid #3182ce !important'
      });
      
      // Log successful rendering
      console.log('✅ EMERGENCY STYLES applied to CategoryRibbon');
    }
  }, [categories, ribbonRef]);
  
  return (
    <div 
      ref={ribbonRef}
      className="category-ribbon" 
      id="category-ribbon-main-container"
      style={{
        background: '#f8fafc',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',  // More pronounced shadow
        margin: '1.5rem 0',
        border: '2px solid #3182ce', // Add border to make it stand out
        display: 'block !important',  // Ensure visibility
        visibility: 'visible !important'  // Ensure visibility
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
      
      <div 
        className="category-ribbon-container"
        id="category-ribbon-container"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1rem',
          justifyContent: 'center'
        }}>
        {/* Backup data attributes for emergency DOM selection */}
        <div 
          style={{display: 'none'}} 
          id="hidden-category-data" 
          data-categories={JSON.stringify(categories)} 
          data-count={categories.length}
        />
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

export default CategoryRibbon;
