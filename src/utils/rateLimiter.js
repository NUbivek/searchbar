import { RateLimitError } from './errorHandling';

class RateLimiter {
  constructor() {
    this.limits = {
      'LinkedIn': { max: 100, window: 60000, current: 0 }, // 100 requests per minute
      'X': { max: 180, window: 900000, current: 0 }, // 180 requests per 15 minutes
      'Reddit': { max: 60, window: 60000, current: 0 }, // 60 requests per minute
      'Web': { max: 300, window: 60000, current: 0 } // 300 requests per minute
    };
    this.timestamps = {};
  }

  async checkLimit(source) {
    const limit = this.limits[source];
    if (!limit) return true;

    const now = Date.now();
    const timestamps = this.timestamps[source] = this.timestamps[source] || [];

    // Remove old timestamps
    while (timestamps.length && timestamps[0] < now - limit.window) {
      timestamps.shift();
    }

    if (timestamps.length >= limit.max) {
      const oldestTimestamp = timestamps[0];
      const resetTime = oldestTimestamp + limit.window;
      throw new RateLimitError(source, resetTime - now);
    }

    timestamps.push(now);
    return true;
  }
}

export const rateLimiter = new RateLimiter(); 