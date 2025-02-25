const { logger } = require('./logger');
const { searchWeb } = require('./deepWebSearch');
const { sourceHandlers, performSearch: sourcePerformSearch } = require('./sourceIntegration');
const axios = require('axios');
const { SearchModes, SourceTypes } = require('./constants');

// Constants for verified sources
const VERIFIED_SOURCES = {
  'Market Data Analytics': [
    { name: 'Bloomberg', url: 'https://www.bloomberg.com' },
    { name: 'Reuters', url: 'https://www.reuters.com' },
    { name: 'WSJ', url: 'https://www.wsj.com' }
  ],
  'VC & Startups': [
    { name: 'Crunchbase', url: 'https://www.crunchbase.com' },
    { name: 'Pitchbook', url: 'https://www.pitchbook.com' },
    { name: 'TechCrunch', url: 'https://www.techcrunch.com' }
  ],
  'VC Firms': [
    { name: 'Andreessen Horowitz', url: 'https://a16z.com', handles: { x: '@a16z', linkedin: 'company/andreessen-horowitz', substack: 'future.a16z.com' } },
    { name: 'Sequoia Capital', url: 'https://www.sequoiacap.com', handles: { x: '@sequoia', linkedin: 'company/sequoia-capital', substack: 'sequoia.substack.com' } },
    { name: 'Accel', url: 'https://www.accel.com', handles: { x: '@accel', linkedin: 'company/accel-partners', substack: 'accel.substack.com' } },
    { name: 'Greylock Partners', url: 'https://greylock.com', handles: { x: '@greylock', linkedin: 'company/greylock-partners', substack: 'greylock.substack.com' } },
    { name: 'Benchmark', url: 'https://www.benchmark.com', handles: { x: '@benchmark', linkedin: 'company/benchmark' } },
    { name: 'Lightspeed', url: 'https://lsvp.com', handles: { x: '@lightspeedvp', linkedin: 'company/lightspeed-venture-partners' } },
    { name: 'NEA', url: 'https://www.nea.com', handles: { x: '@nea', linkedin: 'company/nea' } },
    { name: 'Bessemer', url: 'https://www.bvp.com', handles: { x: '@bvp', linkedin: 'company/bessemer-venture-partners' } },
    { name: 'Index Ventures', url: 'https://www.indexventures.com', handles: { x: '@indexventures', linkedin: 'company/index-ventures' } },
    { name: 'General Catalyst', url: 'https://www.generalcatalyst.com', handles: { x: '@gcvp', linkedin: 'company/general-catalyst-partners' } },
    { name: 'Khosla Ventures', url: 'https://www.khoslaventures.com', handles: { x: '@khoslaventures', linkedin: 'company/khosla-ventures' } },
    { name: 'Founders Fund', url: 'https://foundersfund.com', handles: { x: '@foundersfund', linkedin: 'company/founders-fund' } },
    { name: 'Tiger Global', url: 'https://www.tigerglobal.com', handles: { x: '@tigerglobal', linkedin: 'company/tiger-global-management' } },
    { name: 'First Round', url: 'https://firstround.com', handles: { x: '@firstround', linkedin: 'company/first-round-capital' } },
    { name: 'Union Square Ventures', url: 'https://www.usv.com', handles: { x: '@usv', linkedin: 'company/union-square-ventures' } },
    { name: 'Kleiner Perkins', url: 'https://www.kleinerperkins.com', handles: { x: '@kleinerperkins', linkedin: 'company/kleiner-perkins' } },
    { name: 'Insight Partners', url: 'https://www.insightpartners.com', handles: { x: '@insightpartners', linkedin: 'company/insight-partners' } },
    { name: 'GGV Capital', url: 'https://www.ggvc.com', handles: { x: '@ggvcapital', linkedin: 'company/ggv-capital' } },
    { name: 'Coatue', url: 'https://www.coatue.com', handles: { x: '@coatue', linkedin: 'company/coatue-management' } },
    { name: 'Battery Ventures', url: 'https://www.battery.com', handles: { x: '@batteryventures', linkedin: 'company/battery-ventures' } }
  ],
  'VC Partners': [
    { name: 'Marc Andreessen', url: 'https://pmarca.substack.com', handles: { x: '@pmarca', linkedin: '/in/mandreessen' } },
    { name: 'Ben Horowitz', url: 'https://a16z.com/author/ben-horowitz', handles: { x: '@bhorowitz', linkedin: '/in/benhorowitz' } },
    { name: 'Roelof Botha', url: 'https://www.sequoiacap.com/people/roelof-botha', handles: { x: '@roelofbotha', linkedin: '/in/roelofbotha' } },
    { name: 'Bill Gurley', url: 'http://abovethecrowd.com', handles: { x: '@bgurley', linkedin: '/in/billgurley' } },
    { name: 'Fred Wilson', url: 'https://avc.com', handles: { x: '@fredwilson', linkedin: '/in/fredwilson' } }
  ]
};

// Process results with LLM
async function processResults(query, results, model = 'mixtral-8x7b', context = '') {
  try {
    let baseUrl;
    if (typeof window !== 'undefined') {
      // Client-side
      baseUrl = window.location.origin;
    } else {
      // Server-side
      baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3010' 
        : process.env.NEXT_PUBLIC_BASE_URL || '';
    }
      
    // Use the real LLM processing endpoint
    const response = await axios.post(`${baseUrl}/api/llm/process`, {
      query,
      sources: results,
      model,
      context
    });

    return {
      content: response.data.content,
      sourceMap: response.data.sourceMap || {}
    };
  } catch (error) {
    logger.error('LLM processing error:', error);
    // Return a fallback response
    return {
      content: `Found ${results.length} results for "${query}". Unable to generate summary.`,
      sourceMap: {}
    };
  }
}

// Perform search for verified sources
async function performVerifiedSearch(query, options = {}) {
  try {
    // Use the verified source handler
    const results = await sourceHandlers.verified(query, options);
    return results;
  } catch (error) {
    logger.error('Error in performVerifiedSearch:', error);
    throw error;
  }
}

// Perform search across selected sources
async function performSearch(query, sources, options = {}) {
  if (!query) {
    throw new Error('Search query is required');
  }

  try {
    // Convert source names to lowercase for consistency
    const normalizedSources = sources.map(source => source.toLowerCase());
    
    // Check if we're using verified sources
    if (normalizedSources.includes('verified')) {
      logger.info('Performing verified search with query:', query);
      return await performVerifiedSearch(query, options);
    }
    
    // For other sources, use the sourceHandlers
    const results = [];
    const promises = normalizedSources.map(async (source) => {
      if (sourceHandlers[source]) {
        try {
          const sourceResults = await sourceHandlers[source](query, options);
          if (sourceResults && sourceResults.length > 0) {
            results.push(...sourceResults);
          }
        } catch (error) {
          logger.error(`Error searching ${source}:`, error);
          // Continue with other sources even if one fails
        }
      } else {
        logger.warn(`No handler found for source: ${source}`);
      }
    });
    
    await Promise.all(promises);
    return results;
  } catch (error) {
    logger.error('Error in performSearch:', error);
    throw error;
  }
}

// Handle custom sources (URLs and files)
async function handleCustomSources(query, customUrls = [], files = []) {
  const results = [];

  // Process custom URLs if any
  if (customUrls && customUrls.length > 0) {
    try {
      const urlResults = await sourceHandlers.custom(query, customUrls);
      results.push(...urlResults);
    } catch (error) {
      logger.error(`Error processing custom URLs:`, error);
    }
  }

  // Process files if any
  if (files && files.length > 0) {
    try {
      const fileResults = await sourceHandlers.file(query, files);
      results.push(...fileResults);
    } catch (error) {
      logger.error(`Error processing files:`, error);
    }
  }

  return results;
}

async function searchOpenSources(query, selectedSources = []) {
  if (!query) {
    throw new Error('Search query is required');
  }

  try {
    const searchPromises = selectedSources.map(source => {
      const handler = sourceHandlers[source.toLowerCase()];
      if (!handler) {
        logger.warn(`No handler found for source: ${source}`);
        return Promise.resolve([]);
      }
      return handler(query).catch(error => {
        logger.error(`Error searching ${source}:`, error);
        return [];
      });
    });

    // Wait for all searches to complete
    const results = await Promise.allSettled(searchPromises);
    
    // Process results
    const validResults = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
      .flat()
      .filter(r => r && r.content);

    if (validResults.length === 0) {
      return {
        summary: {
          content: 'No results found from any source',
          sourceMap: {}
        },
        results: []
      };
    }

    // Process with LLM
    const summary = await processResults(query, validResults);
    return { summary, results: validResults };
  } catch (error) {
    logger.error('Open search error:', error);
    throw error;
  }
}

async function searchVerifiedSources(query, options = {}) {
  const {
    category = null,
    model = 'mixtral-8x7b',
    context = ''
  } = options;

  try {
    let results = [];

    // Handle market data specially
    if (category === 'Market Data Analytics') {
      const marketResults = await sourceHandlers.marketData(query);
      if (marketResults.length > 0) {
        return {
          summary: {
            content: `Found market data for ${marketResults[0].title}`,
            sourceMap: {}
          },
          results: marketResults
        };
      }
    }

    // Fall back to verified sources
    const sources = category ? VERIFIED_SOURCES[category] : Object.values(VERIFIED_SOURCES).flat();
    const searchPromises = sources.map(source => 
      sourceHandlers.custom({ url: source.url, query })
        .catch(error => {
          logger.error(`Error searching ${source.name}:`, error);
          return [];
        })
    );

    // Wait for all searches to complete
    const searchResults = await Promise.allSettled(searchPromises);
    
    // Process results
    const validResults = searchResults
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
      .flat()
      .filter(r => r && r.content);

    if (validResults.length === 0) {
      return {
        summary: {
          content: 'No results found from verified sources',
          sourceMap: {}
        },
        results: []
      };
    }

    // Process with LLM
    const summary = await processResults(query, validResults, model, context);
    return { summary, results: validResults };
  } catch (error) {
    logger.error('Verified search error:', error);
    throw error;
  }
}

/**
 * Simplified search function that uses the source handlers
 * @param {string} query - The search query
 * @param {Array<string>} sources - Array of source names to search
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} - Array of search results
 */
async function performSimpleSearch(query, sources = ['web'], options = {}) {
  try {
    if (!query) {
      throw new Error('Query is required');
    }

    const { customUrls, uploadedFiles, model } = options;
    let results = [];

    // Use the performSearch function from sourceIntegration
    const searchResults = await sourcePerformSearch(query, sources);
    results = [...results, ...searchResults];

    // Handle custom sources if provided
    if (customUrls && customUrls.length > 0 || uploadedFiles && uploadedFiles.length > 0) {
      try {
        const customResults = await handleCustomSources(query, customUrls || [], uploadedFiles || []);
        results = [...results, ...customResults];
      } catch (customError) {
        logger.error('Error processing custom sources:', customError);
      }
    }

    return results;
  } catch (error) {
    logger.error('Error in performSimpleSearch:', error);
    return [];
  }
}

/**
 * Simplified verified search function
 * @param {string} query - The search query
 * @param {Array<string>} sources - Array of source names to search
 * @param {Object} options - Additional options including customUrls and uploadedFiles
 * @returns {Promise<Array>} - Array of search results
 */
async function performSimpleVerifiedSearch(query, sources = ['fmp', 'sec'], options = {}) {
  try {
    if (!query) {
      throw new Error('Query is required');
    }

    const { customUrls, uploadedFiles, model } = options;
    let results = [];

    // Use the performSearch function from sourceIntegration for verified sources
    const verifiedResults = await sourcePerformSearch(query, sources);
    results = [...results, ...verifiedResults];

    // Handle custom sources if provided
    if (customUrls && customUrls.length > 0 || uploadedFiles && uploadedFiles.length > 0) {
      try {
        const customResults = await handleCustomSources(query, customUrls || [], uploadedFiles || []);
        results = [...results, ...customResults];
      } catch (customError) {
        logger.error('Error processing custom sources:', customError);
      }
    }

    return results;
  } catch (error) {
    logger.error('Error in performSimpleVerifiedSearch:', error);
    return [];
  }
}

module.exports = {
  VERIFIED_SOURCES,
  processResults,
  performVerifiedSearch,
  performSearch,
  handleCustomSources,
  searchOpenSources,
  searchVerifiedSources,
  performSimpleSearch,
  performSimpleVerifiedSearch
};
