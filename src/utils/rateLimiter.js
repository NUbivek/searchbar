import { RateLimitError } from './errorHandling';
import { logger } from './logger';

// Rate limits per source (requests per minute)
const RATE_LIMITS = {
  web: process.env.RATE_LIMIT_WEB || (process.env.NODE_ENV === 'development' ? 10000 : 1000),
  linkedin: process.env.RATE_LIMIT_LINKEDIN || (process.env.NODE_ENV === 'development' ? 10000 : 500),
  x: process.env.RATE_LIMIT_X || (process.env.NODE_ENV === 'development' ? 10000 : 500),
  reddit: process.env.RATE_LIMIT_REDDIT || (process.env.NODE_ENV === 'development' ? 10000 : 500),
  crunchbase: process.env.RATE_LIMIT_CRUNCHBASE || (process.env.NODE_ENV === 'development' ? 10000 : 500),
  pitchbook: process.env.RATE_LIMIT_PITCHBOOK || (process.env.NODE_ENV === 'development' ? 10000 : 500),
  medium: process.env.RATE_LIMIT_MEDIUM || (process.env.NODE_ENV === 'development' ? 10000 : 500),
  substack: process.env.RATE_LIMIT_SUBSTACK || (process.env.NODE_ENV === 'development' ? 10000 : 500),
  marketdata: process.env.RATE_LIMIT_MARKET_DATA || (process.env.NODE_ENV === 'development' ? 10000 : 1000),
  vcfirms: process.env.RATE_LIMIT_VC_FIRMS || (process.env.NODE_ENV === 'development' ? 10000 : 1000),
  llm: process.env.RATE_LIMIT_LLM || (process.env.NODE_ENV === 'development' ? 10000 : 500),
  verified: process.env.RATE_LIMIT_VERIFIED || (process.env.NODE_ENV === 'development' ? 10000 : 1000),
  custom: process.env.RATE_LIMIT_CUSTOM || (process.env.NODE_ENV === 'development' ? 10000 : 500),
  together: process.env.RATE_LIMIT_TOGETHER || (process.env.NODE_ENV === 'development' ? 10000 : 500),
  verifiedsearch: process.env.RATE_LIMIT_VERIFIED_SEARCH || (process.env.NODE_ENV === 'development' ? 10000 : 500)
};

// Request tracking
const requestCounts = new Map();
const requestTimes = new Map();

// Helper function to clean up old requests
function cleanupOldRequests() {
  const now = Date.now();
  for (const [source, times] of requestTimes.entries()) {
    const validTimes = times.filter(time => now - time < 60000);
    if (validTimes.length === 0) {
      requestTimes.delete(source);
      requestCounts.delete(source);
    } else {
      requestTimes.set(source, validTimes);
      requestCounts.set(source, validTimes.length);
    }
  }
}

// Rate limiter class
class RateLimiter {
  async checkLimit(source) {
    const sourceKey = source.toLowerCase();
    const limit = RATE_LIMITS[sourceKey];

    if (!limit) {
      logger.warn(`No rate limit defined for source: ${sourceKey}`);
      return;
    }

    // Clean up old requests periodically
    cleanupOldRequests();

    const now = Date.now();
    const times = requestTimes.get(sourceKey) || [];
    const count = requestCounts.get(sourceKey) || 0;

    // Check if we're over the limit
    if (count >= limit) {
      const oldestRequest = times[0];
      const timeToWait = 60000 - (now - oldestRequest);
      
      if (timeToWait > 0) {
        logger.warn(`Rate limit exceeded for ${sourceKey}. Waiting ${timeToWait}ms`);
        await new Promise(resolve => setTimeout(resolve, timeToWait));
      }
    }

    // Update tracking
    times.push(now);
    requestTimes.set(sourceKey, times);
    requestCounts.set(sourceKey, times.length);
  }

  // Reset rate limits (useful for testing)
  reset() {
    requestCounts.clear();
    requestTimes.clear();
  }

  // Get current request count for a source
  getCount(source) {
    return requestCounts.get(source.toLowerCase()) || 0;
  }

  // Get remaining requests for a source
  getRemaining(source) {
    const sourceKey = source.toLowerCase();
    const limit = RATE_LIMITS[sourceKey];
    const count = this.getCount(sourceKey);
    return Math.max(0, limit - count);
  }

  destroy() {
    // No-op
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Export the rate limiter instance, class and helper function
export { RateLimiter, rateLimiter };
export const rateLimit = async (source) => rateLimiter.checkLimit(source);