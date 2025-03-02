/**
 * Matches content to appropriate categories
 * Provides utility functions for category matching and scoring
 */

import { KeywordMatcher } from '../keywords/KeywordMatcher';
import { 
  calculateRelevanceScore, 
  calculateCredibilityScore,
  calculateAccuracyScore,
  calculateCombinedScore
} from './CategoryMetricsCalculator';

/**
 * Match content to categories and rank them
 * @param {string} content Content to categorize
 * @param {Array} categories Available categories
 * @param {string} query Search query
 * @param {Array} sources Content sources
 * @param {Object} options Additional options
 * @returns {Array} Matched categories ranked by relevance
 */
export const matchCategories = (content, categories = [], query = '', sources = [], options = {}) => {
  if (!content || !categories || categories.length === 0) {
    return [];
  }
  
  const debug = options.debug || false;
  const keywordMatcher = new KeywordMatcher({ debug });
  
  if (debug) {
    console.log('CategoryMatcher: Matching content to', categories.length, 'categories');
    console.log('CategoryMatcher: Query:', query);
  }
  
  // Match content against all categories
  const matchedCategories = categories.map(category => {
    // Get keyword matches for the category
    const keywordMatches = matchKeywords(content, category.keywords || []);
    
    // Calculate metrics
    const relevanceScore = calculateRelevanceScore(content, query, options);
    const credibilityScore = calculateCredibilityScore(sources, options);
    const accuracyScore = calculateAccuracyScore(content, sources, options);
    const combinedScore = calculateCombinedScore(relevanceScore, credibilityScore, accuracyScore);
    
    // Calculate category-specific score (if available)
    const categoryScore = typeof category.getScore === 'function' 
      ? category.getScore(content, query) 
      : (keywordMatches.score * 20); // Default calculation based on keyword matches
    
    // Combine category-specific score with general metrics
    const finalScore = (combinedScore * 0.7) + (categoryScore * 0.3);
    
    return {
      ...category,
      keywordMatches,
      relevanceScore,
      credibilityScore,
      accuracyScore,
      combinedScore,
      categoryScore,
      finalScore,
      meetsThreshold: relevanceScore >= 70 && credibilityScore >= 70 && accuracyScore >= 70
    };
  });
  
  // Sort by final score (descending)
  matchedCategories.sort((a, b) => b.finalScore - a.finalScore);
  
  if (debug) {
    console.log('CategoryMatcher: Matched categories:', 
      matchedCategories.slice(0, 5).map(c => 
        `${c.name} (score: ${c.finalScore.toFixed(1)}, meets threshold: ${c.meetsThreshold})`
      )
    );
  }
  
  return matchedCategories;
};

/**
 * Match text against keywords and return score and matches
 * @param {string} text Text to match against keywords
 * @param {Array} keywords Keywords to match
 * @returns {Object} Match results with score and matched keywords
 */
export const matchKeywords = (text, keywords = []) => {
  if (!text || typeof text !== 'string' || !keywords || keywords.length === 0) {
    return { matched: false, score: 0, matches: [] };
  }
  
  const textLower = text.toLowerCase();
  const matches = [];
  
  // Find keyword matches
  keywords.forEach(keyword => {
    if (textLower.includes(keyword.toLowerCase())) {
      matches.push(keyword);
    }
  });
  
  // Calculate score based on percentage of keywords matched
  const score = keywords.length > 0 ? matches.length / keywords.length : 0;
  
  return {
    matched: matches.length > 0,
    score,
    matches
  };
};

/**
 * Get the primary category for content
 * @param {string} content Content to analyze
 * @param {Array} categories Available categories
 * @param {string} query Search query
 * @param {Array} sources Content sources
 * @param {Object} options Additional options
 * @returns {Object|null} Primary category or null if none match
 */
export const getPrimaryCategory = (content, categories = [], query = '', sources = [], options = {}) => {
  const matched = matchCategories(content, categories, query, sources, options);
  return matched.length > 0 ? matched[0] : null;
};

export default {
  matchCategories,
  matchKeywords,
  getPrimaryCategory
};
