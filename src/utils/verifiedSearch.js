import { VC_FIRMS, MARKET_DATA_SOURCES } from './dataSources';
import { searchCustomSources } from './customSearch';
import { customSearch } from './customSearch';
import { processWithLLM } from './llmProcessing';

export async function searchVerifiedSources(query, options = {}) {
  const { model, mode = 'verified', customUrls = [], uploadedFiles = [] } = options;

  let results = [];

  // Search based on mode
  if (mode === 'verified' || mode === 'combined') {
    // Search verified sources
    const verifiedResults = await Promise.all([
      searchVCFirms(query),
      searchMarketData(query)
    ]);
    results.push(...verifiedResults.flat());
  }

  if (mode === 'custom' || mode === 'combined') {
    // Search custom sources
    const customResults = await Promise.all([
      searchCustomUrls(query, customUrls),
      searchUploadedFiles(query, uploadedFiles)
    ]);
    results.push(...customResults.flat());
  }

  // Process results with selected LLM model
  const processedResults = await processWithLLM(results, model);

  return {
    summary: processedResults.summary,
    sources: results.map(result => ({
      ...result,
      content: processedResults.contentMap[result.url] || result.content
    }))
  };
}

async function searchVCFirms(query) {
  return Object.entries(VC_FIRMS)
    .filter(([_, firm]) => matchesQuery(firm, query))
    .map(([_, firm]) => ({
      source: firm.name,
      type: 'VC Firm',
      content: `${firm.name} - ${firm.focus.join(', ')}`,
      url: firm.handles?.linkedin || firm.handles?.x,
      verified: true
    }));
}

async function searchMarketData(query) {
  return Object.values(MARKET_DATA_SOURCES)
    .flat()
    .filter(source => matchesQuery(source, query))
    .map(source => ({
      source: source.name,
      type: 'Market Data',
      content: source.specialty?.join(', '),
      url: source.research_portals?.public,
      verified: true
    }));
}

function matchesQuery(obj, query) {
  const searchText = JSON.stringify(obj).toLowerCase();
  const terms = query.toLowerCase().split(' ');
  return terms.every(term => searchText.includes(term));
}

export async function verifiedSearch(query, options = {}) {
  return await customSearch(query, { ...options, verifiedOnly: true });
}

export default verifiedSearch; 