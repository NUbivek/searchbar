import { VC_FIRMS, MARKET_DATA_SOURCES, searchAcrossDataSources } from './dataSources';
import { logger } from './logger';
import { withRetry } from './errorHandling';
import axios from 'axios';

export async function searchVerifiedSources(query, options = {}) {
  const searchId = Math.random().toString(36).substring(7);
  logger.debug(`[${searchId}] Starting search`, { query, options });

  const { model, mode = 'verified', customUrls = [], uploadedFiles = [] } = options;

  try {
    // Validate inputs
    if (!query) {
      throw new Error('Query is required');
    }

    // Initialize results array
    let results = [];

    // Verify data sources are loaded with retry
    const getDataSources = withRetry(async () => {
      if (!VC_FIRMS || !MARKET_DATA_SOURCES) {
        throw new Error('Data sources unavailable');
      }
      return { VC_FIRMS, MARKET_DATA_SOURCES };
    }, 3);

    await getDataSources();

    // Search based on mode
    if (mode === 'verified' || mode === 'combined') {
      logger.debug('Searching verified sources...');

      // Search market data with retry
      const marketResults = await withRetry(() => 
        searchAcrossDataSources(query, {
          verifiedOnly: true,
          categories: ['financial', 'industry', 'consulting']
        }), 3);
      
      if (marketResults && marketResults.length > 0) {
        results.push(...marketResults);
      }

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
      }

      logger.debug('Verified search results:', {
        marketResultsCount: marketResults?.length || 0,
        vcResultsCount: vcResults.length
      });
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
        logger.error(`[${searchId}] LLM processing failed:`, error);
        // Continue with unprocessed results
      }
    }

    return results;

  } catch (error) {
    logger.error(`[${searchId}] Search failed:`, error);
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