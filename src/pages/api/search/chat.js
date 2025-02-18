// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 20:01:28
// Current User's Login: NUbivek

import { ModelUtils } from '@/config/models.config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { query, filters, searchMode, model, sourceScope, sources } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Validate model and get configuration
    if (!ModelUtils.isValidModel(model)) {
      return res.status(400).json({ message: 'Invalid model selection' });
    }

    const modelConfig = ModelUtils.getModelConfig(model);
    const prompt = constructPrompt(query, searchMode, filters, sourceScope, sources);

    // Format request body based on the model type
    const requestBody = ModelUtils.formatRequestBody(model, prompt);

    // Make API request using model-specific endpoint and headers
    const response = await fetch(modelConfig.endpoint, {
      method: 'POST',
      headers: modelConfig.headers,
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', data);
      throw new Error(`API responded with status ${response.status}: ${JSON.stringify(data)}`);
    }

    // Extract response text based on the model type
    const content = ModelUtils.extractResponseText(data, model);

    return res.status(200).json({
      result: {
        content,
        model,
        sources: [],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Search processing error:', error);
    return res.status(500).json({
      message: 'Failed to process search request',
      error: error.message,
      details: error.response?.data || error.toString()
    });
  }
}

/**
 * Constructs a structured prompt from the search parameters
 * @param {string} query - The search query
 * @param {string} searchMode - The search mode
 * @param {Object} filters - Active filters
 * @param {string} sourceScope - The source scope for verified searches
 * @param {Object} sources - Custom sources including files and URLs
 * @returns {string} - The constructed prompt
 */
function constructPrompt(query, searchMode, filters, sourceScope, sources) {
  const promptParts = [
    `Search query: ${query}`,
    `Search mode: ${searchMode}`
  ];

  // Add active sources if filters are provided
  if (filters) {
    const activeSources = Object.entries(filters)
      .filter(([_, isActive]) => isActive)
      .map(([source]) => source)
      .join(', ');
    promptParts.push(`Active sources: ${activeSources}`);
  }

  // Add source scope for verified searches
  if (searchMode === 'verified' && sourceScope) {
    promptParts.push(`Source scope: ${sourceScope}`);
  }

  // Add custom sources if provided
  if (sources) {
    if (sources.files?.length > 0) {
      promptParts.push(`Custom files: ${sources.files.join(', ')}`);
    }
    if (sources.urls?.length > 0) {
      promptParts.push(`Custom URLs: ${sources.urls.join(', ')}`);
    }
  }

  return promptParts.join('\n');
}