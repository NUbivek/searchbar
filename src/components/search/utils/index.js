/**
 * Search utilities module exports
 */

// Import specific utilities
import { 
  extractKeyPoints,
  extractKeyNumbers,
  extractHyperlinkTerms,
  extractBusinessInsights
} from './contentExtractor';

import { 
  detectQueryContext,
  isBusinessQuery,
  isTechnicalQuery,
  isFinancialQuery,
  isMedicalQuery
} from './contextDetector';

// Named exports for specific utilities
export {
  // From contentExtractor
  extractKeyPoints,
  extractKeyNumbers,
  extractHyperlinkTerms,
  extractBusinessInsights,
  
  // From contextDetector
  detectQueryContext,
  isBusinessQuery,
  isTechnicalQuery,
  isFinancialQuery,
  isMedicalQuery
};

// Re-export other utility modules
export * from './extractors';
export * from './formatters';
export * from './calculatorUtils';
export * from './dataExtractor';

// Default export for backward compatibility
export default {
  // Content extraction
  extractKeyPoints,
  extractKeyNumbers,
  extractHyperlinkTerms,
  extractBusinessInsights,
  
  // Context detection
  detectQueryContext,
  isBusinessQuery,
  isTechnicalQuery,
  isFinancialQuery,
  isMedicalQuery
};