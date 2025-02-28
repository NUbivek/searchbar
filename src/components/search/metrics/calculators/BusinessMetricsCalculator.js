/**
 * BusinessMetricsCalculator.js
 * Enhanced calculator for business-focused metrics that maintains compatibility
 * with the standard three-score format (relevance, accuracy, credibility)
 */

import { detectQueryContext } from '../utils/contextDetector';
import { BUSINESS_KEYWORDS } from '../utils/businessCalculatorData';

/**
 * Calculate business-enhanced metrics for a search result
 * Maintains the standard three-score format while incorporating business intelligence
 * 
 * @param {Object} result - The search result
 * @param {string} query - The search query
 * @param {Object} standardMetrics - Standard metrics already calculated
 * @param {Object} options - Additional options
 * @returns {Object} - Object containing enhanced standard metrics
 */
const calculateBusinessMetrics = (result, query, standardMetrics, options = {}) => {
  // If no result or no standard metrics, return unchanged metrics
  if (!result || !standardMetrics) {
    return standardMetrics || { relevance: 0, accuracy: 0, credibility: 0, overall: 0 };
  }
  
  // Extract standard metrics with fallbacks to prevent NaN
  const { 
    relevance = 0, 
    accuracy = 0, 
    credibility = 0, 
    overall = 0 
  } = standardMetrics;
  
  // Detect business context from query
  const context = detectQueryContext(query);
  const isBusinessQuery = context.includes('business') || 
                         context.includes('financial') || 
                         context.includes('market') ||
                         context.includes('economic') ||
                         context.includes('investment');
  
  // If not a business query and not forced, return standard metrics
  if (!isBusinessQuery && !options.forceBusinessMetrics) {
    return standardMetrics;
  }
  
  // Get content text for analysis
  const contentText = getContentText(result);
  
  // Calculate enhanced business metrics using the standard three-score format
  const enhancedRelevance = enhanceRelevanceWithBusiness(contentText, query, relevance);
  const enhancedAccuracy = enhanceAccuracyWithFinancial(contentText, accuracy, credibility);
  const enhancedCredibility = enhanceCredibilityWithSourceQuality(result, credibility);
  
  // Calculate enhanced overall score
  const enhancedOverall = calculateEnhancedOverall(
    enhancedRelevance, 
    enhancedAccuracy, 
    enhancedCredibility,
    context
  );
  
  // Return enhanced metrics in the standard format
  return {
    relevance: enhancedRelevance,
    accuracy: enhancedAccuracy,
    credibility: enhancedCredibility,
    overall: enhancedOverall,
    isBusinessEnhanced: true
  };
};

/**
 * Enhance relevance score with business intelligence
 * @param {string} content - Content text
 * @param {string} query - Search query
 * @param {number} baseRelevance - Base relevance score
 * @returns {number} - Enhanced relevance score
 */
const enhanceRelevanceWithBusiness = (content, query, baseRelevance) => {
  // Ensure content is a string
  const contentText = typeof content === 'string' ? content : String(content || '');
  
  // Ensure query is a string
  const queryText = typeof query === 'string' ? query : String(query || '');
  
  // Ensure baseRelevance is a number
  let score = typeof baseRelevance === 'number' ? baseRelevance : parseInt(baseRelevance) || 0;
  
  if (!contentText) return score;
  
  // Check for business-specific keywords
  const businessTerms = [
    'market', 'financial', 'revenue', 'profit', 'earnings', 'growth',
    'investment', 'stock', 'shares', 'business', 'company', 'industry',
    'sector', 'economic', 'forecast', 'trend', 'analysis', 'report',
    'quarter', 'fiscal', 'performance', 'dividend', 'valuation', 'ROI',
    'capital', 'assets', 'liabilities', 'equity', 'stakeholder', 'shareholder',
    'CEO', 'CFO', 'CTO', 'executive', 'board', 'director', 'management'
  ];
  
  // Count business terms in content
  const termCount = businessTerms.reduce((count, term) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = contentText.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  // Boost score based on business term density
  const contentLength = contentText.split(/\s+/).length;
  const termDensity = contentLength > 0 ? (termCount / contentLength) * 100 : 0;
  
  // Apply density boost (up to 15 points)
  const densityBoost = Math.min(termDensity * 3, 15);
  score += densityBoost;
  
  // Check for market analysis terms
  const marketTerms = [
    'market share', 'market growth', 'market trend', 'industry analysis',
    'competitive landscape', 'market forecast', 'market report',
    'market segment', 'market opportunity', 'market challenge',
    'SWOT analysis', 'competitive advantage', 'market positioning',
    'market entry', 'market expansion', 'market disruption'
  ];
  
  // Boost for market analysis (up to 8 points)
  let marketBoost = 0;
  marketTerms.forEach(term => {
    // Ensure content is a string before calling toLowerCase
    const contentLower = typeof contentText === 'string' ? contentText.toLowerCase() : String(contentText).toLowerCase();
    const termLower = typeof term === 'string' ? term.toLowerCase() : String(term).toLowerCase();
    
    if (contentLower.includes(termLower)) {
      marketBoost += 1.5;
    }
  });
  score += Math.min(marketBoost, 8);

  // Check for query term matches (up to 10 points)
  if (queryText) {
    // Ensure query is a string before calling toLowerCase
    const queryLower = typeof queryText === 'string' ? queryText.toLowerCase() : String(queryText).toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2);
    let queryMatchBoost = 0;
    
    queryTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      const matches = contentText.match(regex);
      if (matches && matches.length > 0) {
        queryMatchBoost += 2;
      }
    });
    
    score += Math.min(queryMatchBoost, 10);
  }
  
  // Cap at 100
  return Math.min(Math.round(score), 100);
};

/**
 * Enhance accuracy score with financial data intelligence
 * @param {string} content - Content text
 * @param {number} accuracy - Base accuracy score
 * @param {number} credibility - Base credibility score
 * @returns {number} - Enhanced accuracy score
 */
const enhanceAccuracyWithFinancial = (content, accuracy, credibility) => {
  if (!content) return accuracy || 0;
  
  // Ensure accuracy is a number
  let score = parseInt(accuracy) || 0;
  
  // Check for financial data indicators
  const hasFinancialData = /\$\d+(\.\d+)?(M|B|T|m|b|t)?|\b\d+(\.\d+)? (million|billion|trillion)\b/i.test(content);
  const hasFinancialTerms = /\b(revenue|profit|earnings|margin|dividend|cash flow|balance sheet|income statement|EBITDA|EPS|P\/E|ROI|ROE|ROA)\b/i.test(content);
  
  // Boost for financial data presence
  if (hasFinancialData) {
    score += 7;
  }
  
  if (hasFinancialTerms) {
    score += 5;
  }
  
  // Boost for data-driven insights
  if (/\b\d+(\.\d+)?%\b/.test(content)) { // Percentage figures
    score += 5;
  }
  
  // Check for date references (recency)
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  
  if (content.includes(currentYear.toString())) {
    score += 8; // Current year data is highly valuable
  } else if (content.includes(lastYear.toString())) {
    score += 5; // Last year data is somewhat valuable
  }
  
  // Check for quarterly references
  if (/\bQ[1-4]\b|\bquarter\b/i.test(content)) {
    score += 3;
  }
  
  // Cap at 100
  return Math.min(Math.round(score), 100);
};

/**
 * Enhance credibility score with source quality assessment
 * @param {Object} result - Search result
 * @param {number} credibility - Base credibility score
 * @returns {number} - Enhanced credibility score
 */
const enhanceCredibilityWithSourceQuality = (result, credibility) => {
  if (!result) return credibility || 0;
  
  // Ensure credibility is a number
  let score = typeof credibility === 'number' ? credibility : parseInt(credibility) || 0;
  
  // Ensure source is a string
  const source = typeof result.source === 'string' ? result.source.toLowerCase() : String(result.source || '').toLowerCase();
  
  // Check for high-quality business sources
  const premiumSources = [
    'bloomberg', 'wsj', 'ft.com', 'forbes', 'harvard', 'mckinsey', 
    'economist', 'morningstar', 'reuters', 'cnbc', 'barrons', 
    'businessinsider', 'marketwatch', 'fool.com', 'investopedia'
  ];
  
  // Check for financial data providers
  const dataProviders = [
    'bloomberg', 'refinitiv', 'factset', 'morningstar', 'sp global',
    'moodys', 'fitch', 'ihs markit', 'capital iq', 'yahoo finance'
  ];
  
  // Check for consulting/research firms
  const consultingFirms = [
    'mckinsey', 'bcg', 'bain', 'deloitte', 'pwc', 'kpmg', 'ey', 
    'accenture', 'gartner', 'forrester', 'idc', 'frost & sullivan'
  ];
  
  // Apply source quality boosts
  if (premiumSources.some(s => source.includes(s))) {
    score += 10;
  }
  
  if (dataProviders.some(s => source.includes(s))) {
    score += 15;
  }
  
  if (consultingFirms.some(s => source.includes(s))) {
    score += 12;
  }
  
  // Cap at 100
  return Math.min(Math.round(score), 100);
};

/**
 * Calculate enhanced overall score
 * @param {number} relevance - Enhanced relevance score
 * @param {number} accuracy - Enhanced accuracy score
 * @param {number} credibility - Enhanced credibility score
 * @param {string} context - Query context
 * @returns {number} - Enhanced overall score
 */
const calculateEnhancedOverall = (relevance, accuracy, credibility, context) => {
  // Ensure all inputs are numbers
  const safeRelevance = parseInt(relevance) || 0;
  const safeAccuracy = parseInt(accuracy) || 0;
  const safeCredibility = parseInt(credibility) || 0;
  
  // Default weights
  let weights = {
    relevance: 0.35,
    accuracy: 0.35,
    credibility: 0.30
  };
  
  // Adjust weights based on business context
  if (context.includes('financial')) {
    weights = {
      relevance: 0.25,
      accuracy: 0.45,
      credibility: 0.30
    };
  } else if (context.includes('market')) {
    weights = {
      relevance: 0.40,
      accuracy: 0.30,
      credibility: 0.30
    };
  } else if (context.includes('investment')) {
    weights = {
      relevance: 0.30,
      accuracy: 0.30,
      credibility: 0.40
    };
  } else if (context.includes('business')) {
    weights = {
      relevance: 0.35,
      accuracy: 0.35,
      credibility: 0.30
    };
  }
  
  // Calculate weighted score
  const weightedScore = 
    (safeRelevance * weights.relevance) +
    (safeAccuracy * weights.accuracy) +
    (safeCredibility * weights.credibility);
  
  return Math.round(weightedScore);
};

/**
 * Get content text from result for analysis
 * @param {Object} result - Search result
 * @returns {string} - Content text
 */
const getContentText = (result) => {
  if (!result) return '';
  
  if (typeof result === 'string') {
    return result;
  }
  
  // Try to extract content from various possible structures
  if (result.content) {
    return typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
  }
  
  if (result.text) {
    return typeof result.text === 'string' ? result.text : JSON.stringify(result.text);
  }
  
  if (result.snippet) {
    return typeof result.snippet === 'string' ? result.snippet : JSON.stringify(result.snippet);
  }
  
  if (result.summary) {
    return typeof result.summary === 'string' ? result.summary : JSON.stringify(result.summary);
  }
  
  if (result.description) {
    return typeof result.description === 'string' ? result.description : JSON.stringify(result.description);
  }
  
  // If we have an array of items, try to extract text from each
  if (Array.isArray(result.items)) {
    return result.items.map(item => getContentText(item)).join(' ');
  }
  
  return JSON.stringify(result);
};

export default calculateBusinessMetrics;
