import { searchVerifiedSources } from '../../../utils/verifiedSearch';
import { searchOpenSources } from '../../../utils/openSearch';
import { processWithLLM } from '../../../utils/llmProcessing';
import { searchWeb } from '../../../utils/deepWebSearch';
import { logger } from '../../../utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, mode = 'open', sources = ['Web'], model = 'mixtral', customUrls = [], files = [] } = req.body;

  try {
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    logger.debug('Search request:', { query, mode, sources, model });

    let results;

    if (mode === 'verified') {
      // Use verified sources search
      const sourceResults = await searchVerifiedSources(query, customUrls, files);
      results = sourceResults.results || sourceResults;
    } else if (sources.includes('Web')) {
      // Use DuckDuckGo web search
      results = await searchWeb(query);
    } else {
      // Use open sources search
      const sourceResults = await searchOpenSources(query, sources, model);
      results = sourceResults.results || sourceResults;
    }

    // Return the results
    res.status(200).json({ results });
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message
    });
  }
}
