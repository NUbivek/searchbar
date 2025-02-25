const axios = require('axios');
const { logger } = require('./logger');

// Process search results with LLM
async function processWithLLM(query, sources, selectedModel = 'mixtral-8x7b', context = '') {
  try {
    // Input validation
    if (!query) throw new Error('Query is required');
    if (!Array.isArray(sources)) throw new Error('Sources must be an array');
    
    // Handle empty sources array
    if (sources.length === 0) {
      return {
        content: "I couldn't find any relevant information for your query. Please try a different search term or select different sources.",
        sourceMap: {},
        followUpQuestions: [
          "Could you try rephrasing your question?",
          "Would you like to search in different sources?",
          "Can you provide more specific details in your query?"
        ],
        model: selectedModel
      };
    }

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

module.exports = { processWithLLM };
