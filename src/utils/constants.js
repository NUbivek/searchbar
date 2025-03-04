export const SearchModes = {
  VERIFIED: 'verified',
  OPEN: 'open'
};

export const MODEL_OPTIONS = [
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    icon: '🚀',
    description: 'Well-balanced model with good reasoning capabilities.',
    default: true
  },
  {
    id: 'llama-13b',
    name: 'Llama 2 13B',
    icon: '🔮',
    description: 'Highly accurate with excellent reasoning and context handling.'
  },
  {
    id: 'gemma-27b',
    name: 'Gemma 27B',
    icon: '⚡',
    description: 'Powerful model with excellent reasoning and instruction following.'
  }
];

export const SourceTypes = {
  WEB: 'Web',
  LINKEDIN: 'LinkedIn',
  TWITTER: 'X',
  REDDIT: 'Reddit',
  SUBSTACK: 'Substack',
  CRUNCHBASE: 'Crunchbase',
  PITCHBOOK: 'Pitchbook',
  MEDIUM: 'Medium',
  CARTA: 'Carta',
  MARKET_DATA: 'Market Data Analytics',
  VC_STARTUPS: 'VC & Startups'
};

export const VERIFIED_SOURCES = {
  'Market Data Analytics': [
    { name: 'Bloomberg', url: 'https://www.bloomberg.com' },
    { name: 'Reuters', url: 'https://www.reuters.com' },
    { name: 'WSJ', url: 'https://www.wsj.com' }
  ],
  'VC & Startups': [
    { name: 'Crunchbase', url: 'https://www.crunchbase.com' },
    { name: 'Pitchbook', url: 'https://www.pitchbook.com' },
    { name: 'TechCrunch', url: 'https://www.techcrunch.com' }
  ]
};

export const VERIFIED_SOURCE_TYPES = [
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'twitter', name: 'X', icon: '🐦' },
  { id: 'reddit', name: 'Reddit', icon: '🤖' },
  { id: 'substack', name: 'Substack', icon: '📨' },
  { id: 'medium', name: 'Medium', icon: '📝' },
  { id: 'crunchbase', name: 'Crunchbase', icon: '🚀' },
  { id: 'pitchbook', name: 'Pitchbook', icon: '📊' },
  { id: 'market_data', name: 'Market Data Analytics', icon: '📈' },
  { id: 'vc_startups', name: 'VC & Startups', icon: '💰' }
];

// Check for debug-related constants
export const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
export const SHOW_METRICS = process.env.NEXT_PUBLIC_SHOW_METRICS === 'true';
export const SHOW_CHAT_HISTORY = process.env.NEXT_PUBLIC_SHOW_CHAT_HISTORY === 'true';
