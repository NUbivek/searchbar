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
  createCategorizedContent,
  generateCategories
} from './processors/CategoryProcessor';

// Import category types
import { getSpecialCategories } from './types/SpecialCategories';
import { getBroadCategories } from './types/BroadCategories';
import { getSpecificCategories } from './types/SpecificCategories';

// Import category processors
import { findBestCategories } from './processors/CategoryFinder';
import { createDynamicCategoriesFromText } from './processors/DynamicCategorizer';
import { matchCategories } from './processors/CategoryMatcher';

// Import category metrics
import {
  calculateRelevanceScore,
  calculateCredibilityScore,
  calculateAccuracyScore,
  calculateCombinedScore
} from './processors/CategoryMetricsCalculator';

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
  generateCategories,
  
  // Category Types
  getSpecialCategories,
  getBroadCategories,
  getSpecificCategories,
  
  // Category Processors
  findBestCategories,
  createDynamicCategoriesFromText,
  matchCategories,
  
  // Category Metrics
  calculateRelevanceScore,
  calculateCredibilityScore,
  calculateAccuracyScore,
  calculateCombinedScore,
  
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