/**
 * MetricsCalculator.js
 * Integrates all individual metric calculators and provides overall scoring functionality.
 * Enhanced with improved weighting, context-aware scoring, and user preference integration.
 */

import calculateRelevanceScore from './calculators/RelevanceCalculator';
import calculateAccuracyScore from './calculators/AccuracyCalculator';
import calculateCredibilityScore from './calculators/CredibilityCalculator';
import { detectQueryContext, getContextWeights } from './utils/contextDetector';
import { DISPLAY_THRESHOLD, CONTEXT_WEIGHTS } from './utils/calculatorData';

// Minimum threshold for displaying results (70%)
const DISPLAY_THRESHOLD = DISPLAY_THRESHOLD;

// Default weights for different metrics
const DEFAULT_WEIGHTS = {
  RELEVANCE: 0.35,
  ACCURACY: 0.35,
  CREDIBILITY: 0.30
};

// Context-specific weights for different query types
const CONTEXT_WEIGHTS = CONTEXT_WEIGHTS;

/**
 * Calculate all metrics for a search result
 * @param {Object} result - The search result
 * @param {string} query - The search query
 * @param {Object} options - Additional options
 * @returns {Object} - Object containing all metrics
 */
export const calculateAllMetrics = (result, query, options = {}) => {
  if (!result) {
    return {
      relevance: 0,
      accuracy: 0,
      credibility: 0,
      overall: 0,
      passesThreshold: false
    };
  }

  // Determine query context for appropriate weighting
  const queryContext = detectQueryContext(query);
  const weights = queryContext ? getContextWeights(queryContext) : DEFAULT_WEIGHTS;
  
  // Apply user preferences if available
  const finalWeights = applyUserPreferences(weights, options.userPreferences);

  // Calculate individual metrics
  const relevanceScore = calculateRelevanceScore(result, query, options);
  const accuracyScore = calculateAccuracyScore(result, options);
  const credibilityScore = calculateCredibilityScore(result, options);

  // Calculate overall score with appropriate weights
  const overallScore = calculateOverallScore(
    relevanceScore,
    accuracyScore,
    credibilityScore,
    finalWeights
  );

  // Check if result passes threshold
  const passesThreshold = checkThresholds(relevanceScore, accuracyScore, credibilityScore, overallScore);

  return {
    relevance: relevanceScore,
    accuracy: accuracyScore,
    credibility: credibilityScore,
    overall: overallScore,
    passesThreshold,
    context: queryContext || 'GENERAL'
  };
};

/**
 * Apply user preferences to weights
 * @param {Object} weights - The base weights
 * @param {Object} userPreferences - User preferences
 * @returns {Object} - Adjusted weights
 */
const applyUserPreferences = (weights, userPreferences = {}) => {
  if (!userPreferences || !userPreferences.metricPreferences) {
    return weights;
  }
  
  const { metricPreferences } = userPreferences;
  const adjustedWeights = { ...weights };
  
  // Apply user's metric preferences if specified
  if (metricPreferences.RELEVANCE) {
    adjustedWeights.RELEVANCE = metricPreferences.RELEVANCE;
  }
  
  if (metricPreferences.ACCURACY) {
    adjustedWeights.ACCURACY = metricPreferences.ACCURACY;
  }
  
  if (metricPreferences.CREDIBILITY) {
    adjustedWeights.CREDIBILITY = metricPreferences.CREDIBILITY;
  }
  
  // Normalize weights to ensure they sum to 1
  const totalWeight = adjustedWeights.RELEVANCE + adjustedWeights.ACCURACY + adjustedWeights.CREDIBILITY;
  
  if (totalWeight !== 1) {
    adjustedWeights.RELEVANCE = adjustedWeights.RELEVANCE / totalWeight;
    adjustedWeights.ACCURACY = adjustedWeights.ACCURACY / totalWeight;
    adjustedWeights.CREDIBILITY = adjustedWeights.CREDIBILITY / totalWeight;
  }
  
  return adjustedWeights;
};

/**
 * Calculate overall score based on individual metrics and weights
 * @param {number} relevanceScore - Relevance score
 * @param {number} accuracyScore - Accuracy score
 * @param {number} credibilityScore - Credibility score
 * @param {Object} weights - Weights for each metric
 * @returns {number} - Overall score
 */
const calculateOverallScore = (relevanceScore, accuracyScore, credibilityScore, weights) => {
  // Calculate weighted average
  const overallScore = (
    (relevanceScore * weights.RELEVANCE) +
    (accuracyScore * weights.ACCURACY) +
    (credibilityScore * weights.CREDIBILITY)
  );
  
  // Round to nearest integer
  return Math.round(overallScore);
};

/**
 * Check if a result passes all thresholds
 * @param {number} relevanceScore - Relevance score
 * @param {number} accuracyScore - Accuracy score
 * @param {number} credibilityScore - Credibility score
 * @param {number} overallScore - Overall score
 * @returns {boolean} - Whether the result passes thresholds
 */
const checkThresholds = (relevanceScore, accuracyScore, credibilityScore, overallScore) => {
  // All individual scores must be at least 70%
  const passesIndividualThresholds = 
    relevanceScore >= DISPLAY_THRESHOLD &&
    accuracyScore >= DISPLAY_THRESHOLD &&
    credibilityScore >= DISPLAY_THRESHOLD;
  
  // Overall score must be at least 70%
  const passesOverallThreshold = overallScore >= DISPLAY_THRESHOLD;
  
  return passesIndividualThresholds && passesOverallThreshold;
};

/**
 * Get color for a metric based on its score
 * @param {number} score - Metric score
 * @returns {string} - CSS color class
 */
export const getMetricColor = (score) => {
  if (score >= 90) {
    return 'excellent'; // Green
  } else if (score >= 80) {
    return 'good'; // Blue
  } else if (score >= 70) {
    return 'acceptable'; // Yellow
  } else {
    return 'poor'; // Red
  }
};

/**
 * Get label for a metric based on its score
 * @param {number} score - Metric score
 * @returns {string} - Text label
 */
export const getMetricLabel = (score) => {
  if (score >= 90) {
    return 'Excellent';
  } else if (score >= 80) {
    return 'Good';
  } else if (score >= 70) {
    return 'Acceptable';
  } else {
    return 'Poor';
  }
};

/**
 * Filter results based on metric thresholds
 * @param {Array} results - Array of search results with metrics
 * @returns {Array} - Filtered results
 */
export const filterResultsByMetrics = (results) => {
  if (!results || !Array.isArray(results)) {
    return [];
  }
  
  return results.filter(result => result.metrics && result.metrics.passesThreshold);
};

/**
 * Sort results based on metrics
 * @param {Array} results - Array of search results with metrics
 * @param {string} sortBy - Metric to sort by ('overall', 'relevance', 'accuracy', 'credibility')
 * @returns {Array} - Sorted results
 */
export const sortResultsByMetrics = (results, sortBy = 'overall') => {
  if (!results || !Array.isArray(results)) {
    return [];
  }
  
  return [...results].sort((a, b) => {
    if (!a.metrics) return 1;
    if (!b.metrics) return -1;
    
    return b.metrics[sortBy] - a.metrics[sortBy];
  });
};

export default {
  calculateAllMetrics,
  getMetricColor,
  getMetricLabel,
  filterResultsByMetrics,
  sortResultsByMetrics
};