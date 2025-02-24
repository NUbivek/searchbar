import axios from 'axios';
import { logger } from '../../../utils/logger';
import { rateLimit } from '../../../utils/rateLimiter';
import { JSDOM } from 'jsdom';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await limiter.check(res, 10, 'SUBSTACK_CACHE_TOKEN');
    
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Use Serper API to search Substack
    const serperApiKey = process.env.SERPER_API_KEY;
    if (!serperApiKey) {
      throw new Error('Serper API key not configured');
    }

    const response = await axios.post('https://google.serper.dev/search', 
      { 
        q: `site:substack.com ${query}`,
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
      for (const result of response.data.organic) {
        if (!result.link || !result.title) continue;

        try {
          // Fetch the actual Substack page
          const pageResponse = await axios.get(result.link);
          const dom = new JSDOM(pageResponse.data);
          const document = dom.window.document;

          // Extract article content and metadata
          const article = document.querySelector('article');
          const author = document.querySelector('.author-name')?.textContent || '';
          const date = document.querySelector('.post-date')?.textContent || '';
          const content = article ? article.textContent.slice(0, 1000) : result.snippet;

          results.push({
            source: 'Substack',
            type: 'Article',
            title: result.title,
            content: content,
            url: result.link,
            author: author,
            timestamp: date || new Date().toISOString()
          });
        } catch (error) {
          // If we can't fetch the page, use the search result snippet
          results.push({
            source: 'Substack',
            type: 'Article',
            title: result.title,
            content: result.snippet || '',
            url: result.link,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    res.json({ results });
  } catch (error) {
    logger.error('Substack search error:', error);
    res.status(500).json({ error: error.message });
  }
}
