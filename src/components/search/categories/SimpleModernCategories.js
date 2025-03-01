import React, { useState, useEffect } from 'react';
import styles from './SimpleModernCategories.module.css';
import { getDefaultCategories } from './types/DefaultCategories';
import { processCategories } from './processors/CategoryProcessor';

/**
 * A simplified modern category display component with all inline styles
 * that doesn't depend on any external CSS or other components
 */
const SimpleModernCategories = ({ categories = [], query = '', results = [] }) => {
  // If no categories are provided, use CategoryProcessor to generate them
  let finalCategories = categories;
  
  // If we still have no categories, create them using DefaultCategories
  if (!finalCategories || finalCategories.length === 0) {
    try {
      // Try to process the results to create categories
      if (Array.isArray(results) && results.length > 0) {
        console.log('Processing results to create categories:', { resultCount: results.length });
        const processedCategories = processCategories(results, query);
        if (processedCategories && processedCategories.length > 0) {
          finalCategories = processedCategories;
          console.log('Successfully created categories from results:', { categoryCount: finalCategories.length });
        }
      }
    } catch (err) {
      console.error('Error processing categories:', err);
    }
    
    // If we still don't have categories, use the default ones
    if (!finalCategories || finalCategories.length === 0) {
      finalCategories = getDefaultCategories(query);
      console.log('Using default categories:', { count: finalCategories.length });
    }
  }
  
  // Set the first category as active by default
  const [activeCategory, setActiveCategory] = useState(finalCategories[0]?.id);

  // Get the current active category object
  const activeCategoryObj = finalCategories.find(cat => cat.id === activeCategory) || finalCategories[0];
  
  // Log for debugging
  console.log('SimpleModernCategories rendered:', {
    categoriesCount: finalCategories.length,
    activeCategory,
    categoryNames: finalCategories.map(c => c.name)
  });
  
  // Debug Log
  useEffect(() => {
    console.log('SimpleModernCategories rendered with:', {
      categoriesCount: finalCategories.length,
      activeCategory,
      query
    });
  }, [finalCategories, activeCategory, query]);
  
  return (
    <div className={styles.simpleModernCategories} style={{ 
      margin: '20px 0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Categories Header */}
      <div className={styles.categoryHeader} style={{ 
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 className={styles.categoryTitle} style={{ 
          fontSize: '18px',
          fontWeight: '600',
          color: '#2d3748',
          marginTop: '0',
          marginBottom: '12px',
          textAlign: 'center',
          paddingBottom: '8px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          Categories
        </h3>
        
        {/* Category Tabs */}
        <div className={styles.categoryTabs} style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '10px'
        }}>
          {finalCategories.map(category => (
            <div
              key={category.id}
              className={`${styles.categoryTab} ${category.id === activeCategory ? styles.active : ''}`}
              onClick={() => setActiveCategory(category.id)}
              style={{
                backgroundColor: category.id === activeCategory ? (category.color || '#4285F4') : '#ffffff',
                color: category.id === activeCategory ? '#ffffff' : '#2d3748',
                padding: '10px 16px',
                borderRadius: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                fontWeight: category.id === activeCategory ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${category.id === activeCategory ? (category.color || '#4285F4') : '#e2e8f0'}`,
                transition: 'all 0.2s ease'
              }}
            >
              <span>{category.name}</span>
              {category.content && (
                <span className={styles.categoryTabCount} style={{ 
                  backgroundColor: category.id === activeCategory ? 'rgba(255,255,255,0.3)' : '#edf2f7',
                  color: category.id === activeCategory ? '#ffffff' : '#64748b',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  marginLeft: '8px',
                  fontWeight: '500'
                }}>
                  {Array.isArray(category.content) ? category.content.length : 0}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Category Content */}
      {activeCategoryObj && (
        <div className={styles.categoryContent} style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h4 className={styles.categoryContentTitle} style={{ 
            fontSize: '16px',
            fontWeight: '600',
            color: '#2d3748',
            marginTop: '0',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span className={styles.categoryColorDot} style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: activeCategoryObj.color || '#4285F4',
              borderRadius: '50%',
              display: 'inline-block',
              marginRight: '8px'
            }}></span>
            {activeCategoryObj.name} Content
          </h4>
          
          {Array.isArray(activeCategoryObj.content) && activeCategoryObj.content.length > 0 ? (
            <div>
              {activeCategoryObj.content.map((item, index) => (
                <div key={index} className={styles.contentItem} style={{ 
                  marginBottom: '16px',
                  paddingBottom: '16px',
                  borderBottom: index < activeCategoryObj.content.length - 1 ? '1px solid #edf2f7' : 'none'
                }}>
                  {item.title && (
                    <h5 className={styles.contentItemTitle} style={{ 
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2d3748',
                      marginTop: '0',
                      marginBottom: '8px'
                    }}>
                      {item.title}
                    </h5>
                  )}
                  
                  {item.content && (
                    <p className={styles.contentItemText} style={{ 
                      fontSize: '14px',
                      color: '#4a5568',
                      lineHeight: '1.5',
                      margin: '0'
                    }}>
                      {item.content}
                    </p>
                  )}
                  
                  {item.url && (
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.contentItemUrl}
                      style={{
                        display: 'inline-block',
                        fontSize: '12px',
                        color: '#3182ce',
                        marginTop: '8px',
                        textDecoration: 'none'
                      }}
                    >
                      {item.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noContentMessage} style={{ color: '#718096', fontStyle: 'italic' }}>
              No content available for this category.
            </p>
          )}
        </div>
      )}
      
      {/* Debug panel */}
      <div className={styles.debugPanel} style={{ 
        margin: '20px 0',
        padding: '12px',
        backgroundColor: '#edf2f7',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#4a5568'
      }}>
        <div><strong>Query:</strong> {query || 'No query'}</div>
        <div><strong>Categories:</strong> {finalCategories.length}</div>
        <div><strong>Active:</strong> {activeCategory}</div>
        <div>
          <strong>Item Counts:</strong> 
          {finalCategories.map(cat => (
            <span key={cat.id} style={{ marginRight: '10px' }}>
              {cat.name}: {Array.isArray(cat.content) ? cat.content.length : 0}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleModernCategories;
