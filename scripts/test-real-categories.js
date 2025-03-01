/**
 * This script tests real category generation using the actual API and LLM processing
 * It ensures that we're using real data and the real category scoring system 
 * 
 * Usage: node scripts/test-real-categories.js "your query"
 */

const axios = require('axios');
const chalk = require('chalk');

// We won't import CategoryProcessor directly as it has dependencies that are hard to resolve
// Instead, we'll focus on testing the real API which uses the real CategoryProcessor internally
console.log(chalk.blue('Testing with real API (which uses real category processing)'));

// Real API search function
const performRealSearch = async (query) => {
  try {
    console.log(chalk.blue(`Sending search request to API with query: "${query}"`));
    
    const response = await axios.post('http://localhost:3003/api/search', {
      query,
      mode: 'verified',
      model: 'mixtral-8x7b',
      useLLM: true  // Force LLM processing
    });
    
    return response.data;
  } catch (error) {
    console.error(chalk.red('Error calling search API:'), error.message);
    throw error;
  }
};

// Instead of direct category processing, we'll test with different API options
const performRealSearchWithOptions = async (query, options = {}) => {
  try {
    console.log(chalk.blue(`Sending search request to API with options:`, options));
    
    const response = await axios.post('http://localhost:3003/api/search', {
      query,
      mode: 'verified',
      model: 'mixtral-8x7b',
      useLLM: true,  // Force LLM processing
      ...options
    });
    
    return response.data;
  } catch (error) {
    console.error(chalk.red('Error calling search API with options:'), error.message);
    throw error;
  }
};

// Main function
const main = async () => {
  const query = process.argv[2] || 'Latest AI technologies and investments';
  
  console.log(chalk.bgBlue.white('\n REAL CATEGORY PROCESSING TEST \n'));
  console.log(chalk.cyan(`Testing with query: "${query}"\n`));
  
  try {
    // Step 1: Call the real API
    console.log(chalk.yellow('Step 1: Calling real search API with LLM processing'));
    const apiResponse = await performRealSearch(query);
    
    if (!apiResponse) {
      console.error(chalk.red('Failed to get API response'));
      return;
    }
    
    console.log(chalk.green(`✓ API returned ${apiResponse.results.length} results`));
    
    // Step 2: Examine API categories
    if (!apiResponse.categories || apiResponse.categories.length === 0) {
      console.log(chalk.red('❌ No categories returned from API'));
    } else {
      console.log(chalk.green(`✓ API returned ${apiResponse.categories.length} categories:`));
      
      apiResponse.categories.forEach((cat, index) => {
        const score = cat.metrics?.overall?.toFixed(2) || 'N/A';
        const itemCount = Array.isArray(cat.content) ? cat.content.length : 'N/A';
        console.log(chalk.green(`  ${index+1}. ${cat.name} (Score: ${score}) - ${itemCount} items`));
      });
      
      // Check Key Insights position
      const hasKeyInsights = apiResponse.categories.some(c => 
        c.id === 'key-insights' || c.id === 'key_insights' || c.name === 'Key Insights'
      );
      
      if (hasKeyInsights) {
        const firstCategory = apiResponse.categories[0];
        const isKeyInsightsFirst = firstCategory.id === 'key-insights' || 
                                 firstCategory.id === 'key_insights' || 
                                 firstCategory.name === 'Key Insights';
        
        if (isKeyInsightsFirst) {
          console.log(chalk.green('✓ Key Insights category is correctly prioritized'));
        } else {
          console.log(chalk.yellow('⚠️ Key Insights category exists but is not first in the list'));
        }
      } else {
        console.log(chalk.yellow('⚠️ No Key Insights category found'));
      }
    }
    
    // Step 3: Test with different options to see real category generation
    console.log(chalk.yellow('\nStep 3: Testing with force category generation option'));
    const apiResponseWithForce = await performRealSearchWithOptions(query, {
      forceCategories: true,
      debug: true
    });
    
    if (!apiResponseWithForce.categories || apiResponseWithForce.categories.length === 0) {
      console.log(chalk.red('❌ No categories returned even with force option'));
    } else {
      console.log(chalk.green(`✓ Force option returned ${apiResponseWithForce.categories.length} categories:`));
      
      apiResponseWithForce.categories.forEach((cat, index) => {
        const score = cat.metrics?.overall?.toFixed(2) || 'N/A';
        const itemCount = Array.isArray(cat.content) ? cat.content.length : 'N/A';
        console.log(chalk.green(`  ${index+1}. ${cat.name} (Score: ${score}) - ${itemCount} items`));
      });
      
      // Log the full metrics for each category - this shows the real scoring system
      console.log(chalk.yellow('\nDetailed Category Metrics:'));
      apiResponseWithForce.categories.forEach((cat, index) => {
        console.log(chalk.cyan(`Category: ${cat.name}`));
        if (cat.metrics) {
          const metrics = Object.entries(cat.metrics)
            .filter(([key]) => key !== 'scoreComponents' && key !== 'details')
            .map(([key, value]) => `${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`);
          console.log(chalk.green(`  Metrics: ${metrics.join(', ')}`));
          
          // Show score components if available
          if (cat.metrics.scoreComponents) {
            const components = Object.entries(cat.metrics.scoreComponents)
              .map(([key, value]) => `${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`);
            console.log(chalk.green(`  Score Components: ${components.join(', ')}`));
          }
        } else {
          console.log(chalk.yellow('  No metrics available'));
        }
      });
    }
    
    // Step 4: Compare regular vs forced category generation
    console.log(chalk.yellow('\nStep 4: Comparing regular vs forced category generation'));
    
    const regularCategoryNames = apiResponse.categories.map(c => c.name);
    const forcedCategoryNames = apiResponseWithForce.categories.map(c => c.name);
    
    console.log('Regular API Categories:', regularCategoryNames.join(', '));
    console.log('Forced API Categories:', forcedCategoryNames.join(', '));
    
    const regularHasKeyInsights = apiResponse.categories.some(c => 
      c.id === 'key-insights' || c.id === 'key_insights' || c.name === 'Key Insights'
    );
    
    const forcedHasKeyInsights = apiResponseWithForce.categories.some(c => 
      c.id === 'key-insights' || c.id === 'key_insights' || c.name === 'Key Insights'
    );
    
    if (regularHasKeyInsights && forcedHasKeyInsights) {
      console.log(chalk.green('✓ Both regular and forced include Key Insights'));
    } else if (regularHasKeyInsights) {
      console.log(chalk.yellow('⚠️ Only regular includes Key Insights'));
    } else if (forcedHasKeyInsights) {
      console.log(chalk.yellow('⚠️ Only forced includes Key Insights'));
    } else {
      console.log(chalk.red('❌ Neither include Key Insights'));
    }
    
    // Step 5: Check for LLM Processed Content
    console.log(chalk.yellow('\nStep 5: Checking for LLM processed content'));
    
    if (apiResponse.llmResponse) {
      console.log(chalk.green('✓ API response includes LLM processed content'));
    } else {
      console.log(chalk.red('❌ No LLM processed content in API response'));
    }
    
  } catch (error) {
    console.error(chalk.red('Error in test:'), error);
  }
  
  console.log(chalk.bgBlue.white('\n Test Complete \n'));
};

// Run the test
main().catch(console.error);
