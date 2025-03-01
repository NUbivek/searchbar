/**
 * Base class for keyword-based categorization
 */

/**
 * KeywordBase class that provides common keyword matching functionality
 */
export class KeywordBase {
  /**
   * Create a new KeywordBase instance
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    this.category = options.category || 'general';
    this.highPriority = options.highPriority || [];
    this.mediumPriority = options.mediumPriority || [];
    this.lowPriority = options.lowPriority || [];
    this.debug = options.debug || false;
  }
  
  /**
   * Get all keywords combined into a single array
   * @returns {Array} All keywords
   */
  getAllKeywords() {
    return [
      ...this.highPriority,
      ...this.mediumPriority,
      ...this.lowPriority
    ];
  }
  
  /**
   * Check if text contains keywords from this category
   * @param {string} text Text to check
   * @returns {Object} Match results including score and matches
   */
  matches(text) {
    if (!text || typeof text !== 'string') {
      return { matched: false, score: 0, category: this.category };
    }
    
    const lowerText = text.toLowerCase();
    let score = 0;
    let matches = [];
    
    // Check high priority keywords (3x weight)
    this.highPriority.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 3;
        matches.push({ keyword, priority: 'high', weight: 3 });
      }
    });
    
    // Check medium priority keywords (2x weight)
    this.mediumPriority.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 2;
        matches.push({ keyword, priority: 'medium', weight: 2 });
      }
    });
    
    // Check low priority keywords (1x weight)
    this.lowPriority.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 1;
        matches.push({ keyword, priority: 'low', weight: 1 });
      }
    });
    
    if (this.debug && matches.length > 0) {
      console.log(`${this.category} matches:`, {
        matchCount: matches.length,
        score,
        top3: matches.slice(0, 3).map(m => m.keyword)
      });
    }
    
    return {
      matched: score > 0,
      score,
      matches,
      category: this.category
    };
  }
  
  /**
   * Create a KeywordBase instance from a keyword object
   * @param {Object} keywordObj Keyword object with high/medium/low priority arrays
   * @returns {KeywordBase} New KeywordBase instance
   */
  static fromObject(keywordObj, options = {}) {
    return new KeywordBase({
      category: keywordObj.category || options.category || 'unknown',
      highPriority: keywordObj.highPriority || [],
      mediumPriority: keywordObj.mediumPriority || [],
      lowPriority: keywordObj.lowPriority || [],
      debug: options.debug || false
    });
  }
}

// For backward compatibility
export default KeywordBase;