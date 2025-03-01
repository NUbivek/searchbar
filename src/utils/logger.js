/**
 * @fileoverview Logging utility that provides different log levels and respects environment configuration
 */

import { isDebugMode } from './debug';

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
    if (isDebugMode()) {
      console.log('DEBUG:', ...args);
    }
  },

  /**
   * Log info messages when logging is enabled
   * @param {...*} args - Arguments to log
   */
  info: (...args) => {
    console.log('INFO:', ...args);
  },

  /**
   * Log error messages (always enabled)
   * @param {...*} args - Arguments to log
   */
  error: (...args) => {
    console.error('ERROR:', ...args);
  },

  /**
   * Log warning messages (always enabled)
   * @param {...*} args - Arguments to log
   */
  warn: (...args) => {
    console.warn('WARN:', ...args);
  }
};

// Export the logger object and individual methods
export { logger };
export const debug = logger.debug;
export const info = logger.info;
export const warn = logger.warn;
export const error = logger.error;