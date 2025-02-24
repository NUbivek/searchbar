import axios from 'axios';
import { logger } from '../logger';

export async function searchTwitter(query) {
  const searchId = Math.random().toString(36).substring(7);
  logger.debug(`[${searchId}] Searching Twitter`, { query });

  try {
    const response = await axios.get('/api/search/twitter', {
      params: {
        query,
        limit: 10
      }
    });

    if (!response.data?.results) {
      return [];
    }

    return response.data.results.map(tweet => ({
      source: 'Twitter',
      type: 'TweetResult',
      content: tweet.text,
      url: tweet.url || `https://twitter.com/search?q=${encodeURIComponent(query)}`,
      timestamp: new Date(tweet.created_at || Date.now()).toISOString(),
      author: tweet.author?.username ? `@${tweet.author.username}` : undefined
    }));
  } catch (error) {
    logger.error(`[${searchId}] Twitter search error:`, error.message);
    return [{
      source: 'Twitter',
      type: 'SearchError',
      content: 'Unable to search Twitter at this time. Please try again later.',
      url: `https://twitter.com/search?q=${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString()
    }];
  }
}
