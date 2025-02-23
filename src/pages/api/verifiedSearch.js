// For market data analytics and vcaccounts list 

import { VC_FIRMS, MARKET_DATA_SOURCES } from '../../utils/dataSources';
import { getMarketData } from '../../utils/marketData';
import { searchVerifiedSources } from '../../utils/verifiedSearch';
import { logger } from '../../utils/logger';

export default async function handler(req, res) {
  // Set CORS and content headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
  }

  try {
    const { 
      query, 
      model, 
      customMode, 
      customUrls = [], 
      uploadedFiles = [],
      selectedSources = [] 
    } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    logger.debug('Search request:', {
      query,
      model,
      customMode,
      hasCustomUrls: customUrls.length,
      hasUploadedFiles: uploadedFiles.length,
      selectedSources
    });

    const results = await searchVerifiedSources(query, {
      model,
      mode: customMode,
      customUrls,
      uploadedFiles,
      selectedSources
    });

    return res.status(200).json(results);
  } catch (error) {
    logger.error('Search error:', error);
    return res.status(500).json({
      error: 'Search failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 