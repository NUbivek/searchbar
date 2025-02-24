import { searchOpenSources } from '../../../utils/searchUtils';
import { logger } from '../../../utils/logger';
import axios from 'axios';

// Constants
const VALID_MODELS = ['mixtral-8x7b', 'deepseek-70b', 'gemma-7b'];
const VALID_SOURCES = ['web', 'linkedin', 'x', 'reddit', 'substack', 'crunchbase', 'pitchbook', 'medium', 'verified'];

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      query,
      model = 'gemma-7b',
      sources = ['web'],
      customUrls = [],
      uploadedFiles = [],
      context = ""
    } = req.body;

    // Input validation
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Valid query string is required' });
    }

    if (!VALID_MODELS.includes(model.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid model. Must be one of: ${VALID_MODELS.join(', ')}`,
        availableModels: VALID_MODELS
      });
    }

    // Validate sources
    const validatedSources = sources
      .map(s => s.toLowerCase())
      .filter(s => VALID_SOURCES.includes(s));

    if (validatedSources.length === 0 && customUrls.length === 0 && uploadedFiles.length === 0) {
      return res.status(400).json({
        error: 'At least one valid source must be selected',
        availableSources: VALID_SOURCES
      });
    }

    // Search sources
    logger.info('Starting open search', { query, model, sources: validatedSources });
    const searchResults = await searchOpenSources(query, validatedSources);

    if (!searchResults || searchResults.length === 0) {
      return res.status(404).json({
        error: 'No results found',
        query,
        sources: validatedSources
      });
    }

    // Process results with LLM
    const llmResponse = await axios.post('/api/llm/process', {
      query,
      sources: searchResults,
      model: model.toLowerCase(),
      context
    });

    // Return formatted response
    return res.status(200).json({
      summary: llmResponse.data,
      model,
      sources: searchResults.map(result => ({
        title: result.title || result.url,
        url: result.url,
        source: result.source
      }))
    });

  } catch (error) {
    logger.error('Open search error:', error);
    return res.status(500).json({ 
      error: 'Failed to process search request',
      details: error.message 
    });
  }
}
