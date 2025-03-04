import React, { useState, useEffect, useMemo } from 'react';
import CategoryTabs from './display/CategoryTabs';
import CategoryContent from './CategoryContent';
import { debug, info, error, warn } from '../../../utils/logger';

// Create a log object for consistent logging
const log = { debug, info, error, warn };

/**
 * Component for displaying categorized content with business-focused categories
 * @param {Array} props.categories The pre-processed categories to display
 * @param {string} props.query The search query
 * @param {boolean} props.loading Whether data is loading
 * @param {Object} props.options Additional options for processing
 * @returns {JSX.Element} Categorized content display
 */
const CategoryDisplay = ({ categories = [], searchQuery = '', loading = false, options = {} }) => {
  // Ensure categories is always an array and filter out any invalid ones
  const categoriesArray = useMemo(() => {
    if (!Array.isArray(categories)) {
      console.log('Categories is not an array:', typeof categories);
      return [];
    }
    
    console.log('Processing categories:', categories.map(cat => ({
      id: cat?.id || 'no-id',
      name: cat?.name || cat?.title || 'unnamed',
      contentType: cat?.content ? (Array.isArray(cat.content) ? 'array' : typeof cat.content) : 'no-content'
    })));
    
    // Filter out invalid categories or ones with no content
    return categories.filter(category => 
      category && 
      typeof category === 'object' && 
      category.id && 
      category.content && 
      // Allow both array content and string content
      ((Array.isArray(category.content) && category.content.length > 0) ||
       (typeof category.content === 'string' && category.content.trim().length > 0))
    );
  }, [categories]);

  // If no valid categories, don't render anything
  if (categoriesArray.length === 0) {
    console.log('No valid categories to display');
    return null;
  }

  // State for active category
  const [activeCategory, setActiveCategory] = useState(
    options.activeCategory || (categoriesArray.length > 0 ? categoriesArray[0].id : null)
  );

  // Extract options with defaults
  const {
    showMetrics = true,
    useCardView = false,
    showTabs = true, // Always show tabs by default
    showInsights = true,
    tabsPosition = 'default', // 'top', 'default'
    categoriesCount = null, // Allow override of category count for specific views
    activeCategory: activeTabCategory = null // Allow override of active category
  } = options || {};

  // Log categories and display options for debugging
  console.log('CategoryDisplay render:', { 
    categoriesCount: categoriesArray.length,
    showTabs,
    showMetrics,
    firstCategoryId: categoriesArray[0]?.id || 'none',
    activeCategory 
  });

  // Ensure query is a string
  const query = typeof searchQuery === 'string' ? searchQuery : '';

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // Get the active category object
  const activeCategoryObj = categoriesArray.find(cat => cat.id === activeCategory) || 
    (categoriesArray.length > 0 ? categoriesArray[0] : null);

  // If no active category, don't render anything
  if (!activeCategoryObj) {
    return null;
  }

  // If no active category is set but we have categories, set the first one as active
  useEffect(() => {
    if (categoriesArray.length > 0 && !activeCategory) {
      // Log for debugging
      console.log("Setting initial active category:", categoriesArray[0].id);
      setActiveCategory(categoriesArray[0].id);
    } else if (categoriesArray.length > 0 && activeCategory) {
      // Check if the active category still exists in the new categories
      const categoryExists = categoriesArray.some(cat => cat.id === activeCategory);
      if (!categoryExists) {
        console.log("Active category no longer exists, setting to first category:", categoriesArray[0].id);
        setActiveCategory(categoriesArray[0].id);
      }
    }
  }, [categoriesArray, activeCategory]);

  // Update active category when it changes in props
  useEffect(() => {
    if (activeTabCategory && activeTabCategory !== activeCategory) {
      setActiveCategory(activeTabCategory);
    }
  }, [activeTabCategory, activeCategory]);

  // Loading state
  if (loading) {
    return (
      <div className="category-display-loading" style={{
        padding: '20px',
        textAlign: 'center',
        color: '#6c757d'
      }}>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="category-display" style={{
      width: '100%',
      marginBottom: '24px'
    }}>
      {/* Category tabs at top */}
      {showTabs && tabsPosition !== 'bottom' && (
        <CategoryTabs 
          categories={categoriesArray} 
          activeCategory={activeCategory} 
          onCategoryChange={handleCategoryChange}
          position="top"
        />
      )}
      
      {/* Active category content */}
      {activeCategoryObj && (
        <CategoryContent 
          category={activeCategoryObj} 
          query={query}
          options={{
            useCardView, // Use card view option
            showMetrics, // Show metrics option
            showInsights // Show insights option
          }}
        />
      )}
      
      {/* Category tabs at bottom */}
      {showTabs && tabsPosition === 'bottom' && (
        <CategoryTabs 
          categories={categoriesArray} 
          activeCategory={activeCategory} 
          onCategoryChange={handleCategoryChange}
          position="bottom"
        />
      )}
    </div>
  );
};

export default CategoryDisplay;