/**
 * CategoryIntegration.js
 * 
 * Connects the LLMResults component with the category system.
 * Implements the category selection algorithm with thresholds and prioritization.
 */

import { debug, info, error, warn } from '../../../utils/logger';
import { DEFAULT_CATEGORIES } from './LLMResultsCore';
import { findBestCategory, getAllCategories } from '../categories/CategoryFinder';
import { dynamicCategorize } from '../categories/DynamicCategorizer';
import { calculateMetrics } from '../metrics/calculators';
import { isBusinessQuery } from '../utils';

// Create a log object for consistent logging
const log = { debug, info, error, warn };

// Constants for category selection
export const MAX_CATEGORIES = 6;
export const MIN_THRESHOLD = 70; // 70% minimum quality threshold
export const LOWER_THRESHOLD = 65; // 65% for edge cases

/**
 * Integrates categories with LLM results
 * @param {Array} results Raw LLM results
 * @param {string} query Search query
 * @param {Object} options Integration options
 * @returns {Object} Object containing categorized results with metrics
 */
export const integrateCategoriesWithLLM = async (results, query, options = {}) => {
  if (!results || !query) {
    log.warn('Missing results or query in integrateCategoriesWithLLM');
    return { 
      categories: [], 
      error: null 
    };
  }

  log.debug('Integrating categories with LLM results');
  log.debug(`Query: "${query}"`);

  try {
    // Extract content from results
    const content = extractContentFromResults(results);
    
    // Find sources if available
    const sources = extractSourcesFromResults(results);
    
    // Determine if this is a business query
    const isBusinessContext = isBusinessQuery(query);
    
    // Process content through categorizer
    const categorizedContent = await processCategorizedContent(content, sources, query, isBusinessContext);
    
    // Apply threshold filtering and limit to top categories
    const filteredCategories = applyCategoryFilters(categorizedContent, query);
    
    return {
      categories: filteredCategories,
      error: null
    };
  } catch (err) {
    log.error('Error in integrateCategoriesWithLLM:', err);
    return {
      categories: [],
      error: err.message || 'Error integrating categories'
    };
  }
};

/**
 * Extracts content from various result formats
 * @param {any} results The results to extract content from
 * @returns {string} Extracted content
 */
const extractContentFromResults = (results) => {
  if (!results) return '';
  
  if (typeof results === 'string') {
    return results;
  }
  
  if (Array.isArray(results)) {
    return results.map(item => {
      if (typeof item === 'string') return item;
      if (item.content) return item.content;
      if (item.snippet) return item.snippet;
      return JSON.stringify(item, null, 2);
    }).join('\n\n');
  }
  
  if (results.content) {
    return results.content;
  }
  
  if (results.categories) {
    return Object.values(results.categories).join('\n\n');
  }
  
  return JSON.stringify(results, null, 2);
};

/**
 * Extracts sources from results
 * @param {any} results The results to extract sources from
 * @returns {Array} Array of sources
 */
const extractSourcesFromResults = (results) => {
  if (!results) return [];
  
  if (Array.isArray(results)) {
    // Try to find sources in array items
    const sources = [];
    results.forEach(item => {
      if (item.sources) {
        if (Array.isArray(item.sources)) {
          sources.push(...item.sources);
        } else {
          sources.push(item.sources);
        }
      }
      if (item.source) {
        sources.push(item.source);
      }
    });
    return sources;
  }
  
  if (results.sources) {
    return Array.isArray(results.sources) ? results.sources : [results.sources];
  }
  
  if (results.source) {
    return [results.source];
  }
  
  return [];
};

/**
 * Process content into categorized content with metrics
 * @param {string} content The content to categorize
 * @param {Array} sources The sources associated with the content
 * @param {string} query The search query
 * @param {boolean} isBusinessContext Whether this is a business query
 * @returns {Array} Array of categories with metrics
 */
const processCategorizedContent = async (content, sources, query, isBusinessContext) => {
  // Use dynamicCategorize from DynamicCategorizer
  const categorizedContent = await dynamicCategorize(content, query, {
    sources,
    businessContext: isBusinessContext,
    maxCategories: MAX_CATEGORIES * 2 // Double the limit for initial processing
  });
  
  // Calculate metrics for each category
  return categorizedContent.map(category => {
    const metrics = calculateMetrics(category.content, sources, query, { 
      businessContext: isBusinessContext 
    });
    
    return {
      ...category,
      metrics
    };
  });
};

/**
 * Apply filters to categories based on thresholds and limits
 * @param {Array} categories The categories to filter
 * @param {string} query The search query
 * @returns {Array} Filtered and limited categories
 */
const applyCategoryFilters = (categories, query) => {
  if (!categories || categories.length === 0) {
    return [];
  }
  
  // Step 1: Filter out categories that don't meet the minimum threshold
  let filteredCategories = categories.filter(cat => {
    const { relevance, accuracy, credibility } = cat.metrics || { relevance: 0, accuracy: 0, credibility: 0 };
    return relevance >= MIN_THRESHOLD && accuracy >= MIN_THRESHOLD && credibility >= MIN_THRESHOLD;
  });
  
  // Special handling for Key Insights - always include if it meets threshold
  const keyInsights = categories.find(cat => cat.id === 'key_insights' || cat.id === 'keyInsights');
  
  // Edge case handling - if few categories meet the threshold
  if (filteredCategories.length < 3 && keyInsights) {
    // Lower the threshold
    filteredCategories = categories.filter(cat => {
      const { relevance, accuracy, credibility } = cat.metrics || { relevance: 0, accuracy: 0, credibility: 0 };
      return relevance >= LOWER_THRESHOLD && accuracy >= LOWER_THRESHOLD && credibility >= LOWER_THRESHOLD;
    });
  }
  
  // If still no categories, just use key insights if available
  if (filteredCategories.length === 0 && keyInsights) {
    return [keyInsights];
  }
  
  // Step 2: Sort by weighted scores (relevance has higher weight)
  filteredCategories.sort((a, b) => {
    const scoreA = (a.metrics.relevance * 2) + a.metrics.accuracy + a.metrics.credibility;
    const scoreB = (b.metrics.relevance * 2) + b.metrics.accuracy + b.metrics.credibility;
    return scoreB - scoreA;
  });
  
  // Step 3: Limit to MAX_CATEGORIES
  filteredCategories = filteredCategories.slice(0, MAX_CATEGORIES);
  
  // Step 4: Ensure diversity of information
  // This is simplified; the DynamicCategorizer already handles much of this
  
  // Final sorting by priority
  filteredCategories.sort((a, b) => {
    const catA = DEFAULT_CATEGORIES.find(cat => cat.id === a.id);
    const catB = DEFAULT_CATEGORIES.find(cat => cat.id === b.id);
    return (catA?.priority || 99) - (catB?.priority || 99);
  });
  
  return filteredCategories;
};

export default {
  integrateCategoriesWithLLM,
  MAX_CATEGORIES,
  MIN_THRESHOLD,
  LOWER_THRESHOLD
};
