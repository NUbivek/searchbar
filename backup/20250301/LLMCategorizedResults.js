import React, { useState, useEffect } from 'react';
import LLMCategoryTabs from '../categories/display/LLMCategoryTabs';
import styles from './LLMCategorizedResults.module.css';
import { debug, info, warn, error } from '../../../utils/logger';

// Create a log object for consistent logging
const log = { debug, info, warn, error };

/**
 * LLMCategorizedResults component
 * 
 * A specialized component for displaying categorized LLM search results.
 * Provides a sleek, responsive UI for displaying LLM results organized by categories.
 * 
 * Key features:
 * 1. Designed specifically for the LLM results section
 * 2. Responsive across all device sizes
 * 3. Handles incremental updates for follow-up questions
 * 4. Screen reader accessible
 * 5. Mobile-optimized with touch-friendly UI
 * 
 * @param {Object} props Component props
 * @param {Array} props.categories List of categories with metrics
 * @param {Array} props.results The search results to display
 * @param {string} props.query The search query
 * @param {Object} props.options Display options
 * @returns {JSX.Element} LLM categorized results component
 */
const LLMCategorizedResults = ({
  categories = [],
  results = [],
  query = '',
  options = {}
}) => {
  // Log category information for debugging
  log.info('LLMCategorizedResults rendering with categories:', {
    categoryCount: categories.length,
    categoryNames: categories.map(c => c.name || 'Unnamed')
  });
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryContent, setCategoryContent] = useState([]);
  const [isCompactView, setIsCompactView] = useState(false);
  
  // Check screen size for responsive layout
  useEffect(() => {
    const checkScreenSize = () => {
      // Using 768px as the breakpoint for tablets/mobile
      setIsCompactView(window.innerWidth < 768);
    };
    
    // Set initial value
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Store a global reference for debugging
  useEffect(() => {
    if (typeof window !== 'undefined' && categories?.length > 0) {
      window.__llmCategoriesReference = categories;
      log.info('Storing LLM categories in global reference for debugging');
    }
  }, [categories]);
  
  // Set active category when categories change
  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0].id);
    } else if (activeCategory && !categories.some(c => c.id === activeCategory) && categories.length > 0) {
      // If active category no longer exists but we have categories, reset to first
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Update content when active category changes
  useEffect(() => {
    if (!activeCategory || !Array.isArray(categories)) return;
    
    const category = categories.find(c => c.id === activeCategory);
    if (category && Array.isArray(category.content)) {
      setCategoryContent(category.content);
    } else {
      // If no specific content for this category, use all results
      setCategoryContent(results);
    }
  }, [activeCategory, categories, results]);
  
  // Log diagnostic info for category display
  useEffect(() => {
    log.info('LLMCategorizedResults component:', {
      categoryCount: categories.length,
      categoryNames: categories.map(c => c.name).join(', '),
      activeCategory,
      query,
      resultsCount: results.length,
      categoryContentCount: categoryContent.length,
      isCompactView
    });
  }, [categories, activeCategory, results, categoryContent, query, isCompactView]);
  
  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };
  
  // If no categories, just return the results directly
  if (!Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="llm-results-content">
        {results.map((result, index) => (
          <div key={index} className="llm-result-item">
            {renderResultContent(result)}
          </div>
        ))}
      </div>
    );
  }

  // Helper to render rich or simple content
  function renderResultContent(result) {
    // If it's a string, just render it directly
    if (typeof result === 'string') {
      return <div className="llm-result-text">{result}</div>;
    }
    
    // If it has content property (common in our system)
    if (result && result.content) {
      // Check if it's rich HTML content
      if (typeof result.content === 'string' && (result.content.includes('<') || result.isHtml)) {
        return <div dangerouslySetInnerHTML={{ __html: result.content }} />;
      }
      return <div className="llm-result-text">{result.content}</div>;
    }
    
    // If it has text property
    if (result && result.text) {
      return <div className="llm-result-text">{result.text}</div>;
    }
    
    // If it's a record with title/description pattern
    if (result && result.title) {
      return (
        <div className="llm-result-record">
          <h4 className="llm-result-title">{result.title}</h4>
          {result.description && <p className="llm-result-description">{result.description}</p>}
          {result.url && <a href={result.url} className="llm-result-link" target="_blank" rel="noopener noreferrer">{result.url}</a>}
        </div>
      );
    }
    
    // Fallback for other object types
    return <div className="llm-result-item">{JSON.stringify(result)}</div>;
  }
  
  // Enhanced visibility check for debugging
  useEffect(() => {
    // Wait for component to render, then check visibility
    const timer = setTimeout(() => {
      const container = document.querySelector('[data-testid="llm-categorized-results"]');
      if (container) {
        const style = window.getComputedStyle(container);
        const visible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        log.info('LLMCategorizedResults visibility check:', { visible, style: { 
          display: style.display, 
          visibility: style.visibility, 
          opacity: style.opacity,
          zIndex: style.zIndex
        }});
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className={styles.llmCategorizedResults}
      data-testid="llm-categorized-results"
      id="llm-categorized-results-container"
      style={{
        display: 'flex !important',
        flexDirection: 'column !important',
        width: '100% !important',
        border: '3px solid #6366f1 !important',
        borderRadius: '8px !important',
        padding: '16px !important',
        backgroundColor: '#ffffff !important',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1) !important',
        marginBottom: '20px !important',
        visibility: 'visible !important',
        opacity: '1 !important',
        position: 'relative !important',
        zIndex: '999 !important',
        overflowX: 'visible !important',
        overflowY: 'visible !important'
      }}
    >
      {/* LLM Results Header */}
      <div className={styles.resultsHeader} style={{
        backgroundColor: '#f5f3ff !important',
        padding: '8px 12px !important',
        borderRadius: '4px !important',
        marginBottom: '12px !important',
        fontSize: '14px !important',
        fontWeight: 'bold !important',
        color: '#5b21b6 !important',
        display: 'block !important',
        visibility: 'visible !important',
        opacity: '1 !important',
        textAlign: 'center !important',
        border: '1px solid #8b5cf6 !important'
      }}>
        LLM Results - React Based Display
      </div>

      {/* Category tabs at the top */}
      <div className={styles.tabsContainer} style={{ 
        display: 'block !important', 
        margin: '0 0 12px 0 !important',
        visibility: 'visible !important',
        opacity: '1 !important',
        position: 'relative !important',
        zIndex: '50 !important' 
      }}>
        <LLMCategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          options={{ 
            compact: isCompactView,
            isCompact: isCompactView,
            showMetrics: !isCompactView,
            isInLLMResults: true, // Important flag to ensure correct context
            forceDisplay: true, // Force display regardless of other conditions
            zIndex: 2000 // Higher z-index to ensure visibility
          }}
        />
      </div>
      
      {/* Results content section */}
      <div 
        className={styles.categoryContent}
        style={{
          backgroundColor: 'white !important',
          borderRadius: '6px !important',
          padding: '12px !important',
          border: '2px solid #8b5cf6 !important',
          display: 'block !important',
          visibility: 'visible !important',
          opacity: '1 !important',
          zIndex: '10 !important',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1) !important'
        }}
      >
        {/* Optional category heading */}
        {activeCategory && (
          <div 
            className={styles.categoryHeading}
            style={{
              marginBottom: '12px !important',
              paddingBottom: '8px !important',
              borderBottom: '1px solid #f3f4f6 !important',
              fontWeight: 'bold !important',
              display: 'block !important',
              visibility: 'visible !important',
              fontSize: '16px !important'
            }}
          >
            {categories.find(c => c.id === activeCategory)?.name || 'Results'}
          </div>
        )}
        
        {/* Render content items */}
        <div className={styles.categoryItems} style={{
          display: 'block !important',
          visibility: 'visible !important',
          opacity: '1 !important'
        }}>
          {categoryContent.length > 0 ? (
            // Render each content item
            categoryContent.map((item, index) => (
              <div 
                key={index} 
                className={styles.categoryItem}
                style={{
                  marginBottom: index < categoryContent.length - 1 ? '12px !important' : '0 !important',
                  paddingBottom: index < categoryContent.length - 1 ? '12px !important' : '0 !important',
                  borderBottom: index < categoryContent.length - 1 ? '1px solid #f3f4f6 !important' : 'none !important',
                  display: 'block !important',
                  visibility: 'visible !important',
                  opacity: '1 !important'
                }}
              >
                {renderResultContent(item)}
              </div>
            ))
          ) : (
            // Empty state
            <div className={styles.emptyCategory} style={{
              display: 'block !important',
              visibility: 'visible !important',
              opacity: '1 !important'
            }}>
              <p style={{ 
                color: '#6b7280 !important', 
                fontStyle: 'italic !important', 
                textAlign: 'center !important',
                display: 'block !important' 
              }}>
                No content available for this category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LLMCategorizedResults;
