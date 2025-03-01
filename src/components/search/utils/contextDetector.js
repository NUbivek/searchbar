/**
 * Utility for detecting the context of a search query
 */

// Business context keywords
const BUSINESS_KEYWORDS = [
  'market', 'business', 'company', 'industry', 'revenue', 'profit', 'financial', 'earnings',
  'stock', 'investment', 'investor', 'strategy', 'growth', 'sales', 'forecast', 'trend', 'trends',
  'competitor', 'acquisition', 'merger', 'startup', 'venture', 'capital', 'funding', 'valuation',
  'market share', 'quarterly', 'annual report', 'fiscal', 'CEO', 'executive', 'board',
  'shareholder', 'stakeholder', 'portfolio', 'asset', 'liability', 'balance sheet', 'income statement',
  'cash flow', 'dividend', 'equity', 'debt', 'financing', 'IPO', 'public offering', 'private equity',
  'venture capital', 'ROI', 'return on investment', 'margin', 'profitability', 'cost reduction',
  'efficiency', 'productivity', 'supply chain', 'distribution', 'logistics', 'procurement',
  'B2B', 'B2C', 'SaaS', 'enterprise', 'corporate', 'commercial', 'retail', 'wholesale',
  'invest', 'investing', 'investments', 'investor', 'ai investment', 'tech investment', 'technology investment',
  '2025', 'future', 'forecast', 'projection', 'outlook', 'prediction', 'analysis'
];

// Financial context keywords
const FINANCIAL_KEYWORDS = [
  'finance', 'financial', 'investment', 'investor', 'stock', 'bond', 'equity', 'asset',
  'portfolio', 'fund', 'hedge fund', 'mutual fund', 'ETF', 'index fund', 'retirement',
  'IRA', '401k', 'pension', 'annuity', 'dividend', 'yield', 'interest rate', 'APR',
  'mortgage', 'loan', 'credit', 'debt', 'liability', 'balance sheet', 'income statement',
  'cash flow', 'revenue', 'profit', 'earnings', 'EBITDA', 'P/E ratio', 'market cap',
  'valuation', 'ROI', 'return', 'capital gain', 'tax', 'inflation', 'deflation', 'recession',
  'depression', 'bull market', 'bear market', 'volatility', 'risk', 'diversification',
  'allocation', 'liquidity', 'solvency', 'bankruptcy', 'default', 'credit rating',
  'banking', 'fintech', 'cryptocurrency', 'blockchain', 'bitcoin', 'ethereum', 'forex'
];

// Technical context keywords
const TECHNICAL_KEYWORDS = [
  'technology', 'technical', 'software', 'hardware', 'code', 'programming', 'developer',
  'development', 'engineering', 'algorithm', 'data structure', 'API', 'interface', 'framework',
  'library', 'module', 'component', 'architecture', 'system', 'platform', 'infrastructure',
  'cloud', 'server', 'client', 'database', 'SQL', 'NoSQL', 'frontend', 'backend', 'fullstack',
  'web', 'mobile', 'app', 'application', 'device', 'IoT', 'AI', 'ML', 'machine learning',
  'deep learning', 'neural network', 'NLP', 'computer vision', 'robotics', 'automation',
  'DevOps', 'CI/CD', 'testing', 'QA', 'security', 'encryption', 'authentication', 'authorization',
  'protocol', 'network', 'bandwidth', 'latency', 'throughput', 'scalability', 'performance',
  'optimization', 'debugging', 'deployment', 'monitoring', 'logging', 'analytics'
];

// Medical context keywords
const MEDICAL_KEYWORDS = [
  'medical', 'health', 'healthcare', 'clinical', 'hospital', 'doctor', 'physician', 'nurse',
  'patient', 'treatment', 'therapy', 'medication', 'drug', 'pharmaceutical', 'diagnosis',
  'symptom', 'disease', 'condition', 'disorder', 'syndrome', 'pathology', 'etiology',
  'prognosis', 'recovery', 'rehabilitation', 'surgery', 'procedure', 'operation', 'screening',
  'prevention', 'vaccine', 'immunization', 'antibiotic', 'antiviral', 'oncology', 'cancer',
  'cardiology', 'heart', 'neurology', 'brain', 'orthopedic', 'bone', 'pediatric', 'geriatric',
  'emergency', 'intensive care', 'ICU', 'outpatient', 'inpatient', 'ambulatory', 'primary care',
  'specialist', 'referral', 'prescription', 'dosage', 'side effect', 'contraindication',
  'biomedical', 'clinical trial', 'FDA', 'approval', 'regulatory', 'insurance', 'Medicare', 'Medicaid'
];

/**
 * Detect the context of a search query
 * @param {string} query The search query
 * @returns {Object} Object with context types and confidence scores
 */
export const detectQueryContext = (query) => {
  if (!query || typeof query !== 'string') {
    return {
      business: 0,
      financial: 0,
      technical: 0,
      medical: 0,
      general: 1 // Default to general
    };
  }
  
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/);
  
  // Calculate matches for each context
  const businessMatches = countKeywordMatches(lowerQuery, words, BUSINESS_KEYWORDS);
  const financialMatches = countKeywordMatches(lowerQuery, words, FINANCIAL_KEYWORDS);
  const technicalMatches = countKeywordMatches(lowerQuery, words, TECHNICAL_KEYWORDS);
  const medicalMatches = countKeywordMatches(lowerQuery, words, MEDICAL_KEYWORDS);
  
  // Calculate total matches
  const totalMatches = businessMatches + financialMatches + technicalMatches + medicalMatches;
  
  // If no matches, return general context
  if (totalMatches === 0) {
    return {
      business: 0,
      financial: 0,
      technical: 0,
      medical: 0,
      general: 1,
      isBusinessQuery: false,
      isFinancialQuery: false,
      isTechnicalQuery: false,
      isMedicalQuery: false,
      isGeneralQuery: true,
      primaryContext: 'general'
    };
  }
  
  // Calculate confidence scores
  const businessConfidence = businessMatches / totalMatches;
  const financialConfidence = financialMatches / totalMatches;
  const technicalConfidence = technicalMatches / totalMatches;
  const medicalConfidence = medicalMatches / totalMatches;
  
  // Calculate general confidence (inverse of the max confidence)
  const maxConfidence = Math.max(businessConfidence, financialConfidence, technicalConfidence, medicalConfidence);
  const generalConfidence = maxConfidence < 0.3 ? 1 - maxConfidence : 0;
  
  // Create contextScores object
  const contextScores = {
    business: businessConfidence,
    financial: financialConfidence,
    technical: technicalConfidence,
    medical: medicalConfidence,
    general: generalConfidence
  };
  
  // Get the primary context type
  const primaryContext = getPrimaryContextType(contextScores);
  
  // Boolean flags for each context type - using threshold of 0.3 to determine if it's primarily that type
  const isBusinessQuery = businessConfidence >= 0.3;
  const isFinancialQuery = financialConfidence >= 0.3;
  const isTechnicalQuery = technicalConfidence >= 0.3;
  const isMedicalQuery = medicalConfidence >= 0.3;
  const isGeneralQuery = generalConfidence >= 0.5 || (!isBusinessQuery && !isFinancialQuery && !isTechnicalQuery && !isMedicalQuery);
  
  return {
    // Original confidence scores
    business: businessConfidence,
    financial: financialConfidence,
    technical: technicalConfidence,
    medical: medicalConfidence,
    general: generalConfidence,
    
    // Boolean flags for easy checking
    isBusinessQuery,
    isFinancialQuery,
    isTechnicalQuery,
    isMedicalQuery,
    isGeneralQuery,
    
    // Primary context for single type identification
    primaryContext
  };
};

/**
 * Count the number of keyword matches in a query
 * @param {string} fullQuery The full query string
 * @param {Array<string>} queryWords The query words
 * @param {Array<string>} keywords The keywords to match
 * @returns {number} Number of matches
 */
const countKeywordMatches = (fullQuery, queryWords, keywords) => {
  let matches = 0;
  
  // Check for exact phrase matches first (higher weight)
  keywords.forEach(keyword => {
    if (keyword.includes(' ')) {
      if (fullQuery.includes(keyword.toLowerCase())) {
        matches += 2; // Higher weight for phrase matches
      }
    }
  });
  
  // Check for individual word matches
  queryWords.forEach(word => {
    if (word.length < 3) return; // Skip very short words
    
    keywords.forEach(keyword => {
      if (!keyword.includes(' ')) { // Only check single-word keywords
        if (keyword.toLowerCase() === word) {
          matches += 1;
        }
      }
    });
  });
  
  return matches;
};

/**
 * Get the primary context type from context scores
 * @param {Object} contextScores Object with context scores
 * @returns {string} Primary context type
 */
export const getPrimaryContextType = (contextScores) => {
  if (!contextScores) return 'general';
  
  const entries = Object.entries(contextScores);
  if (entries.length === 0) return 'general';
  
  // Sort by confidence score (descending)
  entries.sort((a, b) => b[1] - a[1]);
  
  // Return the context type with highest score
  return entries[0][0];
};

/**
 * Check if a query is primarily business-focused
 * @param {string} query The search query
 * @returns {boolean} Whether the query is business-focused
 */
export const isBusinessQuery = (query) => {
  if (!query || typeof query !== 'string') {
    console.log('Invalid query for business detection:', query);
    return false;
  }
  
  // Normalize the query
  const normalizedQuery = query.toLowerCase().trim();
  
  // Check if query is empty after normalization
  if (!normalizedQuery) {
    console.log('Empty normalized query for business detection');
    return false;
  }
  
  // Business-related query keywords (expanded list)
  const businessKeywords = [
    'business', 'company', 'startup', 'corporation', 'enterprise', 'industry',
    'market', 'economy', 'finance', 'investment', 'stock', 'shares', 'investor',
    'revenue', 'profit', 'sales', 'growth', 'strategy', 'management', 'ceo',
    'executive', 'board', 'shareholder', 'stakeholder', 'valuation', 'funding',
    'venture capital', 'vc', 'private equity', 'pe', 'ipo', 'acquisition',
    'merger', 'dividend', 'earnings', 'quarterly', 'annual report', 'sec filing',
    'balance sheet', 'income statement', 'cash flow', 'forecast', 'projection',
    'trend', 'analysis', 'report', 'research', 'sector', 'competition', 'competitive',
    'supply chain', 'logistics', 'distribution', 'wholesale', 'retail', 'b2b',
    'business to business', 'b2c', 'commercial', 'trade', 'export', 'import'
  ];

  // Direct pattern matching for common business query patterns
  const businessPatterns = [
    /investment\s+trends/i,
    /market\s+trends/i,
    /business\s+forecast/i,
    /financial\s+outlook/i,
    /industry\s+analysis/i,
    /ai\s+investment/i,
    /tech\s+investment/i,
    /investment\s+in\s+\w+/i,
    /future\s+of\s+\w+/i,
    /\w+\s+market\s+\d{4}/i,
    /\w+\s+industry\s+\d{4}/i,
    /\d{4}\s+\w+\s+forecast/i,
    /\d{4}\s+\w+\s+trends/i,
    /supply\s+chain/i,
    /business\s+intelligence/i,
    /market\s+analysis/i,
    /business\s+strategy/i,
    /corporate\s+governance/i,
    /business\s+development/i,
    /ai\s+(for|in)\s+business/i,
    /tech\s+(for|in)\s+business/i
  ];
  
  // Check if any business keyword is in the query
  for (const keyword of businessKeywords) {
    if (normalizedQuery.includes(keyword)) {
      console.log(`Identified business query "${query}" (matched keyword: ${keyword})`);
      return true;
    }
  }

  // Check if query matches any of the business patterns
  for (const pattern of businessPatterns) {
    if (pattern.test(normalizedQuery)) {
      console.log(`Identified business query "${query}" (matched pattern)`);
      return true;
    }
  }
  
  // Check for specific contexts that might indicate business context
  const businessContexts = [
    // Financial patterns: numbers with currency symbols or percentage
    /(\$|€|£|¥)\s*\d+(\.\d+)?(k|m|b|t)?/i,
    /\d+(\.\d+)?\s*(%|percent|percentage)/i,
    
    // Company identifiers
    /\b(inc|llc|ltd|corp|corporation|co|company)\b/i,
    
    // Business metrics
    /\b(roi|roa|roe|ebitda|cagr|yoy|qoq|eps|p\/e|revenue|profit margin)\b/i,
    
    // Common business acronyms
    /\b(ceo|cfo|cto|coo|cmo|chro|ciso|cbo|cbd)\b/i,
    
    // Market terms
    /\b(market share|market cap|market value|market growth)\b/i
  ];

  for (const pattern of businessContexts) {
    if (pattern.test(normalizedQuery)) {
      console.log(`Identified business query "${query}" via context pattern`);
      return true;
    }
  }
  
  // Fall back to context detection if no direct pattern match
  const contextScores = detectQueryContext(query);
  const primaryContext = getPrimaryContextType(contextScores);
  
  const isBusinessContext = primaryContext === 'business' || primaryContext === 'financial';
  if (isBusinessContext) {
    console.log(`Identified business query "${query}" via context detection`);
  } else {
    console.log(`Not a business query: "${query}"`);
  }
  
  return isBusinessContext;
};
