/**
 * contentUtils.js
 * 
 * Utility functions for content processing, sanitization, and conversion
 * especially focused on handling complex API response structures.
 */

import { debug, info, error, warn } from './logger';

// Create a log object for consistent logging
const log = { debug, info, error, warn };

/**
 * Sanitize content to ensure it's safe for display
 * Handles complex nested objects, functions, DOM nodes, etc.
 * @param {any} content Content to sanitize
 * @param {Object} options Sanitization options
 * @returns {string} Sanitized content as string
 */
export const sanitizeContent = (content, options = {}) => {
  const {
    maxLength = 10000,
    htmlStrip = true,
    convertObjects = true,
    fallbackText = '',
    preserveLineBreaks = true
  } = options;
  
  try {
    // Handle null/undefined
    if (content === null || content === undefined) {
      return fallbackText;
    }
    
    // Handle strings directly
    if (typeof content === 'string') {
      let processedContent = content;
      
      // Strip HTML if requested
      if (htmlStrip) {
        processedContent = processedContent.replace(/<[^>]*>/g, ' ');
      }
      
      // Ensure line breaks are preserved if requested
      if (preserveLineBreaks) {
        processedContent = processedContent.replace(/\n/g, '\\n');
      }
      
      // Truncate if too long
      if (processedContent.length > maxLength) {
        processedContent = processedContent.substring(0, maxLength) + '...';
      }
      
      return processedContent;
    }
    
    // Handle primitive values
    if (typeof content === 'number' || typeof content === 'boolean') {
      return String(content);
    }
    
    // Handle arrays
    if (Array.isArray(content)) {
      if (!convertObjects) {
        return '[Array]';
      }
      
      // Process each array item recursively
      const items = content.map(item => sanitizeContent(item, {
        ...options,
        maxLength: Math.floor(maxLength / content.length)
      }));
      
      return items.join(', ');
    }
    
    // Handle objects
    if (typeof content === 'object') {
      if (!convertObjects) {
        return '[Object]';
      }
      
      // Handle special object types
      
      // Handle Date objects
      if (content instanceof Date) {
        return content.toISOString();
      }
      
      // Handle common response structures
      if (content.text || content.content || content.value || content.message) {
        const extractedContent = content.text || content.content || content.value || content.message;
        return sanitizeContent(extractedContent, options);
      }
      
      // Handle search API response structures
      if (content.summary) {
        return sanitizeContent(content.summary, options);
      }
      
      // Stringify the object
      try {
        const jsonContent = JSON.stringify(content);
        return jsonContent.length > maxLength 
          ? jsonContent.substring(0, maxLength) + '...' 
          : jsonContent;
      } catch (jsonError) {
        log.warn('Failed to JSON stringify object:', jsonError);
        return '[Complex Object]';
      }
    }
    
    // Handle functions
    if (typeof content === 'function') {
      return '[Function]';
    }
    
    // Fallback for any other type
    return String(content) || fallbackText;
  } catch (err) {
    log.error('Error sanitizing content:', err);
    return fallbackText || '[Content Error]';
  }
};

/**
 * Process an LLM response to ensure it's safe for display in React
 * @param {any} llmResponse Raw LLM response from API
 * @param {Object} options Processing options
 * @returns {Object} Processed response safe for display
 */
export const processLlmResponseToSafeFormat = (llmResponse, options = {}) => {
  if (!llmResponse) {
    return {
      content: '',
      sources: [],
      followUpQuestions: []
    };
  }
  
  const {
    extractSources = true,
    extractFollowUpQuestions = true,
    sanitizeHtml = true
  } = options;
  
  try {
    // Ensure we're working with an object
    const response = typeof llmResponse === 'string' 
      ? JSON.parse(llmResponse) 
      : llmResponse;
    
    // Process the main content
    let processedContent = '';
    
    if (response.answer || response.content || response.text || response.summary) {
      processedContent = sanitizeContent(
        response.answer || response.content || response.text || response.summary,
        { htmlStrip: sanitizeHtml }
      );
    } else if (typeof response === 'string') {
      processedContent = sanitizeContent(response, { htmlStrip: sanitizeHtml });
    } else {
      // Try to extract content from categories if available
      if (response.categories) {
        const categories = response.categories;
        
        const summaryCategory = 
          categories.summary || 
          categories.general || 
          categories.information;
          
        if (summaryCategory) {
          processedContent = sanitizeContent(summaryCategory, { htmlStrip: sanitizeHtml });
        } else {
          // Use the first available category
          const firstCategory = Object.values(categories)[0];
          if (firstCategory) {
            processedContent = sanitizeContent(firstCategory, { htmlStrip: sanitizeHtml });
          }
        }
      }
    }
    
    // Process sources
    let sources = [];
    
    if (extractSources) {
      if (response.sources && Array.isArray(response.sources)) {
        sources = response.sources.map(source => {
          if (typeof source === 'string') {
            // This may be a URL or title
            return { 
              url: source.startsWith('http') ? source : null,
              title: source
            };
          }
          
          if (typeof source === 'object') {
            return {
              url: source.url || source.link || null,
              title: source.title || source.name || 'Source',
              content: sanitizeContent(source.content || source.snippet || source.description || '', 
                { maxLength: 200, htmlStrip: sanitizeHtml }),
              date: source.date || source.published_date || null
            };
          }
          
          return { title: 'Source' };
        });
      } else if (response.sourceLinks && Array.isArray(response.sourceLinks)) {
        // Extract sources from common alternative formats
        sources = response.sourceLinks.map((link, index) => ({
          url: link,
          title: response.sourceTitles?.[index] || `Source ${index + 1}`
        }));
      } else if (response.sourceMap) {
        // Handle the sourceMap format
        sources = Object.entries(response.sourceMap).map(([id, source]) => ({
          id,
          url: source.url || source.link || null,
          title: source.title || source.name || id,
          content: sanitizeContent(source.content || source.snippet || '', 
            { maxLength: 200, htmlStrip: sanitizeHtml })
        }));
      }
    }
    
    // Process follow-up questions
    let followUpQuestions = [];
    
    if (extractFollowUpQuestions) {
      if (response.followUpQuestions && Array.isArray(response.followUpQuestions)) {
        followUpQuestions = response.followUpQuestions.map(q => 
          typeof q === 'string' ? q : q.question || q.text || String(q)
        );
      } else if (response.suggestedQuestions && Array.isArray(response.suggestedQuestions)) {
        followUpQuestions = response.suggestedQuestions.map(q => 
          typeof q === 'string' ? q : q.question || q.text || String(q)
        );
      }
    }
    
    // Process categories if available
    let categories = {};
    
    if (response.categories && typeof response.categories === 'object') {
      Object.entries(response.categories).forEach(([key, value]) => {
        categories[key] = sanitizeContent(value, { htmlStrip: sanitizeHtml });
      });
    }
    
    // Return the processed response
    return {
      content: processedContent || '',
      sources: sources || [],
      followUpQuestions: followUpQuestions || [],
      categories: Object.keys(categories).length > 0 ? categories : null,
      raw: response // For debugging only, should be removed in production
    };
  } catch (err) {
    log.error('Error processing LLM response:', err);
    
    // Return a safe fallback
    return {
      content: 'Error processing response content.',
      sources: [],
      followUpQuestions: [],
      error: err.message
    };
  }
};

/**
 * Create URL parameters from a search query and options
 * @param {string} query Search query
 * @param {Object} options Search options
 * @returns {URLSearchParams} URL search parameters
 */
export const createSearchParams = (query, options = {}) => {
  const params = new URLSearchParams();
  
  // Add the query
  if (query) {
    params.append('q', query);
  }
  
  // Add options as parameters
  Object.entries(options).forEach(([key, value]) => {
    // Skip undefined values
    if (value === undefined) {
      return;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      value.forEach(item => {
        params.append(`${key}[]`, item);
      });
      return;
    }
    
    // Handle objects
    if (value !== null && typeof value === 'object') {
      params.append(key, JSON.stringify(value));
      return;
    }
    
    // Handle other types
    params.append(key, String(value));
  });
  
  return params;
};

/**
 * Extract text fragments from a document
 * @param {string} content Document content
 * @param {Object} options Extraction options
 * @returns {Array} Extracted text fragments
 */
export const extractTextFragments = (content, options = {}) => {
  if (!content) {
    return [];
  }
  
  const {
    maxFragments = 10,
    fragmentLength = 200,
    overlap = 50
  } = options;
  
  // Clean up the content
  const cleanedContent = typeof content === 'string'
    ? content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : String(content);
  
  if (cleanedContent.length <= fragmentLength) {
    return [cleanedContent];
  }
  
  // Create overlapping fragments
  const fragments = [];
  let position = 0;
  
  while (position < cleanedContent.length && fragments.length < maxFragments) {
    let endPosition = Math.min(position + fragmentLength, cleanedContent.length);
    
    // Try to end at a sentence boundary if possible
    if (endPosition < cleanedContent.length) {
      const sentenceEnd = cleanedContent.substring(position, endPosition + 30).search(/[.!?]\s/);
      if (sentenceEnd > 0) {
        endPosition = position + sentenceEnd + 1;
      }
    }
    
    fragments.push(cleanedContent.substring(position, endPosition));
    
    // Move to next position with overlap
    position = endPosition - overlap;
  }
  
  return fragments;
};

export default {
  sanitizeContent,
  processLlmResponseToSafeFormat,
  createSearchParams,
  extractTextFragments
};
