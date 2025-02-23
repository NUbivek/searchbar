import { rateLimit } from '../../../utils/rateLimiter';
import { logger } from '../../../utils/logger';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await limiter.check(res, 10, 'TWITTER_CACHE_TOKEN');
    
    const { query } = req.query;
    const apiKey = process.env.TWITTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('Twitter API key not configured');
    }

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Twitter API v2 endpoint
    const url = 'https://api.twitter.com/2/tweets/search/recent';
    const response = await fetch(`${url}?query=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Format results
    const results = data.data.map(tweet => ({
      source: 'X',
      type: 'Tweet',
      content: tweet.text,
      url: `https://twitter.com/user/status/${tweet.id}`,
      contributors: tweet.author ? [tweet.author.username] : [],
      timestamp: tweet.created_at
    }));

    return res.status(200).json({ results });
  } catch (error) {
    logger.error('Twitter search error:', error);
    return res.status(500).json({ error: error.message });
  }
}
