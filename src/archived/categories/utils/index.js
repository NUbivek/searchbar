/**
 * Category utilities module exports
 */

import { 
  getCategoryColor, 
  getCategoryIcon, 
  getKeyTermsForCategory,
  isBusinessCategory,
  filterDuplicateContent,
  sortContentByQuality,
  calculateCategoryMetrics
} from './categoryUtils';

import {
  extractCategoryInsights,
  categorizeBusinessInsights
} from './categoryInsights';

// Export all utility functions
export {
  // From categoryUtils
  getCategoryColor,
  getCategoryIcon,
  getKeyTermsForCategory,
  isBusinessCategory,
  filterDuplicateContent,
  sortContentByQuality,
  calculateCategoryMetrics,
  
  // From categoryInsights
  extractCategoryInsights,
  categorizeBusinessInsights
};

// Default export for backward compatibility
export default {
  getCategoryColor,
  getCategoryIcon,
  getKeyTermsForCategory,
  isBusinessCategory,
  filterDuplicateContent,
  sortContentByQuality,
  calculateCategoryMetrics,
  extractCategoryInsights,
  categorizeBusinessInsights
};