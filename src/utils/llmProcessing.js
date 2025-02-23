import axios from 'axios';
import { logger } from './logger';

const MODEL_ENDPOINTS = {
  'perplexity': process.env.PERPLEXITY_API_KEY,
  'gemma-2.0': process.env.TOGETHER_API_KEY,
  'mixtral-8x7b': process.env.TOGETHER_API_KEY,
  'deepseek-70b': process.env.TOGETHER_API_KEY
};

export async function processWithLLM(results, model) {
  try {
    // Format results for LLM processing
    const formattedResults = results.map(result => ({
      content: result.content,
      metadata: {
        source: result.source,
        url: result.url,
        type: result.type,
        contributors: result.contributors || [],
        timestamp: result.timestamp
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
      throw new Error('Invalid model selection');
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

    // Format response with source attribution
    const processedResults = {
      results: formattedResults.map(result => ({
        content: result.content,
        source: result.metadata.source,
        url: result.metadata.url,
        type: result.metadata.type,
        contributors: result.metadata.contributors,
        timestamp: result.metadata.timestamp
      })),
      summary: response.data.summary,
      categories: response.data.categories || [],
      followupQuestions: response.data.suggestions || []
    };

    return processedResults;
  } catch (error) {
    logger.error('LLM processing error:', error);
    throw new Error('Failed to process results with LLM');
  }
}