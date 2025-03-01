/**
 * Live API test for search results categorization
 * This script tests the search API and analyzes the category data it returns
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// API endpoint from .env (or use default)
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:3001/api';

/**
 * Test search queries
 */
const searchQueries = [
  'cloud computing market growth',
  'financial performance tech sector',
  'market share software companies',
  'business strategy fintech'
];

/**
 * Run a live search and analyze the results
 * @param {string} query - Search query to test
 */
async function testSearch(query) {
  console.log(`\n=== Testing search for query: "${query}" ===`);
  
  try {
    // Perform a real search API call
    console.log(`Calling search API for: "${query}"...`);
    const response = await axios.get(`${API_ENDPOINT}/search`, {
      params: { q: query }
    });
    
    // Analyze search results
    const searchResults = response.data.results || [];
    console.log(`Received ${searchResults.length} search results`);
    
    // Check for category data
    const categories = response.data.categories || [];
    console.log(`Received ${categories.length} categories`);
    
    if (categories.length > 0) {
      console.log('\nCategory breakdown:');
      categories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.name || 'Unnamed'}`);
        console.log(`   Description: ${category.description || 'No description'}`);
        console.log(`   Content: ${typeof category.content} (${category.content ? 
          (typeof category.content === 'string' ? 
            category.content.substring(0, 50) + '...' : 
            JSON.stringify(category.content).substring(0, 50) + '...') : 
          'None'})`); 
        console.log(`   Sources: ${category.sources ? category.sources.length : 0}`);
        if (category.metrics) {
          console.log(`   Metrics: ${JSON.stringify(category.metrics)}`);
        }
        console.log('');
      });
    } else {
      console.log('\nNo category data found in response.');
      
      // Try to extract categories from search results
      console.log('Analyzing search results for potential categories...');
      const topics = new Set();
      searchResults.forEach(result => {
        if (result.topics && Array.isArray(result.topics)) {
          result.topics.forEach(topic => topics.add(topic));
        }
        if (result.categories && Array.isArray(result.categories)) {
          result.categories.forEach(category => topics.add(category));
        }
        if (result.tags && Array.isArray(result.tags)) {
          result.tags.forEach(tag => topics.add(tag));
        }
      });
      
      if (topics.size > 0) {
        console.log(`Found ${topics.size} potential topic categories:`);
        console.log(Array.from(topics).join(', '));
      } else {
        console.log('No explicit category data found in search results.');
      }
    }
    
    // Extract data about sources
    const sources = new Set();
    searchResults.forEach(result => {
      if (result.source) sources.add(result.source);
      if (result.domain) sources.add(result.domain);
    });
    
    console.log(`\nSearch results come from ${sources.size} different sources:`);
    console.log(Array.from(sources).join(', '));
    
    return { success: true, resultsCount: searchResults.length, categoriesCount: categories.length };
  } catch (error) {
    console.error(`Error testing search for "${query}":`, error.message);
    
    // Log more error details 
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Run tests on the search API endpoint
 */
async function testSearchAPI() {
  console.log(`Testing search API at ${API_ENDPOINT}\n`); 
  
  try {
    // Test API availability
    console.log('Checking API availability...');
    await axios.get(`${API_ENDPOINT}/health` || `${API_ENDPOINT}/status`).catch(() => {
      console.log('Health/status endpoint not available, will proceed with search tests directly.');
    });
    
    // Run search tests with each query
    let successful = 0;
    for (const query of searchQueries) {
      const result = await testSearch(query);
      if (result.success) successful++;
    }
    
    console.log(`\n=== Test Results: ${successful}/${searchQueries.length} successful queries ===`);
    return { success: true, successRate: successful / searchQueries.length };
  } catch (error) {
    console.error('Error in API test:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the tests
testSearchAPI().then(result => {
  console.log(`\nTest complete. Overall success: ${result.success}`);
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
