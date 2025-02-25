const cors = require('cors');
const { searchVerifiedSources } = require('../utils/search');

const corsHandler = cors({
  origin: ['https://research.bivek.ai', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
});

module.exports = (req, res) => {
  return new Promise((resolve, reject) => {
    corsHandler(req, res, async (err) => {
      if (err) return reject(err);

      try {
        const { 
          query, 
          model, 
          customMode, 
          customUrls = [], 
          uploadedFiles = [],
          selectedSources = [] 
        } = req.body;

        if (!query) {
          return res.status(400).json({ error: 'Query is required' });
        }

        const results = await searchVerifiedSources(query, {
          model,
          mode: customMode,
          customUrls,
          uploadedFiles,
          selectedSources
        });

        res.json(results);
      } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
          error: 'Search failed',
          message: error.message
        });
      }
    });
  });
}; 