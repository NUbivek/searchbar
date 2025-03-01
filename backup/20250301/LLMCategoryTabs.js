import React, { useState, useEffect, useRef } from 'react';
import { debug, info, warn, error } from '../../../../utils/logger';
import styles from './LLMCategoryTabs.module.css';

// Create a log object for consistent logging
const log = { debug, info, warn, error };

/**
 * LLMCategoryTabs component
 * 
 * A specialized category tab display designed specifically for LLM results sections
 * with responsive design, accessibility features, and device-specific styling.
 * 
 * This component:
 * 1. Is fully responsive across all device sizes
 * 2. Works within LLM results scrollers
 * 3. Supports incremental updates for follow-up questions
 * 4. Uses proper React state management
 * 
 * @param {Object} props Component props
 * @param {Array} props.categories List of categories with metrics
 * @param {string} props.activeCategory Currently active category ID
 * @param {Function} props.onCategoryChange Callback when category is changed
 * @param {Object} props.options Display options
 * @returns {JSX.Element} LLM category tabs component
 */
const LLMCategoryTabs = ({ 
  categories = [], 
  activeCategory,
  onCategoryChange,
  options = {}
}) => {
  // Add logging for debugging purposes
  console.log('LLMCategoryTabs rendering with:', {
    categoryCount: categories.length,
    categoryNames: categories.map(c => c.name),
    options
  });
  const [selectedCategory, setSelectedCategory] = useState(activeCategory || (categories[0]?.id));
  const scrollContainerRef = useRef(null);
  const [showScrollIndicators, setShowScrollIndicators] = useState(false);
  const [scrollPosition, setScrollPosition] = useState({ left: false, right: true });
  
  // Monitor scroll status for horizontal overflow
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    const checkScroll = () => {
      const el = scrollContainerRef.current;
      if (!el) return;
      
      // Check if we need to show indicators (if content overflows)
      const hasOverflow = el.scrollWidth > el.clientWidth;
      setShowScrollIndicators(hasOverflow);
      
      // Check scroll positions
      setScrollPosition({
        left: el.scrollLeft > 20, // Some threshold to show left indicator
        right: el.scrollLeft < (el.scrollWidth - el.clientWidth - 20) // Some threshold for right
      });
    };
    
    // Set initial scroll state
    checkScroll();
    
    // Add resize and scroll listeners
    window.addEventListener('resize', checkScroll);
    scrollContainerRef.current.addEventListener('scroll', checkScroll);
    
    // Check visibility of the container after a brief delay
    // This helps detect if CSS is hiding our component
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const computedStyle = window.getComputedStyle(scrollContainerRef.current);
        const isVisible = computedStyle.display !== 'none' && 
                          computedStyle.visibility !== 'hidden' && 
                          computedStyle.opacity !== '0';
        
        if (!isVisible) {
          console.warn('LLMCategoryTabs: Container is not visible in DOM! CSS issues detected:', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            zIndex: computedStyle.zIndex
          });
          
          // Emergency override of styles
          scrollContainerRef.current.style.display = 'flex !important';
          scrollContainerRef.current.style.visibility = 'visible !important';
          scrollContainerRef.current.style.opacity = '1 !important';
          console.log('Applied emergency style overrides to ensure visibility');
        } else {
          console.log('LLMCategoryTabs container is visible in DOM');
        }
      }
    }, 500);
    
    return () => {
      window.removeEventListener('resize', checkScroll);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', checkScroll);
      }
    };
  }, [categories]);
  
  // Handle category selection
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    if (typeof onCategoryChange === 'function') {
      onCategoryChange(categoryId);
    }
    
    // Log the selection event
    log.info('LLM Category selected:', { categoryId });
  };
  
  // Ensure we have a valid selected category when props change
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
  
  // Scroll handling functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  // Add a check for categories and logging
  if (!Array.isArray(categories)) {
    console.error('LLMCategoryTabs: categories is not an array');
    return null;
  }
  
  if (categories.length === 0) {
    console.warn('LLMCategoryTabs: categories array is empty');
    return (
      <div 
        className="llm-category-tabs-empty-state" 
        style={{
          padding: '12px',
          textAlign: 'center',
          border: '2px dashed #d1d5db',
          borderRadius: '6px',
          color: '#6b7280',
          fontSize: '14px',
          margin: '0 0 12px 0',
          backgroundColor: '#f9fafb'
        }}
      >
        No categories available to display
      </div>
    );
  }
  
  // Function to get formatted display metrics if needed
  const getDisplayMetrics = (category) => {
    // Extract metrics from category or use defaults
    const metrics = category.metrics || {};
    
    // Convert to percentage format
    const relevance = Math.round((metrics.relevance || metrics.relevanceScore || 0.75) * 100);
    const credibility = Math.round((metrics.credibility || metrics.credibilityScore || 0.80) * 100);
    const accuracy = Math.round((metrics.accuracy || metrics.accuracyScore || 0.85) * 100);
    
    return { relevance, credibility, accuracy };
  };
  
  // Compact mode hides metrics to save space
  const isCompact = options.compact || options.isCompact || false;
  
  // Extract z-index from options or use high default
  const zIndex = options.zIndex || 9999;
  const showBorder = options.showBorder || false;
  const alwaysVisible = options.alwaysVisible || false;
  const forceDisplay = options.forceDisplay || false;
  
  // Force display this component if options request it
  if (alwaysVisible || forceDisplay) {
    // Create a global reference to categories for troubleshooting
    if (typeof window !== 'undefined') {
      window.__llmCategoryTabs = {
        categories,
        activeCategory,
        options
      };
      console.log('Categories stored in window.__llmCategoryTabs for debugging access');
    }
  }
  
  return (
    <div 
      className={styles.llmCategoryTabsContainer}
      data-testid="llm-category-tabs"
      id="llm-category-tabs-container"
      style={{
        position: 'relative !important',
        margin: '0 0 12px 0 !important',
        padding: '0 !important',
        display: 'block !important',
        visibility: 'visible !important',
        opacity: '1 !important',
        zIndex: `${zIndex} !important`,
        pointerEvents: 'auto !important',
        width: '100% !important',
        border: showBorder ? '3px solid #8b5cf6 !important' : 'none',
        backgroundColor: showBorder ? '#f9fafb !important' : 'transparent',
        borderRadius: showBorder ? '8px !important' : '0',
        padding: showBorder ? '8px !important' : '0 !important',
        boxShadow: showBorder ? '0 4px 6px rgba(0,0,0,0.1) !important' : 'none'
      }}
    >
      {/* Left scroll button - only shown when needed */}
      {showScrollIndicators && scrollPosition.left && (
        <button
          type="button"
          className="scroll-button scroll-left"
          onClick={scrollLeft}
          aria-label="Scroll categories left"
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e5e7eb',
            borderRadius: '50%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
        >
          ←
        </button>
      )}
      
      {/* Right scroll button - only shown when needed */}
      {showScrollIndicators && scrollPosition.right && (
        <button
          type="button"
          className="scroll-button scroll-right"
          onClick={scrollRight}
          aria-label="Scroll categories right"
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e5e7eb',
            borderRadius: '50%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            cursor: 'pointer'
          }}
        >
          →
        </button>
      )}
      
      {/* Scrollable tabs container */}
      <div 
        ref={scrollContainerRef}
        className={styles.tabsScroller}
        id="llm-category-tabs-scroller"
        style={{
          display: 'flex !important',
          flexWrap: 'nowrap !important',
          overflowX: 'auto !important',
          scrollbarWidth: 'thin !important',
          scrollBehavior: 'smooth !important',
          padding: '8px !important',
          gap: '8px !important',
          backgroundColor: '#f9fafb !important',
          borderRadius: '6px !important',
          border: '2px solid #8b5cf6 !important',  /* Purple border to make it stand out */
          // Add padding when scroll indicators are present
          paddingLeft: showScrollIndicators && scrollPosition.left ? '36px !important' : '8px !important',
          paddingRight: showScrollIndicators && scrollPosition.right ? '36px !important' : '8px !important',
          // Make sure it's visible
          visibility: 'visible !important',
          opacity: '1 !important',
          zIndex: `${zIndex} !important`,
          position: 'relative !important',
          minHeight: '64px !important',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1) !important',
          pointerEvents: 'auto !important',
          width: '100% !important'
        }}
      >
        {categories.map((category, index) => {
          const isActive = category.id === selectedCategory;
          const metrics = getDisplayMetrics(category);
          
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
              className={`${styles.categoryTab} ${isActive ? styles.active : ''}`}
              data-category-id={category.id}
              data-category-name={category.name}
              data-testid={`llm-category-${category.id}`}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCategoryClick(category.id);
                  e.preventDefault();
                }
              }}
              style={{
                display: 'flex !important',
                flexDirection: 'column !important',
                borderLeft: `4px solid ${borderColor} !important`,
                backgroundColor: isActive ? '#f9fafb !important' : 'white !important',
                boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1) !important' : '0 1px 3px rgba(0,0,0,0.05) !important',
                padding: isCompact ? '6px 12px !important' : '8px 12px !important',
                borderRadius: '4px !important',
                cursor: 'pointer !important',
                minWidth: isCompact ? 'auto !important' : '130px !important',
                border: `1px solid ${isActive ? '#d1d5db !important' : '#e5e7eb !important'}`,
                borderLeftWidth: '4px !important',
                transition: 'all 0.2s ease !important',
                flexShrink: 0,
                // Focus styles for accessibility
                outline: 'none !important',
                position: 'relative !important',
                visibility: 'visible !important',
                opacity: '1 !important'
              }}
            >
              <div className={`${styles.tabName} ${isActive ? styles.active : ''}`} style={{
                fontWeight: isActive ? '600 !important' : '500 !important',
                color: '#111827 !important',
                marginBottom: isCompact ? '0 !important' : '4px !important',
                fontSize: '0.9rem !important',
                whiteSpace: 'nowrap !important'
              }}>
                {category.name}
              </div>
              
              {/* Only show metrics if not in compact mode */}
              {!isCompact && (
                <div className={styles.metrics} style={{
                  display: 'flex !important',
                  fontSize: '0.75rem !important',
                  color: '#6b7280 !important',
                  gap: '6px !important'
                }}>
                  <div>R: <span className={styles.relevanceValue} style={{ color: '#2563eb !important' }}>{metrics.relevance}%</span></div>
                  <div>C: <span className={styles.credibilityValue} style={{ color: '#059669 !important' }}>{metrics.credibility}%</span></div>
                  <div>A: <span className={styles.accuracyValue} style={{ color: '#d97706 !important' }}>{metrics.accuracy}%</span></div>
                </div>
              )}
              
              {/* Selected indicator dot for compact mode */}
              {isCompact && isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: borderColor
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LLMCategoryTabs;
