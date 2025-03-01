/**
 * Utility for matching and scoring text against different keyword sets
 */

// Import keyword sets
import { BusinessKeywords } from './BusinessKeywords';
import { MarketKeywords } from './MarketKeywords';
import { FinancialKeywords } from './FinancialKeywords';

/**
 * KeywordMatcher class for evaluating text against different keyword categories
 */
export class KeywordMatcher {
  /**
   * Construct a new KeywordMatcher
   * @param {Object} options Options for the matcher
   */
  constructor(options = {}) {
    this.matchers = {
      business: BusinessKeywords,
      market: MarketKeywords,
      financial: FinancialKeywords,
      ...options.additionalMatchers
    };
    
    // Optional logging
    this.debug = options.debug || false;
  }
  
  /**
   * Match text against all keyword categories
   * @param {string} text Text to analyze
   * @returns {Object} Matching results for all categories
   */
  matchAll(text) {
    if (!text || typeof text !== 'string') {
      return { matched: false, categories: [] };
    }
    
    const results = {};
    let anyMatched = false;
    
    // Run all matchers
    Object.entries(this.matchers).forEach(([category, matcher]) => {
      if (typeof matcher.matches === 'function') {
        const result = matcher.matches(text);
        
        if (result.matched) {
          anyMatched = true;
          results[category] = result;
        }
      }
    });
    
    // Sort categories by score
    const sortedCategories = Object.entries(results)
      .sort((a, b) => b[1].score - a[1].score)
      .map(([category, result]) => ({
        category,
        score: result.score,
        matches: result.matches || []
      }));
    
    if (this.debug) {
      console.log('KeywordMatcher results:', {
        text: text.substring(0, 100) + '...',
        anyMatched,
        categories: sortedCategories.map(c => `${c.category} (${c.score})`).join(', ')
      });
    }
    
    return {
      matched: anyMatched,
      categories: sortedCategories,
      primaryCategory: sortedCategories.length > 0 ? sortedCategories[0].category : null,
      primaryScore: sortedCategories.length > 0 ? sortedCategories[0].score : 0
    };
  }
  
  /**
   * Match text against a specific category
   * @param {string} text Text to analyze
   * @param {string} category Category to match against
   * @returns {Object} Matching results for the specified category
   */
  matchCategory(text, category) {
    if (!text || typeof text !== 'string' || !category) {
      return { matched: false, score: 0 };
    }
    
    if (!this.matchers[category] || typeof this.matchers[category].matches !== 'function') {
      return { matched: false, score: 0, error: 'Invalid category' };
    }
    
    return this.matchers[category].matches(text);
  }
  
  /**
   * Get the primary category for a piece of text
   * @param {string} text Text to analyze
   * @returns {string} Primary category name or null if no match
   */
  getPrimaryCategory(text) {
    const results = this.matchAll(text);
    return results.primaryCategory;
  }
  
  /**
   * Static method to quickly match text against all categories
   * @param {string} text Text to analyze
   * @param {Object} options Options for the matcher
   * @returns {Object} Matching results
   */
  static match(text, options = {}) {
    const matcher = new KeywordMatcher(options);
    return matcher.matchAll(text);
  }
}

// For backward compatibility
export default KeywordMatcher;