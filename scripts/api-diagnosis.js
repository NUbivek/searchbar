/**
 * API Diagnosis Tool for Searchbar
 * Tests both Serper API and Together AI API independently and reports issues
 */

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const chalk = require('chalk');

// Colors for output
const heading = (text) => console.log(chalk.bold.blue('\n=== ' + text + ' ==='));
const success = (text) => console.log(chalk.green('✓ ' + text));
const error = (text) => console.log(chalk.red('✗ ' + text));
const warning = (text) => console.log(chalk.yellow('⚠️ ' + text));
const info = (text) => console.log(chalk.cyan('ℹ ' + text));
const debug = (obj) => console.log(JSON.stringify(obj, null, 2));

// Config checks
heading('Configuration Check');

// Check API keys
const serperKey = process.env.SERPER_API_KEY;
const togetherKey = process.env.TOGETHER_API_KEY;

if (!serperKey) {
  error('Serper API key is missing from .env.local');
} else if (serperKey.length < 20) {
  warning(`Serper API key looks suspicious - only ${serperKey.length} characters`);
} else {
  success(`Serper API key found (${serperKey.substring(0, 5)}...${serperKey.substring(serperKey.length - 5)})`);
}

if (!togetherKey) {
  error('Together API key is missing from .env.local');
} else if (togetherKey.length < 64) {
  error(`Together API key is too short - only ${togetherKey.length} characters. Should be at least 64 characters.`);
} else {
  success(`Together API key found (${togetherKey.substring(0, 5)}...${togetherKey.substring(togetherKey.length - 5)})`);
}

// Test Serper API
async function testSerperAPI() {
  heading('Testing Serper API');
  
  try {
    info('Making test request to Serper API...');
    const response = await axios.post('https://google.serper.dev/search', 
      { 
        q: 'AI latest developments',
        num: 3,
        gl: 'us',
        hl: 'en'
      },
      { 
        headers: { 
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 200) {
      success('Serper API request successful!');
      info(`Received ${response.data.organic?.length || 0} organic results`);
      
      if (response.data.organic && response.data.organic.length > 0) {
        success('Results contain the expected data structure');
        info('First result title: ' + response.data.organic[0].title);
      } else {
        warning('Results structure may be unexpected - no organic results found');
      }
    } else {
      error(`Serper API returned unexpected status: ${response.status}`);
    }
    
    return true;
  } catch (err) {
    error(`Serper API request failed: ${err.message}`);
    if (err.response) {
      error(`Status: ${err.response.status}`);
      debug(err.response.data);
    }
    return false;
  }
}

// Test Together API
async function testTogetherAPI() {
  heading('Testing Together AI API');
  
  try {
    info('Making test request to Together API...');
    const response = await axios.post('https://api.together.xyz/v1/completions', 
      {
        model: "mistralai/Mistral-7B-v0.1",
        prompt: "Summarize the latest developments in artificial intelligence in 3 sentences:",
        max_tokens: 256,
        temperature: 0.7,
        top_p: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${togetherKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 200) {
      success('Together API request successful!');
      
      if (response.data.choices && response.data.choices.length > 0) {
        success('Results contain the expected data structure');
        info('Generation output: ' + response.data.choices[0].text.substring(0, 100) + '...');
      } else {
        warning('Results structure may be unexpected - no choices found');
        debug(response.data);
      }
    } else {
      error(`Together API returned unexpected status: ${response.status}`);
    }
    
    return true;
  } catch (err) {
    error(`Together API request failed: ${err.message}`);
    if (err.response) {
      error(`Status: ${err.response.status}`);
      debug(err.response.data);
    }
    return false;
  }
}

// Test full integration flow with simplified version of the app's process
async function testIntegrationFlow() {
  heading('Testing Integration Flow');
  
  try {
    info('1. Retrieving search results from Serper...');
    const searchResponse = await axios.post('https://google.serper.dev/search', 
      { 
        q: 'latest developments in artificial intelligence',
        num: 5,
        gl: 'us',
        hl: 'en'
      },
      { 
        headers: { 
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!searchResponse.data.organic || searchResponse.data.organic.length === 0) {
      error('No search results found to process');
      return false;
    }
    
    success(`Retrieved ${searchResponse.data.organic.length} search results`);
    
    info('2. Transforming search results into source format...');
    const sources = searchResponse.data.organic.map(result => ({
      title: result.title || 'Untitled',
      content: result.snippet || '',
      url: result.link || '',
      source: 'web'
    }));
    
    success(`Transformed ${sources.length} search results for LLM processing`);
    
    info('3. Sending to Together API for processing...');
    // Construct LLM prompt
    const prompt = `You are an AI assistant that analyzes search results and provides insights.
    
Please analyze the following search results about "${searchResponse.data.searchParameters.q}" and provide a concise summary:

${sources.map((source, i) => `Source ${i+1}: ${source.title}
${source.content}`).join('\n\n')}`;

    const llmResponse = await axios.post('https://api.together.xyz/v1/completions', 
      {
        model: "mistralai/Mistral-7B-v0.1",
        prompt: prompt,
        max_tokens: 256,
        temperature: 0.7,
        top_p: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${togetherKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (llmResponse.data.choices && llmResponse.data.choices.length > 0) {
      success('Successfully processed search results with LLM');
      info('LLM generated content:');
      console.log(chalk.gray('---'));
      console.log(llmResponse.data.choices[0].text);
      console.log(chalk.gray('---'));
    } else {
      error('Unexpected LLM response structure');
      debug(llmResponse.data);
      return false;
    }
    
    success('Full integration flow test completed successfully');
    info('The APIs are working correctly in isolation - issue must be in the app integration');
    return true;
  } catch (err) {
    error(`Integration flow test failed: ${err.message}`);
    if (err.response) {
      error(`Status: ${err.response.status}`);
      debug(err.response.data);
    }
    return false;
  }
}

// Run the tests
async function runTests() {
  const serperSuccess = await testSerperAPI();
  const togetherSuccess = await testTogetherAPI();
  
  if (serperSuccess && togetherSuccess) {
    heading('Testing Full Integration Flow');
    await testIntegrationFlow();
  } else {
    heading('Skipping Integration Test');
    error('Cannot test integration because one or more individual API tests failed');
  }
  
  heading('Diagnostic Summary');
  if (!serperSuccess) {
    error('Serper API is not functioning correctly - fix this first');
  }
  if (!togetherSuccess) {
    error('Together API is not functioning correctly - fix this first');
  }
  if (serperSuccess && togetherSuccess) {
    success('Both APIs are working in isolation');
    info('Likely issues:');
    info('1. The useLLM flag may not be properly passed to the API');
    info('2. Error handling in processWithLLM may be swallowing critical errors');
    info('3. LLM results may not be correctly flagged for detection in the UI');
    info('4. Try adding "shouldUseLLM: true" to all search requests explicitly');
  }
}

runTests();
