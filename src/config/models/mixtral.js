// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 17:43:56
// Current User's Login: NUbivek

export const MIXTRAL = {
    id: 'mixtral',
    name: 'Mixtral',
    description: 'Completion Optimized',
    category: 'completion',
    apiConfig: {
      baseURL: '/api/completion',
      headers: {
        'Content-Type': 'application/json'
      },
    },
    parameters: {
      temperature: 0.8,
      maxTokens: 8192,
    }
  };