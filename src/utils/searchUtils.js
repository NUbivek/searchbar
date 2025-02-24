import { logger } from './logger';
import { searchWeb } from './deepWebSearch';
import { sourceHandlers } from './sourceIntegration';
import axios from 'axios';

// Search modes
export const SearchModes = {
  VERIFIED: 'verified',
  OPEN: 'open'
};

// Source types
export const SourceTypes = {
  WEB: 'web',
  LINKEDIN: 'linkedin',
  TWITTER: 'twitter',
  REDDIT: 'reddit',
  SUBSTACK: 'substack',
  CRUNCHBASE: 'crunchbase',
  PITCHBOOK: 'pitchbook',
  MEDIUM: 'medium',
  MARKET_DATA: 'market_data',
  VC_FIRMS: 'vc_firms',
  CUSTOM: 'custom'
};

// Constants for verified sources
export const VERIFIED_SOURCES = {
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
    { name: 'Andreessen Horowitz', url: 'https://a16z.com', region: 'US' },
    { name: 'Sequoia Capital', url: 'https://www.sequoiacap.com', region: 'US' },
    { name: 'Accel', url: 'https://www.accel.com', region: 'Global' }
  ]
};

// Process results with LLM
async function processResults(query, results, model = 'mixtral-8x7b', context = '') {
  try {
    const response = await axios.post('/api/llm/process', {
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
    throw error;
  }
}

// Perform search across selected sources
export async function performSearch(query, options = {}) {
  const {
    mode = SearchModes.VERIFIED,
    model = 'mixtral-8x7b',
    customUrls = [],
    files = [],
    sources = [],
    context = ''
  } = options;

  try {
    const searchPromises = [];

    // Handle verified sources
    if (mode === SearchModes.VERIFIED) {
      for (const sourceGroup of sources) {
        const { type, sources: groupSources } = sourceGroup;
        
        if (type === 'Market Data Analytics') {
          searchPromises.push(sourceHandlers.marketData(query));
        } else if (type === 'VC & Startups') {
          searchPromises.push(sourceHandlers.vcFirms(query));
        }
      }

      // Custom sources
      if (customUrls.length > 0 || files.length > 0) {
        const customResults = await handleCustomSources(query, customUrls, files);
        searchPromises.push(Promise.resolve(customResults));
      }
    } 
    // Handle open research sources
    else {
      for (const source of sources) {
        const handler = sourceHandlers[source.toLowerCase()];
        if (handler) {
          searchPromises.push(handler(query));
        }
      }

      // Add custom sources if any
      if (customUrls.length > 0 || files.length > 0) {
        const customResults = await handleCustomSources(query, customUrls, files);
        searchPromises.push(Promise.resolve(customResults));
      }
    }

    // Wait for all searches to complete
    const results = await Promise.allSettled(searchPromises);
    
    // Process results
    const validResults = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
      .flat()
      .filter(r => r && r.content); // Filter out empty results

    if (validResults.length === 0) {
      logger.warn('No results found', { query, mode, sources });
      return {
        summary: {
          content: 'No results found from any source',
          sourceMap: {}
        }
      };
    }

    // Group results by source and category
    const groupedResults = validResults.reduce((acc, result) => {
      const sourceKey = result.source;
      const categoryKey = result.category || 'Other';
      
      if (!acc[categoryKey]) {
        acc[categoryKey] = {};
      }
      
      if (!acc[categoryKey][sourceKey]) {
        acc[categoryKey][sourceKey] = [];
      }
      
      acc[categoryKey][sourceKey].push(result);
      return acc;
    }, {});

    // Process with LLM
    const summary = await processResults(query, validResults, model, context);
    return { summary, results: validResults };

  } catch (error) {
    logger.error('Search error:', error);
    throw error;
  }
}

// Handle custom sources (URLs and files)
async function handleCustomSources(query, customUrls = [], files = []) {
  const results = [];

  // Process custom URLs
  for (const url of customUrls) {
    try {
      const urlResults = await sourceHandlers.custom({ url, query });
      results.push(...urlResults);
    } catch (error) {
      logger.error(`Error processing custom URL ${url}:`, error);
    }
  }

  // Process files
  for (const file of files) {
    try {
      const fileResults = await sourceHandlers.file(file);
      results.push(...fileResults);
    } catch (error) {
      logger.error(`Error processing file ${file.name}:`, error);
    }
  }

  return results;
}

export async function searchOpenSources(query, selectedSources = []) {
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

export async function searchVerifiedSources(query, options = {}) {
  const {
    category = null,
    model = 'mixtral-8x7b',
    context = ''
  } = options;

  try {
    const sources = category ? VERIFIED_SOURCES[category] : Object.values(VERIFIED_SOURCES).flat();
    const searchPromises = sources.map(source => 
      sourceHandlers.custom({ url: source.url, query })
        .catch(error => {
          logger.error(`Error searching ${source.name}:`, error);
          return [];
        })
    );

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
