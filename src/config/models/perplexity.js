// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 17:43:56
// Current User's Login: NUbivek

export const PERPLEXITY = {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'Search Optimized',
    category: 'search',
    apiConfig: {
      baseURL: '/api/search',
      headers: {
        'Content-Type': 'application/json'
      },
    },
    parameters: {
      temperature: 0.7,
      maxTokens: 2048,
    }
  };