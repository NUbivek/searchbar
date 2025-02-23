import axios from 'axios';
import { rateLimit } from '../../../utils/rateLimit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await limiter.check(res, 10, 'LINKEDIN_SEARCH_TOKEN');
    
    const { query } = req.body;
    const LINKEDIN_API_KEY = process.env.LINKEDIN_API_KEY;

    if (!LINKEDIN_API_KEY) {
      throw new Error('LinkedIn API key not configured');
    }

    const response = await axios.get(`https://api.linkedin.com/v2/search`, {
      headers: {
        'Authorization': `Bearer ${LINKEDIN_API_KEY}`,
        'X-Restli-Protocol-Version': '2.0.0'
      },
      params: {
        q: query,
        count: 10
      }
    });

    return res.status(200).json({
      status: 'success',
      results: response.data.elements.map(item => ({
        title: item.title?.text || '',
        url: item.url || '',
        snippet: item.snippet || '',
        source: 'LinkedIn'
      }))
    });
  } catch (error) {
    console.error('LinkedIn search error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to search LinkedIn'
    });
  }
}
