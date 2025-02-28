/**
 * Categories module exports
 */

// Import main components
import CategoryDisplay from './CategoryDisplay';
import CategoryContent from './CategoryContent';
import EnhancedCategoryDisplay from './EnhancedCategoryDisplay';
import DynamicCategorizer from './DynamicCategorizer';

// Import processors
import { 
  processCategories, 
  processCategory,
  createCategorizedContent 
} from './processors';

// Import display components
import { 
  CategoryTabs,
  BusinessMetricsDisplay,
  EnhancedCategoryContent,
  CategoryHeaderContent,
  CategorySummaryDisplay,
  CategoryCard,
  BulletPointDisplay,
  NumberHighlighter,
  BusinessInsightsDisplay,
  CategoryMetricsDisplay
} from './display';

// Import utilities
import {
  extractCategoryInsights,
  categorizeBusinessInsights,
  getCategoryColor,
  getCategoryIcon
} from './utils';

// Import metrics
import {
  calculateCategoryMetrics,
  meetsThreshold
} from './metrics';

// Export all components and utilities
export {
  // Main components
  CategoryDisplay,
  CategoryContent,
  EnhancedCategoryDisplay,
  DynamicCategorizer,
  
  // Processors
  processCategories,
  processCategory,
  createCategorizedContent,
  
  // Display components
  CategoryTabs,
  BusinessMetricsDisplay,
  EnhancedCategoryContent,
  CategoryHeaderContent,
  CategorySummaryDisplay,
  CategoryCard,
  BulletPointDisplay,
  NumberHighlighter,
  BusinessInsightsDisplay,
  CategoryMetricsDisplay,
  
  // Utilities
  extractCategoryInsights,
  categorizeBusinessInsights,
  getCategoryColor,
  getCategoryIcon,
  
  // Metrics
  calculateCategoryMetrics,
  meetsThreshold
};

// Default export for backward compatibility
export default {
  CategoryDisplay,
  CategoryContent,
  EnhancedCategoryDisplay,
  DynamicCategorizer,
  processCategories,
  processCategory
};