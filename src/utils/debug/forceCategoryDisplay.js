/**
 * Force Category Display Utility
 * 
 * This script provides utility functions to force the display of categories
 * in the LLM results section when they are not appearing naturally.
 * 
 * Usage from console:
 * 1. Run window.forceCategoryDisplay() to attempt to show categories
 * 2. Run window.diagnosticTools.inspectCategories() to get info about categories
 */

// Create diagnostic namespace
window.diagnosticTools = window.diagnosticTools || {};

/**
 * Force the display of categories by directly interacting with the DOM
 */
window.forceCategoryDisplay = function() {
  console.log('🔍 Attempting to force category display...');
  
  // 1. Check if categories exist in global storage
  const categories = 
    window.__globalCategoryStorage?.categories || 
    window.__intelligentSearchCategories ||
    window.__allCategories || 
    window.__categoryCaptureSystem?.categories || 
    [];
  
  if (!Array.isArray(categories) || categories.length === 0) {
    console.error('❌ No categories found in global storage!');
    return;
  }
  
  console.log(`✅ Found ${categories.length} categories in global storage:`, 
    categories.map(c => c.name || 'Unnamed'));
  
  // 2. Look for LLM results container
  const llmContainers = document.querySelectorAll('[data-testid="llm-results-container"]');
  if (llmContainers.length === 0) {
    console.error('❌ No LLM results containers found in the DOM');
    return;
  }
  
  console.log(`✅ Found ${llmContainers.length} LLM results containers`);
  
  // 3. Check if category tabs already exist
  const existingTabs = document.querySelectorAll('[data-testid="llm-category-tabs"]');
  console.log(`Found ${existingTabs.length} existing category tab elements`);
  
  // 4. Force display on existing tabs
  if (existingTabs.length > 0) {
    existingTabs.forEach(tab => {
      tab.style.display = 'block !important';
      tab.style.visibility = 'visible !important';
      tab.style.opacity = '1 !important';
      tab.style.zIndex = '9999 !important';
      tab.style.position = 'relative !important';
      tab.style.pointerEvents = 'auto !important';
      
      console.log('✅ Enhanced visibility of existing category tabs');
    });
  }
  
  // 5. Manually trigger category display in React components
  if (typeof window.React !== 'undefined' && typeof window.ReactDOM !== 'undefined') {
    console.log('🔄 Attempting to trigger React component updates');
    // This is a gentle prod to React to update components
    const event = new Event('react-force-update');
    window.dispatchEvent(event);
  }
  
  console.log('✅ Category display enforcement complete');
  console.log('👉 If categories are still not visible, try refreshing the page');
};

/**
 * Inspect and log information about categories in the system
 */
window.diagnosticTools.inspectCategories = function() {
  console.log('🔍 Inspecting category system...');
  
  // 1. Check all global storages
  const storages = {
    '__globalCategoryStorage': window.__globalCategoryStorage,
    '__intelligentSearchCategories': window.__intelligentSearchCategories,
    '__allCategories': window.__allCategories,
    '__categoryCaptureSystem': window.__categoryCaptureSystem
  };
  
  for (const [key, storage] of Object.entries(storages)) {
    console.log(`${key}:`, storage ? 'exists' : 'missing');
    if (storage && storage.categories) {
      console.log(`  - Categories: ${storage.categories.length}`);
      console.log(`  - Names: ${storage.categories.map(c => c.name || 'Unnamed').join(', ')}`);
    }
  }
  
  // 2. Check DOM elements
  const categoryElements = {
    'LLM Category Tabs': document.querySelectorAll('[data-testid="llm-category-tabs"]'),
    'Category Ribbons': document.querySelectorAll('[data-testid^="category-ribbon"]'),
    'LLM Results Containers': document.querySelectorAll('[data-testid="llm-results-container"]'),
    'Category Items': document.querySelectorAll('[data-category-id]'),
    'Hidden Category Data': document.getElementById('hidden-categories-data')
  };
  
  for (const [key, elements] of Object.entries(categoryElements)) {
    if (elements instanceof NodeList) {
      console.log(`${key}: ${elements.length} found`);
      if (elements.length > 0) {
        console.log('  - First element:', elements[0]);
      }
    } else if (elements) {
      console.log(`${key}: found`);
      console.log('  - Element:', elements);
    } else {
      console.log(`${key}: not found`);
    }
  }
  
  // 3. Check computed styles of existing elements
  const categoryTabs = document.getElementById('llm-category-tabs-container');
  if (categoryTabs) {
    const styles = window.getComputedStyle(categoryTabs);
    console.log('Category tabs computed styles:');
    console.log(`  - display: ${styles.display}`);
    console.log(`  - visibility: ${styles.visibility}`);
    console.log(`  - opacity: ${styles.opacity}`);
    console.log(`  - z-index: ${styles.zIndex}`);
    console.log(`  - position: ${styles.position}`);
  }
  
  console.log('✅ Category inspection complete');
};

// Auto-run diagnostics on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    console.log('🚀 Category display diagnostics loaded and ready');
    console.log('👉 Run window.forceCategoryDisplay() to manually trigger category display');
    console.log('👉 Run window.diagnosticTools.inspectCategories() to inspect the category system');
  }, 2000);
}

export default {
  forceCategoryDisplay: window.forceCategoryDisplay,
  inspectCategories: window.diagnosticTools.inspectCategories
};
