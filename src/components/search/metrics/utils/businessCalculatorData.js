/**
 * businessCalculatorData.js
 * Configuration data for business metrics calculation
 * Maintains compatibility with the standard three-score format
 */

/**
 * Business-specific keywords for enhanced metrics calculation
 */
export const BUSINESS_KEYWORDS = {
  // Business relevance keywords
  BUSINESS_TERMS: [
    'market', 'financial', 'revenue', 'profit', 'earnings', 'growth',
    'investment', 'stock', 'shares', 'business', 'company', 'industry',
    'sector', 'economic', 'forecast', 'trend', 'analysis', 'report',
    'quarter', 'fiscal', 'performance', 'dividend', 'valuation', 'ROI',
    'capital', 'assets', 'liabilities', 'equity', 'stakeholder', 'shareholder',
    'corporate', 'enterprise', 'firm', 'organization', 'conglomerate',
    'startup', 'scale-up', 'unicorn', 'venture', 'private equity', 'IPO'
  ],
  
  // Market insight keywords
  MARKET_TERMS: [
    'market share', 'market growth', 'market trend', 'industry analysis',
    'competitive landscape', 'market forecast', 'market report',
    'market segment', 'market opportunity', 'market challenge',
    'market leader', 'market disruption', 'market dynamics', 'market entry',
    'market penetration', 'market saturation', 'market expansion',
    'market consolidation', 'market fragmentation', 'addressable market',
    'total addressable market', 'TAM', 'serviceable available market', 'SAM',
    'serviceable obtainable market', 'SOM', 'SWOT analysis', 'PESTEL analysis',
    'Porter\'s five forces', 'competitive advantage', 'competitive positioning'
  ],
  
  // Financial accuracy keywords
  FINANCIAL_TERMS: [
    'revenue', 'profit', 'earnings', 'margin', 'EBITDA', 'EPS', 'P/E',
    'cash flow', 'balance sheet', 'income statement', 'quarterly results',
    'fiscal year', 'dividend', 'ROI', 'ROE', 'ROA', 'ROCE', 'financial performance',
    'gross margin', 'operating margin', 'net margin', 'profit margin',
    'free cash flow', 'FCF', 'debt-to-equity', 'leverage ratio', 'liquidity ratio',
    'current ratio', 'quick ratio', 'acid test', 'working capital',
    'capital expenditure', 'CAPEX', 'operating expense', 'OPEX',
    'cost of goods sold', 'COGS', 'cost of revenue', 'burn rate',
    'runway', 'break-even', 'valuation multiple', 'enterprise value', 'EV',
    'market capitalization', 'book value', 'tangible book value',
    'intrinsic value', 'discounted cash flow', 'DCF', 'net present value', 'NPV',
    'internal rate of return', 'IRR', 'compound annual growth rate', 'CAGR'
  ],
  
  // Management and strategy terms
  MANAGEMENT_TERMS: [
    'CEO', 'CFO', 'COO', 'CTO', 'CMO', 'CIO', 'CHRO', 'C-suite', 'executive',
    'board of directors', 'chairman', 'leadership', 'management team',
    'corporate governance', 'strategic plan', 'business strategy',
    'growth strategy', 'diversification', 'vertical integration',
    'horizontal integration', 'merger', 'acquisition', 'M&A',
    'joint venture', 'partnership', 'alliance', 'collaboration',
    'restructuring', 'reorganization', 'turnaround', 'pivot',
    'digital transformation', 'innovation', 'R&D', 'product development',
    'go-to-market', 'GTM', 'business model', 'revenue model', 'pricing strategy',
    'cost structure', 'value chain', 'supply chain', 'distribution channel'
  ],
  
  // Source quality indicators
  QUALITY_SOURCES: [
    'bloomberg', 'reuters', 'wsj', 'wall street journal', 'financial times',
    'ft.com', 'cnbc', 'forbes', 'harvard business', 'mckinsey', 'morningstar',
    'seeking alpha', 'yahoo finance', 'marketwatch', 'investor.gov', 'sec.gov',
    'nasdaq', 'nyse', 'investopedia', 'fool.com', 'barrons', 'economist',
    'business insider', 'fortune', 'hbr.org', 'harvard business review',
    'deloitte', 'pwc', 'kpmg', 'ey', 'accenture', 'mckinsey', 'bain', 'bcg',
    'gartner', 'statista', 'ibisworld', 'crunchbase', 'pitchbook',
    'edgar', '10-k', '10-q', 'annual report', 'quarterly report',
    'earnings call', 'investor relations', 'press release'
  ],
  
  // Industry-specific terms
  INDUSTRY_TERMS: {
    TECHNOLOGY: [
      'software', 'hardware', 'SaaS', 'cloud', 'AI', 'machine learning', 'ML',
      'artificial intelligence', 'big data', 'analytics', 'IoT', 'internet of things',
      'blockchain', 'cryptocurrency', 'crypto', 'fintech', 'cybersecurity',
      'data privacy', 'GDPR', 'CCPA', 'API', 'platform', 'ecosystem',
      'digital', 'e-commerce', 'mobile', 'app', 'web', 'UX', 'UI'
    ],
    HEALTHCARE: [
      'healthcare', 'health', 'medical', 'biotech', 'pharmaceutical', 'pharma',
      'life sciences', 'clinical', 'FDA', 'EMA', 'regulatory', 'compliance',
      'patient', 'provider', 'payer', 'reimbursement', 'Medicare', 'Medicaid',
      'telehealth', 'telemedicine', 'digital health', 'health tech'
    ],
    FINANCE: [
      'banking', 'insurance', 'wealth management', 'asset management',
      'private equity', 'venture capital', 'VC', 'hedge fund', 'mutual fund',
      'ETF', 'REIT', 'mortgage', 'loan', 'credit', 'debt', 'equity',
      'capital markets', 'IPO', 'M&A', 'fintech', 'regtech', 'insurtech'
    ],
    RETAIL: [
      'retail', 'e-commerce', 'omnichannel', 'brick and mortar', 'DTC',
      'direct-to-consumer', 'consumer goods', 'CPG', 'FMCG', 'luxury',
      'apparel', 'fashion', 'grocery', 'merchandising', 'inventory',
      'supply chain', 'logistics', 'fulfillment', 'last mile', 'POS'
    ],
    MANUFACTURING: [
      'manufacturing', 'industrial', 'production', 'factory', 'plant',
      'assembly', 'automation', 'robotics', 'IoT', 'industry 4.0',
      'lean', 'six sigma', 'quality control', 'QC', 'quality assurance', 'QA',
      'supply chain', 'procurement', 'raw materials', 'inventory'
    ],
    ENERGY: [
      'energy', 'oil', 'gas', 'petroleum', 'renewable', 'solar', 'wind',
      'hydro', 'geothermal', 'biofuel', 'clean energy', 'green energy',
      'carbon', 'emissions', 'climate', 'sustainability', 'ESG'
    ]
  }
};

/**
 * Context-specific weights for the standard three-score metrics
 * Used to adjust the importance of each metric based on query context
 */
export const BUSINESS_CONTEXT_WEIGHTS = {
  // Default business context
  business: {
    relevance: 0.35,
    accuracy: 0.35,
    credibility: 0.30
  },
  
  // Financial context (prioritizes accuracy)
  financial: {
    relevance: 0.25,
    accuracy: 0.45,
    credibility: 0.30
  },
  
  // Market context (prioritizes relevance)
  market: {
    relevance: 0.40,
    accuracy: 0.30,
    credibility: 0.30
  },
  
  // Investment context (prioritizes credibility)
  investment: {
    relevance: 0.30,
    accuracy: 0.30,
    credibility: 0.40
  },
  
  // Strategic context (balanced)
  strategic: {
    relevance: 0.35,
    accuracy: 0.35,
    credibility: 0.30
  },
  
  // Industry analysis context (relevance-focused)
  industry: {
    relevance: 0.45,
    accuracy: 0.30,
    credibility: 0.25
  }
};

/**
 * Tooltip descriptions for business-enhanced metrics
 */
export const BUSINESS_METRIC_DESCRIPTIONS = {
  relevance: "Measures how well the content matches your business query, including business terminology, industry context, and market relevance.",
  accuracy: "Evaluates the precision of financial data, statistics, and business facts in the content, with emphasis on recency and completeness.",
  credibility: "Assesses the reliability of business sources based on reputation, authority, and expertise in the relevant industry or sector.",
  overall: "Composite score that weighs relevance, accuracy, and credibility based on the specific business context of your query."
};

/**
 * Business insight categories for organizing search results
 */
export const BUSINESS_INSIGHT_CATEGORIES = [
  {
    id: 'financial_performance',
    name: 'Financial Performance',
    description: 'Revenue, profit, margins, and other financial metrics',
    keywords: ['revenue', 'profit', 'earnings', 'margin', 'financial', 'quarterly', 'annual']
  },
  {
    id: 'market_position',
    name: 'Market Position',
    description: 'Market share, competitive landscape, and industry standing',
    keywords: ['market share', 'competitor', 'industry', 'position', 'ranking', 'leader']
  },
  {
    id: 'growth_strategy',
    name: 'Growth Strategy',
    description: 'Plans for expansion, new markets, and future growth',
    keywords: ['growth', 'expansion', 'strategy', 'plan', 'future', 'roadmap', 'vision']
  },
  {
    id: 'leadership_management',
    name: 'Leadership & Management',
    description: 'Executive team, board, and governance information',
    keywords: ['CEO', 'executive', 'management', 'leadership', 'board', 'director']
  },
  {
    id: 'investment_outlook',
    name: 'Investment Outlook',
    description: 'Investment potential, risks, and analyst perspectives',
    keywords: ['investment', 'investor', 'stock', 'share', 'analyst', 'rating', 'recommendation']
  },
  {
    id: 'innovation_rd',
    name: 'Innovation & R&D',
    description: 'Research, development, patents, and innovation initiatives',
    keywords: ['innovation', 'R&D', 'research', 'development', 'patent', 'technology']
  }
];

export default {
  BUSINESS_KEYWORDS,
  BUSINESS_CONTEXT_WEIGHTS,
  BUSINESS_METRIC_DESCRIPTIONS,
  BUSINESS_INSIGHT_CATEGORIES
};
