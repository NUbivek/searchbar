/**
 * Metrics utilities exports
 */

// Import all utility functions
import { 
  detectQueryContext, 
  isBusinessQuery, 
  isTechnicalQuery, 
  isFinancialQuery 
} from './contextDetector';

import {
  calculateWeightedAverage,
  normalizeScore,
  applyBoost,
  applyPenalty
} from './calculatorUtils';

import {
  getBusinessCalculatorData,
  getBusinessWeights
} from './businessCalculatorData';

import {
  getCalculatorData,
  getDefaultWeights
} from './calculatorData';

// Export named functions
export {
  // Context detector
  detectQueryContext,
  isBusinessQuery,
  isTechnicalQuery,
  isFinancialQuery,
  
  // Calculator utilities
  calculateWeightedAverage,
  normalizeScore,
  applyBoost,
  applyPenalty,
  
  // Business calculator data
  getBusinessCalculatorData,
  getBusinessWeights,
  
  // General calculator data
  getCalculatorData,
  getDefaultWeights
};

// Default export for backward compatibility
export default {
  detectQueryContext,
  isBusinessQuery,
  isTechnicalQuery,
  isFinancialQuery,
  calculateWeightedAverage,
  normalizeScore,
  applyBoost,
  applyPenalty,
  getBusinessCalculatorData,
  getBusinessWeights,
  getCalculatorData,
  getDefaultWeights
};
