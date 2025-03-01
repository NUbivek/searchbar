/**
 * LLMResultsCore.js
 * 
 * Core functionality for processing LLM results, extracting categories,
 * and handling errors. This is separated from the UI component to prevent
 * circular dependencies and infinite rendering loops.
 */

import { safeStringify } from '../../../utils/reactUtils';
import { debug, info, error, warn } from '../../../utils/logger';

// Create a log object for consistent logging
const log = { debug, info, error, warn };

// Default categories with their properties
export const DEFAULT_CATEGORIES = [
  {
    id: 'key_insights',
    title: 'Key Insights',
    keywords: ['key', 'insight', 'highlight', 'important', 'significant', 'notable', 'critical'],
    priority: 0,
    color: '#673AB7' // Purple (updated to match requirements)
  },
  {
    id: 'market_overview',
    title: 'Market Overview',
    keywords: ['market', 'industry', 'sector', 'landscape', 'overview', 'trends'],
    priority: 1,
    color: '#4285F4' // Blue
  },
  {
    id: 'financial_overview',
    title: 'Financial Overview',
    keywords: ['financial', 'finance', 'money', 'capital', 'funding', 'investment'],
    priority: 1,
    color: '#F4B400' // Yellow
  },
  {
    id: 'business_strategy',
    title: 'Business Strategy',
    keywords: ['strategy', 'business model', 'approach', 'plan', 'roadmap'],
    priority: 1,
    color: '#0F9D58' // Green
  },
  {
    id: 'industry_insights',
    title: 'Industry Insights',
    keywords: ['industry', 'sector', 'vertical', 'market segment'],
    priority: 1,
    color: '#DB4437' // Red
  }
];

/**
 * Process content (objects, arrays, strings) into a clean string format
 * @param {any} content The content to process
 * @returns {string|null} Processed content as string or null if invalid
 */
export const processContent = (content) => {
  if (!content) return null;
  
  if (typeof content === 'string') {
    return content;
  } else if (Array.isArray(content)) {
    return content.map(item => {
      if (typeof item === 'string') return item;
      return safeStringify(item);
    }).join('\n\n');
  } else if (typeof content === 'object') {
    return safeStringify(content);
  }
  
  return String(content);
};

/**
 * Create a category with validation
 * @param {string} id Category ID
 * @param {string} title Category title
 * @param {any} content Category content
 * @param {string} color Category color
 * @returns {Object|null} Category object or null if invalid
 */
export const createCategory = (id, title, content, color) => {
  const processedContent = processContent(content);
  
  // Don't create empty categories or categories with error messages
  if (!processedContent || 
      processedContent === 'No content available' || 
      processedContent.includes('Error processing')) {
    return null;
  }
  
  return {
    id,
    title,
    content: processedContent,
    color
  };
};

/**
 * Process LLM results into structured categories
 * @param {Object|string} results Raw LLM results
 * @param {string} query Search query
 * @returns {Object} Object containing processed categories and any errors
 */
export const processLLMResults = async (results, query) => {
  log.debug('Processing LLM results');
  
  if (!results || !query) {
    log.warn('Missing results or query in processLLMResults');
    return { 
      categories: [], 
      error: null 
    };
  }

  try {
    // Parse the results if they're a string
    // Initialize parsed results
    let parsedResults = results;
    
    // Normalize input
    if (typeof results === 'object' && results !== null) {
      // Already an object, just validate structure
      if (!results.content && !results.categories) {
        console.log('DEBUG: Results missing content or categories, creating fallback structure');
        parsedResults = {
          content: JSON.stringify(results),
          categories: { searchResults: results }
        };
      }
    } else if (typeof results === 'string') {
      try {
        // Remove any BOM or invalid characters
        const cleanedResults = results.trim().replace(/^\uFEFF/, '');
        
        // Check for error messages
        if (cleanedResults.startsWith('Error:')) {
          throw new Error(cleanedResults);
        }
        
        // Try to parse as JSON
        try {
          parsedResults = JSON.parse(cleanedResults);
          console.log('DEBUG: Successfully parsed JSON results:', {
            hasContent: !!parsedResults.content,
            hasCategories: !!parsedResults.categories
          });
        } catch (parseError) {
          console.log('DEBUG: Failed to parse as JSON, treating as plain text');
          if (cleanedResults.trim().length > 0) {
            // Create a fallback response structure for non-empty text
            parsedResults = {
              content: cleanedResults,
              categories: {
                key_insights: cleanedResults
              },
              sources: [],
              error: `Failed to parse as JSON: ${parseError.message}`
            };
            console.log('DEBUG: Created fallback response from plain text');
          } else {
            // Empty or invalid response
            throw new Error(`Empty or invalid LLM response: ${parseError.message}`);
          }
        }
      } catch (error) {
        console.error('Error processing LLM results:', error);
        
        // Create a fallback error response
        parsedResults = {
          content: `Error processing results: ${error.message}`,
          categories: {
            error: error.message,
            key_insights: 'We encountered an error processing your search results. Please try refining your search query.'
          },
          sources: [],
          error: error.message
        };
      }
    }
    
    // Validate and normalize results structure
    if (!parsedResults || typeof parsedResults !== 'object') {
      console.error('Invalid results structure after processing');
      parsedResults = {
        error: 'Invalid results structure',
        content: 'An error occurred while processing the search results.',
        categories: {
          error: 'An error occurred while processing the search results.'
        },
        sources: []
      };
    }

    // Ensure required properties exist
    if (!parsedResults.categories) {
      parsedResults.categories = {};
    }
    if (!parsedResults.sources) {
      parsedResults.sources = [];
    }
    if (!parsedResults.content) {
      parsedResults.content = '';
    }
    
    // Process the results to get structured categories
    const categories = [];
    
    // Check if we have categories in the response
    if (parsedResults.categories) {
      // Map the categories to our format
      Object.entries(parsedResults.categories).forEach(([key, content]) => {
        // Find the matching category from our predefined list
        const categoryDef = DEFAULT_CATEGORIES.find(cat => cat.id === key) || {
          id: key,
          title: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          color: '#607D8B' // Default color
        };
        
        const category = createCategory(
          key,
          categoryDef.title,
          content,
          categoryDef.color
        );
        
        if (category) categories.push(category);
      });
    } else if (parsedResults.content) {
      // If we just have content, put it in the key insights category
      const category = createCategory(
        'key_insights',
        'Key Insights',
        parsedResults.content,
        '#673AB7'
      );
      
      if (category) categories.push(category);
    } else if (typeof parsedResults === 'string') {
      // If we just have a string, put it in the key insights category
      const category = createCategory(
        'key_insights',
        'Key Insights',
        parsedResults,
        '#673AB7'
      );
      
      if (category) categories.push(category);
    } else if (Array.isArray(parsedResults)) {
      // If we have an array, try to extract content from it
      const content = parsedResults.map(item => {
        if (typeof item === 'string') return item;
        if (item.content) return item.content;
        if (item.snippet) return item.snippet;
        return safeStringify(item);
      }).join('\n\n');
      
      const category = createCategory(
        'key_insights',
        'Key Insights',
        content,
        '#673AB7'
      );
      
      if (category) categories.push(category);
    } else {
      // Fallback for other formats
      const category = createCategory(
        'key_insights',
        'Key Insights',
        safeStringify(parsedResults),
        '#673AB7'
      );
      
      if (category) categories.push(category);
    }
    
    // Sort categories by priority
    categories.sort((a, b) => {
      const catA = DEFAULT_CATEGORIES.find(cat => cat.id === a.id);
      const catB = DEFAULT_CATEGORIES.find(cat => cat.id === b.id);
      return (catA?.priority || 99) - (catB?.priority || 99);
    });
    
    return {
      categories,
      error: null
    };
  } catch (error) {
    log.error('Error in processLLMResults:', error);
    return {
      categories: [],
      error: error.message || 'Error processing results'
    };
  }
};

export default {
  processLLMResults,
  createCategory,
  processContent,
  DEFAULT_CATEGORIES
};
