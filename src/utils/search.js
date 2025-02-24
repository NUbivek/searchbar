import axios from 'axios';
import { logger } from './logger';

// Process search results with LLM
export async function processWithLLM(query, sources, selectedModel = 'mixtral-8x7b', context = '') {
  try {
    // Input validation
    if (!query) throw new Error('Query is required');
    if (!Array.isArray(sources)) throw new Error('Sources must be an array');
    if (sources.length === 0) throw new Error('No sources provided');

    // Process with LLM API
    const response = await axios.post('/api/llm/process', {
      query,
      sources,
      model: selectedModel,
      context
    });

    return {
      content: response.data.content,
      sourceMap: response.data.sourceMap || {},
      followUpQuestions: response.data.followUpQuestions || [],
      model: selectedModel
    };
  } catch (error) {
    logger.error('LLM processing error:', error);
    throw new Error('Failed to process search results with LLM');
  }
}
