/**
 * Metrics module index
 * Exports all metrics-related functionality
 */

// Main calculator
import MetricsCalculator, { 
  calculateMetrics, 
  getMetricColor, 
  getMetricLabel 
} from './MetricsCalculator';

// Individual metric calculators
import calculateRelevanceScore from './calculators/RelevanceCalculator';
import calculateAccuracyScore from './calculators/AccuracyCalculator';
import calculateCredibilityScore from './calculators/CredibilityCalculator';

// Display components
import MetricsDisplay from './MetricsDisplay';

// Export everything
export {
  // Main calculator
  MetricsCalculator as default,
  calculateMetrics,
  getMetricColor,
  getMetricLabel,
  
  // Individual calculators
  calculateRelevanceScore,
  calculateAccuracyScore,
  calculateCredibilityScore,
  
  // Display components
  MetricsDisplay
};