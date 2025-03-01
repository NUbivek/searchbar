/**
 * Category Troubleshooting Tool
 * 
 * This script helps diagnose issues with category display by running a test search
 * and logging detailed information about the category flow.
 * 
 * Usage:
 *   node scripts/troubleshoot-categories.js [search query]
 */

const axios = require('axios');
const chalk = require('chalk');

// Configure
const DEFAULT_QUERY = 'business analysis of technology trends';
const API_ENDPOINT = 'http://localhost:3003/api/search'; // Updated port to match the running server

// Colors and formatting
const heading = (text) => console.log(chalk.bold.blue('\n=== ' + text + ' ==='));
const success = (text) => console.log(chalk.green('✓ ' + text));
const error = (text) => console.log(chalk.red('✗ ' + text));
const info = (text) => console.log(chalk.yellow('ℹ ' + text));
const data = (label, value) => console.log(`${chalk.cyan(label)}: ${value}`);
const json = (obj) => JSON.stringify(obj, null, 2);

async function troubleshootCategories() {
  const query = process.argv[2] || DEFAULT_QUERY;
  
  heading('Starting Category Troubleshooting');
  info(`Using query: "${query}"`);
  
  try {
    // Step 1: Test API Response
    heading('Testing Search API Response');
    info('Sending request to search API...');
    
    const response = await axios.post(API_ENDPOINT, {
      query,
      mode: 'verified',
      model: 'mixtral-8x7b',
      sources: [],
      customUrls: [],
      files: [],
      useLLM: true
    });
    
    // Check for errors in response
    if (response.data.error) {
      error(`API returned error: ${response.data.error}`);
      return;
    }
    
    success('Received API response');
    data('Response status', response.status);
    data('Results count', response.data.results?.length || 0);
    
    // Step 2: Check Categories in Response
    heading('Examining Categories in API Response');
    
    const categories = response.data.categories || [];
    
    if (!categories || !Array.isArray(categories)) {
      error('Categories is not an array in API response');
      data('Categories value', typeof categories);
      return;
    }
    
    if (categories.length === 0) {
      error('Categories array is empty in API response');
      data('Results available', response.data.results?.length > 0 ? 'Yes' : 'No');
      return;
    }
    
    success(`Found ${categories.length} categories in API response`);
    
    // Step 3: Analyze each category
    heading('Analyzing Category Structure');
    
    categories.forEach((category, index) => {
      info(`Category ${index + 1}: ${category.name || 'Unnamed'}`);
      
      // Check essential properties
      const checks = [
        { name: 'id', value: category.id, required: true },
        { name: 'name', value: category.name, required: true },
        { name: 'content', value: Array.isArray(category.content), required: true },
        { name: 'metrics', value: typeof category.metrics === 'object', required: false },
        { name: 'icon', value: category.icon, required: false },
        { name: 'color', value: category.color, required: false }
      ];
      
      checks.forEach(check => {
        if (check.required && !check.value) {
          error(`Missing required property: ${check.name}`);
        } else if (check.name === 'content') {
          data(`content items`, Array.isArray(category.content) ? category.content.length : 0);
        } else {
          data(check.name, check.value);
        }
      });
      
      // If this is a default category or fallback
      if (category.id === 'searchResults' || category.id === 'all_results') {
        info('This appears to be a fallback/default category');
      }
      
      // Check metrics
      if (category.metrics) {
        data('metrics', json({
          relevance: category.metrics.relevance || 'N/A',
          accuracy: category.metrics.accuracy || 'N/A',
          credibility: category.metrics.credibility || 'N/A',
          overall: category.metrics.overall || 'N/A'
        }));
      }
      
      console.log('\n');
    });
    
    // Summary
    heading('Category Troubleshooting Summary');
    
    if (categories.length > 0 && categories[0].id && categories[0].content) {
      success('Categories appear to be properly structured');
      info('If categories are still not displaying in the UI:');
      info('1. Check that categories are being passed through the component chain');
      info('2. Verify ModernCategoryDisplay is receiving and rendering the categories');
      info('3. Look for errors in browser console');
      info('4. Check that CategoryRibbon component is rendering correctly');
    } else {
      error('Categories have structural issues that may prevent display');
      info('Review the analysis above to identify and fix the issues');
    }
    
    info('For detailed documentation, see: /docs/CATEGORY_FLOW.md');
    
  } catch (err) {
    error(`Error during troubleshooting: ${err.message}`);
    if (err.response) {
      error(`API response status: ${err.response.status}`);
      error(`API response data: ${json(err.response.data)}`);
    }
  }
}

// Run the troubleshooting
troubleshootCategories();
