import { jest } from '@jest/globals';

// Mock response data
export const mockResponses = {
  together: {
    output: {
      choices: [{ text: 'Mock LLM response for testing purposes.' }]
    }
  },
  perplexity: {
    choices: [{ message: { content: 'Mock Perplexity response for testing.' } }]
  },
  serper: {
    organic: [
      {
        title: 'Mock Search Result',
        link: 'https://example.com/mock',
        snippet: 'This is a mock search result for testing.'
      }
    ]
  },
  verified: {
    marketData: [
      {
        title: 'Mock Market Report',
        url: 'https://example.com/market',
        content: 'Mock market data content',
        source: 'Bloomberg',
        type: 'financial',
        verified: true
      }
    ],
    vcData: [
      {
        title: 'Mock VC Investment',
        url: 'https://example.com/vc',
        content: 'Mock VC data content',
        source: 'Crunchbase',
        type: 'vc_data',
        verified: true
      }
    ]
  }
};

// Mock data sources
export const MOCK_MARKET_DATA_SOURCES = {
  financial: [
    {
      name: 'Bloomberg',
      specialty: ['Market Data', 'Financial News'],
      description: 'Leading financial data provider',
      research_portals: { public: 'https://bloomberg.com' },
      verified: true
    },
    {
      name: 'Reuters',
      specialty: ['News', 'Market Data'],
      description: 'Global news and data provider',
      research_portals: { public: 'https://reuters.com' },
      verified: true
    }
  ],
  vc_data: [
    {
      name: 'Crunchbase',
      specialty: ['Startup Data', 'VC Investment'],
      description: 'Startup and investment database',
      research_portals: { public: 'https://crunchbase.com' },
      verified: true
    }
  ]
};

export const MOCK_VC_FIRMS = {
  sequoia: {
    name: 'Sequoia Capital',
    description: 'Leading venture capital firm',
    verified: true
  },
  accel: {
    name: 'Accel Partners',
    description: 'Global venture capital firm',
    verified: true
  }
};

// Mock API functions
export const mockSearchVerifiedSources = (query, options) => {
  if (!query) throw new Error('Query is required');
  
  if (options.mode === 'verified') {
    return Promise.resolve([
      ...mockResponses.verified.marketData,
      ...mockResponses.verified.vcData
    ]);
  }
  
  return Promise.resolve([]);
};

export const mockProcessWithLLM = (query, sources, context = "", model = "Mixtral-8x7B") => {
  if (!query) throw new Error('Query is required');
  if (!Array.isArray(sources)) throw new Error('Sources must be an array');

  return Promise.resolve({
    content: mockResponses.together.output.choices[0].text,
    sourceMap: sources.reduce((acc, s, idx) => {
      acc[`source_${idx}`] = {
        url: s.url || 'https://example.com',
        title: s.title || 'Mock Source',
        source: s.source || 'Test'
      };
      return acc;
    }, {})
  });
};

export const setupTestEnvironment = () => {
  // Mock API endpoints
  jest.mock('../../src/pages/api/search/verified.js', () => ({
    __esModule: true,
    default: async (req, res) => {
      const { query, model = 'mixtral-8x7b', mode = 'verified' } = req.body;
      
      try {
        const results = await mockSearchVerifiedSources(query, { mode });
        return res.status(200).json({ results, query, model });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
  }));

  // Mock LLM processing
  jest.mock('../../src/utils/llm/processor.js', () => ({
    __esModule: true,
    processWithLLM: mockProcessWithLLM
  }));

  // Mock data sources
  jest.mock('../../src/utils/dataSources', () => ({
    MARKET_DATA_SOURCES: MOCK_MARKET_DATA_SOURCES,
    VC_FIRMS: MOCK_VC_FIRMS,
    searchAcrossDataSources: (query, options) => {
      if (!query) throw new Error('Query is required');
      
      const results = [];
      
      if (options.sources.includes('financial')) {
        results.push(...mockResponses.verified.marketData);
      }
      
      if (options.sources.includes('vc')) {
        results.push(...mockResponses.verified.vcData);
      }
      
      return Promise.resolve(results);
    }
  }));

  // Mock the searchVerifiedSources function
  jest.mock('../../src/utils/verifiedSearch', () => ({
    searchVerifiedSources: mockSearchVerifiedSources
  }));

  // Set environment variables
  process.env.TEST_MODE = 'true';
  process.env.MOCK_EXTERNAL_APIS = 'true';
};

export const resetMocks = () => {
  jest.resetModules();
  jest.clearAllMocks();
};
