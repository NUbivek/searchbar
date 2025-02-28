/**
 * Category types module exports
 */

import { 
  getDefaultCategories, 
  getCategoriesByKeywords,
  CATEGORY_TYPES
} from './DefaultCategories';

// Export all category type functions and constants
export {
  getDefaultCategories,
  getCategoriesByKeywords,
  CATEGORY_TYPES
};

// Default export for backward compatibility
export default {
  getDefaultCategories,
  getCategoriesByKeywords,
  CATEGORY_TYPES
};