import { VC_FIRMS, MARKET_DATA_SOURCES } from './dataSources';
import { searchCustomSources } from './customSearch';
import { customSearch } from './customSearch';
import { processWithLLM } from './llmProcessing';

export async function searchVerifiedSources(query, options = {}) {
  const { model, mode = 'verified', customUrls = [], uploadedFiles = [] } = options;

  try {
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
      if (customUrls.length > 0 || uploadedFiles.length > 0) {
        const customResults = await Promise.all([
          searchCustomUrls(query, customUrls),
          searchUploadedFiles(query, uploadedFiles)
        ]);
        results.push(...customResults.flat());
      }
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
  } catch (error) {
    console.error('Search error:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
}

async function searchVCFirms(query) {
  // Ensure VC_FIRMS is properly imported and structured
  if (!VC_FIRMS || typeof VC_FIRMS !== 'object') {
    console.error('VC_FIRMS data not properly loaded');
    return [];
  }

  return Object.entries(VC_FIRMS)
    .filter(([_, firm]) => matchesQuery(firm, query))
    .map(([_, firm]) => ({
      source: firm.name,
      type: 'VC Firm',
      content: `${firm.name} - ${firm.focus?.join(', ') || 'No focus areas specified'}`,
      url: firm.handles?.linkedin || firm.handles?.x || '#',
      verified: true
    }));
}

async function searchMarketData(query) {
  // Ensure MARKET_DATA_SOURCES is properly imported and structured
  if (!MARKET_DATA_SOURCES || !Array.isArray(MARKET_DATA_SOURCES)) {
    console.error('MARKET_DATA_SOURCES data not properly loaded');
    return [];
  }

  return MARKET_DATA_SOURCES
    .filter(source => matchesQuery(source, query))
    .map(source => ({
      source: source.name,
      type: 'Market Data',
      content: source.description || source.specialty?.join(', ') || 'No description available',
      url: source.url || source.research_portals?.public || '#',
      verified: true
    }));
}

async function searchCustomUrls(query, urls) {
  // Implement URL content fetching and searching
  return urls.map(url => ({
    source: new URL(url).hostname,
    type: 'Custom URL',
    content: `Content from ${url}`, // Replace with actual content fetching
    url,
    verified: false
  }));
}

async function searchUploadedFiles(query, files) {
  // Implement file content searching
  return files.map(file => ({
    source: file.name,
    type: 'Uploaded File',
    content: `Content from ${file.name}`, // Replace with actual file content
    url: '#',
    verified: false
  }));
}

function matchesQuery(obj, query) {
  if (!query || !obj) return false;

  const searchText = JSON.stringify(obj).toLowerCase();
  const terms = query.toLowerCase().split(' ');
  return terms.every(term => searchText.includes(term));
}

export async function verifiedSearch(query, options = {}) {
  return await customSearch(query, { ...options, verifiedOnly: true });
}

export default verifiedSearch; 