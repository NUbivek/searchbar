// Test script to check client-side category generation
const path = require('path');
const fs = require('fs');

// Mock browser environment
global.window = {};
global.console = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
};

// Sample search results
const sampleResults = [
  {
    id: 'result1',
    title: 'AI Business Impact in 2025',
    url: 'https://example.com/1',
    snippet: 'AI will transform business operations by 2025',
    score: 0.95
  },
  {
    id: 'result2',
    title: 'Market Trends in AI',
    url: 'https://example.com/2',
    snippet: 'The global AI market is growing rapidly',
    score: 0.92
  },
  {
    id: 'result3',
    title: 'AI Applications in Finance',
    url: 'https://example.com/3',
    snippet: 'Financial institutions are adopting AI for risk management',
    score: 0.89
  }
];

// Mock the ModernCategoryDisplay component's category generation logic
function generateClientSideCategories(results, query) {
  console.log(`\n=== Generating client-side categories for query "${query}" ===`);
  
  if (!results || results.length === 0) {
    console.log('No results available to create categories');
    return [];
  }
  
  // Ensure we have proper content for categories
  const availableResults = results && Array.isArray(results) ? results : [];
  const relevantResults = availableResults.slice(0, Math.min(5, availableResults.length));
  
  console.log(`Creating client-side categories with ${relevantResults.length} results`);
  
  const categoriesArray = [
    {
      id: 'key_insights',
      name: 'Key Insights',
      icon: 'lightbulb',
      description: 'Most important insights from all sources',
      content: relevantResults, // Add actual content from results
      color: '#0F9D58', // Google Green
      metrics: {
        relevance: 0.95,
        accuracy: 0.90,
        credibility: 0.92,
        overall: 0.92
      }
    },
    {
      id: 'all_results',
      name: 'All Results',
      icon: 'search',
      description: 'All search results',
      content: availableResults, // Add all available results
      color: '#4285F4', // Google Blue
      metrics: {
        relevance: 0.75,
        accuracy: 0.75,
        credibility: 0.75,
        overall: 0.75
      }
    }
  ];
  
  // Check if query appears to be business-related
  const businessTerms = ['business', 'company', 'industry', 'market', 'enterprise', 'economy', 'finance', 'investment'];
  const isBusinessQuery = businessTerms.some(term => query.toLowerCase().includes(term));
  
  if (isBusinessQuery && relevantResults.length > 0) {
    categoriesArray.push({
      id: 'business_impact',
      name: 'Business Impact',
      icon: 'trending_up',
      description: 'Impact on business operations and strategy',
      content: relevantResults,
      color: '#DB4437', // Google Red
      metrics: {
        relevance: 0.85,
        accuracy: 0.82,
        credibility: 0.84,
        overall: 0.84
      }
    });
  }
  
  return categoriesArray;
}

// Test with different queries
const testQueries = [
  "artificial intelligence business impact 2025",
  "machine learning applications",
  "financial market trends 2025"
];

// Run tests
console.log("=== Client-Side Category Generation Test ===\n");

testQueries.forEach(query => {
  const categories = generateClientSideCategories(sampleResults, query);
  
  console.log(`\n=== Results for query: "${query}" ===`);
  console.log(`Generated ${categories.length} categories`);
  
  categories.forEach(category => {
    console.log(`\nCategory: ${category.name}`);
    console.log(`Description: ${category.description}`);
    console.log(`Content items: ${category.content.length}`);
    
    // Show first content item as example
    if (category.content.length > 0) {
      console.log(`Example content: ${category.content[0].title}`);
    }
  });
  
  console.log("\n---");
});

console.log("\n=== Client-Side Category Generation Test Complete ===");
