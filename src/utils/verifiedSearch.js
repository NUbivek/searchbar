import { VC_FIRMS, MARKET_DATA_SOURCES, searchAcrossDataSources } from './dataSources';
import { searchGovernmentData } from './governmentData';
import { VERIFIED_DATA_SOURCES, searchVerifiedSources as searchVerifiedSourcesInternal } from './verifiedDataSources';
import { debug, info, error, warn } from './logger';
import { withRetry } from './errorHandling';
import axios from 'axios';

export async function searchVerifiedSources(query, options = {}) {
  const searchId = Math.random().toString(36).substring(7);
  
  // Create a logger object for compatibility
  const log = {
    debug,
    info,
    error,
    warn
  };
  
  log.debug(`[${searchId}] Starting search`, { query, options });

  const { model, mode = 'verified', customUrls = [], uploadedFiles = [] } = options;

  try {
    // Validate inputs
    if (!query) {
      throw new Error('Query is required');
    }

    // Initialize results array
    let results = [];

    // Verify data sources are available
    if (!VC_FIRMS || !MARKET_DATA_SOURCES) {
      log.warn('Data sources unavailable, using fallback data');
    }

    // Verify API key is available
    if (!process.env.SERPER_API_KEY) {
      log.error('SERPER_API_KEY is not set');
      throw new Error('Search API key is not configured');
    }

    // Search based on mode
    if (mode === 'verified' || mode === 'combined') {
      log.debug('Searching verified sources and government data...');

      // Track successful and failed search attempts
      const searchResults = {
        government: { success: false, count: 0, error: null },
        verified: { success: false, count: 0, error: null },
        market: { success: false, count: 0, error: null },
        vc: { success: false, count: 0, error: null }
      };

      try {
        // Search government and financial data sources
        const govResults = await searchGovernmentData(query);
        if (govResults.length > 0) {
          results.push(...govResults.map(result => ({
            ...result,
            verified: true,
            relevance: 0.9  // High relevance for government data
          })));
          searchResults.government.success = true;
          searchResults.government.count = govResults.length;
        }
      } catch (error) {
        log.error('Error searching government data:', error);
        searchResults.government.error = error.message;
      }

      try {
        // Search additional verified sources
        const additionalResults = searchVerifiedSourcesInternal(query)
          .map(source => ({
            source: source.name,
            type: source.specialty?.[0] || 'Research',
            content: `${source.name} - ${source.focus?.join(', ') || 'No focus specified'}`,
            url: source.research_portals?.public || source.handles?.linkedin || source.handles?.x || '#',
            verified: true
          }));

        if (additionalResults.length > 0) {
          results.push(...additionalResults);
          searchResults.verified.success = true;
          searchResults.verified.count = additionalResults.length;
        }
      } catch (error) {
        log.error('Error searching verified sources:', error);
        searchResults.verified.error = error.message;
      }

      try {
        // Search market data with retry
        const marketResults = await withRetry(() => 
          searchAcrossDataSources(query, {
            verifiedOnly: true,
            categories: ['financial', 'industry', 'consulting']
          }), 3);
        
        if (marketResults && marketResults.length > 0) {
          results.push(...marketResults);
          searchResults.market.success = true;
          searchResults.market.count = marketResults.length;
        }
      } catch (error) {
        log.error('Error searching market data:', error);
        searchResults.market.error = error.message;
      }

      try {
        // Search VC firms
        const vcResults = Object.entries(VC_FIRMS)
          .filter(([_, firm]) => matchesQuery(firm, query))
          .map(([_, firm]) => ({
            source: firm.name,
            type: 'VC Firm',
            content: `${firm.name} - ${firm.focus?.join(', ') || 'No focus specified'}`,
            url: firm.handles?.linkedin || firm.handles?.x || '#',
            verified: true
          }));
        
        if (vcResults.length > 0) {
          results.push(...vcResults);
          searchResults.vc.success = true;
          searchResults.vc.count = vcResults.length;
        }
      } catch (error) {
        log.error('Error searching VC firms:', error);
        searchResults.vc.error = error.message;
      }

      log.debug('Verified search results:', {
        marketResultsCount: searchResults.market.count,
        vcResultsCount: searchResults.vc.count,
        governmentResultsCount: searchResults.government.count,
        verifiedResultsCount: searchResults.verified.count
      });
      
      // If no results from any source, throw an error
      if (results.length === 0) {
        const errors = Object.entries(searchResults)
          .filter(([_, data]) => data.error)
          .map(([source, data]) => `${source}: ${data.error}`)
          .join('; ');
          
        throw new Error(`No results found from any verified sources. Errors: ${errors || 'None'}`);
      }
    }

    // Process results with LLM if available
    if (results.length > 0 && model) {
      try {
        const llmResponse = await axios.post('/api/llm/process', {
          query,
          sources: results,
          model: model.toLowerCase(),
          context: ''
        });
        results = results.map(result => ({
          ...result,
          llmProcessed: llmResponse.data.content
        }));
      } catch (error) {
        log.error(`[${searchId}] LLM processing failed:`, error);
        // Continue with unprocessed results
      }
    }

    return results;

  } catch (error) {
    log.error(`[${searchId}] Search failed:`, error);
    throw error;
  }
}

// Improved query matching with fuzzy search
function matchesQuery(obj, query) {
  const searchTerms = query.toLowerCase().split(' ');
  const objString = JSON.stringify(obj).toLowerCase();
  
  return searchTerms.every(term => 
    objString.includes(term) || 
    // Add fuzzy matching for terms longer than 4 characters
    (term.length > 4 && [...objString].some((_, i) => 
      objString.slice(i).startsWith(term.slice(0, -1))
    ))
  );
}