/**
 * CategoryMetricsCalculator.js
 * Calculates relevance, credibility, and accuracy metrics for categories.
 */

// Import from main metrics calculator
import MetricsCalculator from '../../metrics/MetricsCalculator';

// Minimum threshold for metrics (70%)
const MIN_THRESHOLD = 70;

/**
 * Calculate all metrics for a category
 * @param {Object} category - The category object with content
 * @param {string} query - The search query
 * @returns {Object} Object with relevance, credibility, accuracy, and overall scores
 */
export const calculateCategoryMetrics = (category, query = '') => {
  if (!category || !category.content || category.content.length === 0) {
    return {
      relevance: 0,
      credibility: 0,
      accuracy: 0,
      overall: 0
    };
  }

  // Create a combined result object for metrics calculation
  const combinedResult = {
    content: category.content.map(item => item.content).join('\n\n'),
    title: category.name,
    sources: extractSources(category.content)
  };

  // Calculate base metrics
  let relevance = MetricsCalculator.calculateRelevance(combinedResult, query);
  let credibility = MetricsCalculator.calculateCredibility(combinedResult);
  let accuracy = MetricsCalculator.calculateAccuracy(combinedResult);

  // Apply query-specific relevance boosting
  relevance = applyQueryRelevanceBoost(relevance, category, query);
  
  // Apply category-specific adjustments
  const adjustedMetrics = applyCategorySpecificAdjustments(
    { relevance, credibility, accuracy },
    category
  );

  // Apply relevance-first weighting (2x multiplier for relevance)
  const weightedRelevance = adjustedMetrics.relevance * 2;
  const weightedCredibility = adjustedMetrics.credibility;
  const weightedAccuracy = adjustedMetrics.accuracy;
  
  // Calculate overall score with weighted relevance
  const overall = Math.round((weightedRelevance + weightedCredibility + weightedAccuracy) / 4);

  return {
    relevance: Math.round(adjustedMetrics.relevance),
    credibility: Math.round(adjustedMetrics.credibility),
    accuracy: Math.round(adjustedMetrics.accuracy),
    overall
  };
};

/**
 * Extract sources from category content
 * @param {Array} content - Array of content items
 * @returns {Array} Array of sources
 */
const extractSources = (content) => {
  const sources = [];
  
  content.forEach(item => {
    if (item.sources && Array.isArray(item.sources)) {
      sources.push(...item.sources);
    }
  });
  
  // Remove duplicates
  return [...new Set(sources)];
};

/**
 * Apply query-specific relevance boosting
 * @param {number} baseRelevance - Base relevance score
 * @param {Object} category - The category object
 * @param {string} query - The search query
 * @returns {number} Boosted relevance score
 */
const applyQueryRelevanceBoost = (baseRelevance, category, query) => {
  if (!query || query.trim() === '') {
    return baseRelevance;
  }
  
  const normalizedQuery = query.toLowerCase();
  const categoryKeywords = category.keywords || [];
  
  // Check for direct keyword matches in query
  let keywordMatchCount = 0;
  for (const keyword of categoryKeywords) {
    if (normalizedQuery.includes(keyword.toLowerCase())) {
      keywordMatchCount++;
    }
  }
  
  // Calculate boost factor (0-0.3)
  const boostFactor = Math.min(0.3, keywordMatchCount * 0.1);
  
  // Apply boost (ensuring we don't exceed 100)
  return Math.min(100, baseRelevance * (1 + boostFactor));
};

/**
 * Apply category-specific adjustments to metrics
 * @param {Object} metrics - Base metrics object
 * @param {Object} category - The category object
 * @returns {Object} Adjusted metrics object
 */
const applyCategorySpecificAdjustments = (metrics, category) => {
  const { relevance, credibility, accuracy } = metrics;
  let adjustedRelevance = relevance;
  let adjustedCredibility = credibility;
  let adjustedAccuracy = accuracy;
  
  // Adjust based on category priority
  if (category.priority === 0) {
    // Key Insights gets a relevance boost
    adjustedRelevance = Math.min(100, relevance * 1.15);
  } else if (category.priority === 1) {
    // Broad categories get a small boost
    adjustedRelevance = Math.min(100, relevance * 1.05);
  }
  
  // Adjust based on category type
  switch (category.id) {
    case 'financial_performance':
    case 'valuation_benchmarking':
    case 'performance_metrics':
      // Financial categories get accuracy boost if they contain numbers
      if (containsNumbers(category.content)) {
        adjustedAccuracy = Math.min(100, accuracy * 1.1);
      }
      break;
      
    case 'market_intelligence':
    case 'market_overview':
    case 'industry_insights':
      // Market categories get credibility boost if they contain recent dates
      if (containsRecentDates(category.content)) {
        adjustedCredibility = Math.min(100, credibility * 1.1);
      }
      break;
      
    case 'risk_compliance':
    case 'sustainability_esg':
      // Compliance categories get credibility boost
      adjustedCredibility = Math.min(100, credibility * 1.05);
      break;
  }
  
  return {
    relevance: adjustedRelevance,
    credibility: adjustedCredibility,
    accuracy: adjustedAccuracy
  };
};

/**
 * Check if content contains numbers
 * @param {Array} content - Array of content items
 * @returns {boolean} True if content contains numbers
 */
const containsNumbers = (content) => {
  if (!content || !Array.isArray(content)) return false;
  
  const combinedContent = content.map(item => item.content).join(' ');
  
  // Check for numbers, percentages, currency values
  return /\d+%|\$\d+|\d+\.\d+|\b\d+\b/.test(combinedContent);
};

/**
 * Check if content contains recent dates
 * @param {Array} content - Array of content items
 * @returns {boolean} True if content contains recent dates
 */
const containsRecentDates = (content) => {
  if (!content || !Array.isArray(content)) return false;
  
  const combinedContent = content.map(item => item.content).join(' ');
  
  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Check for recent years (current or last year)
  return new RegExp(`\\b${currentYear}\\b|\\b${currentYear-1}\\b`).test(combinedContent);
};

/**
 * Check if all metrics meet the minimum threshold
 * @param {Object} metrics - Metrics object
 * @param {number} threshold - Threshold value (default: MIN_THRESHOLD)
 * @returns {boolean} True if all metrics meet the threshold
 */
export const meetsThreshold = (metrics, threshold = MIN_THRESHOLD) => {
  if (!metrics) return false;
  
  return (
    metrics.relevance >= threshold &&
    metrics.credibility >= threshold &&
    metrics.accuracy >= threshold
  );
};

export default {
  calculateCategoryMetrics,
  meetsThreshold,
  MIN_THRESHOLD
};
