// For market data analytics and vcaccounts list 

import { VC_FIRMS, MARKET_DATA_SOURCES } from '../../utils/dataSources';
import { getMarketData } from '../../utils/marketData';
import { searchVerifiedSources } from '../../utils/verifiedSearch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, model, customMode, customUrls, uploadedFiles } = req.body;
    
    // Add logging to debug
    console.log('Search request:', { query, model, customMode });

    const results = await searchVerifiedSources(query, {
      model,
      mode: customMode,
      customUrls,
      uploadedFiles
    });

    // Add logging for results
    console.log('Search results:', results);

    res.status(200).json(results);
  } catch (error) {
    console.error('Verified search error:', error);
    res.status(500).json({ error: 'Search failed: ' + error.message });
  }
} 