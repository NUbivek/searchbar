/**
 * calculatorData.js
 * Shared data constants for metric calculators
 */

// Minimum threshold for all metrics (70%)
export const DISPLAY_THRESHOLD = 70;

// Topic categories for better matching
export const TOPIC_CATEGORIES = {
  FINANCE: ['finance', 'investment', 'stock', 'market', 'trading', 'fund', 'equity', 'bond', 'dividend', 'portfolio', 'asset', 'allocation', 'hedge', 'etf', 'mutual fund', 'reit', 'securities'],
  BUSINESS: ['business', 'company', 'corporate', 'startup', 'entrepreneur', 'industry', 'enterprise', 'commerce', 'merger', 'acquisition', 'ipo', 'earnings', 'revenue', 'profit', 'loss', 'quarterly', 'annual', 'fiscal', 'ceo', 'cfo', 'cto', 'executive'],
  ECONOMICS: ['economy', 'economic', 'gdp', 'inflation', 'recession', 'monetary', 'fiscal', 'policy', 'growth', 'interest rate', 'fed', 'federal reserve', 'central bank', 'treasury', 'deficit', 'surplus', 'debt', 'employment', 'unemployment', 'labor', 'wage', 'income'],
  TECHNOLOGY: ['technology', 'tech', 'software', 'hardware', 'digital', 'ai', 'artificial intelligence', 'blockchain', 'cloud', 'saas', 'paas', 'iaas', 'machine learning', 'deep learning', 'neural network', 'algorithm', 'data science', 'big data', 'analytics', 'automation'],
  REAL_ESTATE: ['real estate', 'property', 'housing', 'mortgage', 'commercial', 'residential', 'reit', 'rent', 'lease', 'tenant', 'landlord', 'development', 'construction', 'zoning', 'appraisal', 'valuation', 'foreclosure', 'listing', 'broker', 'agent'],
  CRYPTO: ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'token', 'defi', 'nft', 'cryptocurrency', 'altcoin', 'mining', 'wallet', 'exchange', 'smart contract', 'decentralized', 'staking', 'yield farming', 'dao', 'ico', 'airdrop'],
  INVESTING: ['investing', 'investor', 'portfolio', 'asset', 'allocation', 'diversification', 'risk', 'return', 'capital', 'appreciation', 'dividend', 'yield', 'growth', 'value', 'passive', 'active', 'strategy', 'long-term', 'short-term', 'day trading'],
  REGULATION: ['regulation', 'compliance', 'legal', 'law', 'policy', 'governance', 'sec', 'finra', 'fdic', 'occ', 'cftc', 'regulatory', 'oversight', 'enforcement', 'sanction', 'fine', 'penalty', 'violation', 'rule', 'guideline']
};

// Domain-specific high-value sources
export const DOMAIN_SPECIFIC_SOURCES = {
  FINANCE: ['bloomberg', 'wsj', 'ft.com', 'morningstar', 'seekingalpha', 'investopedia', 'cnbc', 'reuters'],
  BUSINESS: ['hbr.org', 'forbes', 'inc.com', 'fastcompany', 'businessinsider', 'fortune'],
  ECONOMICS: ['economist.com', 'imf.org', 'worldbank.org', 'federalreserve.gov', 'bis.org', 'oecd.org'],
  TECHNOLOGY: ['techcrunch', 'wired', 'theverge', 'arstechnica', 'mit.edu', 'stanford.edu'],
  REAL_ESTATE: ['zillow', 'redfin', 'realtor.com', 'nar.realtor', 'loopnet', 'costar'],
  CRYPTO: ['coindesk', 'cointelegraph', 'decrypt', 'theblock', 'messari', 'kraken'],
  INVESTING: ['investor.gov', 'vanguard', 'fidelity', 'schwab', 'blackrock', 'morningstar'],
  REGULATION: ['sec.gov', 'finra.org', 'cftc.gov', 'fdic.gov', 'occ.treas.gov', 'consumerfinance.gov']
};

// Source categorization by reliability
export const SOURCE_CATEGORIES = {
  HIGHLY_RELIABLE: [
    'bloomberg', 'wsj', 'reuters', 'ft.com', 'harvard', 'mit', 
    'stanford', 'sec.gov', 'federalreserve', 'nasdaq', 'nyse',
    'nature.com', 'science.org', 'nih.gov', 'nejm.org', 'lancet',
    'census.gov', 'bls.gov', 'worldbank.org', 'imf.org', 'bis.org',
    'statista', 'mckinsey', 'deloitte', 'pwc', 'kpmg', 'ey.com',
    'economist.com', 'hbr.org', 'jstor.org', 'ssrn.com'
  ],
  MODERATELY_RELIABLE: [
    'cnbc', 'forbes', 'businessinsider', 'marketwatch', 'yahoo.finance',
    'investopedia', 'morningstar', 'seeking alpha', 'fool.com',
    'nytimes', 'washingtonpost', 'guardian', 'bbc', 'cnn', 'apnews',
    'thestreet', 'barrons', 'fortune', 'fastcompany', 'inc.com',
    'techcrunch', 'wired', 'verge', 'zdnet', 'cnet', 'venturebeat',
    'medium.com', 'substack', 'hacker-news', 'github'
  ],
  LESS_RELIABLE: [
    'reddit', 'quora', 'twitter', 'facebook', 'instagram', 'tiktok',
    'youtube', 'blogspot', 'wordpress', 'tumblr', 'pinterest',
    'buzzfeed', 'vox', 'huffpost', 'dailymail', 'nypost', 'foxnews'
  ]
};

// Fact-checking organizations and their domains
export const FACT_CHECKING_SOURCES = [
  'factcheck.org', 'politifact.com', 'snopes.com', 'apnews.com/hub/ap-fact-check',
  'reuters.com/fact-check', 'fullfact.org', 'factcheckni.org', 'africacheck.org',
  'checkyourfact.com', 'factcheck.afp.com', 'leadstories.com', 'truthorfiction.com',
  'washingtonpost.com/news/fact-checker', 'bbc.com/news/reality_check'
];

// List of prestigious academic institutions
export const PRESTIGIOUS_INSTITUTIONS = [
  'harvard', 'stanford', 'mit', 'princeton', 'yale', 'columbia', 'berkeley', 'chicago',
  'oxford', 'cambridge', 'caltech', 'eth zurich', 'imperial college', 'ucl', 'toronto',
  'cornell', 'penn', 'johns hopkins', 'michigan', 'duke', 'northwestern', 'nyu',
  'ucla', 'carnegie mellon', 'washington', 'ucsf', 'ucsd', 'ubc', 'mcgill'
];

// List of reputable research organizations
export const RESEARCH_ORGANIZATIONS = [
  'rand', 'brookings', 'pew research', 'gallup', 'ipsos', 'nielsen', 'gartner',
  'forrester', 'mckinsey', 'boston consulting', 'bain', 'deloitte', 'kpmg', 'pwc', 'ey',
  'world economic forum', 'imf', 'world bank', 'oecd', 'bis', 'federal reserve',
  'nber', 'cbo', 'gao', 'census bureau', 'bls', 'eurostat'
];

// List of professional credentials
export const PROFESSIONAL_CREDENTIALS = [
  'phd', 'md', 'jd', 'mba', 'cpa', 'cfa', 'frm', 'pmp', 'cissp', 'cisa',
  'professor', 'fellow', 'economist', 'analyst', 'researcher', 'scientist',
  'engineer', 'attorney', 'lawyer', 'physician', 'surgeon', 'director'
];

// Context-specific weights for different query types
export const CONTEXT_WEIGHTS = {
  FINANCIAL: {
    RELEVANCE: 0.30,
    ACCURACY: 0.40,
    CREDIBILITY: 0.30
  },
  MEDICAL: {
    RELEVANCE: 0.25,
    ACCURACY: 0.40,
    CREDIBILITY: 0.35
  },
  NEWS: {
    RELEVANCE: 0.40,
    ACCURACY: 0.30,
    CREDIBILITY: 0.30
  },
  TECHNICAL: {
    RELEVANCE: 0.35,
    ACCURACY: 0.40,
    CREDIBILITY: 0.25
  },
  ACADEMIC: {
    RELEVANCE: 0.25,
    ACCURACY: 0.35,
    CREDIBILITY: 0.40
  }
};

export default {
  DISPLAY_THRESHOLD,
  TOPIC_CATEGORIES,
  DOMAIN_SPECIFIC_SOURCES,
  SOURCE_CATEGORIES,
  FACT_CHECKING_SOURCES,
  PRESTIGIOUS_INSTITUTIONS,
  RESEARCH_ORGANIZATIONS,
  PROFESSIONAL_CREDENTIALS,
  CONTEXT_WEIGHTS
};
