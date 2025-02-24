import { fetch } from 'undici';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.local';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

const TEST_PORT = 3001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Test cases for different search functionalities
const TEST_CASES = {
  verifiedSources: [
    {
      name: 'Market Data - Bloomberg Search',
      input: {
        query: 'Latest AI market trends 2024',
        source: 'bloomberg',
        model: 'mixtral-8x7b'
      },
      expectedFields: ['title', 'content', 'url', 'source']
    },
    {
      name: 'Market Data - Reuters Search',
      input: {
        query: 'Semiconductor industry analysis',
        source: 'reuters',
        model: 'mixtral-8x7b'
      },
      expectedFields: ['title', 'content', 'url', 'source']
    },
    {
      name: 'VC Data - Crunchbase Search',
      input: {
        query: 'AI startups funding 2024',
        source: 'crunchbase',
        model: 'mixtral-8x7b'
      },
      expectedFields: ['title', 'content', 'url', 'source']
    }
  ],
  openResearch: [
    {
      name: 'Web Search via Serper',
      input: {
        query: 'Latest developments in quantum computing',
        source: 'web',
        model: 'mixtral-8x7b'
      },
      expectedFields: ['title', 'link', 'snippet']
    },
    {
      name: 'LinkedIn Search',
      input: {
        query: 'AI researchers in Silicon Valley',
        source: 'linkedin',
        model: 'mixtral-8x7b'
      },
      expectedFields: ['title', 'url', 'description']
    },
    {
      name: 'Twitter/X Search',
      input: {
        query: 'AI technology trends',
        source: 'twitter',
        model: 'mixtral-8x7b'
      },
      expectedFields: ['text', 'url', 'author']
    },
    {
      name: 'Reddit Search',
      input: {
        query: 'Machine learning breakthroughs',
        source: 'reddit',
        model: 'mixtral-8x7b'
      },
      expectedFields: ['title', 'url', 'content']
    }
  ],
  llmProcessing: [
    {
      name: 'Basic LLM Processing',
      input: {
        query: 'Explain quantum computing advances',
        results: [
          {
            title: 'Recent Quantum Computing Breakthrough',
            content: 'Scientists achieve new milestone in quantum computing...',
            url: 'https://example.com/quantum'
          }
        ],
        model: 'mixtral-8x7b'
      },
      expectedFields: ['content', 'sourceMap', 'followUpQuestions']
    },
    {
      name: 'Multi-source LLM Processing',
      input: {
        query: 'AI market analysis',
        results: [
          {
            title: 'AI Market Report 2024',
            content: 'The AI market is expected to grow...',
            url: 'https://example.com/ai-market'
          },
          {
            title: 'AI Investment Trends',
            content: 'Venture capital investment in AI...',
            url: 'https://example.com/ai-investment'
          }
        ],
        model: 'mixtral-8x7b'
      },
      expectedFields: ['content', 'sourceMap', 'categories']
    }
  ]
};

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  errors: []
};

async function testSearch(testCase) {
  console.log(`Running test: ${testCase.name}`);
  try {
    const response = await fetch(`${BASE_URL}/api/search/${testCase.input.source}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase.input)
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate response structure
    const missingFields = testCase.expectedFields.filter(field => {
      const hasField = Array.isArray(data) ? 
        data[0]?.[field] !== undefined : 
        data[field] !== undefined;
      return !hasField;
    });

    if (missingFields.length > 0) {
      throw new Error(`Missing expected fields: ${missingFields.join(', ')}`);
    }

    testResults.passed.push({
      name: testCase.name,
      query: testCase.input.query,
      resultCount: Array.isArray(data) ? data.length : 1,
      sampleResult: Array.isArray(data) ? data[0] : data
    });

    return true;
  } catch (error) {
    testResults.failed.push({
      name: testCase.name,
      error: error.message
    });
    return false;
  }
}

async function testLLMProcessing(testCase) {
  console.log(`Running LLM test: ${testCase.name}`);
  try {
    const response = await fetch(`${BASE_URL}/api/llm/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase.input)
    });

    if (!response.ok) {
      throw new Error(`LLM processing failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate response structure
    const missingFields = testCase.expectedFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing expected fields: ${missingFields.join(', ')}`);
    }

    testResults.passed.push({
      name: testCase.name,
      query: testCase.input.query,
      hasSourceMap: !!data.sourceMap,
      hasFollowUp: Array.isArray(data.followUpQuestions)
    });

    return true;
  } catch (error) {
    testResults.failed.push({
      name: testCase.name,
      error: error.message
    });
    return false;
  }
}

async function runAllTests() {
  console.log('Starting search functionality tests...\n');

  // Test Verified Sources
  console.log('Testing Verified Sources...');
  for (const testCase of TEST_CASES.verifiedSources) {
    await testSearch(testCase);
  }

  // Test Open Research Sources
  console.log('\nTesting Open Research Sources...');
  for (const testCase of TEST_CASES.openResearch) {
    await testSearch(testCase);
  }

  // Test LLM Processing
  console.log('\nTesting LLM Processing...');
  for (const testCase of TEST_CASES.llmProcessing) {
    await testLLMProcessing(testCase);
  }

  // Print results in table format
  console.log('\n=== Test Results ===\n');
  
  console.log('Passed Tests:');
  console.table(testResults.passed.map(result => ({
    'Test Name': result.name,
    'Query': result.query,
    'Results': result.resultCount || 'N/A',
    'Sample Data': JSON.stringify(result.sampleResult || {}).slice(0, 50) + '...'
  })));

  console.log('\nFailed Tests:');
  console.table(testResults.failed.map(result => ({
    'Test Name': result.name,
    'Error': result.error
  })));

  return testResults.failed.length === 0;
}

// Run tests
runAllTests().then(success => {
  if (!success) {
    process.exit(1);
  }
}).catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});
