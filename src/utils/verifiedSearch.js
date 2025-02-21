import { VC_FIRMS, MARKET_DATA_SOURCES } from './dataSources';
import { searchCustomSources } from './customSearch';

export async function searchVerifiedSources(query, options = {}) {
  const { mode = 'default', customUrls = [], uploadedFiles = [] } = options;

  let results = [];

  switch (mode) {
    case 'default':
      // Only search default verified sources
      results = await Promise.all([
        searchVCContent(query),
        searchMarketData(query),
        searchVCInfluencerContent(query)
      ]);
      results = results.flat();
      break;

    case 'custom':
      // Only search custom sources
      results = await searchCustomSources(query, customUrls, uploadedFiles);
      break;

    case 'combined':
      // Search both default and custom sources
      const [defaultResults, customResults] = await Promise.all([
        Promise.all([
          searchVCContent(query),
          searchMarketData(query),
          searchVCInfluencerContent(query)
        ]).then(results => results.flat()),
        searchCustomSources(query, customUrls, uploadedFiles)
      ]);
      results = [...defaultResults, ...customResults];
      break;

    default:
      throw new Error(`Invalid search mode: ${mode}`);
  }

  // Add source attribution and deduplicate
  return deduplicateResults(results.map(result => ({
    ...result,
    verified: !result.isCustom,
    sourceType: result.isCustom ? 'custom' : 'verified'
  })));
}

function deduplicateResults(results) {
  // Deduplicate by URL while preserving the verified source if available
  const urlMap = new Map();
  
  results.forEach(result => {
    const existing = urlMap.get(result.url);
    if (!existing || (result.verified && !existing.verified)) {
      urlMap.set(result.url, result);
    }
  });

  return Array.from(urlMap.values());
}

async function searchVCContent(query) {
  // Enhanced VC firm search including partners and content
  return Object.entries(VC_FIRMS).flatMap(([key, firm]) => {
    const results = [];
    
    // Firm info
    if (matchesQuery(firm, query)) {
      results.push({
        title: firm.name,
        content: `${firm.name} - ${firm.focus.join(', ')}`,
        url: firm.handles?.linkedin || firm.handles?.x,
        type: 'vc_firm',
        verified: true,
        metadata: {
          aum: firm.aum,
          tier: firm.tier,
          focus: firm.focus
        }
      });
    }

    // Partner info
    firm.partners?.forEach(partner => {
      if (matchesQuery(partner, query)) {
        results.push({
          title: partner.name,
          content: `${partner.name} - ${partner.focus.join(', ')}`,
          url: partner.handles?.linkedin || partner.handles?.x,
          type: 'vc_partner',
          verified: true,
          metadata: {
            firm: firm.name,
            focus: partner.focus
          }
        });
      }
    });

    return results;
  });
}

async function searchMarketData(query) {
  return Object.values(MARKET_DATA_SOURCES)
    .flat()
    .filter(source => matchesQuery(source, query))
    .map(source => ({
      title: source.name,
      content: source.description || source.specialty?.join(', '),
      url: source.research_portals?.public || source.handles?.linkedin,
      type: 'market_data',
      verified: true,
      metadata: {
        dataTypes: source.data_types,
        specialty: source.specialty
      }
    }));
}

async function searchVCInfluencerContent(query) {
  // This would integrate with a service that indexes YC and VC influencer content
  const vcContent = await searchVCWebsites(query);
  return vcContent.map(content => ({
    ...content,
    verified: true,
    type: 'vc_content'
  }));
}

function matchesQuery(obj, query) {
  const searchText = JSON.stringify(obj).toLowerCase();
  const terms = query.toLowerCase().split(' ');
  return terms.every(term => searchText.includes(term));
} 