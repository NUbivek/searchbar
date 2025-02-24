import axios from 'axios';
import { logger } from '../logger';

export async function searchReddit(query) {
  const searchId = Math.random().toString(36).substring(7);
  logger.debug(`[${searchId}] Searching Reddit`, { query });

  try {
    const response = await axios.get('/api/search/reddit', {
      params: {
        query,
        limit: 10,
        sort: 'relevance',
        time: 'month'
      }
    });

    if (!response.data?.results) {
      return [];
    }

    return response.data.results.map(post => ({
      source: 'Reddit',
      type: 'RedditResult',
      content: `${post.title}\n${post.selftext || post.url || ''}`,
      url: post.permalink ? `https://reddit.com${post.permalink}` : `https://reddit.com/search?q=${encodeURIComponent(query)}`,
      timestamp: new Date(post.created_utc * 1000).toISOString(),
      author: post.author,
      subreddit: post.subreddit_name_prefixed
    }));
  } catch (error) {
    logger.error(`[${searchId}] Reddit search error:`, error.message);
    return [{
      source: 'Reddit',
      type: 'SearchError',
      content: 'Unable to search Reddit at this time. Please try again later.',
      url: `https://reddit.com/search?q=${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString()
    }];
  }
}
