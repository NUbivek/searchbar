/**
 * LLMCategoriesTab.js
 * 
 * A dedicated tab component for displaying categories within the LLM results section
 * This is a radical new approach to ensure categories are always visible
 */

import React, { useState, useEffect } from 'react';
import { debug, info, warn, error } from '../../../utils/logger';
import styles from './LLMCategoriesTab.module.css';

// Import DefaultCategories to access enrichCategoryContent
import { getDefaultCategories } from '../categories/types/DefaultCategories';

// Create a log object for consistent logging
const log = { debug, info, warn, error };

/**
 * LLMCategoriesTab Component
 * 
 * Displays categories in a tab inside the LLM results section
 * 
 * @param {Object} props Component props 
 * @param {Array} props.categories List of categories to display
 * @param {string} props.query Current search query
 * @param {Object} props.options Display options
 * @returns {JSX.Element} Categories tab component
 */
const LLMCategoriesTab = ({ categories = [], query = '', options = {} }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Enrich categories with content if needed
  const [enrichedCategories, setEnrichedCategories] = useState([]);
  
  // Process and enrich categories on mount and when categories change
  useEffect(() => {
    setIsMounted(true);
    
    // Ensure all categories have content
    let processedCategories = [...(categories || [])];
    
    // Use the DefaultCategories.enrichCategoryContent function if available
    if (typeof window !== 'undefined' && window.DefaultCategories?.enrichCategoryContent) {
      processedCategories = window.DefaultCategories.enrichCategoryContent(processedCategories);
      log.info('Using DefaultCategories.enrichCategoryContent to ensure content');
    } else {
      // Fallback enrichment if DefaultCategories is not available
      processedCategories = processedCategories.map(category => {
        if (!category.content || 
            (typeof category.content === 'string' && category.content.trim() === '') ||
            (Array.isArray(category.content) && category.content.length === 0)) {
          return {
            ...category,
            content: `<div class="fallback-content">
              <p><strong>Category: ${category.name}</strong></p>
              <p>This category would display relevant search results.</p>
            </div>`,
            isEnriched: true
          };
        }
        return category;
      });
    }
    
    setEnrichedCategories(processedCategories);
    
    // Set active category
    if (processedCategories && processedCategories.length > 0) {
      setActiveCategory(processedCategories[0].id);
    }
    
    // Store categories in window for debugging
    if (typeof window !== 'undefined') {
      window.__categoriesTabData = {
        timestamp: new Date().toISOString(),
        originalCategories: categories || [],
        enrichedCategories: processedCategories,
        query
      };
    }
    
    log.info('LLMCategoriesTab mounted with categories:', { 
      count: categories?.length || 0,
      enrichedCount: processedCategories.length,
      names: processedCategories?.map(c => c.name) || []
    });
  }, [categories, query]);
  
  // Update active category when categories change
  useEffect(() => {
    if (categories && categories.length > 0) {
      // If current active category isn't in the list, reset to the first one
      if (!activeCategory || !categories.some(c => c.id === activeCategory)) {
        setActiveCategory(categories[0].id);
      }
    }
  }, [categories]);
  
  // If no categories, display a message
  if (!enrichedCategories || !Array.isArray(enrichedCategories) || enrichedCategories.length === 0) {
    return (
      <div 
        id="llm-categories-tab" 
        className={`${styles.categoriesTabContainer} ${styles.emptyContainer}`}
        data-testid="llm-categories-tab"
      >
        <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>No Categories Available</p>
        <p style={{ fontSize: '14px', margin: 0, color: '#6b7280' }}>
          No categories were found for this search query.
        </p>
      </div>
    );
  }
  
  // Get the active category content
  const activeContent = enrichedCategories.find(c => c.id === activeCategory)?.content || '';
  
  return (
    <div 
      id="llm-categories-tab" 
      className={`${styles.categoriesTabContainer} ${styles.forceVisible}`}
      data-testid="llm-categories-tab"
      data-categories-count={enrichedCategories.length}
      data-active-category={activeCategory}
    >
      {/* Tab header */}
      <div className={styles.tabHeader}>
        {enrichedCategories.map(category => (
          <button 
            key={category.id}
            type="button"
            className={`${styles.tabButton} ${activeCategory === category.id ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveCategory(category.id)}
            data-category-id={category.id}
            data-category-name={category.name}
          >
            {category.name || category.title}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div className={styles.tabContent}>
        {activeContent ? (
          <div 
            className={styles.categoryContent}
            dangerouslySetInnerHTML={{ __html: typeof activeContent === 'string' ? activeContent : JSON.stringify(activeContent) }}
          />
        ) : (
          <div className={styles.emptyContent}>
            <p>No content available for this category.</p>
          </div>
        )}
      </div>
      
      {/* Debug footer */}
      <div className={styles.tabFooter}>
        <div>Available Categories: {enrichedCategories.length}</div>
        <div>Category Names: {enrichedCategories.map(c => c.name).join(', ')}</div>
        <div>Original Categories Count: {categories.length || 0}</div>
      </div>
    </div>
  );
};

export default LLMCategoriesTab;
