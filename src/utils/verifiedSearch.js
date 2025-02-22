import { VC_FIRMS, MARKET_DATA_SOURCES, searchAcrossDataSources } from './dataSources';
import { processWithLLM } from './llmProcessing';
import { logger } from './logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

    // Verify data sources are loaded
    if (!VC_FIRMS || !MARKET_DATA_SOURCES) {
      logger.error('Data sources not loaded properly');
      throw new Error('Data sources unavailable');
    }

    // Search based on mode
    if (mode === 'verified' || mode === 'combined') {
      logger.debug('Searching verified sources...');

      // Search market data
      const marketResults = await searchAcrossDataSources(query, {
        verifiedOnly: true,
        categories: ['financial', 'industry', 'consulting']
      });
      results.push(...marketResults);

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
      results.push(...vcResults);

      logger.debug('Verified search results:', {
        marketResultsCount: marketResults.length,
        vcResultsCount: vcResults.length
      });
    }

    // Handle custom sources
    if ((mode === 'custom' || mode === 'combined') && 
        (customUrls.length > 0 || uploadedFiles.length > 0)) {
      logger.debug('Processing custom sources...');
      
      // Process URLs
      if (customUrls.length > 0) {
        const urlResults = await Promise.all(
          customUrls.map(async (url) => {
            try {
              const response = await fetch(url);
              const text = await response.text();
              return {
                source: new URL(url).hostname,
                type: 'Custom URL',
                content: text.substring(0, 1000), // First 1000 chars for preview
                url,
                verified: false
              };
            } catch (error) {
              logger.error(`Error fetching URL ${url}:`, error);
              return null;
            }
          })
        );
        results.push(...urlResults.filter(Boolean));
      }

      // Process files
      if (uploadedFiles.length > 0) {
        const fileResults = uploadedFiles.map(file => ({
          source: file.name,
          type: 'Uploaded File',
          content: `Content from ${file.name}`,
          url: '#',
          verified: false
        }));
        results.push(...fileResults);
      }
    }

    // Process results with LLM
    const processedResults = await processWithLLM(results, model);
    
    logger.debug(`Search completed with ${results.length} results`);

    return {
      summary: processedResults.summary,
      sources: results.map(result => ({
        ...result,
        content: processedResults.contentMap[result.url] || result.content
      }))
    };
  } catch (error) {
    logger.error(`Search failed:`, error);
    throw new Error(`Search failed: ${error.message}`);
  }
}

function matchesQuery(obj, query) {
  if (!query || !obj) return false;
  const searchText = JSON.stringify(obj).toLowerCase();
  const terms = query.toLowerCase().split(' ');
  return terms.every(term => searchText.includes(term));
}

export async function verifiedSearch(query, model = 'Gemma 7B') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/verifiedSearch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, model }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in verifiedSearch:', error);
    throw error;
  }
} 