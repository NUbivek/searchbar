// For market data analytics and vcaccounts list 

import { VC_FIRMS, MARKET_DATA_SOURCES } from '../../utils/dataSources';
import { marketDataIntegration } from '../../utils/marketData';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.query;

  try {
    // Search across VC firms
    const vcResults = Object.entries(VC_FIRMS)
      .filter(([_, firm]) => {
        const searchText = JSON.stringify(firm).toLowerCase();
        return searchText.includes(query.toLowerCase());
      })
      .map(([key, firm]) => ({
        type: 'VC',
        source: firm.name,
        content: firm,
        url: firm.handles?.linkedin || firm.handles?.x || '',
        verified: true
      }));

    // Search across market data sources
    const marketResults = marketDataIntegration.searchMarketData(query, {
      searchInFirms: true,
      searchInPersonnel: true
    });

    const combinedResults = {
      summary: `Found ${vcResults.length + marketResults.firms.length + marketResults.personnel.length} relevant results`,
      sources: [
        ...vcResults,
        ...marketResults.firms.map(firm => ({
          type: 'Market Data',
          source: firm.name,
          content: firm,
          url: firm.research_portals?.public || firm.handles?.linkedin || '',
          verified: firm.verified
        })),
        ...marketResults.personnel.map(person => ({
          type: 'Expert',
          source: `${person.name} (${person.firm})`,
          content: person,
          url: person.handles?.linkedin || person.handles?.x || '',
          verified: person.verified
        }))
      ]
    };

    res.status(200).json(combinedResults);
  } catch (error) {
    console.error('Verified search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
} 