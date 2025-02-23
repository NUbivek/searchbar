import { VC_FIRMS, MARKET_DATA_SOURCES, searchAcrossDataSources } from './dataSources';
import { processWithLLM } from './llmProcessing';
import { logger } from './logger';
import { processFiles } from './fileProcessing';
import { searchCustomUrls } from './customSearch';

export async function searchVerifiedSources(query, options = {}) {
  const searchId = Math.random().toString(36).substring(7);
  logger.debug(`[${searchId}] Starting search`, { query, options });

  const { model, mode = 'verified', customUrls = [], uploadedFiles = [] } = options;

  try {
    if (!query) {
      throw new Error('Query is required');
    }

    let results = [];
    
    // Handle different search modes
    switch (mode) {
      case 'verified':
        // Search only verified sources
        results = await searchAcrossDataSources(query, {
          sources: MARKET_DATA_SOURCES,
          vcFirms: VC_FIRMS
        });
        break;
        
      case 'custom':
        // Search only user's custom sources
        if (uploadedFiles.length > 0) {
          const fileResults = await processFiles(uploadedFiles, query);
          results.push(...fileResults);
        }
        if (customUrls.length > 0) {
          const urlResults = await searchCustomUrls(customUrls, query);
          results.push(...urlResults);
        }
        break;
        
      case 'combined':
        // Search both verified and custom sources
        const [verifiedResults, fileResults, urlResults] = await Promise.all([
          searchAcrossDataSources(query, {
            sources: MARKET_DATA_SOURCES,
            vcFirms: VC_FIRMS
          }),
          uploadedFiles.length > 0 ? processFiles(uploadedFiles, query) : [],
          customUrls.length > 0 ? searchCustomUrls(customUrls, query) : []
        ]);
        
        results = [...verifiedResults, ...fileResults, ...urlResults];
        break;
        
      default:
        throw new Error('Invalid search mode');
    }

    // Process results with selected LLM model
    const processedResults = await processWithLLM(results, model);

    // Format results with source links
    return {
      results: processedResults.results.map(result => ({
        ...result,
        sourceUrl: result.url,
        sourceName: result.source,
        contributors: result.contributors || [],
        timestamp: result.timestamp,
        category: result.category || 'General'
      })),
      summary: processedResults.summary,
      metadata: {
        totalSources: results.length,
        searchId,
        mode,
        model
      }
    };

  } catch (error) {
    logger.error(`[${searchId}] Search failed:`, error);
    throw error;
  }
}

function matchesQuery(obj, query) {
  const searchStr = JSON.stringify(obj).toLowerCase();
  return query.toLowerCase().split(' ').every(term => searchStr.includes(term));
}