import axios from 'axios';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  factor: 2 // Exponential backoff factor
};

// Custom error types
export class APIError extends Error {
  constructor(message, status, source) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.source = source;
  }
}

export class RateLimitError extends APIError {
  constructor(source, retryAfter) {
    super('Rate limit exceeded', 429, source);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// Retry mechanism with exponential backoff
export async function withRetry(operation, options = {}) {
  const config = { ...RETRY_CONFIG, ...options };
  let lastError;
  let delay = config.initialDelay;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error.status === 404 || error.status === 401) {
        throw error;
      }

      // Handle rate limiting specially
      if (error.status === 429) {
        const retryAfter = parseInt(error.response?.headers?.['retry-after']) * 1000 || delay;
        await sleep(retryAfter);
        continue;
      }

      // Last attempt failed
      if (attempt === config.maxRetries) {
        throw lastError;
      }

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * config.factor, config.maxDelay);
      await sleep(delay);
    }
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms)); 