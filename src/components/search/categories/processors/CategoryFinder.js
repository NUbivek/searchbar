/**
 * Category detection and selection logic
 * Implements the category selection algorithm based on content relevance
 */

// Import category types
import { getSpecialCategories } from '../types/SpecialCategories';
import { getBroadCategories } from '../types/BroadCategories';
import { getSpecificCategories } from '../types/SpecificCategories';
import { CategoryBase } from '../types/CategoryBase';

// Import keyword matchers
import { KeywordMatcher } from '../keywords/KeywordMatcher';

/**
 * Constants for category selection
 */
const MAX_CATEGORIES = 6;
const PRIMARY_THRESHOLD = 70; // Initial quality threshold
const FALLBACK_THRESHOLD = 65; // Fallback threshold when not enough categories meet primary threshold
const MIN_CATEGORIES = 3; // Minimum number of categories to display

/**
 * Find the best categories for the given content and query
 * @param {string} content The content to categorize
 * @param {string} query The search query
 * @param {Object} options Additional options
 * @returns {Array} Selected categories sorted by relevance
 */
export const findBestCategories = (content, query = '', options = {}) => {
  if (!content) return []; // No content, no categories
  
  // Get all category definitions
  const allCategories = [
    ...getSpecialCategories(),
    ...getSpecificCategories(),
    ...getBroadCategories()
  ];
  
  // Debug mode
  const debug = options.debug || false;
  
  if (debug) {
    console.log('CategoryFinder: Finding best categories for query:', query);
    console.log('CategoryFinder: Content preview:', content.substring(0, 100) + '...');
    console.log('CategoryFinder: Evaluating', allCategories.length, 'categories');
  }
  
  // Step 1: Initial Scoring - evaluate all categories against content
  const scoredCategories = allCategories.map(category => {
    // Create a CategoryBase instance if not already one
    const categoryInstance = category instanceof CategoryBase 
      ? category 
      : CategoryBase.fromObject(category);
    
    // Evaluate the category against content
    const evaluation = categoryInstance.evaluate(content, query);
    
    // Calculate metrics for the category
    const relevanceScore = evaluation.score;
    const credibilityScore = 80; // Default credibility score (would be based on source quality in a real implementation)
    const accuracyScore = 85; // Default accuracy score (would be based on validation in a real implementation)
    
    // Store all evaluation data
    return {
      ...evaluation,
      relevanceScore,
      credibilityScore,
      accuracyScore,
      // Check if category meets all threshold requirements
      meetsThreshold: (
        relevanceScore >= PRIMARY_THRESHOLD &&
        credibilityScore >= PRIMARY_THRESHOLD &&
        accuracyScore >= PRIMARY_THRESHOLD
      ),
      // Calculate weighted total score (relevance has 2x weight)
      weightedScore: (relevanceScore * 2 + credibilityScore + accuracyScore) / 4
    };
  });
  
  // Step 2: Filter categories that meet the primary threshold
  let selectedCategories = scoredCategories.filter(cat => cat.meetsThreshold);
  
  // Step 3: If not enough categories, try the fallback threshold
  if (selectedCategories.length < MIN_CATEGORIES) {
    if (debug) {
      console.log('CategoryFinder: Not enough categories meet primary threshold, using fallback threshold');
    }
    
    selectedCategories = scoredCategories.filter(cat => (
      cat.relevanceScore >= FALLBACK_THRESHOLD &&
      cat.credibilityScore >= FALLBACK_THRESHOLD &&
      cat.accuracyScore >= FALLBACK_THRESHOLD
    ));
  }
  
  // Step 4: Ensure Key Insights is included if it meets threshold
  const keyInsightsCategory = scoredCategories.find(cat => cat.id === 'key-insights');
  
  if (keyInsightsCategory && !selectedCategories.some(cat => cat.id === 'key-insights')) {
    // If Key Insights meets at least the fallback threshold, include it
    if (keyInsightsCategory.relevanceScore >= FALLBACK_THRESHOLD) {
      selectedCategories.push(keyInsightsCategory);
    }
  }
  
  // Step 5: Sort by weighted score and limit to MAX_CATEGORIES
  selectedCategories.sort((a, b) => b.weightedScore - a.weightedScore);
  
  // Step 6: Ensure diversity by avoiding too similar categories
  const diverseCategories = [];
  const categoryTypes = new Set();
  
  // Always include Key Insights first if available
  const keyInsights = selectedCategories.find(cat => cat.id === 'key-insights');
  if (keyInsights) {
    diverseCategories.push(keyInsights);
    categoryTypes.add('special');
  }
  
  // Add remaining categories ensuring diversity
  for (const category of selectedCategories) {
    if (diverseCategories.length >= MAX_CATEGORIES) break;
    
    // Skip Key Insights as it's already added
    if (category.id === 'key-insights') continue;
    
    // Determine category type based on ID prefix
    let categoryType = 'specific';
    if (category.id.startsWith('market-overview') || 
        category.id.startsWith('financial-overview') || 
        category.id.startsWith('business-strategy') || 
        category.id.startsWith('industry-insights')) {
      categoryType = 'broad';
    }
    
    // If we already have 2 of this type, and there are other types available, skip
    if (Array.from(categoryTypes).filter(t => t === categoryType).length >= 2 && 
        diverseCategories.length < selectedCategories.length) {
      continue;
    }
    
    diverseCategories.push(category);
    categoryTypes.add(categoryType);
  }
  
  // Step 7: If we still need more categories, add any remaining ones
  if (diverseCategories.length < Math.min(MAX_CATEGORIES, selectedCategories.length)) {
    for (const category of selectedCategories) {
      if (diverseCategories.length >= MAX_CATEGORIES) break;
      if (!diverseCategories.some(c => c.id === category.id)) {
        diverseCategories.push(category);
      }
    }
  }
  
  // Final sorting by priority then score
  diverseCategories.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.weightedScore - a.weightedScore;
  });
  
  if (debug) {
    console.log('CategoryFinder: Selected categories:', 
      diverseCategories.map(c => `${c.name} (Score: ${c.weightedScore.toFixed(1)})`));
  }
  
  return diverseCategories;
};

/**
 * Find a single best category for content
 * @param {string} content Content to categorize
 * @param {string} query Search query
 * @returns {Object|null} Best category or null if none meet threshold
 */
export const findBestCategory = (content, query = '') => {
  const categories = findBestCategories(content, query);
  return categories.length > 0 ? categories[0] : null;
};

export default {
  findBestCategories,
  findBestCategory,
  MAX_CATEGORIES,
  PRIMARY_THRESHOLD,
  FALLBACK_THRESHOLD
};
