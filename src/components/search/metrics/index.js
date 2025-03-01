/**
 * Metrics module index
 * Exports all metrics-related functionality
 */

// Main calculator
import MetricsCalculator from './MetricsCalculator';

// Individual metric calculators
import calculateRelevanceScore from './calculators/RelevanceCalculator';
import calculateAccuracyScore from './calculators/AccuracyCalculator';
import calculateCredibilityScore from './calculators/CredibilityCalculator';
import calculateBusinessMetrics from './calculators/BusinessMetricsCalculator';
import calculateRecency from './calculators/RecencyCalculator';

// New unified calculator
import { calculateMetrics, DEFAULT_METRICS } from './calculators';

// Display components
import MetricsDisplay from './MetricsDisplay';

// Export everything
export {
  // Main calculator
  MetricsCalculator as default,
  
  // Individual calculators
  calculateRelevanceScore,
  calculateAccuracyScore,
  calculateCredibilityScore,
  calculateBusinessMetrics,
  calculateRecency,
  
  // New unified calculator
  calculateMetrics,
  DEFAULT_METRICS,
  
  // Display components
  MetricsDisplay
};