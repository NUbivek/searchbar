/**
 * @fileoverview Logging utility that provides different log levels and respects environment configuration
 */

/**
 * Logger object with methods for different logging levels
 * @namespace
 */
const logger = {
  /**
   * Log debug messages when logging is enabled
   * @param {...*} args - Arguments to log
   */
  debug: (...args) => {
    if (process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true') {
      console.log('[Debug]', ...args);
    }
  },

  /**
   * Log info messages when logging is enabled
   * @param {...*} args - Arguments to log
   */
  info: (...args) => {
    if (process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true') {
      console.log('[Info]', ...args);
    }
  },

  /**
   * Log error messages (always enabled)
   * @param {...*} args - Arguments to log
   */
  error: (...args) => {
    console.error('[Error]', ...args);
  },

  /**
   * Log warning messages (always enabled)
   * @param {...*} args - Arguments to log
   */
  warn: (...args) => {
    console.warn('[Warning]', ...args);
  }
};

module.exports = { logger };