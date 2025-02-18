// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 17:43:56
// Current User's Login: NUbivek

export * from './perplexity';
export * from './gemma';
export * from './mixtral';

export const DEFAULT_MODEL = 'perplexity';

export const MODEL_CATEGORIES = {
  CHAT: 'chat',
  SEARCH: 'search',
  COMPLETION: 'completion'
};