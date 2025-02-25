const axios = require('axios');
const { performSimpleVerifiedSearch } = require('../../../utils/searchUtils');
const { logger } = require('../../../utils/logger');
const { getAllVerifiedSources } = require('../../../utils/verifiedDataSources');
const { sourceHandlers } = require('../../../utils/sourceIntegration');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, sources = [], model, customUrls = [], uploadedFiles = [], verifiedDataSources = [] } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    logger.info('Verified search request:', { query, sources, model });

    // If no sources provided, return empty results
    if (sources.length === 0 && customUrls.length === 0 && uploadedFiles.length === 0) {
      return res.status(200).json({ results: [] });
    }

    // Initialize results array
    let results = [];

    // Process each source in parallel
    const sourcePromises = sources.map(async (source) => {
      try {
        // Get the appropriate handler for this source
        const handler = sourceHandlers[source];
        if (handler) {
          const sourceResults = await handler(query);
          return sourceResults;
        } else {
          logger.warn(`No handler found for source: ${source}`);
          return [];
        }
      } catch (error) {
        logger.error(`Error processing source ${source}:`, error);
        return [];
      }
    });

    // Process custom URLs if provided
    if (customUrls && customUrls.length > 0) {
      sourcePromises.push(sourceHandlers.custom(query, customUrls));
    }

    // Process uploaded files if provided
    if (uploadedFiles && uploadedFiles.length > 0) {
      sourcePromises.push(sourceHandlers.file(query, uploadedFiles));
    }

    // Process additional verified data sources if provided
    if (verifiedDataSources && verifiedDataSources.length > 0) {
      sourcePromises.push(sourceHandlers.verifiedData(query, verifiedDataSources));
    }

    // Wait for all source processing to complete
    const sourceResults = await Promise.all(sourcePromises);

    // Flatten results
    results = sourceResults.flat();

    // Sort results by relevance (if available) or other criteria
    results.sort((a, b) => {
      if (a.relevance && b.relevance) {
        return b.relevance - a.relevance;
      }
      return 0;
    });

    return res.status(200).json({ results });
  } catch (error) {
    logger.error('Verified search error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during search' });
  }
}
