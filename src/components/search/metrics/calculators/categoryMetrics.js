/**
 * Utility functions for calculating category-specific metrics
 */

/**
 * Calculate metrics specific to a category of search results
 * @param {Array} results - Array of search results in the category
 * @param {string} category - The category name
 * @param {string} query - The search query
 * @returns {Object} Metrics object with relevance, accuracy, and credibility scores
 */
export const calculateCategoryMetrics = (results, category, query) => {
  // Default metrics
  const metrics = {
    relevance: 0.8,
    accuracy: 0.75,
    credibility: 0.7,
    overall: 0.75
  };
  
  // If no results, return zero metrics
  if (!results || results.length === 0) {
    return {
      relevance: 0,
      accuracy: 0,
      credibility: 0,
      overall: 0
    };
  }
  
  // In a real implementation, we would calculate these based on the results
  // For now, we'll return reasonable default values
  
  // Adjust metrics based on category
  switch (category.toLowerCase()) {
    case 'financial':
    case 'market':
    case 'investment':
      metrics.accuracy = 0.85;
      metrics.credibility = 0.9;
      break;
      
    case 'technology':
    case 'tech':
      metrics.relevance = 0.85;
      metrics.accuracy = 0.8;
      break;
      
    case 'news':
    case 'recent':
      metrics.relevance = 0.9;
      metrics.credibility = 0.75;
      break;
      
    case 'academic':
    case 'research':
      metrics.accuracy = 0.9;
      metrics.credibility = 0.85;
      break;
  }
  
  // Calculate overall score (weighted average)
  metrics.overall = (
    metrics.relevance * 0.4 + 
    metrics.accuracy * 0.35 + 
    metrics.credibility * 0.25
  ).toFixed(2);
  
  return metrics;
}; 