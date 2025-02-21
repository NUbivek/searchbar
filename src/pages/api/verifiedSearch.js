// For market data analytics and vcaccounts list 

import { VC_FIRMS, MARKET_DATA_SOURCES } from '../../utils/dataSources';
import { getMarketData } from '../../utils/marketData';
import { searchVerifiedSources } from '../../utils/verifiedSearch';

export default async function handler(req, res) {
  // Set proper headers
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    const { query, model, customMode, customUrls, uploadedFiles } = req.body;
    
    console.log('Request parameters:', {
      query,
      model,
      customMode,
      hasCustomUrls: !!customUrls?.length,
      hasUploadedFiles: !!uploadedFiles?.length
    });

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await searchVerifiedSources(query, {
      model,
      mode: customMode,
      customUrls: customUrls || [],
      uploadedFiles: uploadedFiles || []
    });

    console.log('Search completed with results:', {
      hasResults: !!results,
      resultCount: results?.sources?.length
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Search failed', 
      message: error.message 
    });
  }
} 