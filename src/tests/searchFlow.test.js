const axios = require('axios');
const { logger } = require('../utils/logger');

// Configure axios base URL for testing
const api = axios.create({
  baseURL: 'http://localhost:3000'
});

async function testSearchFlow() {
  const searchId = Math.random().toString(36).substring(7);
  logger.info(`[${searchId}] Starting search flow test`);

  try {
    // Step 1: Test initial search
    const initialQuery = "What are the latest developments in AI?";
    logger.info(`[${searchId}] Testing initial search: ${initialQuery}`);
    
    const searchResponse = await api.post('/api/search/web', {
      query: initialQuery
    });

    if (!searchResponse.data?.results || searchResponse.data.results.length === 0) {
      throw new Error('No search results found');
    }

    logger.info(`[${searchId}] Search successful, found ${searchResponse.data.results.length} results`);

    // Step 2: Test LLM processing
    logger.info(`[${searchId}] Testing LLM processing`);
    const llmResponse = await api.post('/api/llm/process', {
      query: initialQuery,
      sources: searchResponse.data.results,
      model: 'mixtral-8x7b'
    });

    if (!llmResponse.data?.content) {
      throw new Error('No LLM response content');
    }

    logger.info(`[${searchId}] LLM processing successful`);

    // Step 3: Test follow-up question
    const followUpQuery = "Can you elaborate on the impact of these developments?";
    logger.info(`[${searchId}] Testing follow-up question: ${followUpQuery}`);

    const followUpResponse = await api.post('/api/llm/process', {
      query: followUpQuery,
      sources: searchResponse.data.results,
      model: 'mixtral-8x7b',
      context: llmResponse.data.content
    });

    if (!followUpResponse.data?.content) {
      throw new Error('No follow-up response content');
    }

    logger.info(`[${searchId}] Follow-up successful`);

    // Step 4: Test different models
    const models = ['mixtral-8x7b', 'deepseek-70b', 'gemma-7b'];
    for (const model of models) {
      logger.info(`[${searchId}] Testing model: ${model}`);
      const modelResponse = await api.post('/api/llm/process', {
        query: initialQuery,
        sources: searchResponse.data.results,
        model
      });

      if (!modelResponse.data?.content) {
        throw new Error(`No response from model: ${model}`);
      }

      logger.info(`[${searchId}] ${model} test successful`);
    }

    logger.info(`[${searchId}] All tests passed successfully`);
    return true;

  } catch (error) {
    logger.error(`[${searchId}] Test failed:`, error);
    throw error;
  }
}

// Run tests
testSearchFlow().then(() => {
  logger.info('Tests completed successfully');
}).catch((error) => {
  logger.error('Tests failed:', error);
  process.exit(1);
});

// Export for test runner
module.exports = { testSearchFlow };
