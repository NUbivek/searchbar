import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiters = new Map();

export function rateLimit({ interval, uniqueTokenPerInterval }) {
  return {
    check: async (res, points, key) => {
      const rateLimiter = rateLimiters.get(key) || new RateLimiterMemory({
        points: uniqueTokenPerInterval,
        duration: interval,
      });
      
      rateLimiters.set(key, rateLimiter);

      try {
        await rateLimiter.consume(points);
      } catch (error) {
        res.setHeader('Retry-After', error.msBeforeNext / 1000);
        res.status(429).json({
          error: 'Too Many Requests',
          message: 'Please try again later'
        });
        throw error;
      }
    }
  };
}
