/**
 * @fileoverview Error handling utilities for API requests including custom error types,
 * retry mechanisms, and rate limiting handlers.
 */

import axios from 'axios';

/**
 * Configuration for retry mechanism
 * @constant {Object}
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  factor: 2 // Exponential backoff factor
};

/**
 * Base class for API-related errors
 * @extends Error
 */
export class APIError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   * @param {string} source - Source of the error (e.g., 'linkedin', 'twitter')
   */
  constructor(message, status, source) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.source = source;
  }
}

/**
 * Error class for rate limit exceeded scenarios
 * @extends APIError
 */
export class RateLimitError extends APIError {
  /**
   * @param {string} source - Source that triggered the rate limit
   * @param {number} retryAfter - Time in milliseconds to wait before retrying
   */
  constructor(source, retryAfter) {
    super('Rate limit exceeded', 429, source);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Executes an operation with retry logic and exponential backoff
 * @async
 * @param {Function} operation - Async function to execute
 * @param {Object} [options={}] - Override default retry configuration
 * @returns {Promise<*>} Result of the operation
 * @throws {APIError} When max retries are exhausted or on fatal errors
 */
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