import React, { useEffect } from 'react';

/**
 * CategoryDiagnosticPanel - Emergency diagnostic component for category display issues
 * This component renders a floating panel showing all known categories from all sources
 * and provides debugging tools to help identify why categories aren't displaying.
 */
const CategoryDiagnosticPanel = () => {
  useEffect(() => {
    // Create panel only in browser
    if (typeof window === 'undefined') return;
    
    const setup = () => {
      try {
        // Find all sources of categories
        const apiCategories = window.__apiDirectCategories || [];
        const globalStorage = window.__globalCategoryStorage || [];
        const intelligentSearch = window.__intelligentSearchCategories || [];
        const allCategories = window.__allCategories || [];
        const hiddenData = document.getElementById('api-direct-categories');
        const hiddenCategories = hiddenData && hiddenData.hasAttribute('data-categories') 
          ? JSON.parse(hiddenData.getAttribute('data-categories')) 
          : [];
        
        // Collect all category sources
        const allSources = {
          'API Direct': apiCategories,
          'Global Storage': globalStorage,
          'Intelligent Search': intelligentSearch,
          'All Categories': allCategories,
          'Hidden DOM': hiddenCategories
        };
        
        // Create or get container
        let container = document.getElementById('category-diagnostic-panel');
        if (!container) {
          container = document.createElement('div');
          container.id = 'category-diagnostic-panel';
          
          // Style the container
          Object.assign(container.style, {
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: '10001',
            backgroundColor: '#ffffff',
            border: '3px solid #0284c7',
            borderRadius: '8px',
            padding: '15px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            width: '320px',
            maxHeight: '500px',
            overflowY: 'auto',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.4'
          });
          
          document.body.appendChild(container);
        }
        
        // Clear previous content
        container.innerHTML = '';
        
        // Add header
        const header = document.createElement('h3');
        header.textContent = '🔍 CATEGORY DIAGNOSTIC PANEL';
        Object.assign(header.style, {
          margin: '0 0 10px 0',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#0284c7',
          textAlign: 'center',
          borderBottom: '2px solid #0284c7',
          paddingBottom: '5px'
        });
        container.appendChild(header);
        
        // Add CSS inspection section
        const cssSection = document.createElement('div');
        cssSection.innerHTML = '<strong>CSS Inspection:</strong>';
        Object.assign(cssSection.style, {
          marginBottom: '10px',
          padding: '5px',
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          fontSize: '12px'
        });
        container.appendChild(cssSection);
        
        // Check CSS selectors
        const cssSelectors = [
          '#category-ribbon-main-container',
          '.category-ribbon-container',
          '[class*="category-ribbon"]',
          '.ribbon-category-card',
          '[data-category-name]'
        ];
        
        const cssList = document.createElement('ul');
        Object.assign(cssList.style, {
          margin: '5px 0',
          paddingLeft: '20px',
          fontSize: '11px'
        });
        
        cssSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          const item = document.createElement('li');
          item.textContent = `${selector} (${elements.length} found)`;
          item.style.color = elements.length > 0 ? '#059669' : '#dc2626';
          cssList.appendChild(item);
        });
        
        cssSection.appendChild(cssList);
        
        // Add category sources section
        Object.entries(allSources).forEach(([sourceName, categories]) => {
          const sourceSection = document.createElement('div');
          sourceSection.innerHTML = `<strong>${sourceName}:</strong> ${categories.length} categories`;
          Object.assign(sourceSection.style, {
            marginBottom: '8px',
            padding: '5px',
            backgroundColor: categories.length > 0 ? '#ecfdf5' : '#fef2f2',
            borderRadius: '4px',
            borderLeft: `4px solid ${categories.length > 0 ? '#059669' : '#dc2626'}`,
            fontSize: '12px'
          });
          
          if (categories.length > 0) {
            const categoryList = document.createElement('ul');
            Object.assign(categoryList.style, {
              margin: '5px 0',
              paddingLeft: '20px',
              fontSize: '11px'
            });
            
            categories.forEach(category => {
              const item = document.createElement('li');
              item.textContent = category.name || 'Unnamed Category';
              categoryList.appendChild(item);
            });
            
            sourceSection.appendChild(categoryList);
          }
          
          container.appendChild(sourceSection);
        });
        
        // Add force display button
        const forceButton = document.createElement('button');
        forceButton.textContent = '🔄 Force Display Categories';
        Object.assign(forceButton.style, {
          marginTop: '10px',
          padding: '8px 12px',
          backgroundColor: '#0369a1',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '100%',
          fontWeight: 'bold'
        });
        
        forceButton.onclick = () => {
          // Collect all categories from all sources
          const allKnownCategories = [
            ...apiCategories,
            ...globalStorage,
            ...intelligentSearch,
            ...allCategories,
            ...hiddenCategories
          ].filter(Boolean);
          
          // De-duplicate by name
          const uniqueCategories = Array.from(
            new Map(allKnownCategories.map(cat => [cat.name, cat])).values()
          );
          
          if (uniqueCategories.length > 0) {
            console.log('🔄 Force displaying categories:', uniqueCategories);
            
            // Create category display container
            const displayContainer = document.createElement('div');
            displayContainer.id = 'emergency-category-display';
            Object.assign(displayContainer.style, {
              position: 'fixed',
              top: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: '10000',
              backgroundColor: '#ffffff',
              border: '2px solid #0284c7',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              width: '80%',
              maxWidth: '800px'
            });
            
            // Add header
            const header = document.createElement('h3');
            header.textContent = '🚨 EMERGENCY CATEGORY DISPLAY';
            Object.assign(header.style, {
              margin: '0 0 15px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#0284c7',
              textAlign: 'center',
              borderBottom: '2px solid #0284c7',
              paddingBottom: '8px'
            });
            displayContainer.appendChild(header);
            
            // Add category container
            const categoryContainer = document.createElement('div');
            Object.assign(categoryContainer.style, {
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center'
            });
            
            // Add each category as a button
            uniqueCategories.forEach(category => {
              const categoryBtn = document.createElement('div');
              categoryBtn.textContent = category.name;
              categoryBtn.setAttribute('data-category-id', category.id || '');
              categoryBtn.setAttribute('data-category-name', category.name || '');
              
              Object.assign(categoryBtn.style, {
                padding: '10px 15px',
                backgroundColor: '#f1f5f9',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid #cbd5e1',
                fontWeight: '500',
                transition: 'all 0.15s ease'
              });
              
              categoryBtn.onmouseover = () => {
                Object.assign(categoryBtn.style, {
                  backgroundColor: '#e0f2fe',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                });
              };
              
              categoryBtn.onmouseout = () => {
                Object.assign(categoryBtn.style, {
                  backgroundColor: '#f1f5f9',
                  boxShadow: 'none'
                });
              };
              
              categoryContainer.appendChild(categoryBtn);
            });
            
            displayContainer.appendChild(categoryContainer);
            
            // Add close button
            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Close';
            Object.assign(closeBtn.style, {
              marginTop: '15px',
              padding: '8px 12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            });
            closeBtn.onclick = () => document.body.removeChild(displayContainer);
            displayContainer.appendChild(closeBtn);
            
            // Add to body
            document.body.appendChild(displayContainer);
          } else {
            alert('No categories found in any storage!');
          }
        };
        
        container.appendChild(forceButton);
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close Panel';
        Object.assign(closeBtn.style, {
          marginTop: '10px',
          padding: '6px 12px',
          backgroundColor: '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          width: '100%'
        });
        closeBtn.onclick = () => {
          container.style.display = 'none';
        };
        container.appendChild(closeBtn);
        
        console.log('✅ Category diagnostic panel initialized');
      } catch (err) {
        console.error('Failed to create category diagnostic panel:', err);
      }
    };
    
    // Run immediately
    setup();
    
    // Also run on a timer to keep updating
    const intervalId = setInterval(setup, 3000);
    
    return () => {
      clearInterval(intervalId);
      
      // Clean up
      const panel = document.getElementById('category-diagnostic-panel');
      if (panel) {
        document.body.removeChild(panel);
      }
    };
  }, []);
  
  // Component doesn't render anything in the React tree
  return null;
};

export default CategoryDiagnosticPanel;
