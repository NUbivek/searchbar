// This catches any undefined API routes
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({
    error: 'API route not found',
    availableRoutes: ['/api/verifiedSearch', '/api/openSearch', '/api/debug']
  });
} 