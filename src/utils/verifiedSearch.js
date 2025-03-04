import { VC_FIRMS, MARKET_DATA_SOURCES, searchAcrossDataSources } from './dataSources';
import { searchGovernmentData } from './governmentData';
import { VERIFIED_DATA_SOURCES, searchVerifiedSources as searchVerifiedSourcesInternal } from './verifiedDataSources';
import { debug, info, error, warn } from './logger';
import { withRetry } from './errorHandling';
import axios from 'axios';
import { deepWebSearch } from './deepWebSearch';
import { searchWithSerper } from './openSearch';

/**
 * Search verified sources for information related to the query
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @param {Array} options.sources - Sources to search
 * @param {Array} options.customUrls - Custom URLs to include
 * @param {Array} options.uploadedFiles - Uploaded files to include
 * @param {string} options.model - LLM model to use
 * @returns {Object} - Search results
 * @deprecated Use the unifiedSearch function from search.js instead
 */
export async function searchVerifiedSources(query, options = {}) {
  warn('searchVerifiedSources is deprecated. Use unifiedSearch from search.js instead');
  
  // Extract options
  const { sources = [], customUrls = [], uploadedFiles = [], model } = options;
  const searchId = Math.random().toString(36).substring(7);
  
  try {
    // Import the unifiedSearch function from search.js
    const { default: unifiedSearch } = await import('./search');
    
    // Call the unified search function with verified mode
    return await unifiedSearch({
      query,
      mode: 'verified',
      model: model || 'mistral',
      sources: sources.length > 0 ? sources : ['VerifiedSources'],
      customUrls: customUrls || [],
      uploadedFiles: uploadedFiles || []
    }, searchId);
  } catch (err) {
    error(`[${searchId}] Error in searchVerifiedSources:`, err.message);
    return {
      error: 'Failed to perform verified sources search',
      message: err.message
    };
  }
}

/**
 * Helper function to check if an item matches the query
 * @param {Object} obj - Object to check
 * @param {string} query - Query to match against
 * @returns {boolean} - Whether the object matches the query
 * @private
 */
function matchesQuery(obj, query) {
  if (!query) return true;
  
  // Normalize query for case-insensitive matching
  const normalizedQuery = query.toLowerCase();
  
  // Check various properties for matches
  return (
    // Check title
    (obj.title && obj.title.toLowerCase().includes(normalizedQuery)) ||
    // Check content/description
    (obj.content && obj.content.toLowerCase().includes(normalizedQuery)) ||
    (obj.description && obj.description.toLowerCase().includes(normalizedQuery)) ||
    // Check URL
    (obj.url && obj.url.toLowerCase().includes(normalizedQuery))
  );
}
