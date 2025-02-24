import axios from 'axios';
import { logger } from './logger';

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const REQUEST_TIMEOUT = 30000;

// Source configurations for web scraping and search
const sourceConfigs = {
  'LinkedIn': {
    domains: ['linkedin.com'],
    apiEndpoint: '/api/search/linkedin'
  },
  'Twitter': {
    domains: ['twitter.com', 'x.com'],
    apiEndpoint: '/api/search/twitter'
  },
  'Reddit': {
    domains: ['reddit.com'],
    apiEndpoint: '/api/search/reddit'
  },
  'Substack': {
    domains: ['substack.com'],
    apiEndpoint: null
  },
  'Medium': {
    domains: ['medium.com'],
    apiEndpoint: null
  },
  'Crunchbase': {
    domains: ['crunchbase.com'],
    apiEndpoint: '/api/search/crunchbase'
  },
  'Pitchbook': {
    domains: ['pitchbook.com'],
    apiEndpoint: '/api/search/pitchbook'
  },
  'Market Data Analytics': {
    domains: ['bloomberg.com', 'reuters.com', 'wsj.com'],
    apiEndpoint: null
  },
  'VC & Startups': {
    domains: ['crunchbase.com', 'pitchbook.com', 'techcrunch.com'],
    apiEndpoint: null
  }
};

// Source handlers for different types of searches
export const sourceHandlers = {
  // Market data handler
  marketData: async (query) => {
    const source = 'Market Data Analytics';
    return searchSource(query, source);
  },

  // VC firms handler
  vcFirms: async (query) => {
    const source = 'VC & Startups';
    return searchSource(query, source);
  },

  // Custom URL handler
  custom: async ({ url, query }) => {
    try {
      const response = await axios.post('/api/webScrape', {
        query,
        url
      }, {
        timeout: REQUEST_TIMEOUT
      });
      return normalizeResults([{
        ...response.data,
        url,
        source: 'Custom'
      }]);
    } catch (error) {
      logger.error('Custom URL search error:', error);
      return [];
    }
  },

  // File handler
  file: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/fileProcess', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: REQUEST_TIMEOUT
      });

      return normalizeResults([{
        title: file.name,
        content: response.data.content,
        source: 'File'
      }]);
    } catch (error) {
      logger.error('File processing error:', error);
      return [];
    }
  }
};

/**
 * Main search function for open research
 */
export async function searchOpenResearch(query, selectedSources, options = {}) {
  try {
    // Validate inputs
    if (!query) throw new Error('Query is required');
    if (!Array.isArray(selectedSources)) throw new Error('Sources must be an array');
    if (selectedSources.length === 0) throw new Error('At least one source must be selected');

    // Filter valid sources
    const validSources = selectedSources.filter(source => sourceConfigs[source]);
    if (validSources.length === 0) throw new Error('No valid sources selected');

    // Perform searches in parallel
    const searchPromises = validSources.map(source => searchSource(query, source));

    // Add custom sources if provided
    const { customUrls = [], files = [] } = options;
    if (customUrls.length > 0) {
      searchPromises.push(...customUrls.map(url => sourceHandlers.custom({ url, query })));
    }
    if (files.length > 0) {
      searchPromises.push(...files.map(file => sourceHandlers.file(file)));
    }

    // Wait for all searches to complete
    const results = await Promise.allSettled(searchPromises);
    
    // Process results
    const validResults = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value)
      .flat()
      .filter(Boolean);

    // Return normalized results
    return {
      summary: {
        content: '',
        sourceMap: {}
      },
      results: normalizeResults(validResults)
    };
  } catch (error) {
    logger.error('Open research search error:', error);
    throw error;
  }
}

/**
 * Search a specific source using all available methods
 */
async function searchSource(query, source) {
  const config = sourceConfigs[source];
  if (!config) return [];

  try {
    // Run all search methods in parallel
    const [apiResults, scrapeResults, webResults] = await Promise.all([
      searchAPI(query, source, config),
      searchWebScraping(query, source),
      searchSerper(query, config.domains)
    ]);

    // Combine results and add source information
    return [...apiResults, ...scrapeResults, ...webResults].map(result => ({
      ...result,
      source,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    logger.error(`Search error for ${source}:`, error);
    return [];
  }
}

/**
 * Search using source-specific API if available
 */
async function searchAPI(query, source, config) {
  if (!config.apiEndpoint) return [];

  try {
    const response = await axios.post(config.apiEndpoint, { query }, {
      timeout: REQUEST_TIMEOUT
    });
    return response.data.results || [];
  } catch (error) {
    logger.error(`API search error for ${source}:`, error);
    return [];
  }
}

/**
 * Search using web scraping
 */
async function searchWebScraping(query, source) {
  try {
    const response = await axios.post('/api/webScrape', {
      query,
      sources: [source]
    }, {
      timeout: REQUEST_TIMEOUT
    });
    return response.data.results || [];
  } catch (error) {
    logger.error(`Web scraping error for ${source}:`, error);
    return [];
  }
}

/**
 * Search using Serper API as fallback
 */
async function searchSerper(query, domains) {
  if (!SERPER_API_KEY) {
    logger.error('Missing SERPER_API_KEY');
    return [];
  }

  try {
    const response = await axios.post('https://google.serper.dev/search', {
      q: `${query} site:${domains.join(' OR site:')}`,
      num: 10
    }, {
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: REQUEST_TIMEOUT
    });

    return response.data.organic.map(result => ({
      title: result.title,
      content: result.snippet,
      url: result.link,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    logger.error('Serper API error:', error);
    return [];
  }
}

/**
 * Normalize results to a consistent format
 */
export function normalizeResults(results) {
  return results.map(result => ({
    title: result.title || '',
    content: result.content || result.description || '',
    url: result.url || result.link || '',
    source: result.source || 'Web',
    timestamp: result.timestamp || new Date().toISOString(),
    author: result.author || '',
    metadata: {
      ...result.metadata,
      industry: result.industry || '',
      subreddit: result.subreddit || ''
    }
  }));
}