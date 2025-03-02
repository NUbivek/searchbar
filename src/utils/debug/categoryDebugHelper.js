/**
 * Category Debug Helper
 * 
 * Provides utilities for debugging category display issues
 */

// Debug log function that's easy to identify in the console
export function logCategoryDebug(message, data) {
  console.log(`🔍 CATEGORY DEBUG: ${message}`, data || '');
}

// Log category state at different points in the flow
export function logCategoryState(location, categories = [], options = {}) {
  const count = Array.isArray(categories) ? categories.length : 0;
  const names = Array.isArray(categories) 
    ? categories.map(c => c.name || 'Unnamed').join(', ')
    : 'None';
  
  logCategoryDebug(`[${location}] Found ${count} categories: ${names}`);
  
  // Log additional details if provided
  if (options.details) {
    logCategoryDebug(`[${location}] Details:`, options.details);
  }
  
  return { count, names };
}

// Add debug attributes to any component
export function withCategoryDebugAttributes(props = {}, categories = []) {
  return {
    ...props,
    'data-category-count': Array.isArray(categories) ? categories.length : 0,
    'data-has-categories': Array.isArray(categories) && categories.length > 0 ? 'true' : 'false',
    'data-category-names': Array.isArray(categories) 
      ? categories.map(c => c.name || 'Unnamed').join(',') 
      : '',
    'data-debug-timestamp': new Date().getTime()
  };
}

// Check if we're in a search context
function isInSearchContext() {
  if (typeof window === 'undefined') return false;
  
  // Check for URL parameters indicating a search
  const urlHasSearch = window.location.search.includes('query=') || 
                       window.location.search.includes('q=');
                       
  // Check for search results in the DOM
  const domHasSearchResults = document.querySelector('.search-results-container') || 
                              document.querySelector('.intelligent-search-results');
                              
  // Check for categories in the page
  const hasCategories = document.querySelector('[data-categories-count]') || 
                        document.querySelector('[data-category-id]');
                        
  return urlHasSearch || (domHasSearchResults && hasCategories);
}

// Display helper for categories - only operates during search
export function enhanceCategoryVisibility(element) {
  if (!element) return;
  
  // Only enhance visibility if in a search context
  if (!isInSearchContext()) {
    console.log('🔍 Not in search context - skipping visibility enhancement');
    return;
  }
  
  // Force essential styles
  const styles = {
    display: 'block !important',
    visibility: 'visible !important',
    opacity: '1 !important',
    position: 'relative !important',
    zIndex: '900 !important'
  };
  
  // Apply styles
  Object.keys(styles).forEach(key => {
    element.style[key] = styles[key];
  });
  
  // Mark as enhanced for debugging
  element.setAttribute('data-visibility-enhanced', 'true');
  element.setAttribute('data-enhanced-timestamp', Date.now());
}

// Create a global utility object
if (typeof window !== 'undefined') {
  window.categoryDebug = {
    logState: logCategoryState,
    enhanceVisibility: enhanceCategoryVisibility,
    log: logCategoryDebug
  };
}

export default {
  logCategoryDebug,
  logCategoryState,
  withCategoryDebugAttributes,
  enhanceCategoryVisibility
};
