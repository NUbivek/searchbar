import React, { useState, useEffect } from 'react';
import { CategoryTabs } from './display';
import { EnhancedCategoryContent } from './display';
import { isBusinessQuery } from '../utils/contextDetector';

/**
 * Enhanced category display component
 * @param {Object} props Component props
 * @param {Array} props.categories Array of categories
 * @param {string} props.query The search query
 * @returns {JSX.Element} Rendered enhanced category display
 */
const EnhancedCategoryDisplay = ({ categories, query }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  
  // Set the first category as active by default
  useEffect(() => {
    if (categories && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  
  // If no categories, show empty state
  if (!categories || categories.length === 0) {
    return (
      <div className="enhanced-category-display">
        <p>No categories available.</p>
      </div>
    );
  }
  
  // Check if query is business-focused
  const isBusinessFocused = isBusinessQuery(query);
  
  return (
    <div className="enhanced-category-display">
      {/* Category Tabs */}
      <CategoryTabs 
        categories={categories} 
        activeCategory={activeCategory} 
        onCategoryChange={handleCategoryChange}
        query={query}
        isBusinessFocused={isBusinessFocused}
      />
      
      {/* Active Category Content */}
      {activeCategory && (
        <div className="category-content-container" style={{ padding: '20px' }}>
          <EnhancedCategoryContent 
            category={activeCategory} 
            query={query} 
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedCategoryDisplay;
