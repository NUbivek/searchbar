/**
 * Improved Category Troubleshooting Tool
 * 
 * This script helps diagnose issues with category display by running a test search
 * and logging detailed information about the category flow.
 * 
 * Usage:
 *   node scripts/improved-category-troubleshooter.js [search query]
 */

const axios = require('axios');
const chalk = require('chalk');

// Configure
const DEFAULT_QUERY = 'business analysis of technology trends';
const API_ENDPOINT = 'http://localhost:3003/api/search'; // Updated port to match running server

// Colors and formatting
const heading = (text) => console.log(chalk.bold.blue('\n=== ' + text + ' ==='));
const success = (text) => console.log(chalk.green('✓ ' + text));
const error = (text) => console.log(chalk.red('✗ ' + text));
const info = (text) => console.log(chalk.yellow('ℹ ' + text));
const data = (label, value) => console.log(`${chalk.cyan(label)}: ${value}`);
const json = (obj) => JSON.stringify(obj, null, 2);

async function troubleshootCategories() {
  const query = process.argv[2] || DEFAULT_QUERY;
  
  heading('Starting Enhanced Category Troubleshooting');
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
        { name: 'color', value: category.color, required: false },
        { name: 'keyTerms', value: Array.isArray(category.keyTerms), required: false }
      ];
      
      checks.forEach(check => {
        if (check.required && !check.value) {
          error(`Missing required property: ${check.name}`);
        } else if (check.name === 'content') {
          const contentCount = Array.isArray(category.content) ? category.content.length : 0;
          if (contentCount === 0) {
            error(`Category has 0 content items - will not display correctly`);
          } else {
            success(`Has ${contentCount} content items`);
          }
        } else if (check.name === 'keyTerms' && check.value) {
          data(`keyTerms`, category.keyTerms.join(', '));
        } else {
          data(check.name, check.value);
        }
      });
      
      // Sample some content items if they exist
      if (category.content && category.content.length > 0) {
        const sampleItem = category.content[0];
        info(`Sample content item:`);
        console.log(chalk.dim(JSON.stringify({
          title: sampleItem.title || '[No title]',
          type: sampleItem.type || '[No type]',
          id: sampleItem.id || '[No ID]',
          source: sampleItem.source || '[No source]'
        }, null, 2)));
      }
      
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
    
    // Calculate detailed stats
    const categoriesWithContent = categories.filter(c => c.content && c.content.length > 0);
    const totalContentItems = categories.reduce((sum, cat) => sum + (cat.content?.length || 0), 0);
    const avgContentPerCategory = categoriesWithContent.length > 0 ? 
      Math.round(totalContentItems / categoriesWithContent.length) : 0;
    
    // Display stats
    data('Total categories', categories.length);
    data('Categories with content', categoriesWithContent.length);
    data('Total content items', totalContentItems);
    data('Average items per category', avgContentPerCategory);
    
    if (categoriesWithContent.length === 0) {
      error('No categories contain any content items! This will cause display issues.');
    } else if (categoriesWithContent.length === 1 && 
              (categoriesWithContent[0].id === 'searchResults' || 
               categoriesWithContent[0].id === 'all_results')) {
      error('Only the default category contains content. No specialized categories are populated.');
    } else if (categoriesWithContent.length > 0) {
      success(`${categoriesWithContent.length} categories have content and should display correctly`);
    }
    
    info('\nCategory Display Checklist:');
    info('1. Verify categories are returned from the API ✓');
    info('2. Confirm categories have content ✓');
    info('3. Check that IntelligentSearchResults.generateCategories() uses the API categories');
    info('4. Verify ModernCategoryDisplay receives and renders the categories');
    info('5. Look for React errors in browser console that might prevent rendering');
    info('6. Confirm CategoryRibbon is visible in the DOM (may be hidden by CSS issues)');
    
    info('\nFor detailed documentation, see: /docs/CATEGORY_FLOW.md');
    
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
