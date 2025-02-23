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
    await limiter.check(res, 10, 'TWITTER_SEARCH_TOKEN');
    
    const { query } = req.body;
    const TWITTER_API_KEY = process.env.TWITTER_API_KEY;

    if (!TWITTER_API_KEY) {
      throw new Error('Twitter API key not configured');
    }

    const response = await axios.get(`https://api.twitter.com/2/tweets/search/recent`, {
      headers: {
        'Authorization': `Bearer ${TWITTER_API_KEY}`
      },
      params: {
        query: query,
        max_results: 10,
        'tweet.fields': 'created_at,author_id,text,entities'
      }
    });

    return res.status(200).json({
      status: 'success',
      results: response.data.data.map(tweet => ({
        title: `Tweet by ${tweet.author_id}`,
        url: `https://twitter.com/user/status/${tweet.id}`,
        snippet: tweet.text,
        source: 'Twitter',
        timestamp: tweet.created_at
      }))
    });
  } catch (error) {
    console.error('Twitter search error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to search Twitter'
    });
  }
}
