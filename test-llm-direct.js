/**
 * Direct test script for the LLM API
 * Tests the /api/llm/test endpoint which bypasses the search functionality
 * Run with: node test-llm-direct.js
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

const TEST_QUERY = 'What is artificial intelligence?';

// API url for direct LLM testing
const API_URL = 'http://localhost:3000/api/llm/test';

/**
 * Run a test for a specific model
 */
async function runTest(model) {
  console.log(`\n==============================`);
  console.log(`Testing model: ${model}`);
  console.log(`Query: ${TEST_QUERY}`);
  console.log(`==============================\n`);
  
  try {
    console.log(`Using API key: ${process.env.TOGETHER_API_KEY ? process.env.TOGETHER_API_KEY.substring(0, 5) + '...' : 'none'} (${process.env.TOGETHER_API_KEY?.length || 0} chars)`);
    
    const response = await axios.post(API_URL, {
      query: TEST_QUERY,
      modelId: model
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Has content: ${response.data?.content ? 'YES' : 'NO'}`);
    
    if (response.data?.content) {
      console.log('✅ LLM processing successful!');
      console.log('\nSample content:');
      console.log(response.data.content.substring(0, 150) + '...');
    } else {
      console.log('❌ No content found in response');
      console.log('Response data keys:', Object.keys(response.data));
      if (response.data.error) {
        console.log('Error:', response.data.error);
      }
    }
    
    return {
      success: true,
      hasContent: !!response.data?.content
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
    withContent: 0,
    failed: 0
  };
  
  for (const model of MODELS) {
    results.total++;
    
    const testResult = await runTest(model);
    
    if (testResult.success) {
      results.successful++;
      if (testResult.hasContent) {
        results.withContent++;
      }
    } else {
      results.failed++;
    }
    
    // Wait between tests to avoid rate limiting
    console.log('Waiting 2 seconds before next test...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Print summary
  console.log('\n==============================');
  console.log('TEST SUMMARY');
  console.log('==============================');
  console.log(`Total tests: ${results.total}`);
  console.log(`Successful API calls: ${results.successful}`);
  console.log(`With content: ${results.withContent}`);
  console.log(`Failed: ${results.failed}`);
  console.log('==============================');
}

// Run the tests
console.log('Starting direct LLM tests...');
runAllTests().catch(error => {
  console.error('Test script error:', error);
});
