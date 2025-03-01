/**
 * Category processors module exports
 * Enhanced version with more robust exports
 */

import { 
  processCategories, 
  processCategory,
  createCategorizedContent 
} from './CategoryProcessor';

// Export named functions with better documentation
/**
 * Process content to extract and categorize into different categories
 * @param {Array} content The content to categorize
 * @param {string} query The search query
 * @param {Object} options Additional options
 * @returns {Array} Array of category objects with their content
 */
export { processCategories };

/**
 * Process a single category to include content and metrics
 * @param {Object} category The category to process
 * @param {Array} content Content items to include
 * @param {string} query The search query
 * @returns {Object} Processed category object
 */
export { processCategory };

/**
 * Alias for processCategories (backward compatibility)
 */
export { createCategorizedContent };

// Default export for backward compatibility
export default {
  processCategories,
  processCategory,
  createCategorizedContent
};