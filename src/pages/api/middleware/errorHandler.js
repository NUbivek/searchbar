export default function errorHandler(error, req, res, next) {
  console.error('API Error:', error);

  if (error.name === 'RateLimitError') {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      source: error.source,
      retryAfter: error.retryAfter
    });
  }

  if (error.name === 'APIError') {
    return res.status(error.status || 500).json({
      error: error.message,
      source: error.source
    });
  }

  // Default error response
  res.status(500).json({
    error: 'An unexpected error occurred',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
} 