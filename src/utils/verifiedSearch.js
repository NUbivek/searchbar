import { VC_FIRMS, MARKET_DATA_SOURCES, searchAcrossDataSources } from './dataSources';
import { processWithLLM } from './llmProcessing';

export async function searchVerifiedSources(query, options = {}) {
  console.log('Starting search with:', { query, options });

  const { model, mode = 'verified', customUrls = [], uploadedFiles = [] } = options;

  try {
    let results = [];

    // Verify data sources are loaded
    console.log('Data sources check:', {
      hasVCFirms: !!VC_FIRMS,
      vcFirmsType: typeof VC_FIRMS,
      hasMarketData: !!MARKET_DATA_SOURCES,
      marketDataType: typeof MARKET_DATA_SOURCES
    });

    // Search based on mode
    if (mode === 'verified' || mode === 'combined') {
      console.log('Searching verified sources...');
      
      try {
        const verifiedResults = await searchAcrossDataSources(query, {
          verifiedOnly: true,
          categories: ['financial', 'industry', 'consulting']
        });
        console.log('Verified results:', verifiedResults);
        results.push(...verifiedResults);

        const vcResults = Object.values(VC_FIRMS)
          .filter(firm => matchesQuery(firm, query))
          .map(firm => ({
            source: firm.name,
            type: 'VC Firm',
            content: `${firm.name} - ${firm.focus?.join(', ') || 'No focus specified'}`,
            url: firm.handles?.linkedin || firm.handles?.x || '#',
            verified: true
          }));
        console.log('VC results:', vcResults);
        results.push(...vcResults);
      } catch (e) {
        console.error('Error in verified search:', e);
      }
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

    return {
      summary: processedResults.summary,
      sources: results.map(result => ({
        ...result,
        content: processedResults.contentMap[result.url] || result.content
      }))
    };
  } catch (error) {
    console.error('Search failed with error:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
}

function matchesQuery(obj, query) {
  if (!query || !obj) return false;
  const searchText = JSON.stringify(obj).toLowerCase();
  const terms = query.toLowerCase().split(' ');
  return terms.every(term => searchText.includes(term));
} 