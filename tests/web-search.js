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
const TEST_QUERY = 'Latest developments in AI technology';

// Mock Serper API response
const mockResults = {
  searchParameters: {
    q: TEST_QUERY,
    gl: "us",
    hl: "en",
    num: 10,
    type: "search"
  },
  organic: [
    {
      title: "Latest AI Technology Trends & Innovations",
      link: "https://example.com/ai-trends",
      snippet: "Explore the latest developments in artificial intelligence technology, including machine learning, neural networks, and natural language processing.",
      position: 1
    },
    {
      title: "AI Research Breakthroughs",
      link: "https://example.com/ai-research",
      snippet: "Recent breakthroughs in AI research have led to significant improvements in language models and computer vision systems.",
      position: 2
    }
  ],
  knowledgeGraph: {
    title: "Artificial Intelligence",
    description: "Artificial intelligence is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans.",
    url: "https://example.com/ai"
  },
  peopleAlsoAsk: [
    {
      question: "What are the latest trends in AI?",
      snippet: "The latest trends in AI include large language models, multimodal AI, and edge computing.",
      link: "https://example.com/ai-trends"
    }
  ]
};

async function testWebSearch() {
  console.log('Testing web search...');
  try {
    const response = await fetch(`${BASE_URL}/api/search/web`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: TEST_QUERY,
        mockResults
      })
    });

    // Validate error responses
    if (!response.ok) {
      const data = await response.json();
      if (!data.message) {
        throw new Error('Missing error message in error response');
      }
      return true;
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.sources || !Array.isArray(data.sources)) {
      throw new Error('Invalid response format: missing sources array');
    }

    if (!data.summary || typeof data.summary !== 'object') {
      throw new Error('Invalid response format: missing summary object');
    }

    if (!data.summary.sourceMap || typeof data.summary.sourceMap !== 'object') {
      throw new Error('Invalid response format: missing sourceMap object');
    }

    // Validate sources
    data.sources.forEach((source, index) => {
      if (!source.title || !source.content || !source.type || !source.sourceId) {
        throw new Error(`Invalid source at index ${index}: missing required fields`);
      }
    });

    // Validate sourceMap
    Object.entries(data.summary.sourceMap).forEach(([sourceId, source]) => {
      if (!source.url || !source.title || !source.source) {
        throw new Error(`Invalid sourceMap entry for ${sourceId}: missing required fields`);
      }
    });

    console.log('Web search test results:', {
      totalSources: data.sources.length,
      sourceTypes: [...new Set(data.sources.map(s => s.type))],
      sampleSource: data.sources[0],
      sourceMapSize: Object.keys(data.summary.sourceMap).length
    });

    return true;
  } catch (error) {
    console.error('Web search test failed:', error.message);
    return false;
  }
}

testWebSearch().then(success => {
  if (!success) {
    process.exit(1);
  }
});
