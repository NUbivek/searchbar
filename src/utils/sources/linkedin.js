import axios from 'axios';
import { logger } from '../logger';

export async function searchLinkedIn(query) {
  const searchId = Math.random().toString(36).substring(7);
  logger.debug(`[${searchId}] Searching LinkedIn`, { query });

  try {
    const response = await axios.get('/api/search/linkedin', {
      params: {
        query,
        type: 'posts,companies,people',
        limit: 10
      }
    });

    if (!response.data?.results) {
      return [];
    }

    return response.data.results.map(item => ({
      source: 'LinkedIn',
      type: 'LinkedInResult',
      content: `${item.title || item.name}\n${item.description || item.snippet || ''}`,
      url: item.url || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    logger.error(`[${searchId}] LinkedIn search error:`, error.message);
    return [{
      source: 'LinkedIn',
      type: 'SearchError',
      content: 'Unable to search LinkedIn at this time. Please try again later.',
      url: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString()
    }];
  }
}
