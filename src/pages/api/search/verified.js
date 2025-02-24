import axios from 'axios';
import { logger } from '../../../utils/logger';
import { withRetry } from '../../../utils/errorHandling';
import { searchVerifiedSources } from '../../../utils/searchUtils';
import { validateSearchRequest } from '../../../utils/validation';
import { processFile } from '../../../utils/fileProcessing';
import { validateUrl } from '../../../utils/urlValidator';

// Constants
const MAX_CUSTOM_URLS = 5;
const MAX_UPLOADED_FILES = 3;
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_CONTENT_LENGTH = 50000; // 50KB
const VALID_MODELS = ['mixtral-8x7b', 'deepseek-70b', 'gemma-7b'];
const VALID_CATEGORIES = ['Market Data Analytics', 'VC & Startups'];

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
      customUrls = [],
      uploadedFiles = [],
      model = 'gemma-7b',
      category = null,
      useVerifiedSources = true,
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

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
        availableCategories: VALID_CATEGORIES
      });
    }

    // Validate custom URLs
    if (customUrls.length > MAX_CUSTOM_URLS) {
      return res.status(400).json({
        error: `Maximum ${MAX_CUSTOM_URLS} custom URLs allowed`
      });
    }

    const validatedUrls = customUrls.filter(url => validateUrl(url));
    if (validatedUrls.length !== customUrls.length) {
      return res.status(400).json({
        error: 'One or more custom URLs are invalid'
      });
    }

    // Validate uploaded files
    if (uploadedFiles.length > MAX_UPLOADED_FILES) {
      return res.status(400).json({
        error: `Maximum ${MAX_UPLOADED_FILES} files allowed`
      });
    }

    // Search verified sources
    logger.info('Starting verified search', { query, category, model });
    const searchResults = await searchVerifiedSources(query, {
      category,
      customUrls: validatedUrls,
      uploadedFiles,
      useVerifiedSources
    });

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
    logger.error('Verified search error:', error);
    return res.status(500).json({ 
      error: 'Failed to process search request',
      details: error.message 
    });
  }
}
