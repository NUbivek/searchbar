import axios from 'axios';
import { logger } from './logger';

const MODEL_ENDPOINTS = {
  'perplexity': process.env.PERPLEXITY_API_KEY,
  'gemma-2.0': process.env.TOGETHER_API_KEY,
  'mixtral-8x7b': process.env.TOGETHER_API_KEY,
  'deepseek-70b': process.env.TOGETHER_API_KEY
};

export async function processWithLLM(results, model = null) {
  // If no model specified or no results, return original results
  if (!model || !results || results.length === 0) {
    return { results };
  }

  try {
    // Format results for LLM processing
    const formattedResults = results.map(result => ({
      content: result.content || '',
      metadata: {
        source: result.source || 'Unknown',
        url: result.url || '',
        type: result.type || 'Unknown',
        timestamp: result.timestamp || new Date().toISOString()
      }
    }));

    // Prepare prompt with source attribution
    const prompt = `
      Analyze and summarize the following information from multiple sources.
      For each piece of information, include the source URL and any relevant contributors.
      Organize the information logically and highlight key insights.
      
      Sources:
      ${formattedResults.map(r => `- ${r.metadata.source} (${r.metadata.url})`).join('\n')}
      
      Content:
      ${formattedResults.map(r => r.content).join('\n\n')}
    `;

    // Select API endpoint based on model
    const apiKey = MODEL_ENDPOINTS[model.toLowerCase()];
    if (!apiKey) {
      logger.warn('Invalid model selection, returning original results');
      return { results };
    }

    // Process with selected model
    const response = await axios.post('/api/llm/process', {
      prompt,
      model,
      apiKey,
      options: {
        temperature: 0.7,
        maxTokens: 2000
      }
    });

    if (!response.data || !response.data.summary) {
      logger.warn('LLM processing returned invalid response, using original results');
      return { results };
    }

    return {
      results,
      summary: response.data.summary,
      categories: response.data.categories
    };
  } catch (error) {
    logger.error('LLM processing error:', error);
    // Return original results on error
    return { results };
  }
}