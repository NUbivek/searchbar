const cors = require('cors');
const { searchVerifiedSources } = require('../utils/search');

const corsHandler = cors({
  origin: ['https://research.bivek.ai', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
});

// Validate input parameters
function validateInput(body) {
  const { 
    query, 
    model, 
    selectedSources = [] 
  } = body;

  const errors = [];

  if (!query) {
    errors.push('Query is required');
  }

  if (model && !['mixtral-8x7b', 'deepseek-70b', 'gemma-7b'].includes(model.toLowerCase())) {
    errors.push('Invalid model specified');
  }

  // Validate sources
  if (selectedSources.length > 0) {
    const validSources = ['web', 'linkedin', 'twitter', 'reddit', 'crunchbase', 'pitchbook'];
    selectedSources.forEach(source => {
      if (!validSources.includes(source)) {
        errors.push(`Invalid source: ${source}`);
      }
    });
  }

  return errors;
}

module.exports = (req, res) => {
  return new Promise((resolve, reject) => {
    corsHandler(req, res, async (err) => {
      if (err) return reject(err);

      try {
        // Input validation
        const validationErrors = validateInput(req.body);
        if (validationErrors.length > 0) {
          return res.status(400).json({ 
            error: 'Validation failed',
            details: validationErrors 
          });
        }

        const results = await searchVerifiedSources(req.body.query, {
          model: req.body.model,
          mode: 'open',
          selectedSources: req.body.selectedSources
        });

        res.status(200).json(results);
        resolve();
      } catch (error) {
        console.error('Open search error:', error);
        res.status(500).json({ 
          error: 'Search failed',
          message: error.message 
        });
        reject(error);
      }
    });
  });
};
