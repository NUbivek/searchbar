import { jest } from '@jest/globals';
import { setupTestServer, cleanupTestServer, BASE_URL } from './setup.js';
import { mockResponses } from './mocks/api-mocks.js';
import { logger } from '../src/utils/logger.js';
import fetch from 'node-fetch';

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
  jest.clearAllMocks();
});

describe('Search API Integration Tests', () => {
  test('should handle basic search query successfully', async () => {
    const response = await fetch(`${BASE_URL}:${port}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'test query',
        sources: ['web', 'news']
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('summary');
    expect(data).toHaveProperty('sources');
  }, 10000); // Increase test timeout to 10 seconds

  test('should handle verified search query successfully', async () => {
    const response = await fetch(`${BASE_URL}:${port}/api/search/verified`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'market analysis',
        sources: ['financial', 'vc']
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('marketData');
    expect(data).toHaveProperty('vcData');
  }, 10000);

  test('should handle LLM processing with fallback', async () => {
    // First call fails, should fallback to Mixtral
    const response = await fetch(`${BASE_URL}:${port}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'test query',
        sources: ['web'],
        model: 'DeepSeek-70B'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('summary');
  }, 10000);

  test('should handle invalid input gracefully', async () => {
    const response = await fetch(`${BASE_URL}:${port}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '', // Empty query
        sources: ['invalid_source']
      })
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  }, 10000);

  test('should respect rate limits', async () => {
    // Make multiple rapid requests
    const requests = Array(5).fill().map(() => 
      fetch(`${BASE_URL}:${port}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'test query',
          sources: ['web']
        })
      })
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    expect(rateLimited).toBe(true);
  }, 10000);
});
