import React, { useState, useEffect, useMemo } from 'react';
import CategoryTabs from './display/CategoryTabs';
import CategoryContent from './CategoryContent';
import { processCategories } from './processors/CategoryProcessor';

/**
 * Component for displaying categorized content
 * @param {Object} props Component props
 * @param {Array|Object} props.content The content to categorize
 * @param {string} props.query The search query
 * @returns {JSX.Element} Categorized content display
 */
const CategoryDisplay = ({ content, query }) => {
  // Ensure query is a string
  const searchQuery = typeof query === 'string' ? query : '';
  
  // Debug log
  console.log("CategoryDisplay rendering with:", { 
    contentType: typeof content, 
    contentLength: Array.isArray(content) ? content.length : 'N/A',
    query: searchQuery,
    contentSample: Array.isArray(content) && content.length > 0 ? 
      JSON.stringify(content[0]).substring(0, 100) + '...' : 'No content'
  });

  // Add a visible debug message
  const debugStyle = {
    padding: '10px',
    margin: '10px 0',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '4px',
    fontSize: '12px'
  };

  // Process categories based on content and query
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeCategories = async () => {
      try {
        setLoading(true);
        
        // Log the content being processed
        console.log("CategoryDisplay initializing with content:", {
          contentType: typeof content,
          contentLength: Array.isArray(content) ? content.length : 'N/A',
          contentSample: Array.isArray(content) && content.length > 0 ? 
            JSON.stringify(content[0]).substring(0, 100) + '...' : 'No content'
        });
        
        // Get default categories
        const defaultCats = getDefaultCategories();
        console.log("Default categories:", defaultCats);
        
        if (!Array.isArray(content) || content.length === 0) {
          console.log("No content to categorize");
          setCategories(defaultCats);
          setActiveCategory(defaultCats[0]?.id || null);
          setLoading(false);
          return;
        }
        
        // Process content through CategoryProcessor
        const normalizedContent = normalizeContent(content);
        console.log("Normalized content:", {
          length: normalizedContent.length,
          sample: normalizedContent.length > 0 ? 
            JSON.stringify(normalizedContent[0]).substring(0, 100) + '...' : 'No content'
        });
        
        // Filter categories based on content
        const filteredCategories = defaultCats.filter(category => {
          // If category has a filter function, use it
          if (typeof category.filter === 'function') {
            const matchingItems = normalizedContent.filter(category.filter);
            console.log(`Category ${category.name} matched ${matchingItems.length} items`);
            return matchingItems.length > 0;
          }
          return true;
        });
        
        console.log("Filtered categories:", filteredCategories.map(c => c.name));
        
        // If no categories match, use all default categories
        if (filteredCategories.length === 0) {
          console.log("No categories matched, using defaults");
          setCategories(defaultCats);
          setActiveCategory(defaultCats[0]?.id || null);
        } else {
          // Sort categories by priority (if available)
          const sortedCategories = filteredCategories.sort((a, b) => 
            (b.priority || 0) - (a.priority || 0)
          );
          
          setCategories(sortedCategories);
          setActiveCategory(sortedCategories[0]?.id || null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error initializing categories:", err);
        setError(err.message || "Failed to initialize categories");
        setLoading(false);
      }
    };
    
    initializeCategories();
  }, [content, query]);

  // Handle tab change
  const handleTabChange = (categoryId) => {
    console.log("CategoryDisplay: Tab changed to:", categoryId);
    setActiveCategory(categoryId);
  };

  // Get active category object
  const activeCategoryObj = useMemo(() => {
    if (!activeCategory || !categories || categories.length === 0) {
      console.log("No active category or categories");
      return null;
    }
    
    // Find the active category
    const category = categories.find(c => c.id === activeCategory);
    if (!category) {
      console.log("Active category not found in categories");
      return null;
    }
    
    console.log("Found active category:", category.name);
    
    // If content is not available, return the category as is
    if (!Array.isArray(content) || content.length === 0) {
      console.log("No content available for active category");
      return { ...category, content: [] };
    }
    
    // Filter content for this category
    let categoryContent = [];
    
    // If the category has a filter function, use it
    if (typeof category.filter === 'function') {
      // Process content through CategoryProcessor first
      const normalizedContent = normalizeContent(content);
      categoryContent = normalizedContent.filter(category.filter);
      console.log(`Filtered ${categoryContent.length} items for category ${category.name}`);
    } else if (category.name === 'All Results') {
      // For "All Results" category, include all content
      categoryContent = normalizeContent(content);
      console.log(`Using all ${categoryContent.length} items for All Results category`);
    } else {
      // Default: empty content
      console.log("No filter function for category:", category.name);
      categoryContent = [];
    }
    
    // Return the category with its content
    return {
      ...category,
      content: categoryContent
    };
  }, [activeCategory, categories, content]);

  // Show loading state
  if (loading) {
    return (
      <div className="category-loading" style={{ 
        padding: '16px', 
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        marginBottom: '16px'
      }}>
        <p>Loading categories...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="category-error" style={{ 
        padding: '16px', 
        backgroundColor: '#fee2e2',
        borderRadius: '4px',
        color: '#b91c1c',
        marginBottom: '16px'
      }}>
        <p>Error loading categories: {error}</p>
      </div>
    );
  }

  // If no categories were found
  if (!categories || categories.length === 0) {
    console.log("CategoryDisplay: No categories found");
    return (
      <div className="no-categories" style={{ 
        padding: '16px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px',
        marginBottom: '16px'
      }}>
        <p>No categories available for this content.</p>
      </div>
    );
  }

  return (
    <div className="category-display">
      {/* Render tabs if there are categories */}
      <CategoryTabs 
        categories={categories} 
        activeCategory={activeCategoryObj?.id} 
        onTabChange={handleTabChange} 
      />
      
      {/* Render the content of the active category */}
      <CategoryContent category={activeCategoryObj} />
      
      {/* Render visible debug information */}
      <div style={debugStyle}>
        <p>Debug Information:</p>
        <p>Content Type: {typeof content}</p>
        <p>Content Length: {Array.isArray(content) ? content.length : 'N/A'}</p>
        <p>Query: {searchQuery}</p>
        <p>Content Sample: {Array.isArray(content) && content.length > 0 ? 
          JSON.stringify(content[0]).substring(0, 100) + '...' : 'No content'}</p>
      </div>
    </div>
  );
};

export default CategoryDisplay;