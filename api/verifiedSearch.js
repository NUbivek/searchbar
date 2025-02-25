const cors = require('cors');
const { searchVerifiedSources } = require('../utils/search');
const { rateLimit } = require('../src/utils/rateLimiter');

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
    customMode, 
    customUrls = [], 
    uploadedFiles = [], 
    selectedSources = [] 
  } = body;

  const errors = [];

  if (!query) {
    errors.push('Query is required');
  }

  if (model && !['mixtral-8x7b', 'deepseek-70b', 'gemma-7b'].includes(model.toLowerCase())) {
    errors.push('Invalid model specified');
  }

  if (customMode && !['research', 'analysis', 'summary'].includes(customMode)) {
    errors.push('Invalid custom mode specified');
  }

  // Validate URLs
  if (customUrls.length > 0) {
    customUrls.forEach(url => {
      try {
        new URL(url);
      } catch {
        errors.push(`Invalid URL: ${url}`);
      }
    });
  }

  // Validate files
  if (uploadedFiles.length > 0) {
    uploadedFiles.forEach(file => {
      if (!file || !file.name || !file.content) {
        errors.push(`Invalid file: ${file?.name || 'unnamed'}`);
      }
    });
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

        // Rate limiting
        try {
          await rateLimit('verified_search');
        } catch (error) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: error.message
          });
        }

        const results = await searchVerifiedSources(req.body.query, {
          model: req.body.model,
          mode: req.body.customMode,
          customUrls: req.body.customUrls,
          uploadedFiles: req.body.uploadedFiles,
          selectedSources: req.body.selectedSources
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