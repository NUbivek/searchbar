/**
 * Utility functions for category processing and display
 */

/**
 * Get a color for a category based on its type
 * @param {string} categoryType The category type
 * @returns {string} Color hex code
 */
export const getCategoryColor = (categoryType) => {
  switch (categoryType) {
    case 'business':
      return '#1976d2'; // Blue
    case 'technical':
      return '#2e7d32'; // Green
    case 'news':
      return '#d32f2f'; // Red
    case 'academic':
      return '#7b1fa2'; // Purple
    case 'financial':
      return '#0097a7'; // Cyan
    case 'market':
      return '#ff9800'; // Orange
    case 'analysis':
      return '#5d4037'; // Brown
    default:
      return '#0066cc'; // Default blue
  }
};

/**
 * Get an icon for a category based on its type
 * @param {string} categoryType The category type
 * @returns {string} Icon name (Font Awesome)
 */
export const getCategoryIcon = (categoryType) => {
  switch (categoryType) {
    case 'business':
      return 'briefcase';
    case 'technical':
      return 'code';
    case 'news':
      return 'newspaper';
    case 'academic':
      return 'graduation-cap';
    case 'financial':
      return 'chart-line';
    case 'market':
      return 'store';
    case 'analysis':
      return 'chart-bar';
    default:
      return 'info-circle';
  }
};

/**
 * Calculate metrics for a category based on its content
 * @param {Object} category The category
 * @returns {Object} Metrics object with relevance, accuracy, and credibility
 */
export const calculateCategoryMetrics = (category) => {
  if (!category || !Array.isArray(category.content) || category.content.length === 0) {
    return { relevance: 0, accuracy: 0, credibility: 0 };
  }
  
  try {
    // Calculate average metrics from content items
    let relevanceSum = 0;
    let accuracySum = 0;
    let credibilitySum = 0;
    let itemsWithMetrics = 0;
    
    category.content.forEach(item => {
      if (!item || typeof item !== 'object') return;
      
      // Check for metrics object
      if (item._metrics && typeof item._metrics === 'object') {
        relevanceSum += typeof item._metrics.relevance === 'number' ? item._metrics.relevance : 0;
        accuracySum += typeof item._metrics.accuracy === 'number' ? item._metrics.accuracy : 0;
        credibilitySum += typeof item._metrics.credibility === 'number' ? item._metrics.credibility : 0;
        itemsWithMetrics++;
      } 
      // Check for individual metric scores
      else {
        if (typeof item._relevanceScore === 'number') {
          relevanceSum += item._relevanceScore;
          itemsWithMetrics++;
        }
        if (typeof item._accuracyScore === 'number') {
          accuracySum += item._accuracyScore;
          itemsWithMetrics++;
        }
        if (typeof item._credibilityScore === 'number') {
          credibilitySum += item._credibilityScore;
          itemsWithMetrics++;
        }
      }
    });
    
    // Calculate averages
    const divisor = Math.max(1, itemsWithMetrics);
    return {
      relevance: Math.round(relevanceSum / divisor),
      accuracy: Math.round(accuracySum / divisor),
      credibility: Math.round(credibilitySum / divisor)
    };
  } catch (error) {
    console.error('Error calculating category metrics:', error);
    return { relevance: 0, accuracy: 0, credibility: 0 };
  }
};

/**
 * Get key terms for a category type
 * @param {string} categoryType The category type
 * @returns {Array<string>} Array of key terms
 */
export const getKeyTermsForCategory = (categoryType) => {
  switch (categoryType) {
    case 'business':
      return ['revenue', 'profit', 'market', 'growth', 'strategy', 'company', 'business', 'industry'];
    case 'technical':
      return ['technology', 'software', 'hardware', 'algorithm', 'system', 'platform', 'development'];
    case 'news':
      return ['announced', 'reported', 'released', 'launched', 'unveiled', 'today', 'recently'];
    case 'academic':
      return ['research', 'study', 'analysis', 'findings', 'paper', 'theory', 'hypothesis'];
    case 'financial':
      return ['investment', 'stock', 'market', 'financial', 'earnings', 'revenue', 'profit'];
    case 'market_analysis':
      return ['market', 'trend', 'growth', 'demand', 'forecast', 'segment', 'opportunity', 'consumer'];
    case 'financial_data':
      return ['revenue', 'profit', 'margin', 'earnings', 'financial', 'quarterly', 'fiscal', 'balance'];
    case 'company_info':
      return ['company', 'organization', 'business', 'leadership', 'founded', 'headquarters', 'employees'];
    case 'industry_trends':
      return ['industry', 'sector', 'trend', 'disruption', 'innovation', 'growth', 'emerging'];
    case 'investment_strategies':
      return ['investment', 'portfolio', 'strategy', 'return', 'risk', 'asset', 'allocation', 'diversification'];
    case 'economic_indicators':
      return ['economic', 'gdp', 'inflation', 'unemployment', 'interest', 'rates', 'economy', 'recession'];
    case 'regulatory_info':
      return ['regulation', 'compliance', 'legal', 'policy', 'law', 'regulatory', 'legislation', 'guidelines'];
    default:
      return ['important', 'significant', 'key', 'major', 'critical', 'essential', 'primary'];
  }
};

/**
 * Check if a category is business-related based on its name
 * @param {string} categoryName The category name
 * @returns {boolean} Whether the category is business-related
 */
export const isBusinessCategory = (categoryName) => {
  if (!categoryName || typeof categoryName !== 'string') return false;
  
  const businessTerms = [
    'business', 'financial', 'market', 'economic', 
    'company', 'industry', 'corporate', 'investment'
  ];
  
  const lowerName = categoryName.toLowerCase();
  return businessTerms.some(term => lowerName.includes(term));
};

/**
 * Filter out duplicate content items from a category
 * @param {Array} content Array of content items
 * @returns {Array} Filtered array with duplicates removed
 */
export const filterDuplicateContent = (content) => {
  if (!Array.isArray(content)) return [];
  
  const uniqueContent = [];
  const seenUrls = new Set();
  const seenTitles = new Set();
  
  content.forEach(item => {
    // Skip invalid items
    if (!item || typeof item !== 'object') return;
    
    // Create unique identifiers
    const itemUrl = typeof item.url === 'string' ? item.url.trim() : 
                   typeof item.link === 'string' ? item.link.trim() : '';
    const itemTitle = typeof item.title === 'string' ? item.title.trim() : '';
    
    // Skip if we've seen this URL or title before (only if they're not empty)
    if ((itemUrl && seenUrls.has(itemUrl)) || 
        (itemTitle && itemTitle.length > 5 && seenTitles.has(itemTitle))) {
      return;
    }
    
    // Add to seen sets
    if (itemUrl) seenUrls.add(itemUrl);
    if (itemTitle && itemTitle.length > 5) seenTitles.add(itemTitle);
    
    // Add to unique content
    uniqueContent.push(item);
  });
  
  return uniqueContent;
};

/**
 * Sort content items by relevance and quality
 * @param {Array} content Array of content items
 * @returns {Array} Sorted array of content items
 */
export const sortContentByQuality = (content) => {
  if (!Array.isArray(content)) return [];
  
  return [...content].sort((a, b) => {
    // Skip if either item is invalid
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return 0;
    
    try {
      // If items have category scores, sort by that first
      if (typeof a._categoryScore === 'number' && typeof b._categoryScore === 'number') {
        return b._categoryScore - a._categoryScore;
      }
      
      // If items have relevance scores, sort by that
      if (typeof a._relevanceScore === 'number' && typeof b._relevanceScore === 'number') {
        const scoreA = a._relevanceScore;
        const scoreB = b._relevanceScore;
        
        // If scores are significantly different, use them
        if (Math.abs(scoreB - scoreA) > 10) {
          return scoreB - scoreA;
        }
      }
      
      // If items have overall scores, sort by that
      if (typeof a._overallScore === 'number' && typeof b._overallScore === 'number') {
        return b._overallScore - a._overallScore;
      }
      
      // If items have metrics objects, sort by overall score
      if (a._metrics && b._metrics && 
          typeof a._metrics === 'object' && typeof b._metrics === 'object') {
        const aOverall = typeof a._metrics.overall === 'number' ? a._metrics.overall : 0;
        const bOverall = typeof b._metrics.overall === 'number' ? b._metrics.overall : 0;
        return bOverall - aOverall;
      }
      
      // Secondary sorting factors
      
      // 1. Prefer items with titles
      const hasTitleA = a.title && typeof a.title === 'string' && a.title.trim().length > 0;
      const hasTitleB = b.title && typeof b.title === 'string' && b.title.trim().length > 0;
      
      if (hasTitleA && !hasTitleB) return -1;
      if (!hasTitleA && hasTitleB) return 1;
      
      // 2. Prefer items with descriptions
      const hasDescA = a.description && typeof a.description === 'string' && a.description.trim().length > 0;
      const hasDescB = b.description && typeof b.description === 'string' && b.description.trim().length > 0;
      
      if (hasDescA && !hasDescB) return -1;
      if (!hasDescA && hasDescB) return 1;
      
      // 3. Prefer items with more content
      const contentLengthA = typeof a.content === 'string' ? a.content.length : 
                            (typeof a.description === 'string' ? a.description.length : 0);
      const contentLengthB = typeof b.content === 'string' ? b.content.length : 
                            (typeof b.description === 'string' ? b.description.length : 0);
      
      if (contentLengthA > contentLengthB) return -1;
      if (contentLengthA < contentLengthB) return 1;
      
      // Default sort by position in array
      return 0;
    } catch (error) {
      console.error('Error sorting content items:', error);
      return 0;
    }
  });
};
