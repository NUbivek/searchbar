/**
 * Category Visibility Diagnostic Tool
 * 
 * This script checks DOM elements for category display visibility issues
 * and suggests fixes specifically for visibility problems.
 */

// Function to run within the browser to diagnose category visibility issues
function checkCategoryVisibility() {
  console.log('%c🔍 Category Visibility Diagnostic Tool', 'font-size: 16px; font-weight: bold; color: #3498db; background-color: #eef9ff; padding: 5px; border-radius: 4px;');
  
  // Important category selectors to check
  const selectors = [
    // Main containers
    '#category-ribbon-main-container',
    '.category-ribbon-container',
    '.modern-category-display',
    '#llm-category-container',
    
    // Specific components
    '.category-ribbon',
    '.ribbon-category-container',
    '.ribbon-category-card',
    '[data-category-name]',
    '[data-testid="category-ribbon-visual"]',
    '[data-testid="category-ribbon-wrapper"]',
    
    // Legacy elements
    '.category-tabbed-view',
    '.category-tab-content',
    '.category-content-container'
  ];
  
  const results = {
    found: 0,
    hidden: 0,
    visible: 0,
    issues: []
  };
  
  // Check each selector
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    results.found += elements.length;
    
    if (elements.length > 0) {
      console.log(`✅ Found ${elements.length} elements matching ${selector}`);
      
      elements.forEach((el, index) => {
        // Get computed style
        const computedStyle = window.getComputedStyle(el);
        
        // Check for visibility issues
        const isVisible = computedStyle.display !== 'none' && 
                         computedStyle.visibility !== 'hidden' && 
                         computedStyle.opacity !== '0' &&
                         computedStyle.height !== '0px';
        
        if (isVisible) {
          results.visible++;
          console.log(`  ✅ Element ${selector} #${index} is visible`);
        } else {
          results.hidden++;
          console.log(`  ❌ Element ${selector} #${index} is hidden:`, {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            height: computedStyle.height,
            position: computedStyle.position,
            zIndex: computedStyle.zIndex
          });
          
          // Store issue details
          results.issues.push({
            selector,
            index,
            element: el,
            style: {
              display: computedStyle.display,
              visibility: computedStyle.visibility,
              opacity: computedStyle.opacity,
              height: computedStyle.height,
              position: computedStyle.position,
              zIndex: computedStyle.zIndex
            }
          });
        }
      });
    } else {
      console.log(`❌ No elements found matching ${selector}`);
    }
  });
  
  // Print summary
  console.log('%c📊 Visibility Diagnostic Summary', 'font-size: 14px; font-weight: bold; color: #2c3e50;');
  console.log(`Found: ${results.found} elements`);
  console.log(`Visible: ${results.visible} elements`);
  console.log(`Hidden: ${results.hidden} elements`);
  console.log(`Issues: ${results.issues.length}`);
  
  // Suggestions
  if (results.issues.length > 0) {
    console.log('%c🔧 Suggestions to Fix', 'font-size: 14px; font-weight: bold; color: #e67e22;');
    console.log('1. Run window.forceCategoryDisplay() to force all categories to display');
    console.log('2. Apply the following CSS fix:');
    
    // Generate CSS fix
    let cssFixCode = `
// Add this CSS to force visibility
const categoryFixStyle = document.createElement('style');
categoryFixStyle.textContent = \`
  /* Force category elements to be visible */
  .category-ribbon-container,
  .category-ribbon,
  .ribbon-category-container,
  .ribbon-category-card,
  [data-category-name],
  [data-testid="category-ribbon-visual"],
  [data-testid="category-ribbon-wrapper"],
  #category-ribbon-main-container,
  #llm-category-container,
  .modern-category-display {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: relative !important;
    z-index: 999 !important;
    height: auto !important;
    pointer-events: auto !important;
    min-height: 50px !important;
  }
\`;
document.head.appendChild(categoryFixStyle);
console.log('✅ Applied CSS fixes for category visibility');
`;
    console.log(cssFixCode);
  } else if (results.found === 0) {
    console.log('%c❌ No category elements found in the DOM!', 'font-size: 14px; font-weight: bold; color: #e74c3c;');
    console.log('Suggestions:');
    console.log('1. Make sure you have run a search to generate categories');
    console.log('2. Run window.injectEmergencyCategories() to force emergency categories');
  } else {
    console.log('%c✅ All category elements are visible!', 'font-size: 14px; font-weight: bold; color: #27ae60;');
  }
  
  return results;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkCategoryVisibility
  };
}

// Add global reference for browser use
if (typeof window !== 'undefined') {
  window.checkCategoryVisibility = checkCategoryVisibility;
  
  // Auto-execute after a short delay (if loaded in browser)
  setTimeout(() => {
    console.log('🔍 Running automated category visibility check...');
    const results = checkCategoryVisibility();
    window.categoryVisibilityResults = results;
    
    // Apply automatic fixes if issues are found
    if (results.issues.length > 0 && typeof window.forceCategoryDisplay === 'function') {
      console.log('🔧 Automatically applying fixes...');
      window.forceCategoryDisplay();
    }
  }, 3000);
}
