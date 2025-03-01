import React, { useEffect, useState } from 'react';
import Script from 'next/script';

/**
 * GlobalDiagnostics - A component that provides global diagnostic capabilities
 * This component injects scripts and global functions that can be used to debug
 * the application regardless of React rendering issues.
 * 
 * It includes emergency category display functions that will work even if React
 * rendering or CSS modules fail. These emergency systems use direct DOM manipulation
 * to ensure categories are always visible.
 */
const GlobalDiagnostics = () => {
  // Track loading state for scripts
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  // Load emergency script directly from public
  useEffect(() => {
    try {
      // Load the inject-categories.js script
      const script = document.createElement('script');
      script.src = '/inject-categories.js';
      script.id = 'emergency-category-script';
      script.async = true;
      script.onload = () => {
        console.log('✅ Emergency category script loaded successfully');
        setScriptsLoaded(true);
      };
      script.onerror = (err) => {
        console.error('❌ Failed to load emergency category script:', err);
      };
      document.head.appendChild(script);
    } catch (err) {
      console.error('Error setting up emergency script:', err);
    }
  }, []);

  // Inject the global diagnostic script inline
  useEffect(() => {
    // Inject the global diagnostic script
    const script = document.createElement('script');
    script.id = 'global-diagnostics-script';
    script.innerHTML = `
      (function() {
        console.log('%c🔍 Global Diagnostics Loaded', 'background: #15803d; color: white; padding: 6px 10px; border-radius: 4px; font-weight: bold; font-size: 14px;');
        
        // Create a storage for categories that persists across renders
        window.__globalCategoryStorage = window.__globalCategoryStorage || {
          categories: [],
          lastUpdated: null
        };
        
        // Global functions for diagnostic purposes
        window.diagnostics = {
          // Shows available categories
          showCategories: function() {
            // Try multiple sources
            const allCategories = 
              window.__processedCategories || 
              window.__allCategories || 
              window.__lastCategoriesReceived || 
              window.__globalCategoryStorage.categories || 
              [];
              
            console.log('%c📊 Available Categories', 'background: #0369a1; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold;');
            
            if (allCategories && allCategories.length > 0) {
              console.table(allCategories.map(c => ({
                name: c.name || 'Unnamed',
                id: c.id || 'No ID',
                contentCount: Array.isArray(c.content) ? c.content.length : 'N/A',
                hasMetrics: c.metrics ? 'Yes' : 'No'
              })));
            } else {
              console.log('%c❌ No categories found', 'color: #ef4444; font-weight: bold;');
            }
            
            return allCategories;
          },
          
          // Injects a standalone category display directly into the DOM
          injectCategoryDisplay: function() {
            const categories = 
              window.__processedCategories || 
              window.__allCategories || 
              window.__lastCategoriesReceived || 
              window.__globalCategoryStorage.categories || 
              [];
              
            if (!categories || categories.length === 0) {
              console.warn('No categories available to inject');
              return;
            }
            
            console.log('%c🧩 Injecting standalone category display', 'background: #8b5cf6; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold;', {
              categoryCount: categories.length,
              names: categories.map(c => c.name || 'Unnamed').join(', ')
            });
            
            // Create container if it doesn't exist
            let container = document.getElementById('global-diagnostics-categories');
            if (!container) {
              container = document.createElement('div');
              container.id = 'global-diagnostics-categories';
              
              // Apply styles to make it very visible
              Object.assign(container.style, {
                position: 'fixed',
                top: '10px',
                right: '10px',
                zIndex: '9999',
                backgroundColor: 'rgba(255, 255, 255, 0.97)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                border: '3px solid #ef4444',
                borderRadius: '8px',
                padding: '15px',
                maxWidth: '400px',
                maxHeight: '80vh',
                overflow: 'auto'
              });
              
              document.body.appendChild(container);
            }
            
            // Generate HTML for categories
            let html = '<h3 style="color: #ef4444; font-size: 16px; font-weight: bold; margin: 0 0 10px 0; text-align: center;">EMERGENCY CATEGORY DISPLAY</h3>';
            
            html += '<p style="margin: 0 0 10px 0; font-size: 12px;">This is an emergency render showing categories that are available but might not be properly displayed in the UI.</p>';
            
            html += '<div style="display: flex; justify-content: space-between; margin-bottom: 15px;">';
            html += '<button id="global-diag-refresh" style="padding: 5px 10px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Refresh</button>';
            html += '<button id="global-diag-hide" style="padding: 5px 10px; background-color: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Hide</button>';
            html += '</div>';
            
            // List of category names
            html += '<div style="margin-bottom: 15px; padding: 8px; background-color: #f3f4f6; border-radius: 4px; font-size: 12px;">';
            html += '<strong>Available Categories:</strong><br />';
            html += categories.map(c => c.name || 'Unnamed').join(', ');
            html += '</div>';
            
            // Category cards
            html += '<div style="display: flex; flex-direction: column; gap: 10px;">';
            
            categories.forEach(category => {
              const name = category.name || category.title || 'Unnamed Category';
              const id = category.id || name.toLowerCase().replace(/\\s+/g, '_') || 'unknown';
              const color = category.color || '#4285F4';
              
              // Generate a lighter version of the color for the background
              const lightColor = color.replace(')', ', 0.15)').replace('rgb', 'rgba');
              
              html += \`
                <div 
                  class="emergency-category-card" 
                  data-category-id="\${id}" 
                  data-category-name="\${name}"
                  style="
                    background-color: \${lightColor || 'rgba(66, 133, 244, 0.15)'};
                    border-left: 4px solid \${color || '#4285F4'};
                    padding: 10px;
                    border-radius: 4px;
                    position: relative;
                    cursor: pointer;
                  "
                >
                  <h4 style="margin: 0 0 5px 0; color: #111827; font-size: 14px;">\${name}</h4>
              \`;
              
              // Add metrics if available
              const metrics = category.metrics || {};
              const finalScore = metrics.finalScore || Math.round((metrics.overall || 0.8) * 100);
              
              if (finalScore) {
                html += \`
                  <div style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background-color: \${color || '#4285F4'};
                    color: white;
                    border-radius: 12px;
                    padding: 2px 8px;
                    font-size: 11px;
                    font-weight: bold;
                  ">
                    \${finalScore}%
                  </div>
                \`;
              }
              
              // Close the card
              html += '</div>';
            });
            
            html += '</div>';
            
            // Update container
            container.innerHTML = html;
            
            // Add event listeners
            const refreshBtn = document.getElementById('global-diag-refresh');
            if (refreshBtn) {
              refreshBtn.addEventListener('click', function() {
                window.diagnostics.injectCategoryDisplay();
              });
            }
            
            const hideBtn = document.getElementById('global-diag-hide');
            if (hideBtn) {
              hideBtn.addEventListener('click', function() {
                container.style.display = 'none';
              });
            }
          },
          
          // Inspect DOM for category-related elements
          inspectCategoryElements: function() {
            console.log('%c🔍 Inspecting DOM for category elements', 'background: #0369a1; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold;');
            
            const selectors = [
              '#category-ribbon-main-container',
              '.category-ribbon-container',
              '[class*="category-ribbon"]',
              '.ribbon-category-card',
              '[data-category-name]',
              '#modern-category-display-container',
              '.modern-category-display',
              '#direct-category-container',
              '.direct-category-display'
            ];
            
            const results = {};
            
            selectors.forEach(selector => {
              const elements = document.querySelectorAll(selector);
              results[selector] = {
                count: elements.length,
                visible: Array.from(elements).some(el => {
                  const style = window.getComputedStyle(el);
                  return style.display !== 'none' && style.visibility !== 'hidden';
                })
              };
            });
            
            console.table(results);
            return results;
          }
        };
        
        // Add commands to console
        console.log('%c🔍 Available Diagnostic Commands', 'background: #0369a1; color: white; padding: 5px 10px; border-radius: 4px; font-weight: bold; margin-top: 10px;');
        console.log('%c• window.diagnostics.showCategories()', 'color: #2563eb; font-weight: bold;', '- Show all available categories');
        console.log('%c• window.diagnostics.injectCategoryDisplay()', 'color: #2563eb; font-weight: bold;', '- Force inject a category display');
        console.log('%c• window.diagnostics.inspectCategoryElements()', 'color: #2563eb; font-weight: bold;', '- Check DOM for category elements');
        
        // Connect with emergency system if available
        document.addEventListener('DOMContentLoaded', function() {
          console.log('GlobalDiagnostics has been loaded and is active');
          
          // Set up cross-monitoring with emergency system
          if (window.emergencyCategorySystem) {
            console.log('Successfully connected to emergency category system');
          } else {
            console.warn('Emergency category system not detected - it will be loaded separately');
            
            // Try to load it directly if it's not already loaded
            const emergencyScript = document.createElement('script');
            emergencyScript.src = '/inject-categories.js';
            emergencyScript.id = 'emergency-category-backup-script';
            document.head.appendChild(emergencyScript);
          }
        });
        
        // Run initial diagnostics after a delay
        setTimeout(() => {
          window.diagnostics.inspectCategoryElements();
          window.diagnostics.injectCategoryDisplay();
          
          // Also try emergency system if available
          if (window.emergencyCategorySystem && window.emergencyCategorySystem.inject) {
            console.log('Running emergency category system check');
            window.emergencyCategorySystem.check();
          }
        }, 2000);
      })();
    `;
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up function
      if (document.getElementById('global-diagnostics-script')) {
        document.head.removeChild(document.getElementById('global-diagnostics-script'));
      }
    };
  }, []);
  
  return (
    <>
      {/* Load emergency category script via Next.js Script for better reliability */}
      <Script
        id="emergency-category-script-nextjs"
        src="/inject-categories.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Emergency category script loaded via Next.js Script');
          if (typeof window !== 'undefined') {
            // Initialize emergency system
            window.emergencyCategorySystemLoaded = true;
            
            // Try connecting with DefaultCategories system
            try {
              if (window.DefaultCategories && window.DefaultCategories.forceDisplay) {
                console.log('Connected with DefaultCategories system');
              }
              
              if (window.emergencyCategorySystem && window.emergencyCategorySystem.inject) {
                console.log('Connected with emergency category system');
              }
            } catch (err) {
              console.error('Error connecting with category systems:', err);
            }
          }
        }}
      />
      
      <div 
        style={{ display: 'none' }} 
        data-testid="global-diagnostics"
        id="global-diagnostics-root"
      >
        {/* Hidden component that injects diagnostic capabilities */}
        <div id="diagnostic-data-storage" data-scripts-loaded={scriptsLoaded.toString()} />
      </div>
    </>
  )
};

export default GlobalDiagnostics;
