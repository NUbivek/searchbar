import axios from 'axios';
import { VC_FIRMS, MARKET_DATA_SOURCES } from './dataSources';
import { withRetry } from './errorHandling';
import { rateLimiter } from './rateLimiter';
import { searchCache } from './cache';

// LinkedIn Search
export async function searchLinkedIn(query) {
  const cacheKey = searchCache.generateKey(query, { source: 'linkedin' });
  
  return await searchCache.getOrSet(cacheKey, 'linkedin', async () => {
    await rateLimiter.checkLimit('LinkedIn');
    
    return await withRetry(async () => {
      const response = await axios.get('/api/sourceSearch', {
        params: {
          source: 'LinkedIn',
          query,
          fields: 'posts,companies,people',
          limit: 20
        }
      });

      return response.data.map(item => ({
        title: item.title || item.name,
        content: item.description || item.snippet,
        url: item.url,
        author: item.author,
        type: 'linkedin',
        timestamp: item.created
      }));
    });
  });
}

// Twitter/X Search
export async function searchTwitter(query) {
  const response = await axios.get('/api/sourceSearch', {
    params: {
      source: 'X',
      query,
      type: 'mixed',
      limit: 20
    }
  });

  return response.data.map(tweet => ({
    title: tweet.text.split('\n')[0],
    content: tweet.text,
    url: `https://twitter.com/user/status/${tweet.id}`,
    author: tweet.author,
    type: 'twitter',
    timestamp: tweet.created_at
  }));
}

// Reddit Search
export async function searchReddit(query) {
  const response = await axios.get('/api/sourceSearch', {
    params: {
      source: 'Reddit',
      query,
      sort: 'relevance',
      limit: 20
    }
  });

  return response.data.map(post => ({
    title: post.title,
    content: post.selftext,
    url: `https://reddit.com${post.permalink}`,
    author: post.author,
    type: 'reddit',
    timestamp: post.created_utc
  }));
}

// Verified Sources Search
export async function searchVerifiedSources(query) {
  // Search through VC firms
  const vcResults = Object.entries(VC_FIRMS)
    .filter(([_, firm]) => {
      const searchText = JSON.stringify(firm).toLowerCase();
      return searchText.includes(query.toLowerCase());
    })
    .map(([key, firm]) => ({
      title: firm.name,
      content: `${firm.name} - ${firm.focus.join(', ')}`,
      url: firm.handles?.linkedin || firm.handles?.x,
      type: 'vc_firm',
      verified: true
    }));

  // Search through market data sources
  const marketResults = Object.values(MARKET_DATA_SOURCES)
    .flat()
    .filter(source => {
      const searchText = JSON.stringify(source).toLowerCase();
      return searchText.includes(query.toLowerCase());
    })
    .map(source => ({
      title: source.name,
      content: source.description || source.specialty?.join(', '),
      url: source.research_portals?.public || source.handles?.linkedin,
      type: 'market_data',
      verified: true
    }));

  return [...vcResults, ...marketResults];
}

// Combined search function
export async function searchSources(query, options) {
  const { mode, selectedSources, customUrls, uploadedFiles } = options;

  if (mode === 'verified') {
    const results = await searchVerifiedSources(query);
    if (customUrls?.length || uploadedFiles?.length) {
      const customResults = await searchCustomSources(query, customUrls, uploadedFiles);
      return [...results, ...customResults];
    }
    return results;
  }

  // Handle open research mode
  const searchPromises = selectedSources.map(source => {
    switch (source) {
      case 'LinkedIn':
        return searchLinkedIn(query);
      case 'X':
        return searchTwitter(query);
      case 'Reddit':
        return searchReddit(query);
      case 'Web':
        return searchWeb(query);
      default:
        return scrapeSource(source, query);
    }
  });

  const results = await Promise.all(searchPromises);
  return results.flat();
} 