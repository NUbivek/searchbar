import React, { useEffect, useRef, useState } from 'react';
import { debug, info, warn, error } from '../../../../utils/logger';

// Create a log object for consistent logging
const log = { debug, info, warn, error };

/**
 * CategoryRibbonVisual component
 * Displays categories in a visual tab format matching the example screenshot
 * with metrics displayed inline and consistent styling
 * 
 * This component is designed for maximum reliability with:
 * 1. Inline styles to avoid CSS module dependencies
 * 2. Direct DOM references for emergency access
 * 3. Comprehensive logging
 * 
 * @param {Object} props Component props
 * @param {Array} props.categories List of categories with metrics
 * @param {string} props.activeCategory Currently active category ID
 * @param {Function} props.onCategoryChange Callback when category is changed
 * @param {Object} props.options Display options
 * @returns {JSX.Element} Visual category ribbon component
 */
const CategoryRibbonVisual = ({ 
  categories = [], 
  activeCategory, 
  onCategoryChange,
  options = {}
}) => {
  const containerRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(activeCategory || (categories[0]?.id));
  
  // Log every render for debugging
  useEffect(() => {
    log.info('CategoryRibbonVisual render:', {
      categoriesCount: categories.length,
      categoryNames: categories.map(c => c.name).join(', '),
      selectedCategory,
      activeCategory
    });
  }, [categories, selectedCategory, activeCategory]);
  
  // Handle category selection
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    if (typeof onCategoryChange === 'function') {
      onCategoryChange(categoryId);
    }
    
    // Log the selection event
    log.info('Category selected:', { categoryId });
  };
  
  // Function to get formatted display metrics
  const getDisplayMetrics = (category) => {
    // Extract metrics from category or use defaults
    const metrics = category.metrics || {};
    
    // Convert to percentage format
    const relevance = Math.round((metrics.relevance || metrics.relevanceScore || 0.75) * 100);
    const credibility = Math.round((metrics.credibility || metrics.credibilityScore || 0.80) * 100);
    const accuracy = Math.round((metrics.accuracy || metrics.accuracyScore || 0.85) * 100);
    
    return { relevance, credibility, accuracy };
  };
  
  // Only render if we have categories
  if (!Array.isArray(categories) || categories.length === 0) {
    log.warn('No categories to display in CategoryRibbonVisual');
    
    // Return informative placeholder
    return (
      <div 
        className="category-ribbon-visual-placeholder" 
        style={{ 
          padding: '10px', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #f87171',
          borderRadius: '4px',
          color: '#ef4444'
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold' }}>Categories unavailable</p>
      </div>
    );
  }
  
  // Ensure we have a valid selected category
  useEffect(() => {
    // Update selected category if activeCategory changes externally
    if (activeCategory && activeCategory !== selectedCategory) {
      setSelectedCategory(activeCategory);
    }
    // Default to first category if no selection exists
    else if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0].id);
    }
    // If selected category is no longer in the categories list, reset
    else if (selectedCategory && !categories.some(c => c.id === selectedCategory)) {
      setSelectedCategory(categories[0]?.id);
    }
  }, [categories, activeCategory, selectedCategory]);
  
  // Get active category object
  const activeCategoryObj = categories.find(c => c.id === selectedCategory) || categories[0];
  
  // We no longer handle LLM results rendering here - it's handled by LLMCategoryTabs component
  
  // Regular (non-LLM) rendering
  return (
    <div 
      ref={containerRef}
      id="visual-category-ribbon-container" 
      className="category-ribbon-visual"
      data-testid="category-ribbon-visual"
      style={{
        margin: '20px 0',
        display: 'block',
        visibility: 'visible',
        opacity: 1
      }}
    >
      {/* Page title matching screenshot */}
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        This page tests the sleek, modern category ribbon display
      </h2>
      
      {/* Categories ribbon container */}
      <div 
        className="category-ribbon-content"
        style={{
          display: 'block',
          marginBottom: '20px'
        }}
      >
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '500',
          color: '#4b5563',
          marginBottom: '12px'
        }}>
          Sample Category Ribbon
        </h3>
        
        {/* Category cards container */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px'
        }}>
          {categories.map((category, index) => {
            const metrics = getDisplayMetrics(category);
            const isActive = category.id === selectedCategory;
            
            // Color based on category or index if not provided
            const colors = [
              '#10b981', // Green
              '#3b82f6', // Blue
              '#6366f1', // Indigo
              '#8b5cf6', // Purple
              '#ec4899', // Pink
              '#f43f5e'  // Red
            ];
            
            // Choose different color for each category
            const borderColor = category.color || colors[index % colors.length];
            
            return (
              <div 
                key={category.id || index}
                onClick={() => handleCategoryClick(category.id)}
                className="category-card" 
                data-category-id={category.id}
                data-category-name={category.name}
                data-testid={`category-${category.id}`}
                style={{
                  borderLeft: `4px solid ${borderColor}`,
                  backgroundColor: isActive ? '#f9fafb' : 'white',
                  boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  minWidth: '160px',
                  border: `1px solid ${isActive ? '#d1d5db' : '#e5e7eb'}`,
                  borderLeftWidth: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  fontWeight: isActive ? '600' : '500',
                  color: '#111827',
                  marginBottom: '4px',
                  fontSize: '0.9rem'
                }}>
                  {category.name}
                </div>
                
                {/* Metrics row */}
                <div style={{
                  display: 'flex',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  gap: '6px'
                }}>
                  <div>R: <span style={{ color: '#2563eb' }}>{metrics.relevance}%</span></div>
                  <div>C: <span style={{ color: '#059669' }}>{metrics.credibility}%</span></div>
                  <div>A: <span style={{ color: '#d97706' }}>{metrics.accuracy}%</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Content section for the selected category */}
      {activeCategoryObj && (
        <div 
          className="category-content"
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: 'white'
          }}
        >
          <h3 style={{
            borderLeft: `4px solid ${activeCategoryObj.color || '#3b82f6'}`,
            paddingLeft: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '16px'
          }}>
            {activeCategoryObj.name}
          </h3>
          
          {/* Example content */}
          <div style={{ fontSize: '0.95rem', color: '#374151' }}>
            {activeCategoryObj.content && activeCategoryObj.content.length > 0 ? (
              <div>
                {activeCategoryObj.content.map((item, i) => (
                  <div key={i} style={{ marginBottom: '12px' }}>
                    {item.content || item.text || item.snippet || String(item)}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p style={{ fontStyle: 'italic', color: '#6b7280' }}>
                  This is an example display for the {activeCategoryObj.name} category. 
                  In a real implementation, content items would be displayed here.
                </p>
                <div style={{ 
                  backgroundColor: '#f3f4f6', 
                  padding: '12px', 
                  borderRadius: '4px',
                  marginTop: '12px' 
                }}>
                  <strong>Example content for {activeCategoryObj.name}</strong>
                  <p>The category system provides a way to organize content into meaningful groups.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryRibbonVisual;
