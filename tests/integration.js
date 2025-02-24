import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const BASE_URL = 'http://localhost:3001';
const TEST_QUERY = 'Latest developments in AI technology';

async function testSearch(source, query = TEST_QUERY) {
  console.log(`Testing ${source} search...`);
  try {
    const response = await fetch(`${BASE_URL}/api/search/${source.toLowerCase()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`${source} search failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✓ ${source} search successful:`, {
      resultsCount: data.length,
      sampleResult: data[0]
    });
    return data;
  } catch (error) {
    console.error(`✗ ${source} search failed:`, error.message);
    return null;
  }
}

async function testLLMProcessing(results, model) {
  console.log(`Testing LLM processing with ${model}...`);
  try {
    const response = await fetch(`${BASE_URL}/api/llm/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        results,
        model,
        query: TEST_QUERY
      })
    });

    if (!response.ok) {
      throw new Error(`LLM processing failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✓ ${model} processing successful:`, {
      contentLength: data.content.length,
      followUpCount: data.followUpQuestions.length,
      sourcesCount: data.sources.length
    });
    return true;
  } catch (error) {
    console.error(`✗ ${model} processing failed:`, error.message);
    return false;
  }
}

async function testFileUpload() {
  console.log('Testing file upload...');
  try {
    const testFile = path.resolve(__dirname, 'test.txt');
    fs.writeFileSync(testFile, 'Test content for file upload');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFile));

    const response = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });

    fs.unlinkSync(testFile);

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.statusText}`);
    }

    console.log('✓ File upload successful');
    return true;
  } catch (error) {
    console.error('✗ File upload failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting integration tests...\n');

  // Test search for each source
  const sources = ['Web', 'LinkedIn', 'Reddit', 'Substack', 'Crunchbase', 'Pitchbook', 'Medium'];
  const searchResults = {};
  
  for (const source of sources) {
    const results = await testSearch(source);
    if (results) {
      searchResults[source] = results;
    }
  }

  console.log('\nTesting LLM processing...');
  // Test each LLM model
  const models = ['mixtral-8x7b', 'deepseek-70b', 'gemma-9b'];
  const combinedResults = Object.values(searchResults).flat();
  
  for (const model of models) {
    await testLLMProcessing(combinedResults, model);
  }

  // Test file upload
  await testFileUpload();

  console.log('\nAll tests completed!');
}

runTests().catch(console.error);
