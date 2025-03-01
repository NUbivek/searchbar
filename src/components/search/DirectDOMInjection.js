import React, { useEffect } from 'react';

/**
 * DirectDOMInjection - Injects JS directly into the page head to manipulate 
 * the DOM even if React's virtual DOM isn't rendering correctly
 */
const DirectDOMInjection = ({ categories }) => {
  useEffect(() => {
    // Create a script element to inject code that will run globally
    const script = document.createElement('script');
    
    // Convert categories to a JSON string that can be inserted into the script
    const categoriesJson = JSON.stringify(categories || []);
    
    // The script content - self-executing function
    script.textContent = `
      (function() {
        console.log('DirectDOMInjection script injected and executing');
        
        // Store categories in window for debugging
        window.__injectedCategories = ${categoriesJson};
        
        // Function to create category elements directly in the DOM
        function injectCategoryDisplay() {
          const categories = window.__injectedCategories || [];
          
          console.log('Injecting categories via direct script:', {
            count: categories.length,
            names: categories.map(c => c.name || c.title || 'Unnamed').join(', ')
          });
          
          if (!categories || categories.length === 0) {
            console.warn('No categories to inject');
            return;
          }
          
          // Create a container for our categories if it doesn't exist
          let container = document.getElementById('injected-categories-container');
          if (!container) {
            container = document.createElement('div');
            container.id = 'injected-categories-container';
            container.style.margin = '20px 0';
            container.style.padding = '15px';
            container.style.border = '2px solid #ef4444';
            container.style.borderRadius = '8px';
            container.style.backgroundColor = '#fef2f2';
            
            // Try to find a good place to insert it
            const possibleParents = [
              document.querySelector('.modern-category-display'),
              document.querySelector('[class*="category"]'),
              document.querySelector('[id*="category"]'),
              document.querySelector('main'),
              document.body
            ];
            
            let inserted = false;
            for (const parent of possibleParents) {
              if (parent) {
                try {
                  parent.appendChild(container);
                  inserted = true;
                  console.log('Inserted category container into', parent);
                  break;
                } catch (e) {
                  console.error('Failed to insert into', parent, e);
                }
              }
            }
            
            if (!inserted) {
              // Last resort - insert after first main div in body
              const firstDiv = document.querySelector('body > div');
              if (firstDiv) {
                firstDiv.parentNode.insertBefore(container, firstDiv.nextSibling);
                console.log('Inserted after first div in body');
              } else {
                document.body.appendChild(container);
                console.log('Inserted at end of body');
              }
            }
          }
          
          // Clear existing content
          container.innerHTML = '';
          
          // Add header
          const header = document.createElement('h3');
          header.textContent = 'EMERGENCY INJECTED CATEGORIES';
          header.style.color = '#b91c1c';
          header.style.textAlign = 'center';
          header.style.fontWeight = 'bold';
          header.style.marginBottom = '15px';
          header.style.fontSize = '18px';
          container.appendChild(header);
          
          // Add subheader with category count
          const subheader = document.createElement('p');
          subheader.textContent = 'Categories: ' + categories.map(c => c.name || c.title || 'Unnamed').join(', ');
          subheader.style.marginBottom = '15px';
          subheader.style.textAlign = 'center';
          container.appendChild(subheader);
          
          // Create ribbon container
          const ribbon = document.createElement('div');
          ribbon.style.display = 'flex';
          ribbon.style.flexWrap = 'wrap';
          ribbon.style.justifyContent = 'center';
          ribbon.style.gap = '10px';
          container.appendChild(ribbon);
          
          // Add each category card
          categories.forEach(category => {
            const card = document.createElement('div');
            const id = category.id || (category.name || category.title || '').toLowerCase().replace(/\\s+/g, '_') || 'category_' + Math.random().toString(36).substr(2, 9);
            const name = category.name || category.title || 'Unnamed Category';
            const color = category.color || '#4CAF50';
            
            card.setAttribute('data-category-id', id);
            card.setAttribute('data-category-name', name);
            card.className = 'injected-category-card';
            
            card.style.backgroundColor = '#ffffff';
            card.style.borderLeft = '4px solid ' + color;
            card.style.padding = '12px 15px';
            card.style.minWidth = '180px';
            card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            card.style.position = 'relative';
            card.style.border = '1px solid #cbd5e0';
            card.style.borderRadius = '6px';
            card.style.margin = '8px';
            card.style.cursor = 'pointer';
            
            // Card title
            const title = document.createElement('h4');
            title.textContent = name;
            title.style.color = '#333333';
            title.style.fontSize = '16px';
            title.style.fontWeight = 'bold';
            title.style.margin = '0';
            title.style.textAlign = 'center';
            card.appendChild(title);
            
            // Card badge (if metrics exist)
            const metrics = category.metrics || {};
            const overall = metrics.overall || metrics.finalScore/100 || 0.8;
            const percentage = Math.round((overall * 100)) + '%';
            
            const badge = document.createElement('div');
            badge.textContent = percentage;
            badge.style.position = 'absolute';
            badge.style.top = '-8px';
            badge.style.right = '-8px';
            badge.style.backgroundColor = color;
            badge.style.color = '#ffffff';
            badge.style.borderRadius = '12px';
            badge.style.padding = '2px 8px';
            badge.style.fontSize = '12px';
            badge.style.fontWeight = 'bold';
            badge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)';
            badge.style.zIndex = '2';
            card.appendChild(badge);
            
            // Add click handler
            card.addEventListener('click', function() {
              console.log('Clicked on category:', name);
              // Try to trigger any React handlers
              try {
                const reactCards = document.querySelectorAll('[data-category-name="' + name + '"]');
                if (reactCards.length > 0) {
                  console.log('Found corresponding React card, triggering click');
                  reactCards[0].click();
                }
              } catch (e) {
                console.error('Failed to trigger React handler', e);
              }
            });
            
            ribbon.appendChild(card);
          });
        }
        
        // Execute immediately
        injectCategoryDisplay();
        
        // Also execute after a short delay to handle dynamic loading
        setTimeout(injectCategoryDisplay, 1000);
        setTimeout(injectCategoryDisplay, 3000);
        
        // Add a global function to force reinjection
        window.forceInjectCategories = injectCategoryDisplay;
        
        // Add a MutationObserver to detect DOM changes and reinject if necessary
        const observer = new MutationObserver(function(mutations) {
          // Check if our injected categories are still in the DOM
          const container = document.getElementById('injected-categories-container');
          if (!container || !document.body.contains(container)) {
            console.log('Category container was removed, reinjecting');
            injectCategoryDisplay();
          }
        });
        
        // Start observing the document body
        observer.observe(document.body, { childList: true, subtree: true });
      })();
    `;
    
    // Add the script to the document head
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      document.head.removeChild(script);
    };
  }, [categories]); // Re-run when categories change
  
  // This component doesn't render anything visible
  return null;
};

export default DirectDOMInjection;
