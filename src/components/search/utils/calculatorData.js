/**
 * calculatorData.js
 * Data constants for metric calculators
 */

// Display threshold for metrics (70%)
export const DISPLAY_THRESHOLD = 70;

// Prestigious academic and research institutions
export const PRESTIGIOUS_INSTITUTIONS = [
  // Universities
  'harvard', 'stanford', 'mit', 'princeton', 'yale', 'columbia',
  'berkeley', 'oxford', 'cambridge', 'caltech', 'chicago', 'penn',
  'cornell', 'duke', 'northwestern', 'johns hopkins', 'michigan',
  'carnegie mellon', 'nyu', 'ucla', 'ucsd', 'ucsf', 'imperial college',
  'eth zurich', 'tokyo', 'peking', 'tsinghua', 'toronto', 'mcgill',
  'melbourne', 'sydney', 'edinburgh', 'lse', 'ucl', 'heidelberg',
  
  // Domains
  '.edu', '.ac.uk', '.ac.jp', '.edu.au', '.edu.cn'
];

// Research organizations and think tanks
export const RESEARCH_ORGANIZATIONS = [
  // Research institutions
  'rand', 'brookings', 'heritage', 'cato', 'urban institute',
  'pew research', 'gallup', 'ipsos', 'mckinsey', 'gartner',
  'forrester', 'idc', 'nielsen', 'kantar', 'euromonitor',
  
  // Government research
  'nih', 'cdc', 'fda', 'nsf', 'nasa', 'darpa', 'nist',
  'doe', 'epa', 'usgs', 'noaa', 'ars', 'census',
  
  // International organizations
  'who', 'world bank', 'imf', 'oecd', 'un', 'unesco',
  'wto', 'fao', 'iea', 'ilo', 'wef'
];

// Credible news and media sources
export const CREDIBLE_NEWS_SOURCES = [
  // Major newspapers
  'nytimes.com', 'wsj.com', 'washingtonpost.com', 'ft.com',
  'economist.com', 'reuters.com', 'apnews.com', 'bloomberg.com',
  'theguardian.com', 'bbc.', 'npr.org', 'pbs.org',
  
  // Business publications
  'forbes.com', 'fortune.com', 'hbr.org', 'businessinsider.com',
  'cnbc.com', 'marketwatch.com', 'barrons.com', 'morningstar.com',
  
  // Science publications
  'nature.com', 'science.org', 'scientificamerican.com',
  'newscientist.com', 'pnas.org', 'nejm.org', 'thelancet.com',
  'sciencedirect.com', 'cell.com', 'ieee.org', 'acm.org'
];

// Industry-specific sources
export const INDUSTRY_SOURCES = {
  TECHNOLOGY: [
    'techcrunch.com', 'wired.com', 'theverge.com', 'cnet.com',
    'zdnet.com', 'venturebeat.com', 'arstechnica.com', 'engadget.com',
    'gizmodo.com', 'slashdot.org', 'thenextweb.com'
  ],
  FINANCE: [
    'bloomberg.com', 'ft.com', 'wsj.com', 'cnbc.com',
    'marketwatch.com', 'investing.com', 'seekingalpha.com',
    'morningstar.com', 'barrons.com', 'thestreet.com'
  ],
  HEALTHCARE: [
    'nejm.org', 'thelancet.com', 'jamanetwork.com', 'bmj.com',
    'medscape.com', 'webmd.com', 'healthline.com', 'mayoclinic.org',
    'nih.gov', 'cdc.gov', 'who.int', 'fda.gov'
  ],
  RETAIL: [
    'retaildive.com', 'chainstoreage.com', 'supermarketnews.com',
    'progressivegrocer.com', 'retailwire.com', 'stores.org',
    'nrf.com', 'retailtouchpoints.com'
  ],
  ENERGY: [
    'oilprice.com', 'energyintel.com', 'platts.com', 'rigzone.com',
    'worldoil.com', 'ogj.com', 'greentechmedia.com', 'rechargenews.com',
    'iea.org', 'eia.gov'
  ],
  MANUFACTURING: [
    'industryweek.com', 'manufacturingglobal.com', 'thomasnet.com',
    'manufacturing.net', 'assemblymag.com', 'mfgtechupdate.com',
    'nam.org', 'mapi.net'
  ]
};

// Business-specific metrics
export const BUSINESS_METRICS = {
  FINANCIAL_TERMS: [
    'revenue', 'profit', 'earnings', 'ebitda', 'margin',
    'eps', 'p/e', 'dividend', 'yield', 'cash flow',
    'balance sheet', 'income statement', 'quarterly', 'fiscal',
    'guidance', 'forecast', 'outlook', 'projection'
  ],
  MARKET_TERMS: [
    'market share', 'market cap', 'valuation', 'stock price',
    'share price', 'trading', 'exchange', 'index', 'sector',
    'industry', 'competitor', 'competition', 'comparative',
    'benchmark', 'performance', 'growth', 'decline'
  ],
  CORPORATE_TERMS: [
    'ceo', 'cfo', 'cto', 'coo', 'executive', 'board',
    'director', 'management', 'leadership', 'strategy',
    'acquisition', 'merger', 'takeover', 'ipo', 'spinoff',
    'restructuring', 'reorganization', 'layoff', 'hiring'
  ],
  OPERATIONAL_TERMS: [
    'sales', 'customer', 'client', 'product', 'service',
    'supply chain', 'inventory', 'manufacturing', 'production',
    'distribution', 'logistics', 'operations', 'efficiency',
    'cost', 'expense', 'overhead', 'investment', 'capital'
  ]
};

// Time-related terms for recency assessment
export const TIME_TERMS = {
  VERY_RECENT: [
    'today', 'yesterday', 'this week', 'this month',
    'current quarter', 'current year', 'ongoing',
    'breaking', 'just announced', 'just released'
  ],
  RECENT: [
    'last week', 'last month', 'recent', 'latest',
    'new', 'updated', 'this year', 'this quarter',
    '2023', '2022' // Update yearly
  ],
  SOMEWHAT_RECENT: [
    'last year', 'last quarter', 'few months ago',
    'earlier this year', '2021', '2020' // Update yearly
  ],
  NOT_RECENT: [
    'several years ago', 'historically', 'previously',
    'in the past', 'formerly', 'once', 'used to',
    '2019', '2018', '2017' // Update yearly
  ]
};

// Topic categories for content classification
export const TOPIC_CATEGORIES = {
  BUSINESS: [
    'business', 'company', 'corporate', 'industry', 'market',
    'finance', 'investment', 'stock', 'economy', 'economic',
    'commercial', 'trade', 'enterprise', 'venture', 'startup',
    'entrepreneur', 'profit', 'revenue', 'sales', 'growth'
  ],
  TECHNOLOGY: [
    'technology', 'tech', 'software', 'hardware', 'digital',
    'computer', 'internet', 'web', 'online', 'app',
    'mobile', 'device', 'gadget', 'innovation', 'development',
    'programming', 'code', 'algorithm', 'data', 'cloud'
  ],
  FINANCE: [
    'finance', 'financial', 'investment', 'investor', 'stock',
    'market', 'trading', 'fund', 'asset', 'portfolio',
    'wealth', 'money', 'banking', 'bank', 'loan',
    'credit', 'debt', 'mortgage', 'interest', 'dividend'
  ],
  HEALTHCARE: [
    'health', 'healthcare', 'medical', 'medicine', 'doctor',
    'hospital', 'patient', 'treatment', 'therapy', 'disease',
    'condition', 'symptom', 'diagnosis', 'prescription', 'drug',
    'pharmaceutical', 'biotech', 'wellness', 'care', 'clinical'
  ],
  RETAIL: [
    'retail', 'store', 'shop', 'shopping', 'consumer',
    'customer', 'product', 'merchandise', 'brand', 'sale',
    'discount', 'price', 'purchase', 'buyer', 'seller',
    'ecommerce', 'commerce', 'market', 'mall', 'outlet'
  ],
  ENERGY: [
    'energy', 'oil', 'gas', 'petroleum', 'fuel',
    'power', 'electricity', 'renewable', 'solar', 'wind',
    'hydro', 'nuclear', 'coal', 'carbon', 'emission',
    'climate', 'sustainable', 'green', 'clean', 'utility'
  ],
  REAL_ESTATE: [
    'real estate', 'property', 'home', 'house', 'apartment',
    'building', 'commercial', 'residential', 'rent', 'lease',
    'mortgage', 'housing', 'development', 'construction', 'land',
    'office', 'space', 'agent', 'broker', 'listing'
  ],
  MANUFACTURING: [
    'manufacturing', 'factory', 'production', 'industrial', 'industry',
    'assembly', 'fabrication', 'processing', 'machinery', 'equipment',
    'automation', 'supply chain', 'inventory', 'quality', 'material',
    'component', 'product', 'goods', 'output', 'capacity'
  ]
};

// Citation quality indicators
export const CITATION_QUALITY = {
  HIGH_QUALITY: [
    /\[\d+\]/,                     // Academic citation format [1]
    /\(.*\d{4}.*\)/,               // Academic citation format (Author, 2023)
    /doi\.org\/[^\s]+/,            // DOI reference
    /pmid:\s*\d+/i,                // PubMed ID
    /isbn:\s*[\d-]+/i              // ISBN reference
  ],
  MEDIUM_QUALITY: [
    /according to [^,\.]+/i,       // Attribution to a source
    /cited by [^,\.]+/i,           // Reference to being cited
    /source: [^,\.]+/i,            // Source attribution
    /reported by [^,\.]+/i,        // Reporting attribution
    /published (in|by) [^,\.]+/i   // Publication attribution
  ],
  LOW_QUALITY: [
    /some say/i,                   // Vague attribution
    /people believe/i,             // Vague attribution
    /it is said/i,                 // Vague attribution
    /many think/i,                 // Vague attribution
    /experts suggest/i             // Vague expert attribution
  ]
};
