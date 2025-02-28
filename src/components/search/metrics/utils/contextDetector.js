/**
 * contextDetector.js
 * Functions for detecting query context
 */

// Keywords for context detection
const FINANCIAL_KEYWORDS = [
  'stock', 'market', 'invest', 'trading', 'finance', 'dividend', 'portfolio',
  'bond', 'equity', 'fund', 'etf', 'mutual fund', 'reit', 'asset', 'allocation',
  'hedge', 'return', 'yield', 'interest rate', 'inflation', 'recession', 'gdp',
  'earnings', 'revenue', 'profit', 'loss', 'balance sheet', 'income statement',
  'cash flow', 'valuation', 'p/e ratio', 'market cap', 'ipo', 'merger', 'acquisition',
  'shareholder', 'stakeholder', 'roi', 'roa', 'roe', 'eps', 'ebitda', 'cagr',
  'liquidity', 'solvency', 'debt', 'equity', 'leverage', 'capital', 'assets',
  'liabilities', 'fiscal', 'quarter', 'annual report', 'sec filing', 'form 10-k',
  'form 10-q', 'proxy statement', 'dividend yield', 'payout ratio'
];

// Business-specific keywords
const BUSINESS_KEYWORDS = [
  'business', 'company', 'corporation', 'enterprise', 'firm', 'organization',
  'industry', 'sector', 'market', 'competition', 'competitive', 'advantage',
  'strategy', 'strategic', 'management', 'leadership', 'executive', 'ceo', 'cfo',
  'cto', 'coo', 'board', 'director', 'corporate', 'governance', 'stakeholder',
  'shareholder', 'investor', 'venture capital', 'private equity', 'startup',
  'scale-up', 'growth', 'expansion', 'diversification', 'acquisition', 'merger',
  'joint venture', 'partnership', 'alliance', 'collaboration', 'supply chain',
  'logistics', 'operations', 'production', 'manufacturing', 'distribution',
  'wholesale', 'retail', 'b2b', 'b2c', 'customer', 'client', 'consumer',
  'market research', 'market analysis', 'market segment', 'target market',
  'value proposition', 'business model', 'revenue model', 'pricing strategy',
  'cost structure', 'profit margin', 'bottom line', 'top line', 'sales',
  'marketing', 'advertising', 'branding', 'product', 'service', 'solution',
  'innovation', 'disruption', 'digital transformation', 'sustainability',
  'corporate social responsibility', 'esg', 'swot', 'pestel', 'porter'
];

const MEDICAL_KEYWORDS = [
  'health', 'medical', 'disease', 'treatment', 'symptom', 'diagnosis', 'therapy',
  'drug', 'vaccine', 'medication', 'patient', 'doctor', 'hospital', 'clinic',
  'surgery', 'cancer', 'diabetes', 'heart disease', 'blood pressure', 'cholesterol',
  'infection', 'virus', 'bacteria', 'immune', 'antibody', 'chronic', 'acute',
  'prescription', 'clinical trial', 'fda', 'pharmaceutical', 'side effect'
];

const NEWS_KEYWORDS = [
  'news', 'report', 'latest', 'update', 'breaking', 'headline', 'story',
  'coverage', 'press', 'media', 'journalist', 'reporter', 'editor', 'broadcast',
  'publication', 'article', 'column', 'editorial', 'opinion', 'analysis',
  'interview', 'statement', 'announcement', 'press release', 'conference',
  'event', 'incident', 'development', 'situation', 'crisis', 'scandal'
];

const TECHNICAL_KEYWORDS = [
  'code', 'programming', 'software', 'hardware', 'developer', 'engineer',
  'algorithm', 'database', 'api', 'framework', 'library', 'function', 'method',
  'class', 'object', 'variable', 'parameter', 'interface', 'implementation',
  'architecture', 'design pattern', 'system', 'network', 'server', 'client',
  'cloud', 'deployment', 'container', 'kubernetes', 'docker', 'devops', 'ci/cd',
  'git', 'version control', 'agile', 'scrum', 'sprint', 'backlog', 'user story'
];

const ACADEMIC_KEYWORDS = [
  'research', 'study', 'paper', 'journal', 'publication', 'peer review',
  'thesis', 'dissertation', 'hypothesis', 'theory', 'experiment', 'data',
  'analysis', 'methodology', 'results', 'conclusion', 'findings', 'evidence',
  'literature review', 'citation', 'reference', 'bibliography', 'abstract',
  'introduction', 'discussion', 'limitation', 'implication', 'future research',
  'academic', 'scholar', 'professor', 'faculty', 'university', 'college',
  'department', 'discipline', 'field', 'subject', 'course', 'curriculum'
];

/**
 * Detect if query contains financial context
 * @param {string} query - Query to analyze
 * @returns {boolean} - Whether query has financial context
 */
export const isFinancialQuery = (query) => {
  if (!query) return false;
  const queryLower = query.toLowerCase();
  
  return FINANCIAL_KEYWORDS.some(keyword => 
    queryLower.includes(keyword.toLowerCase())
  );
};

/**
 * Detect if query contains business context
 * @param {string} query - Query to analyze
 * @returns {boolean} - Whether query has business context
 */
export const isBusinessQuery = (query) => {
  if (!query) return false;
  const queryLower = query.toLowerCase();
  
  return BUSINESS_KEYWORDS.some(keyword => 
    queryLower.includes(keyword.toLowerCase())
  );
};

/**
 * Detect if query contains medical context
 * @param {string} query - Query to analyze
 * @returns {boolean} - Whether query has medical context
 */
export const isMedicalQuery = (query) => {
  if (!query) return false;
  const queryLower = query.toLowerCase();
  
  return MEDICAL_KEYWORDS.some(keyword => 
    queryLower.includes(keyword.toLowerCase())
  );
};

/**
 * Detect if query contains news context
 * @param {string} query - Query to analyze
 * @returns {boolean} - Whether query has news context
 */
export const isNewsQuery = (query) => {
  if (!query) return false;
  const queryLower = query.toLowerCase();
  
  return NEWS_KEYWORDS.some(keyword => 
    queryLower.includes(keyword.toLowerCase())
  );
};

/**
 * Detect if query contains technical context
 * @param {string} query - Query to analyze
 * @returns {boolean} - Whether query has technical context
 */
export const isTechnicalQuery = (query) => {
  if (!query) return false;
  const queryLower = query.toLowerCase();
  
  return TECHNICAL_KEYWORDS.some(keyword => 
    queryLower.includes(keyword.toLowerCase())
  );
};

/**
 * Detect if query contains academic context
 * @param {string} query - Query to analyze
 * @returns {boolean} - Whether query has academic context
 */
export const isAcademicQuery = (query) => {
  if (!query) return false;
  const queryLower = query.toLowerCase();
  
  return ACADEMIC_KEYWORDS.some(keyword => 
    queryLower.includes(keyword.toLowerCase())
  );
};

/**
 * Determine the primary context of a query
 * @param {string} query - Query to analyze
 * @returns {Array<string>} - Array of detected contexts
 */
export const detectQueryContext = (query) => {
  if (!query) return ['general'];
  
  // Count matches for each context
  let matches = {
    financial: 0,
    business: 0,
    medical: 0,
    news: 0,
    technical: 0,
    academic: 0
  };
  
  const queryLower = query.toLowerCase();
  
  // Count matches for each context
  FINANCIAL_KEYWORDS.forEach(keyword => {
    if (queryLower.includes(keyword.toLowerCase())) matches.financial++;
  });
  
  BUSINESS_KEYWORDS.forEach(keyword => {
    if (queryLower.includes(keyword.toLowerCase())) matches.business++;
  });
  
  MEDICAL_KEYWORDS.forEach(keyword => {
    if (queryLower.includes(keyword.toLowerCase())) matches.medical++;
  });
  
  NEWS_KEYWORDS.forEach(keyword => {
    if (queryLower.includes(keyword.toLowerCase())) matches.news++;
  });
  
  TECHNICAL_KEYWORDS.forEach(keyword => {
    if (queryLower.includes(keyword.toLowerCase())) matches.technical++;
  });
  
  ACADEMIC_KEYWORDS.forEach(keyword => {
    if (queryLower.includes(keyword.toLowerCase())) matches.academic++;
  });
  
  // Create array of contexts with their match counts
  const contextMatches = Object.entries(matches)
    .filter(([_, count]) => count >= 1)
    .sort((a, b) => b[1] - a[1]);
  
  // If no matches, return general
  if (contextMatches.length === 0) {
    return ['general'];
  }
  
  // Return array of contexts that have at least 1 match
  return contextMatches.map(([context]) => context);
};

/**
 * Get weights based on query context
 * @param {string} query - Query to analyze
 * @returns {Object} - Weight configuration for the query context
 */
export const getContextWeights = (query) => {
  const contexts = detectQueryContext(query);
  const primaryContext = contexts[0] || 'general';
  
  // Default weights
  const defaultWeights = {
    relevance: 0.35,
    accuracy: 0.35,
    credibility: 0.30
  };
  
  // Context-specific weights
  const contextWeights = {
    financial: {
      relevance: 0.25,
      accuracy: 0.45,
      credibility: 0.30
    },
    business: {
      relevance: 0.35,
      accuracy: 0.35,
      credibility: 0.30
    },
    medical: {
      relevance: 0.25,
      accuracy: 0.40,
      credibility: 0.35
    },
    news: {
      relevance: 0.40,
      accuracy: 0.25,
      credibility: 0.35
    },
    technical: {
      relevance: 0.30,
      accuracy: 0.45,
      credibility: 0.25
    },
    academic: {
      relevance: 0.25,
      accuracy: 0.35,
      credibility: 0.40
    }
  };
  
  // Return weights for the primary context, or default weights if not found
  return contextWeights[primaryContext] || defaultWeights;
};

export default {
  isFinancialQuery,
  isBusinessQuery,
  isMedicalQuery,
  isNewsQuery,
  isTechnicalQuery,
  isAcademicQuery,
  detectQueryContext,
  getContextWeights
};
