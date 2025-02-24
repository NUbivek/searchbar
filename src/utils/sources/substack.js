import axios from 'axios';
import { logger } from '../logger';

export async function scrapeSubstack(query) {
  const searchId = Math.random().toString(36).substring(7);
  logger.debug(`[${searchId}] Searching Substack`, { query });

  try {
    // Use Serper API for better reliability
    const serperApiKey = process.env.SERPER_API_KEY;
    if (!serperApiKey) {
      return [{
        source: 'Substack',
        type: 'SearchError',
        content: 'Search API key not configured. Please check your environment variables.',
        url: `https://substack.com/search?q=${encodeURIComponent(query)}`,
        timestamp: new Date().toISOString()
      }];
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

    if (!response.data?.organic) {
      return [];
    }

    return response.data.organic
      .filter(result => result.link && result.link.includes('substack.com'))
      .map(result => ({
        source: 'Substack',
        type: 'Newsletter',
        content: `${result.title}\n${result.snippet || ''}`,
        url: result.link,
        timestamp: new Date().toISOString()
      }));

  } catch (error) {
    logger.error(`[${searchId}] Substack search error:`, error.message);
    return [{
      source: 'Substack',
      type: 'SearchError',
      content: 'Unable to search Substack at this time. Please try again later.',
      url: `https://substack.com/search?q=${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString()
    }];
  }
}
