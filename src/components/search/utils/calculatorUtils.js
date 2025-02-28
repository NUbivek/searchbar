/**
 * calculatorUtils.js
 * Utility functions for metric calculators
 */

/**
 * Normalize a score to ensure it's within 0-1 range
 * @param {number} score - Score to normalize
 * @returns {number} - Normalized score between 0-1
 */
export const normalizeScore = (score) => {
  return Math.min(Math.max(score, 0), 1);
};

/**
 * Check if a URL or text matches a specific domain
 * @param {string} text - URL or text to check
 * @param {string|Array} domain - Domain(s) to match against
 * @returns {boolean} - Whether the text matches the domain
 */
export const matchesDomain = (text, domain) => {
  if (!text) return false;
  
  const domains = Array.isArray(domain) ? domain : [domain];
  return domains.some(d => text.toLowerCase().includes(d.toLowerCase()));
};

/**
 * Check if text contains specific details
 * @param {string} text - Text to analyze
 * @returns {boolean} - Whether text contains specific details
 */
export const containsSpecificDetails = (text) => {
  if (!text) return false;
  
  // Look for specific details like names, locations, exact measurements
  const specificDetailPatterns = [
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Names (simple pattern)
    /\$\d+([.,]\d+)?( million| billion)?/, // Dollar amounts
    /\d+([.,]\d+)? (percent|%)/, // Percentages
    /\d+([.,]\d+)? (kg|mg|g|lb|oz|km|mi|m|ft|in)/, // Measurements
    /\b[A-Z][a-z]+(, [A-Z][a-z]+)?\b/ // Proper nouns
  ];
  
  return specificDetailPatterns.some(pattern => pattern.test(text));
};

/**
 * Check if text contains precise data points
 * @param {string} text - Text to analyze
 * @returns {boolean} - Whether text contains precise data
 */
export const containsPreciseData = (text) => {
  if (!text) return false;
  
  // Look for precise data like exact numbers, percentages, statistics
  const preciseDataPatterns = [
    /\d+\.\d{2,}%/, // Percentage with 2+ decimal places
    /\$\d+\.\d{2,}/, // Dollar amount with 2+ decimal places
    /\d+\.\d{3,}/, // Number with 3+ decimal places
    /p\s*<\s*0\.0\d+/, // p-value notation
    /confidence interval/i, // Statistical terms
    /margin of error/i,
    /standard deviation/i,
    /standard error/i
  ];
  
  return preciseDataPatterns.some(pattern => pattern.test(text));
};

/**
 * Calculate the quality score for a source
 * @param {string} source - Source URL or name
 * @returns {number} - Quality score between 0-100
 */
export const calculateSourceQuality = (source) => {
  if (!source) return 50; // Default neutral score
  
  let score = 50;
  
  // High quality sources
  const highQualitySources = [
    '.gov', '.edu', 'reuters.com', 'bloomberg.com', 'ft.com',
    'wsj.com', 'economist.com', 'hbr.org', 'mckinsey.com',
    'nature.com', 'science.org', 'nejm.org', 'ieee.org'
  ];
  
  // Medium quality sources
  const mediumQualitySources = [
    'news.', 'nytimes.com', 'washingtonpost.com', 'bbc.', 
    'cnn.com', 'forbes.com', 'research.', 'data.',
    'statistics.', 'report.', 'analysis.'
  ];
  
  // Lower quality sources
  const lowerQualitySources = [
    'blog.', 'forum.', 'community.', 'answers.',
    'opinion.', 'personal.', 'user.', 'comment.'
  ];
  
  // Apply scoring based on source quality
  if (highQualitySources.some(s => source.toLowerCase().includes(s.toLowerCase()))) {
    score += 30;
  } else if (mediumQualitySources.some(s => source.toLowerCase().includes(s.toLowerCase()))) {
    score += 15;
  } else if (lowerQualitySources.some(s => source.toLowerCase().includes(s.toLowerCase()))) {
    score -= 20;
  }
  
  // Ensure score is within 0-100 range
  return Math.min(Math.max(score, 0), 100);
};

/**
 * Check if content contains business-related terms
 * @param {string} content - Content to analyze
 * @returns {boolean} - Whether content contains business terms
 */
export const containsBusinessTerms = (content) => {
  if (!content) return false;
  
  const businessTerms = [
    'revenue', 'profit', 'earnings', 'market share', 'stock price',
    'investment', 'investor', 'shareholder', 'dividend', 'acquisition',
    'merger', 'CEO', 'CFO', 'CTO', 'executive', 'board', 'director',
    'quarterly', 'fiscal', 'financial', 'growth', 'decline', 'market',
    'industry', 'sector', 'company', 'corporation', 'business', 'startup',
    'venture capital', 'IPO', 'public offering', 'private equity'
  ];
  
  return businessTerms.some(term => 
    content.toLowerCase().includes(term.toLowerCase())
  );
};

/**
 * Extract business metrics from content
 * @param {string} content - Content to analyze
 * @returns {Object} - Extracted business metrics
 */
export const extractBusinessMetrics = (content) => {
  if (!content) return {};
  
  const metrics = {
    percentages: [],
    dollarAmounts: [],
    growthIndicators: [],
    timeReferences: []
  };
  
  // Extract percentages
  const percentageMatches = content.match(/\d+([.,]\d+)?%/g);
  if (percentageMatches) {
    metrics.percentages = percentageMatches;
  }
  
  // Extract dollar amounts
  const dollarMatches = content.match(/\$\d+([.,]\d+)?( million| billion)?/g);
  if (dollarMatches) {
    metrics.dollarAmounts = dollarMatches;
  }
  
  // Extract growth indicators
  const growthTerms = ['increase', 'growth', 'grew', 'rise', 'rising', 'up'];
  const declineTerms = ['decrease', 'decline', 'fell', 'drop', 'dropping', 'down'];
  
  growthTerms.forEach(term => {
    if (content.toLowerCase().includes(term)) {
      metrics.growthIndicators.push(term);
    }
  });
  
  declineTerms.forEach(term => {
    if (content.toLowerCase().includes(term)) {
      metrics.growthIndicators.push(term);
    }
  });
  
  // Extract time references
  const timeMatches = content.match(/\b(Q[1-4]|quarter|year|annual|monthly|weekly)\b/gi);
  if (timeMatches) {
    metrics.timeReferences = timeMatches;
  }
  
  return metrics;
};

/**
 * Calculate business relevance score
 * @param {string} content - Content to analyze
 * @returns {number} - Business relevance score (0-100)
 */
export const calculateBusinessRelevance = (content) => {
  if (!content) return 0;
  
  let score = 0;
  
  // Check for business terms
  if (containsBusinessTerms(content)) {
    score += 50; // Base score for containing business terms
    
    // Extract metrics to evaluate further
    const metrics = extractBusinessMetrics(content);
    
    // Add points for percentages (financial data)
    if (metrics.percentages.length > 0) {
      score += Math.min(metrics.percentages.length * 5, 15);
    }
    
    // Add points for dollar amounts (financial data)
    if (metrics.dollarAmounts.length > 0) {
      score += Math.min(metrics.dollarAmounts.length * 5, 10);
    }
    
    // Add points for growth/decline indicators
    if (metrics.growthIndicators.length > 0) {
      score += Math.min(metrics.growthIndicators.length * 2, 10);
    }
    
    // Add points for time references (quarterly, annual, etc.)
    if (metrics.timeReferences.length > 0) {
      score += Math.min(metrics.timeReferences.length * 2, 5);
    }
    
    // Check for company names (simple check)
    if (/\b[A-Z][a-z]+ (Inc\.|Corp\.|LLC|Ltd\.|Limited|Company)\b/.test(content)) {
      score += 10;
    }
  }
  
  // Ensure score is within 0-100 range
  return Math.min(Math.max(score, 0), 100);
};
