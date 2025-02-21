import { VC_FIRMS, MARKET_DATA_SOURCES, searchAcrossDataSources } from './dataSources';
import { processWithLLM } from './llmProcessing';

export async function searchVerifiedSources(query, options = {}) {
  const { model, mode = 'verified', customUrls = [], uploadedFiles = [] } = options;

  try {
    let results = [];

    // Search based on mode
    if (mode === 'verified' || mode === 'combined') {
      // Get verified sources results
      const verifiedResults = await searchAcrossDataSources(query, {
        verifiedOnly: true,
        categories: ['financial', 'industry', 'consulting']
      });
      results.push(...verifiedResults);

      // Add VC firms results
      const vcResults = Object.values(VC_FIRMS)
        .filter(firm => matchesQuery(firm, query))
        .map(firm => ({
          source: firm.name,
          type: 'VC Firm',
          content: `${firm.name} - ${firm.focus.join(', ')}`,
          url: firm.handles?.linkedin || firm.handles?.x,
          verified: true
        }));
      results.push(...vcResults);
    }

    // Handle custom sources
    if ((mode === 'custom' || mode === 'combined') && 
        (customUrls.length > 0 || uploadedFiles.length > 0)) {
      const customResults = [];
      
      // Handle URLs
      if (customUrls.length > 0) {
        const urlResults = customUrls.map(url => ({
          source: new URL(url).hostname,
          type: 'Custom URL',
          content: `Content from ${url}`,
          url,
          verified: false
        }));
        customResults.push(...urlResults);
      }

      // Handle files
      if (uploadedFiles.length > 0) {
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

    // Process with LLM
    const processedResults = await processWithLLM(results, model);

    return {
      summary: processedResults.summary,
      sources: results.map(result => ({
        ...result,
        content: processedResults.contentMap[result.url] || result.content
      }))
    };
  } catch (error) {
    console.error('Search error:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
}

function matchesQuery(obj, query) {
  if (!query || !obj) return false;
  const searchText = JSON.stringify(obj).toLowerCase();
  const terms = query.toLowerCase().split(' ');
  return terms.every(term => searchText.includes(term));
} 