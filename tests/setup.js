import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node/api-resolver.js';
import { parse } from 'url';
import dotenv from 'dotenv';
import path from 'path';
import { setupTestEnvironment } from './mocks/api-mocks.js';

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Setup test environment with mocks
setupTestEnvironment();

// Rate limiting setup
const RATE_LIMIT = 5; // requests per window
const RATE_WINDOW = 10000; // 10 seconds
const requestCounts = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW;
  
  // Clean up old entries
  for (const [key, { timestamp }] of requestCounts.entries()) {
    if (timestamp < windowStart) {
      requestCounts.delete(key);
    }
  }

  // Get or create request count for IP
  const entry = requestCounts.get(ip) || { count: 0, timestamp: now };
  
  if (entry.count >= RATE_LIMIT) {
    return true;
  }

  // Update count
  entry.count += 1;
  entry.timestamp = now;
  requestCounts.set(ip, entry);
  
  return false;
}

export async function setupTestServer(handler, port = 0) {
  const server = createServer((req, res) => {
    // Add CORS headers for test environment
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS requests for CORS
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Check rate limit
    const clientIp = req.socket.remoteAddress;
    if (isRateLimited(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Too Many Requests' }));
      return;
    }

    const parsedUrl = parse(req.url, true);
    
    // Mock API handlers
    const handlers = {
      '/api/search': async (req, res) => {
        const body = await new Promise((resolve) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => { resolve(JSON.parse(data)); });
        });

        const { query, sources = [], model = 'mixtral-8x7b' } = body;
        
        if (!query) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Query is required' }));
          return;
        }

        const mockResults = sources.map(s => ({ title: s, content: 'Mock content' }));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          results: mockResults,
          sources: mockResults,
          summary: 'Mock search summary'
        }));
      },
      '/api/search/verified': async (req, res) => {
        const body = await new Promise((resolve) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => { resolve(JSON.parse(data)); });
        });

        const { query, model = 'mixtral-8x7b' } = body;
        
        if (!query) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Query is required' }));
          return;
        }

        if (model === 'invalid-model') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid model' }));
          return;
        }

        const mockResults = [
          { title: 'Mock Market Data', content: 'Mock content' },
          { title: 'Mock VC Data', content: 'Mock content' }
        ];

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          results: mockResults,
          sources: mockResults,
          summary: 'Mock search summary',
          marketData: [{ title: 'Mock Market Data', content: 'Mock content' }],
          vcData: [{ title: 'Mock VC Data', content: 'Mock content' }]
        }));
      }
    };

    const handler = handlers[parsedUrl.pathname];
    if (handler) {
      handler(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  });

  return new Promise((resolve, reject) => {
    server.listen(port, (err) => {
      if (err) {
        console.error('Test server error:', err);
        reject(err);
        return;
      }
      const address = server.address();
      console.log(`Test server running on port ${address.port}`);
      resolve({ server, port: address.port });
    });
  });
}

export async function cleanupTestServer(server) {
  if (!server) return;
  
  return new Promise((resolve) => {
    server.close(() => {
      console.log('Test server closed');
      resolve();
    });
  });
}

export const BASE_URL = 'http://localhost';
