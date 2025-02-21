export const logger = {
  debug: (...args) => {
    if (process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true') {
      console.log('[Debug]', ...args);
    }
  },
  error: (...args) => {
    console.error('[Error]', ...args);
  }
}; 