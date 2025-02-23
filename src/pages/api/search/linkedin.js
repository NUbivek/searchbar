import { rateLimit } from '../../../utils/rateLimiter';
import { logger } from '../../../utils/logger';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await limiter.check(res, 10, 'LINKEDIN_CACHE_TOKEN');
    
    const { query } = req.query;
    const apiKey = process.env.LINKEDIN_API_KEY;
    
    if (!apiKey) {
      throw new Error('LinkedIn API key not configured');
    }

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // LinkedIn API endpoint
    const url = 'https://api.linkedin.com/v2/search';
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Restli-Protocol-Version': '2.0.0'
      },
      method: 'GET',
      body: JSON.stringify({
        q: query,
        type: ['COMPANY', 'PEOPLE', 'CONTENT']
      })
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Format results
    const results = data.elements.map(item => ({
      source: 'LinkedIn',
      type: item.type,
      content: item.text || item.description || '',
      url: item.url || item.permalink,
      contributors: item.author ? [item.author.name] : [],
      timestamp: item.created || new Date().toISOString()
    }));

    return res.status(200).json({ results });
  } catch (error) {
    logger.error('LinkedIn search error:', error);
    return res.status(500).json({ error: error.message });
  }
}
