export const API_CONFIG = {
  PERPLEXITY: {
    API_KEY: process.env.PERPLEXITY_API_KEY,
    BASE_URL: 'https://api.perplexity.ai'
  },
  TOGETHER: {
    API_KEY: process.env.TOGETHER_API_KEY,
    BASE_URL: 'https://api.together.xyz'
  },
  SOCIAL: {
    LINKEDIN: {
      API_KEY: process.env.LINKEDIN_API_KEY,
      BASE_URL: 'https://api.linkedin.com/v2'
    },
    TWITTER: {
      API_KEY: process.env.TWITTER_API_KEY,
      BASE_URL: 'https://api.twitter.com/2'
    },
    REDDIT: {
      API_KEY: process.env.REDDIT_API_KEY,
      BASE_URL: 'https://oauth.reddit.com'
    }
  }
};

export const MODEL_CONFIGS = {
  'Perplexity': {
    provider: 'PERPLEXITY',
    model: 'pplx-7b-online',
    temperature: 0.7
  },
  'Mistral': {
    provider: 'TOGETHER',
    model: 'mistralai/Mistral-7B-v0.1',
    temperature: 0.7
  },
  'Llama': {
    provider: 'TOGETHER',
    model: 'meta-llama/Llama-2-13b-chat-hf',
    temperature: 0.7
  },
  'Gemma': {
    provider: 'TOGETHER',
    model: 'google/gemma-2-27b-it',
    temperature: 0.7
  }
}; 