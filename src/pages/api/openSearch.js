import { searchOpenSources } from '../../utils/openSearch';
import { logger } from '../../utils/logger';

export default async function handler(req, res) {
  try {
    // Set headers
    res.setHeader('Content-Type', 'application/json');
    
    // Log request
    logger.debug('API request:', {
      method: req.method,
      url: req.url,
      body: req.body
    });

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed',
        allowedMethods: ['POST']
      });
    }

    const { query, model, sources = ['Web'], customUrls = [], uploadedFiles = [] } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await searchOpenSources({
      query,
      model,
      sources,
      customUrls,
      uploadedFiles
    });

    logger.debug('Search results:', results);

    return res.status(200).json(results);
  } catch (error) {
    logger.error('API error:', error);
    return res.status(500).json({
      error: 'Search failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 