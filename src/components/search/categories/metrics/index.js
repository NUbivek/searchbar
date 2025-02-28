/**
 * Category metrics module exports
 */

import { 
  calculateCategoryMetrics,
  meetsThreshold,
  MIN_THRESHOLD
} from './CategoryMetricsCalculator';

// Export all category metrics functions
export {
  calculateCategoryMetrics,
  meetsThreshold,
  MIN_THRESHOLD
};

// Default export for backward compatibility
export default {
  calculateCategoryMetrics,
  meetsThreshold,
  MIN_THRESHOLD
};