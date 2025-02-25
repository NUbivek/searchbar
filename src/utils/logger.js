const logger = {
  debug: (...args) => {
    if (process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true') {
      console.log('[Debug]', ...args);
    }
  },
  info: (...args) => {
    if (process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true') {
      console.log('[Info]', ...args);
    }
  },
  error: (...args) => {
    console.error('[Error]', ...args);
  },
  warn: (...args) => {
    console.warn('[Warning]', ...args);
  }
};

module.exports = { logger };