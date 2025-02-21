import NodeCache from 'node-cache';

class SearchCache {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 3600, // 1 hour default TTL
      checkperiod: 600 // Check for expired entries every 10 minutes
    });

    this.ttlConfig = {
      'verified': 86400, // 24 hours for verified sources
      'linkedin': 3600, // 1 hour for LinkedIn
      'twitter': 1800, // 30 minutes for Twitter
      'reddit': 1800, // 30 minutes for Reddit
      'web': 3600 // 1 hour for web results
    };
  }

  generateKey(query, options) {
    const normalized = query.toLowerCase().trim();
    return `${normalized}-${JSON.stringify(options)}`;
  }

  async getOrSet(key, source, fetchFunction) {
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    const result = await fetchFunction();
    const ttl = this.ttlConfig[source] || 3600;
    this.cache.set(key, result, ttl);
    return result;
  }

  invalidate(key) {
    this.cache.del(key);
  }
}

export const searchCache = new SearchCache(); 