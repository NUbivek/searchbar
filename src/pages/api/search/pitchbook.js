import axios from 'axios';
import { logger } from '../../../utils/logger';
import { rateLimit } from '../../../utils/rateLimiter';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await limiter.check(res, 10, 'PITCHBOOK_CACHE_TOKEN');
    
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Use Serper API to search Pitchbook
    const serperApiKey = process.env.SERPER_API_KEY;
    if (!serperApiKey) {
      throw new Error('Serper API key not configured');
    }

    const response = await axios.post('https://google.serper.dev/search', 
      { 
        q: `site:pitchbook.com ${query}`,
        num: 10
      },
      { 
        headers: { 
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const results = [];

    // Process search results
    if (response.data?.organic) {
      const organicResults = response.data.organic
        .filter(result => result.link && result.title)
        .map(result => {
          // Extract company name from title
          const title = result.title.replace(' Profile | PitchBook', '');
          
          // Parse investment, industry, and other info from snippet
          const snippet = result.snippet || '';
          const investmentMatch = snippet.match(/\$[\d.]+[MBK]/);
          const industryMatch = snippet.match(/(?:industry|sector): ([^.]+)/i);
          
          return {
            source: 'Pitchbook',
            type: 'Company',
            title: title,
            content: snippet,
            url: result.link,
            metadata: {
              investment: investmentMatch ? investmentMatch[0] : null,
              industry: industryMatch ? industryMatch[1].trim() : null
            },
            timestamp: new Date().toISOString()
          };
        });

      results.push(...organicResults);
    }

    res.json({ results });
  } catch (error) {
    logger.error('Pitchbook search error:', error);
    res.status(500).json({ error: error.message });
  }
}
