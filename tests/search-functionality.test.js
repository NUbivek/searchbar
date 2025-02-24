import { jest } from '@jest/globals';
import { setupTestEnvironment, resetMocks, mockResponses } from './mocks/api-mocks.js';
import { setupTestServer, cleanupTestServer, BASE_URL } from './setup.js';

let server;
let port;

beforeAll(async () => {
  const { server: testServer, port: testPort } = await setupTestServer();
  server = testServer;
  port = testPort;
}, 30000); // Increase timeout to 30 seconds

afterAll(async () => {
  await cleanupTestServer(server);
});

beforeEach(() => {
  resetMocks();
});

// Mock the API handler
jest.mock('../src/pages/api/search/verified.js', () => ({
  __esModule: true,
  default: async (req, res) => {
    const { query, model = 'mixtral-8x7b', mode = 'verified' } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    try {
      const results = [
        {
          title: 'Mock Search Result',
          url: 'https://example.com/result',
          content: 'This is a mock search result.',
          source: 'Test'
        }
      ];

      return res.status(200).json({ results, query, model });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}));

describe('Search Functionality', () => {
  describe('Verified Search', () => {
    it('should return results for a valid query', async () => {
      const response = await fetch(`${BASE_URL}:${port}/api/search/verified`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: 'test query',
          model: 'mixtral-8x7b'
        })
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.results).toBeDefined();
      expect(data.results.length).toBeGreaterThan(0);
    }, 10000); // Increase test timeout to 10 seconds

    it('should handle invalid model', async () => {
      const response = await fetch(`${BASE_URL}:${port}/api/search/verified`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: 'test query',
          model: 'invalid-model'
        })
      });

      expect(response.status).toBe(400);
    }, 10000);
  });

  describe('LLM Processing', () => {
    it('should process results with LLM', async () => {
      const response = await fetch(`${BASE_URL}:${port}/api/search/verified`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: 'test query',
          model: 'mixtral-8x7b',
          processWithLLM: true
        })
      });

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.results).toBeDefined();
      expect(data.summary).toBeDefined();
    }, 10000);
  });
});
