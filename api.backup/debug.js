const cors = require('cors');

const corsHandler = cors({
  origin: ['https://research.bivek.ai', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
});

module.exports = (req, res) => {
  // Handle CORS
  return new Promise((resolve, reject) => {
    corsHandler(req, res, (err) => {
      if (err) return reject(err);
      
      res.json({
        status: 'API is working',
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.url
      });
    });
  });
}; 