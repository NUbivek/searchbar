export const SearchModes = {
  VERIFIED: 'verified',
  OPEN: 'open'
};

export const MODEL_OPTIONS = [
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    icon: '🚀',
    description: 'Latest and most capable model. Best for complex research and analysis.',
    default: true
  },
  {
    id: 'deepseek-70b',
    name: 'DeepSeek 70B',
    icon: '🔮',
    description: 'Highly accurate with excellent reasoning capabilities.'
  },
  {
    id: 'gemma-7b',
    name: 'Gemma 7B',
    icon: '⚡',
    description: 'Fast and efficient. Great for quick research tasks.'
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
