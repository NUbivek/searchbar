const axios = require('axios');
const { VC_FIRMS, MARKET_DATA_SOURCES } = require('./dataSources');
const { logger } = require('../src/utils/logger');
const { withRetry } = require('../src/utils/errorHandling');
const { rateLimit } = require('../src/utils/rateLimiter');

// Constants
const MAX_CONTENT_LENGTH = 100000; // 100KB
const REQUEST_TIMEOUT = 10000; // 10 seconds

async function searchVerifiedSources(query, options = {}) {
  const { 
    model, 
    mode = 'verified', 
    customUrls = [], 
    uploadedFiles = [], 
    selectedSources = [] 
  } = options;

  const searchId = Math.random().toString(36).substring(7);
  logger.info(`[${searchId}] Starting verified search for query: ${query}`);

  try {
    let results = [];

    // Search verified sources
    if (mode === 'verified' || mode === 'combined') {
      // Process sources in parallel
      const sourcePromises = [];

      // Search market data
      if (selectedSources.includes('MARKET_DATA')) {
        sourcePromises.push(searchMarketData(query, searchId));
      }

      // Search VC firms
      if (selectedSources.includes('VC_FIRMS')) {
        sourcePromises.push(searchVCFirms(query, searchId));
      }

      // Wait for all source searches to complete
      const sourceResults = await Promise.allSettled(sourcePromises);
      sourceResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
        } else {
          logger.error(`[${searchId}] Source search failed:`, result.reason);
        }
      });
    }

    // Handle custom sources
    if ((mode === 'custom' || mode === 'combined') && 
        (customUrls.length > 0 || uploadedFiles.length > 0)) {
      const customResults = await processCustomSources(customUrls, uploadedFiles, searchId);
      results.push(...customResults);
    }

    // Process with LLM if specified
    if (model) {
      const processedResults = await processWithLLM(results, model, searchId);
      results = processedResults;
    }

    logger.info(`[${searchId}] Search completed with ${results.length} results`);

    return {
      query,
      timestamp: new Date().toISOString(),
      results
    };
  } catch (error) {
    logger.error(`[${searchId}] Search failed:`, error);
    throw error;
  }
}

// Helper functions
async function searchMarketData(query, searchId) {
  logger.info(`[${searchId}] Searching market data`);
  try {
    await rateLimit('MARKET_DATA');
    const results = await Promise.allSettled(
      MARKET_DATA_SOURCES.map(async source => {
        try {
          const response = await withRetry(() => axios.get(source.url, {
            timeout: REQUEST_TIMEOUT,
            maxContentLength: MAX_CONTENT_LENGTH
          }));

          return {
            source: source.name,
            type: 'Market Data',
            content: sanitizeContent(response.data),
            url: source.url,
            verified: true,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          logger.error(`[${searchId}] Failed to fetch market data from ${source.name}:`, error);
          return null;
        }
      })
    );

    return results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);
  } catch (error) {
    logger.error(`[${searchId}] Market data search failed:`, error);
    return [];
  }
}

function searchVCFirms(query, searchId) {
  logger.info(`[${searchId}] Searching VC firms`);
  try {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const results = Object.values(VC_FIRMS)
      .filter(firm => {
        const searchText = [
          firm.name,
          firm.focus?.join(' ') || '',
          firm.description || '',
          firm.location || ''
        ].join(' ').toLowerCase();

        return queryTerms.every(term => searchText.includes(term));
      })
      .map(firm => ({
        source: firm.name,
        type: 'VC Firm',
        content: formatFirmContent(firm),
        url: firm.handles?.linkedin || firm.handles?.x || '#',
        verified: true,
        timestamp: new Date().toISOString()
      }));

    logger.info(`[${searchId}] Found ${results.length} matching VC firms`);
    return results;
  } catch (error) {
    logger.error(`[${searchId}] VC firm search failed:`, error);
    return [];
  }
}

async function processCustomSources(urls, files, searchId) {
  const results = [];
  
  // Process URLs
  if (urls.length > 0) {
    logger.info(`[${searchId}] Processing ${urls.length} custom URLs`);
    const urlResults = await Promise.allSettled(
      urls.map(async (url) => {
        try {
          await rateLimit('Web');
          const response = await withRetry(() => axios.get(url, {
            timeout: REQUEST_TIMEOUT,
            maxContentLength: MAX_CONTENT_LENGTH
          }));

          return {
            source: new URL(url).hostname,
            type: 'Custom URL',
            content: sanitizeContent(response.data),
            url,
            verified: false,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          logger.error(`[${searchId}] Failed to fetch URL ${url}:`, error);
          return null;
        }
      })
    );

    results.push(...urlResults
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value));
  }

  // Process files
  if (files.length > 0) {
    logger.info(`[${searchId}] Processing ${files.length} uploaded files`);
    const fileResults = files.map(file => ({
      source: file.name,
      type: 'Uploaded File',
      content: sanitizeContent(file.content),
      url: '#',
      verified: false,
      timestamp: new Date().toISOString()
    }));
    results.push(...fileResults);
  }

  return results;
}

// Utility functions
function sanitizeContent(content) {
  if (typeof content !== 'string') return '';
  return content
    .slice(0, MAX_CONTENT_LENGTH)
    .replace(/[<>]/g, '')
    .trim();
}

function formatFirmContent(firm) {
  const parts = [
    `Name: ${firm.name}`,
    firm.focus ? `Focus: ${firm.focus.join(', ')}` : null,
    firm.description ? `Description: ${firm.description}` : null,
    firm.location ? `Location: ${firm.location}` : null,
    firm.stage ? `Stage: ${firm.stage}` : null,
    firm.investment_range ? `Investment Range: ${firm.investment_range}` : null
  ];

  return parts.filter(Boolean).join('\n');
}

async function processWithLLM(results, model, searchId) {
  // Implement LLM processing
  return results;
}

module.exports = {
  searchVerifiedSources
};