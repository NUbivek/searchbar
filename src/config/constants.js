// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 16:31:58
// Current User's Login: NUbivek

import { 
  Search, LinkedinIcon, TwitterIcon, RedditIcon, BookOpen, Building2, LineChart, PenTool, Verified, Upload, Link 
} from 'lucide-react';
import { MODELS } from './models.config.js'; // Added .js extension
import { API_CONFIG as BaseApiConfig } from './api.config.js'; // Added .js extension

export { MODELS };

export const SEARCH_MODES = {
  VERIFIED: 'verified',
  OPEN: 'open'
};

export const SOURCE_TYPES = {
  VERIFIED: 'verified',
  WEB: 'web',
  LINKEDIN: 'linkedin',
  X: 'x',
  REDDIT: 'reddit',
  SUBSTACK: 'substack',
  CRUNCHBASE: 'crunchbase',
  PITCHBOOK: 'pitchbook',
  MEDIUM: 'medium',
  CUSTOM: 'custom'
};

export const PREDEFINED_SEARCHES = [
  'Market size analysis',
  'Competitor landscape',
  'Industry trends',
  'Growth strategies',
  'Investment thesis',
  'Tech stack comparison'
];

export const SOURCES_CONFIG = {
  initialFilters: {
    [SOURCE_TYPES.WEB]: false,
    [SOURCE_TYPES.LINKEDIN]: false,
    [SOURCE_TYPES.X]: false,
    [SOURCE_TYPES.REDDIT]: false,
    [SOURCE_TYPES.SUBSTACK]: false,
    [SOURCE_TYPES.CRUNCHBASE]: false,
    [SOURCE_TYPES.PITCHBOOK]: false,
    [SOURCE_TYPES.MEDIUM]: false,
    [SOURCE_TYPES.CUSTOM]: true
  },
  
  scopeOptions: [
    {
      id: 'only-user',
      label: 'Your Sources Only',
      desc: 'Search through your uploaded files and URLs'
    },
    {
      id: 'combined',
      label: 'Combined Sources',
      desc: 'Include both your sources and our verified database'
    }
  ],

  logoMap: {
    [SOURCE_TYPES.WEB]: Search,
    [SOURCE_TYPES.LINKEDIN]: LinkedinIcon,
    [SOURCE_TYPES.X]: TwitterIcon,
    [SOURCE_TYPES.REDDIT]: RedditIcon,
    [SOURCE_TYPES.SUBSTACK]: BookOpen,
    [SOURCE_TYPES.CRUNCHBASE]: Building2,
    [SOURCE_TYPES.PITCHBOOK]: LineChart,
    [SOURCE_TYPES.MEDIUM]: PenTool,
    [SOURCE_TYPES.VERIFIED]: Verified,
    [SOURCE_TYPES.CUSTOM]: Upload
  },

  allowedFileTypes: [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
};

// Merge the base API config with your custom settings
export const API_CONFIG = {
  ...BaseApiConfig,
  endpoints: {
    ...BaseApiConfig.endpoints,
    search: {
      verified: '/api/search/verified',
      web: '/api/search/web',
      linkedin: '/api/search/linkedin',
      x: '/api/search/x',
      reddit: '/api/search/reddit',
      substack: '/api/search/substack',
      crunchbase: '/api/search/crunchbase',
      pitchbook: '/api/search/pitchbook',
      medium: '/api/search/medium'
    },
    upload: '/api/upload',
    chat: '/api/chat'
  },
  maxFileSize: 25 * 1024 * 1024, // 25MB
};

// Export the base configuration as well in case it's needed
export { BaseApiConfig };

// Add default export for better compatibility
export default {
  SEARCH_MODES,
  PREDEFINED_SEARCHES,
  SOURCES_CONFIG,
  API_CONFIG,
  MODELS
};

// Add to existing constants
export const PLATFORM_CONFIG = {
  LINKEDIN: {
    apiEndpoint: '/api/search/linkedin',
    rateLimit: 100,
    maxResults: 50,
    requiredFields: ['title', 'content', 'author', 'date']
  },
  TWITTER: {
    apiEndpoint: '/api/search/twitter',
    rateLimit: 150,
    maxResults: 100,
    requiredFields: ['text', 'author', 'date', 'metrics']
  },
  REDDIT: {
    apiEndpoint: '/api/search/reddit',
    rateLimit: 120,
    maxResults: 75,
    requiredFields: ['title', 'selftext', 'author', 'created_utc']
  },
  SUBSTACK: {
    apiEndpoint: '/api/search/substack',
    rateLimit: 80,
    maxResults: 30,
    requiredFields: ['title', 'content', 'author', 'date']
  },
  MEDIUM: {
    apiEndpoint: '/api/search/medium',
    rateLimit: 90,
    maxResults: 40,
    requiredFields: ['title', 'content', 'author', 'date']
  },
  CRUNCHBASE: {
    apiEndpoint: '/api/search/crunchbase',
    rateLimit: 70,
    maxResults: 25,
    requiredFields: ['name', 'description', 'funding', 'metrics']
  },
  PITCHBOOK: {
    apiEndpoint: '/api/search/pitchbook',
    rateLimit: 60,
    maxResults: 25,
    requiredFields: ['name', 'details', 'financials', 'metrics']
  }
};