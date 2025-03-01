/**
 * Base category functionality for search result categories
 * Provides standard methods and properties for all category types
 */

/**
 * CategoryBase class with standard functionality
 */
export class CategoryBase {
  /**
   * Create a new CategoryBase instance
   * @param {Object} options Configuration options for the category
   */
  constructor(options = {}) {
    this.id = options.id || 'unknown-category';
    this.name = options.name || 'Unknown Category';
    this.description = options.description || '';
    this.color = options.color || '#6c757d'; // Default color (gray)
    this.icon = options.icon || 'folder';
    this.priority = options.priority !== undefined ? options.priority : 5; // Default priority (lower = higher priority)
    this.keywords = options.keywords || [];
    this.alwaysEvaluate = options.alwaysEvaluate || false;
    
    // Optional custom methods
    if (typeof options.formatContent === 'function') this.formatContent = options.formatContent;
    if (typeof options.getScore === 'function') this.getScore = options.getScore;
    
    // Debug mode
    this.debug = options.debug || false;
  }
  
  /**
   * Format content for this category (default implementation)
   * @param {string} content Content to format
   * @returns {string} Formatted content
   */
  formatContent(content) {
    if (!content || typeof content !== 'string') return '';
    return content;
  }
  
  /**
   * Calculate relevance score for this category based on content (default implementation)
   * @param {string} content Content to score
   * @param {string} query Search query
   * @returns {number} Relevance score (0-100)
   */
  getScore(content, query = '') {
    if (!content || typeof content !== 'string') return 0;
    
    // Basic scoring based on keyword matching
    let keywordMatches = 0;
    
    this.keywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    });
    
    // Calculate percentage of keywords matched
    const keywordMatchPercentage = this.keywords.length > 0 
      ? (keywordMatches / this.keywords.length) * 100 
      : 0;
    
    // Include query relevance if provided
    let queryRelevance = 0;
    if (query) {
      const queryTerms = query.toLowerCase().split(/\s+/);
      const queryMatchCount = queryTerms.filter(term => 
        content.toLowerCase().includes(term) && term.length > 2
      ).length;
      
      queryRelevance = queryTerms.length > 0 
        ? (queryMatchCount / queryTerms.length) * 100 
        : 0;
    }
    
    // Combine scores
    const baseScore = query 
      ? (keywordMatchPercentage * 0.7) + (queryRelevance * 0.3)
      : keywordMatchPercentage;
    
    // Ensure minimum score of 50 if any keywords match
    return keywordMatches > 0 ? Math.max(50, baseScore) : baseScore;
  }
  
  /**
   * Check if this category is relevant to the content
   * @param {string} content Content to check
   * @param {string} query Search query
   * @param {number} threshold Minimum score threshold (0-100)
   * @returns {boolean} True if category is relevant
   */
  isRelevant(content, query = '', threshold = 70) {
    const score = this.getScore(content, query);
    return score >= threshold;
  }
  
  /**
   * Get all information about this category's relevance to content
   * @param {string} content Content to evaluate
   * @param {string} query Search query
   * @returns {Object} Result with category details and relevance information
   */
  evaluate(content, query = '') {
    const score = this.getScore(content, query);
    
    const result = {
      id: this.id,
      name: this.name,
      description: this.description,
      color: this.color,
      icon: this.icon,
      priority: this.priority,
      score,
      relevant: score >= 70,
      formattedContent: this.formatContent(content)
    };
    
    if (this.debug) {
      console.log(`Category evaluation for ${this.name}:`, {
        score,
        relevant: result.relevant,
        contentPreview: content ? content.substring(0, 100) + '...' : 'No content'
      });
    }
    
    return result;
  }
  
  /**
   * Create a CategoryBase from a category definition object
   * @param {Object} categoryObj Category definition object
   * @returns {CategoryBase} New CategoryBase instance
   */
  static fromObject(categoryObj) {
    return new CategoryBase(categoryObj);
  }
}

/**
 * Create a standard category object
 * @param {string} id Category ID
 * @param {string} name Display name
 * @param {string} description Category description
 * @param {Array} keywords Keywords for matching
 * @param {Object} options Additional options
 * @returns {Object} Category definition object
 */
export const createCategory = (id, name, description, keywords, options = {}) => {
  return {
    id,
    name,
    description,
    keywords,
    color: options.color || '#6c757d',
    icon: options.icon || 'folder',
    priority: options.priority !== undefined ? options.priority : 5,
    formatContent: options.formatContent,
    getScore: options.getScore,
    alwaysEvaluate: options.alwaysEvaluate || false
  };
};

// Export default for backward compatibility
export default {
  CategoryBase,
  createCategory
};
