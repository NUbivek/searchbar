import { searchVerifiedSources } from '../../utils/verifiedSearch';
import { searchOpenSources } from '../../utils/openSearch';
import { processWithLLM } from '../../utils/llmProcessing';
import { logger } from '../../utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, mode, sources = ['Web'], model = 'mixtral', customUrls = [], files = [] } = req.body;

  try {
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    logger.debug('Search request:', { query, mode, sources, model });

    // Step 1: Source-specific search
    const sourceResults = mode === 'verified'
      ? await searchVerifiedSources(query, customUrls, files)
      : await searchOpenSources(query, sources, model);

    // Step 2: Process with LLM if needed
    const finalResults = sourceResults.results || sourceResults;

    // Step 3: Format and return results
    res.status(200).json({
      results: finalResults,
      errors: sourceResults.errors
    });
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message
    });
  }
}