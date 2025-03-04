/**
 * Test script to verify all LLM models with all source types
 * Run with: node test-llm.js
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Configuration
const MODELS = [
  'mistral-7b',
  'mixtral-8x7b',
  'llama-2-13b',
  'gemma-7b'
];

const SOURCE_TYPES = [
  'all',
  'verified',
  'research'
];

const TEST_QUERIES = [
  'What is artificial intelligence?',
  'How do machine learning models work?',
  'Explain natural language processing'
];

// API url
const API_URL = 'http://localhost:3000/api/search';

/**
 * Run a test for a specific model, source type and query
 */
async function runTest(model, sourceType, query) {
  console.log(`\n==============================`);
  console.log(`Testing model: ${model}`);
  console.log(`Source type: ${sourceType}`);
  console.log(`Query: ${query}`);
  console.log(`==============================\n`);
  
  try {
    console.log(`Using API key: ${process.env.TOGETHER_API_KEY ? process.env.TOGETHER_API_KEY.substring(0, 5) + '...' : 'none'} (${process.env.TOGETHER_API_KEY?.length || 0} chars)`);
    
    // Add debug flag to force LLM processing
    const response = await axios.post(API_URL, {
      query,
      sourceType,
      modelId: model,
      options: {
        maxResults: 3,
        apiKey: process.env.TOGETHER_API_KEY,
        forceLLM: true,
        debug: true
      }
    });
    
    // Enhanced LLM result detection with multiple strategies
    const llmResults = response.data?.llmResults;
    const directLLMResult = response.data?.__isImmutableLLMResult || response.data?.isLLMResult || response.data?.llmProcessed;
    const resultItems = response.data?.results || [];
    const hasNestedLLM = resultItems.some(r => r.__isImmutableLLMResult || r.isLLMResult || r.llmProcessed);
    
    // Comprehensive check for any type of LLM result
    const hasLLMResults = !!llmResults || directLLMResult || hasNestedLLM;
    
    console.log(`Status: ${response.status}`);
    console.log(`Has LLM Results: ${hasLLMResults ? 'YES' : 'NO'}`);
    
    if (hasLLMResults) {
      console.log('✅ LLM processing successful!');
      
      // Determine which result to display
      let contentToShow = null;
      let source = '';
      
      if (llmResults?.content) {
        contentToShow = llmResults.content;
        source = 'llmResults.content';
      } else if (directLLMResult && response.data?.content) {
        contentToShow = response.data.content;
        source = 'response.data.content (direct LLM result)';
      } else if (hasNestedLLM) {
        const llmItem = resultItems.find(r => r.__isImmutableLLMResult || r.isLLMResult || r.llmProcessed);
        if (llmItem?.content) {
          contentToShow = llmItem.content;
          source = 'nested LLM result in results array';
        }
      }
      
      if (contentToShow) {
        console.log(`\nSample content from ${source}:`);
        console.log(contentToShow.substring(0, 150) + '...');
      } else {
        console.log('\nLLM result detected but no content available');
        const flags = [];
        if (llmResults) flags.push('llmResults');
        if (directLLMResult) flags.push('directLLMResult');
        if (hasNestedLLM) flags.push('hasNestedLLM');
        console.log('Detection flags:', flags);
      }
    } else {
      console.log('❌ No LLM results found in response');
      console.log('Response structure:', JSON.stringify(Object.keys(response.data), null, 2));
      
      // Debug additional structure
      if (response.data.content) {
        console.log('Found response.data.content:', typeof response.data.content === 'string' ? 
          response.data.content.substring(0, 100) + '...' : typeof response.data.content);
      }
      
      if (resultItems.length > 0) {
        console.log(`Found ${resultItems.length} items in results array`);
        console.log('First item keys:', Object.keys(resultItems[0]).join(', '));
      }
    }
    
    return {
      success: true,
      hasLLMResults
    };
  } catch (error) {
    console.log(`❌ Error:`, error.message);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error data:`, error.response.data);
    }
    
    return {
      success: false,
      error: error.message,
      status: error.response?.status
    };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  const results = {
    total: 0,
    successful: 0,
    withLLMResults: 0,
    failed: 0
  };
  
  for (const model of MODELS) {
    for (const sourceType of SOURCE_TYPES) {
      // Use only the first test query to save time
      const query = TEST_QUERIES[0];
      results.total++;
      
      const testResult = await runTest(model, sourceType, query);
      
      if (testResult.success) {
        results.successful++;
        if (testResult.hasLLMResults) {
          results.withLLMResults++;
        }
      } else {
        results.failed++;
      }
      
      // Wait between tests to avoid rate limiting
      console.log('Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Print summary
  console.log('\n==============================');
  console.log('TEST SUMMARY');
  console.log('==============================');
  console.log(`Total tests: ${results.total}`);
  console.log(`Successful API calls: ${results.successful}`);
  console.log(`With LLM results: ${results.withLLMResults}`);
  console.log(`Failed: ${results.failed}`);
  console.log('==============================');
}

// Run the tests
console.log('Starting LLM tests...');
runAllTests().catch(error => {
  console.error('Test script error:', error);
});
