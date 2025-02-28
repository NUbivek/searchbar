/**
 * Category processors module exports
 */

import { 
  processCategories, 
  processCategory,
  createCategorizedContent 
} from './CategoryProcessor';

// Export named functions
export {
  processCategories,
  processCategory,
  createCategorizedContent
};

// Default export for backward compatibility
export default {
  processCategories,
  processCategory,
  createCategorizedContent
};