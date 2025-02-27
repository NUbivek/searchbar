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
  'cash flow', 'valuation', 'p/e ratio', 'market cap', 'ipo', 'merger', 'acquisition'
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
  return FINANCIAL_KEYWORDS.some(keyword => queryLower.includes(keyword.toLowerCase()));
};

/**
 * Detect if query contains medical context
 * @param {string} query - Query to analyze
 * @returns {boolean} - Whether query has medical context
 */
export const isMedicalQuery = (query) => {
  if (!query) return false;
  const queryLower = query.toLowerCase();
  return MEDICAL_KEYWORDS.some(keyword => queryLower.includes(keyword.toLowerCase()));
};

/**
 * Detect if query contains news context
 * @param {string} query - Query to analyze
 * @returns {boolean} - Whether query has news context
 */
export const isNewsQuery = (query) => {
  if (!query) return false;
  const queryLower = query.toLowerCase();
  return NEWS_KEYWORDS.some(keyword => queryLower.includes(keyword.toLowerCase()));
};

/**
 * Detect if query contains technical context
 * @param {string} query - Query to analyze
 * @returns {boolean} - Whether query has technical context
 */
export const isTechnicalQuery = (query) => {
  if (!query) return false;
  const queryLower = query.toLowerCase();
  return TECHNICAL_KEYWORDS.some(keyword => queryLower.includes(keyword.toLowerCase()));
};

/**
 * Detect if query contains academic context
 * @param {string} query - Query to analyze
 * @returns {boolean} - Whether query has academic context
 */
export const isAcademicQuery = (query) => {
  if (!query) return false;
  const queryLower = query.toLowerCase();
  return ACADEMIC_KEYWORDS.some(keyword => queryLower.includes(keyword.toLowerCase()));
};

/**
 * Determine the primary context of a query
 * @param {string} query - Query to analyze
 * @returns {string} - Primary context (FINANCIAL, MEDICAL, NEWS, TECHNICAL, ACADEMIC, or GENERAL)
 */
export const detectQueryContext = (query) => {
  if (!query) return 'GENERAL';
  
  // Count matches for each context
  let matches = {
    FINANCIAL: 0,
    MEDICAL: 0,
    NEWS: 0,
    TECHNICAL: 0,
    ACADEMIC: 0
  };
  
  const queryLower = query.toLowerCase();
  
  // Count matches for each context
  FINANCIAL_KEYWORDS.forEach(keyword => {
    if (queryLower.includes(keyword.toLowerCase())) matches.FINANCIAL++;
  });
  
  MEDICAL_KEYWORDS.forEach(keyword => {
    if (queryLower.includes(keyword.toLowerCase())) matches.MEDICAL++;
  });
  
  NEWS_KEYWORDS.forEach(keyword => {
    if (queryLower.includes(keyword.toLowerCase())) matches.NEWS++;
  });
  
  TECHNICAL_KEYWORDS.forEach(keyword => {
    if (queryLower.includes(keyword.toLowerCase())) matches.TECHNICAL++;
  });
  
  ACADEMIC_KEYWORDS.forEach(keyword => {
    if (queryLower.includes(keyword.toLowerCase())) matches.ACADEMIC++;
  });
  
  // Find context with most matches
  let maxMatches = 0;
  let primaryContext = 'GENERAL';
  
  for (const [context, count] of Object.entries(matches)) {
    if (count > maxMatches) {
      maxMatches = count;
      primaryContext = context;
    }
  }
  
  // Return GENERAL if not enough matches
  return maxMatches >= 2 ? primaryContext : 'GENERAL';
};

/**
 * Get weights based on query context
 * @param {string} query - Query to analyze
 * @returns {Object} - Weight configuration for the query context
 */
export const getContextWeights = (query) => {
  const context = detectQueryContext(query);
  
  const weights = {
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
    },
    GENERAL: {
      RELEVANCE: 0.33,
      ACCURACY: 0.33,
      CREDIBILITY: 0.34
    }
  };
  
  return weights[context] || weights.GENERAL;
};

export default {
  isFinancialQuery,
  isMedicalQuery,
  isNewsQuery,
  isTechnicalQuery,
  isAcademicQuery,
  detectQueryContext,
  getContextWeights
};
