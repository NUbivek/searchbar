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
    await limiter.check(res, 10, 'REDDIT_CACHE_TOKEN');
    
    const { query } = req.query;
    const apiKey = process.env.REDDIT_API_KEY;
    
    if (!apiKey) {
      throw new Error('Reddit API key not configured');
    }

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Reddit API endpoint
    const url = 'https://oauth.reddit.com/search';
    const response = await fetch(`${url}?q=${encodeURIComponent(query)}&sort=relevance`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'ResearchHub/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Format results
    const results = data.data.children.map(post => ({
      source: 'Reddit',
      type: 'Post',
      content: post.data.selftext || post.data.title,
      url: `https://reddit.com${post.data.permalink}`,
      contributors: [post.data.author],
      timestamp: new Date(post.data.created_utc * 1000).toISOString(),
      subreddit: post.data.subreddit_name_prefixed
    }));

    return res.status(200).json({ results });
  } catch (error) {
    logger.error('Reddit search error:', error);
    return res.status(500).json({ error: error.message });
  }
}
