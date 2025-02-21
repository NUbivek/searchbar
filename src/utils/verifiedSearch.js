import { VC_FIRMS, MARKET_DATA_SOURCES, searchAcrossDataSources } from './dataSources';
import { processWithLLM } from './llmProcessing';
import { logger } from './logger';

export async function searchVerifiedSources(query, options = {}) {
  const searchId = Math.random().toString(36).substring(7);
  logger.debug(`[${searchId}] Starting search`, { query, options });

  const { model, mode = 'verified', customUrls = [], uploadedFiles = [] } = options;

  try {
    // Track each step
    const steps = {
      start: Date.now(),
      dataSourcesLoaded: false,
      searchStarted: false,
      resultsProcessed: false,
      end: null
    };

    // Verify data sources
    const dataSourcesCheck = {
      hasVCFirms: !!VC_FIRMS,
      vcFirmsCount: Object.keys(VC_FIRMS || {}).length,
      hasMarketData: !!MARKET_DATA_SOURCES,
      marketDataCount: Object.keys(MARKET_DATA_SOURCES || {}).length
    };
    steps.dataSourcesLoaded = true;
    logger.debug(`[${searchId}] Data sources check:`, dataSourcesCheck);

    // Start search
    steps.searchStarted = true;
    const results = [];
    
    // Track each search operation
    const searchOperations = [];

    // Search based on mode
    if (mode === 'verified' || mode === 'combined') {
      console.log('Searching verified sources...');
      
      const verifiedOp = {
        type: 'verified',
        startTime: Date.now()
      };
      try {
        const verifiedResults = await searchAcrossDataSources(query, {
          verifiedOnly: true,
          categories: ['financial', 'industry', 'consulting']
        });
        console.log('Verified results:', verifiedResults);
        results.push(...verifiedResults);
        verifiedOp.success = true;
        verifiedOp.resultCount = verifiedResults.length;
      } catch (e) {
        console.error('Error in verified search:', e);
        verifiedOp.success = false;
        verifiedOp.error = e.message;
      }
      verifiedOp.endTime = Date.now();
      searchOperations.push(verifiedOp);
    }

    // Handle custom sources
    if ((mode === 'custom' || mode === 'combined') && 
        (customUrls.length > 0 || uploadedFiles.length > 0)) {
      console.log('Processing custom sources...');
      
      const customResults = [];
      
      if (customUrls.length > 0) {
        console.log('Processing URLs:', customUrls);
        const urlResults = customUrls.map(url => ({
          source: new URL(url).hostname,
          type: 'Custom URL',
          content: `Content from ${url}`,
          url,
          verified: false
        }));
        customResults.push(...urlResults);
      }

      if (uploadedFiles.length > 0) {
        console.log('Processing files:', uploadedFiles);
        const fileResults = uploadedFiles.map(file => ({
          source: file.name,
          type: 'Uploaded File',
          content: `Content from ${file.name}`,
          url: '#',
          verified: false
        }));
        customResults.push(...fileResults);
      }

      results.push(...customResults);
    }

    console.log('Pre-LLM results:', results);

    // Process with LLM
    const processedResults = await processWithLLM(results, model);
    console.log('Post-LLM results:', processedResults);

    // Process results
    steps.resultsProcessed = true;
    steps.end = Date.now();

    // Log performance
    logger.debug(`[${searchId}] Search completed`, {
      duration: steps.end - steps.start,
      steps,
      operations: searchOperations,
      resultCount: results.length
    });

    return {
      searchId,
      timing: {
        total: steps.end - steps.start,
        steps
      },
      results: results.map(result => ({
        ...result,
        content: processedResults.contentMap[result.url] || result.content
      }))
    };
  } catch (error) {
    logger.error(`[${searchId}] Search failed:`, error);
    throw new Error(`Search failed: ${error.message}`);
  }
}

function matchesQuery(obj, query) {
  if (!query || !obj) return false;
  const searchText = JSON.stringify(obj).toLowerCase();
  const terms = query.toLowerCase().split(' ');
  return terms.every(term => searchText.includes(term));
} 