import axios from 'axios';
import { rateLimit } from '../../../utils/rateLimit';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await limiter.check(res, 10, 'REDDIT_SEARCH_TOKEN');
    
    const { query } = req.body;
    const REDDIT_API_KEY = process.env.REDDIT_API_KEY;

    if (!REDDIT_API_KEY) {
      throw new Error('Reddit API key not configured');
    }

    const response = await axios.get(`https://oauth.reddit.com/search`, {
      headers: {
        'Authorization': `Bearer ${REDDIT_API_KEY}`,
        'User-Agent': 'ResearchHub/1.0'
      },
      params: {
        q: query,
        limit: 10,
        sort: 'relevance'
      }
    });

    return res.status(200).json({
      status: 'success',
      results: response.data.data.children.map(post => ({
        title: post.data.title,
        url: `https://reddit.com${post.data.permalink}`,
        snippet: post.data.selftext,
        source: 'Reddit',
        author: post.data.author,
        subreddit: post.data.subreddit_name_prefixed
      }))
    });
  } catch (error) {
    console.error('Reddit search error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to search Reddit'
    });
  }
}
