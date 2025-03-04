// Simplified verifiedSearch.js - LLM and search functionality temporarily disabled
import { logger } from '../../utils/logger';

export default async function handler(req, res) {
  // Set proper headers
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, options = {} } = req.body;
    
    // Regular search mode - simplified
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const { sources = [], model } = options;
    
    // Log request - but don't perform any actual search
    logger.debug('Simplified Verified Search API', { query, sources });
    
    // Return a simple placeholder response with empty results
    // This endpoint no longer performs actual searches or LLM processing
    const simplifiedResponse = {
      results: {
        query,
        model: model || 'mistral-7b',
        sources,
        timestamp: new Date().toISOString(),
        message: 'Search processing has been simplified. No results will be returned.',
        results: []
      }
    };
    
    return res.status(200).json(simplifiedResponse);
    
  } catch (error) {
    logger.error('Simplified verified search error:', error);
    return res.status(500).json({ 
      error: 'An error occurred in the simplified search handler',
      message: error.message 
    });
  }
} 