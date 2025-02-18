// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 16:31:58
// Current User's Login: NUbivek

import { 
  Search, Linkedin, Globe, BookOpen, FileText, 
  FileSpreadsheet, Twitter, Upload, X, Plus, Link 
} from 'lucide-react';
import { MODELS } from './models.config';
import { API_CONFIG as BaseApiConfig } from './api.config';

export { MODELS };

export const SEARCH_MODES = {
  VERIFIED: 'verified',
  OPEN: 'open'
};

export const PREDEFINED_SEARCHES = [
  "AI Strategies",
  "Growth Frameworks",
  "Enterprise Optimization",
  "Tech Innovation",
  "Market Expansion",
  "Scaling Techniques"
];

export const SOURCES_CONFIG = {
  logoMap: {
    web: Search,
    linkedin: Linkedin,
    x: Twitter,
    crunchbase: Globe,
    pitchbook: BookOpen,
    reddit: Globe,
    ycombinator: Globe,
    substack: FileText,
    medium: FileSpreadsheet,
    upload: Upload
  },
  initialFilters: {
    web: true,          // Only web search is active by default
    linkedin: false,    // All other sources inactive by default
    x: false,
    crunchbase: false,
    pitchbook: false,
    reddit: false,
    ycombinator: false,
    substack: false,
    medium: false,
    upload: false
  },
  scopeOptions: [
    { 
      id: 'only-user', 
      label: 'Only Your Sources', 
      desc: 'Search using only your uploaded files and URLs' 
    },
    { 
      id: 'combined', 
      label: 'Combined Sources', 
      desc: 'Search using both your sources and our verified database' 
    }
  ]
};

// Merge the base API config with your custom settings
export const API_CONFIG = {
  ...BaseApiConfig,
  endpoints: {
    ...BaseApiConfig.endpoints,
    search: '/api/chat',    // Preserve your custom endpoint
    upload: '/api/upload',  // Preserve your custom endpoint
    websearch: `${process.env.NEXT_PUBLIC_API_BASE_URL}/websearch`,
    linkedinsearch: `${process.env.NEXT_PUBLIC_API_BASE_URL}/linkedinsearch`,
    chat: `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`,
    xsearch: `${process.env.NEXT_PUBLIC_API_BASE_URL}/xsearch`
  },
  maxFileSize: 10 * 1024 * 1024, // Keeping your 10MB limit
  allowedFileTypes: [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};

// Export the base configuration as well in case it's needed
export { BaseApiConfig };