const axios = require('axios');
const { VC_FIRMS, MARKET_DATA_SOURCES } = require('./dataSources');

async function searchVerifiedSources(query, options = {}) {
  const { model, mode = 'verified', customUrls = [], uploadedFiles = [], selectedSources = [] } = options;

  try {
    let results = [];

    // Search verified sources
    if (mode === 'verified' || mode === 'combined') {
      // Search market data
      if (selectedSources.includes('MARKET_DATA')) {
        const marketResults = await searchMarketData(query);
        results.push(...marketResults);
      }

      // Search VC firms
      if (selectedSources.includes('VC_FIRMS')) {
        const vcResults = searchVCFirms(query);
        results.push(...vcResults);
      }
    }

    // Handle custom sources
    if ((mode === 'custom' || mode === 'combined') && 
        (customUrls.length > 0 || uploadedFiles.length > 0)) {
      const customResults = await processCustomSources(customUrls, uploadedFiles);
      results.push(...customResults);
    }

    // Process with LLM if specified
    if (model) {
      results = await processWithLLM(results, model);
    }

    return {
      query,
      timestamp: new Date().toISOString(),
      results
    };
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

// Helper functions
async function searchMarketData(query) {
  // Implement market data search
  return [];
}

function searchVCFirms(query) {
  return Object.values(VC_FIRMS)
    .filter(firm => matchesQuery(firm, query))
    .map(firm => ({
      source: firm.name,
      type: 'VC Firm',
      content: `${firm.name} - ${firm.focus?.join(', ') || 'No focus specified'}`,
      url: firm.handles?.linkedin || firm.handles?.x || '#',
      verified: true
    }));
}

async function processCustomSources(urls, files) {
  const results = [];
  
  // Process URLs
  if (urls.length > 0) {
    const urlResults = await Promise.all(
      urls.map(async (url) => {
        try {
          const response = await axios.get(url);
          return {
            source: new URL(url).hostname,
            type: 'Custom URL',
            content: response.data.substring(0, 1000),
            url,
            verified: false
          };
        } catch (error) {
          console.error(`Error fetching URL ${url}:`, error);
          return null;
        }
      })
    );
    results.push(...urlResults.filter(Boolean));
  }

  // Process files
  if (files.length > 0) {
    const fileResults = files.map(file => ({
      source: file.name,
      type: 'Uploaded File',
      content: `Content from ${file.name}`,
      url: '#',
      verified: false
    }));
    results.push(...fileResults);
  }

  return results;
}

function matchesQuery(obj, query) {
  if (!query || !obj) return false;
  const searchText = JSON.stringify(obj).toLowerCase();
  const terms = query.toLowerCase().split(' ');
  return terms.every(term => searchText.includes(term));
}

module.exports = {
  searchVerifiedSources
}; 