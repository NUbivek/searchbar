/**
 * Utility functions for category-related operations
 */

/**
 * Extract insights for a specific category from search results
 * @param {Array} results - Array of search results
 * @param {string} category - Category name
 * @param {string} query - Search query
 * @returns {Object} Extracted insights
 */
export const extractCategoryInsights = (results, category, query) => {
  if (!results || results.length === 0) {
    return {
      keyPoints: [],
      sources: []
    };
  }
  
  // Extract sources
  const sources = results
    .filter(result => result.source || result.link)
    .map(result => ({
      title: result.title || 'Unknown Source',
      url: result.link || '#',
      source: result.source || 'Unknown'
    }));
  
  // Extract key points (in a real implementation, this would be more sophisticated)
  const keyPoints = [
    `Found ${results.length} results related to ${category}`,
    results.length > 3 ? 'Multiple high-quality sources available' : 'Limited sources available',
    query.length > 10 ? 'Detailed query provides good context' : 'Consider adding more search terms'
  ];
  
  return {
    keyPoints,
    sources
  };
};

/**
 * Get color for a specific category
 * @param {string} category - Category name
 * @returns {string} Color identifier
 */
export const getCategoryColor = (category) => {
  const categoryMap = {
    financial: 'green',
    market: 'green',
    business: 'green',
    technology: 'blue',
    tech: 'blue',
    news: 'yellow',
    recent: 'yellow',
    academic: 'purple',
    research: 'purple',
    general: 'gray',
    other: 'gray'
  };
  
  return categoryMap[category.toLowerCase()] || 'gray';
};

/**
 * Get icon identifier for a specific category
 * @param {string} category - Category name
 * @returns {string} Icon identifier
 */
export const getCategoryIcon = (category) => {
  const categoryMap = {
    financial: 'chart',
    market: 'chart',
    business: 'briefcase',
    technology: 'computer',
    tech: 'computer',
    news: 'newspaper',
    recent: 'newspaper',
    academic: 'book',
    research: 'book',
    general: 'search',
    other: 'search'
  };
  
  return categoryMap[category.toLowerCase()] || 'search';
}; 