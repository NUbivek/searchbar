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

// Test data
const TEST_CASES = [
  {
    name: 'Basic query',
    input: {
      query: 'Latest AI developments',
      model: 'mixtral-8x7b'
    },
    expectedStatus: 200
  },
  {
    name: 'Query with custom mode',
    input: {
      query: 'Company analysis',
      model: 'deepseek-70b',
      customMode: 'analysis'
    },
    expectedStatus: 200
  },
  {
    name: 'Query with invalid model',
    input: {
      query: 'Test query',
      model: 'invalid-model'
    },
    expectedStatus: 400
  },
  {
    name: 'Query with invalid mode',
    input: {
      query: 'Test query',
      customMode: 'invalid-mode'
    },
    expectedStatus: 400
  },
  {
    name: 'Query with invalid URL',
    input: {
      query: 'Test query',
      customUrls: ['not-a-url']
    },
    expectedStatus: 400
  },
  {
    name: 'Query with invalid source',
    input: {
      query: 'Test query',
      selectedSources: ['invalid-source']
    },
    expectedStatus: 400
  }
];

async function runTestCase(testCase) {
  console.log(`\nRunning test: ${testCase.name}`);
  try {
    const response = await fetch(`${BASE_URL}/api/search/verified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCase.input)
    });

    if (response.status !== testCase.expectedStatus) {
      throw new Error(`Expected status ${testCase.expectedStatus}, got ${response.status}`);
    }

    const data = await response.json();

    // Validate successful responses
    if (response.ok) {
      if (!data.sources || !Array.isArray(data.sources)) {
        throw new Error('Missing sources array in response');
      }

      if (!data.summary || typeof data.summary !== 'object') {
        throw new Error('Missing summary object in response');
      }

      if (!data.summary.sourceMap || typeof data.summary.sourceMap !== 'object') {
        throw new Error('Missing sourceMap in response');
      }
    }
    // Validate error responses
    else {
      if (!data.message) {
        throw new Error('Missing error message in error response');
      }
    }

    console.log(`✅ ${testCase.name} passed`);
    return true;
  } catch (error) {
    console.error(`❌ ${testCase.name} failed: ${error.message}`);
    return false;
  }
}

async function testVerifiedSearch() {
  console.log('Testing verified search API...');
  const results = await Promise.all(TEST_CASES.map(runTestCase));
  return results.every(result => result);
}

testVerifiedSearch().then(success => {
  if (!success) {
    process.exit(1);
  }
});
