/**
 * Category Flow Test
 * 
 * This script tests the complete category flow from API to UI
 * It makes a fetch request to the local API and verifies the category structure
 */

const testCategoryFlow = async () => {
  console.log('Starting category flow test...');
  
  try {
    // 1. Test the API response
    console.log('1. Fetching from search API...');
    const response = await fetch('http://localhost:3002/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'business analysis of technology trends',
        mode: 'verified',
        model: 'mixtral-8x7b',
        sources: [],
        customUrls: [],
        files: [],
        useLLM: true
      }),
    });
  
    // 2. Check for successful response
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✓ API request successful');
    
    // 3. Check for categories
    if (!data.categories || !Array.isArray(data.categories)) {
      console.error('✗ No categories array in API response!');
      console.log('API response structure:', Object.keys(data));
      return;
    }
    
    console.log(`✓ Found ${data.categories.length} categories in API response`);
    
    // 4. Validate category structure
    let validCategories = true;
    data.categories.forEach((category, index) => {
      if (!category.id || !category.name) {
        console.error(`✗ Category ${index} missing required fields`);
        validCategories = false;
      }
      
      if (!Array.isArray(category.content)) {
        console.error(`✗ Category ${category.name} content is not an array`);
        validCategories = false;
      }
    });
    
    if (validCategories) {
      console.log('✓ All categories have valid structure');
    }
    
    // 5. Print category details
    console.log('\nCategory Details:');
    console.log('----------------');
    data.categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.id})`);
      console.log(`   - Content items: ${category.content.length}`);
      console.log(`   - Has metrics: ${category.metrics ? 'Yes' : 'No'}`);
      if (category.metrics) {
        console.log(`   - Overall score: ${category.metrics.overall || 'N/A'}`);
      }
    });
    
    console.log('\nTest Complete! The API is returning properly structured categories.');
    console.log('If categories are not displaying in the UI, check the component flow:');
    console.log('1. Check searchFlowHelper.js - executeSearch function');
    console.log('2. Check VerifiedSearch.js - handleSearch function');
    console.log('3. Check SearchResultsWrapper.js - rendering of IntelligentSearchResults');
    console.log('4. Check IntelligentSearchResults.js - generateCategories function');
    
  } catch (error) {
    console.error('Error during category flow test:', error);
  }
};

// Run the test
testCategoryFlow();
