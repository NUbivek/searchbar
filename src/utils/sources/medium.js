import axios from 'axios';
import { logger } from '../logger';

export async function scrapeMedium(query) {
  const searchId = Math.random().toString(36).substring(7);
  logger.debug(`[${searchId}] Searching Medium`, { query });

  try {
    // Use Serper API for better reliability
    const serperApiKey = process.env.SERPER_API_KEY;
    if (!serperApiKey) {
      return [{
        source: 'Medium',
        type: 'SearchError',
        content: 'Search API key not configured. Please check your environment variables.',
        url: `https://medium.com/search?q=${encodeURIComponent(query)}`,
        timestamp: new Date().toISOString()
      }];
    }

    const response = await axios.post('https://google.serper.dev/search', 
      { 
        q: `site:medium.com ${query}`,
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
      .filter(result => result.link && result.link.includes('medium.com'))
      .map(result => ({
        source: 'Medium',
        type: 'Blog',
        content: `${result.title}\n${result.snippet || ''}`,
        url: result.link,
        timestamp: new Date().toISOString()
      }));

  } catch (error) {
    logger.error(`[${searchId}] Medium search error:`, error.message);
    return [{
      source: 'Medium',
      type: 'SearchError',
      content: 'Unable to search Medium at this time. Please try again later.',
      url: `https://medium.com/search?q=${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString()
    }];
  }
}
