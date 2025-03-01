/**
 * Test suite for category processing functionality
 */

// Import individual modules directly
const { generateCategories } = require('../src/components/search/categories/processors/CategoryProcessor');
const { processCategories } = require('../src/components/search/categories/processors/CategoryProcessor');
const { getSpecialCategories } = require('../src/components/search/categories/types/SpecialCategories');
const { getBroadCategories } = require('../src/components/search/categories/types/BroadCategories');
const { getSpecificCategories } = require('../src/components/search/categories/types/SpecificCategories');
const { matchCategories } = require('../src/components/search/categories/processors/CategoryMatcher');
const { calculateRelevanceScore } = require('../src/components/search/categories/processors/CategoryMetricsCalculator');

/**
 * Mock content for testing
 */
const mockContent = `
The global market for cloud computing services is expected to grow by 17.5% in 2023, 
reaching a total value of $590 billion. This growth is primarily driven by increased 
adoption of AI and machine learning technologies, which require substantial computing resources.

Leading companies in this sector include:
1. Amazon Web Services (AWS) - 32% market share
2. Microsoft Azure - 22% market share
3. Google Cloud Platform - 10% market share
4. Alibaba Cloud - 5% market share

Financial analysis shows that companies investing in cloud infrastructure have seen an 
average ROI of 112% over three years, with cost savings being the primary benefit (65% of respondents), 
followed by increased operational efficiency (52%) and improved scalability (48%).

The business strategy for most enterprises now includes a "cloud-first" approach, with 
78% of organizations having at least one application or portion of their computing infrastructure in the cloud.
`;

const mockSources = [
  { title: 'Cloud Computing Market Report 2023', url: 'https://example.com/report' },
  { title: 'Enterprise Cloud Strategy Guide', url: 'https://example.com/strategy' }
];

const searchQueries = [
  'cloud computing market growth',
  'business strategy cloud',
  'financial analysis ROI cloud',
  'market leaders cloud services'
];

/**
 * Test category generation
 */
console.log('=== Testing Category Generation ===');

// Generate categories for each query
searchQueries.forEach(query => {
  console.log(`\nGenerating categories for query: "${query}"`);
  
  const categories = generateCategories(mockContent, query, mockSources, { debug: true });
  
  console.log(`Generated ${categories.length} categories:`);
  categories.forEach(category => {
    console.log(`- ${category.name} (Score: ${category.finalScore ? category.finalScore.toFixed(1) : 'N/A'})`);
  });
});

/**
 * Test category processing
 */
console.log('\n=== Testing Category Processing ===');

// Process mock content into categories
const processedCategories = processCategories([{ content: mockContent, source: mockSources[0] }], 'cloud market analysis', { debug: true });

console.log(`Processed ${processedCategories.length} categories:`);
processedCategories.forEach(category => {
  console.log(`- ${category.name}`);
  console.log(`  Sources: ${category.sources ? category.sources.length : 0}`);
  console.log(`  Content Length: ${category.content ? category.content.length : 0} chars`);
});

/**
 * Test individual components
 */
console.log('\n=== Testing Category Types ===');

// Get all category types
const specialCategories = getSpecialCategories();
const broadCategories = getBroadCategories();
const specificCategories = getSpecificCategories();

console.log(`Special Categories: ${specialCategories.length}`);
console.log(`Broad Categories: ${broadCategories.length}`);
console.log(`Specific Categories: ${specificCategories.length}`);

console.log('\n=== Testing Category Metrics ===');

// Test relevance scoring
const relevanceScores = searchQueries.map(query => {
  const score = calculateRelevanceScore(mockContent, query);
  console.log(`Relevance for "${query}": ${score.toFixed(1)}`);
  return score;
});

console.log(`Average relevance score: ${(relevanceScores.reduce((a, b) => a + b, 0) / relevanceScores.length).toFixed(1)}`);

/**
 * Test category matching
 */
console.log('\n=== Testing Category Matching ===');

// Match content to all categories
const allCategories = [
  ...specialCategories,
  ...specificCategories,
  ...broadCategories
];

const query = 'cloud market growth strategy';
const matched = matchCategories(mockContent, allCategories, query, mockSources);

console.log(`Top 5 matched categories for "${query}":`);
matched.slice(0, 5).forEach((category, index) => {
  console.log(`${index + 1}. ${category.name} (Score: ${category.finalScore ? category.finalScore.toFixed(1) : 'N/A'})`);
});

console.log('\n=== Test Complete ===');
