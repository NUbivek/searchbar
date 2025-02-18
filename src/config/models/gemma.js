// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 17:43:56
// Current User's Login: NUbivek

export const GEMMA = {
    id: 'gemma',
    name: 'Gemma',
    description: 'Chat Optimized',
    category: 'chat',
    apiConfig: {
      baseURL: '/api/chat',
      headers: {
        'Content-Type': 'application/json'
      },
    },
    parameters: {
      temperature: 0.9,
      maxTokens: 4096,
    }
  };