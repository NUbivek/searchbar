/**
 * Broad category definitions for search results
 * These are high-priority fallback categories used when specific categories don't meet thresholds
 */

import { CategoryBase } from './CategoryBase';

/**
 * Market Overview category
 */
export const MarketOverviewCategory = {
  id: 'market-overview',
  name: 'Market Overview',
  description: 'Overview of market trends, industry landscape, and sector analysis',
  color: '#4285F4', // Blue
  priority: 1, // High priority
  icon: 'chart-line',
  keywords: [
    'market', 'industry', 'sector', 'landscape', 'overview', 'trends',
    'market size', 'growth rate', 'market forecast', 'market share',
    'competitive landscape', 'market dynamics', 'market structure',
    'market segments', 'market analysis', 'industry analysis'
  ],
  
  /**
   * Format Market Overview content
   * @param {Object} content The content to format
   * @returns {string} Formatted content
   */
  formatContent: (content) => {
    if (!content || typeof content !== 'string') return '';
    return content;
  },
  
  /**
   * Get score for Market Overview category based on content relevance
   * @param {string} content The content to score
   * @param {string} query Search query
   * @returns {number} Relevance score (0-100)
   */
  getScore: (content, query = '') => {
    if (!content || typeof content !== 'string') return 0;
    
    // Check for keyword matches
    const keywordMatches = MarketOverviewCategory.keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Calculate score based on keyword matches
    let score = Math.min(70 + (keywordMatches.length * 5), 100);
    
    // Boost score if query contains market-related terms
    if (query) {
      const queryLower = query.toLowerCase();
      const marketTerms = ['market', 'industry', 'sector', 'trend'];
      
      if (marketTerms.some(term => queryLower.includes(term))) {
        score += 10;
      }
    }
    
    return Math.min(score, 100);
  }
};

/**
 * Financial Overview category
 */
export const FinancialOverviewCategory = {
  id: 'financial-overview',
  name: 'Financial Overview',
  description: 'Financial analysis, metrics, funding, and investment information',
  color: '#F4B400', // Yellow
  priority: 1, // High priority
  icon: 'chart-pie',
  keywords: [
    'financial', 'finance', 'money', 'capital', 'funding', 'investment',
    'revenue', 'profit', 'earnings', 'margins', 'cash flow', 'balance sheet',
    'income statement', 'financial performance', 'financial metrics',
    'financial ratios', 'financial health', 'financial analysis'
  ],
  
  /**
   * Format Financial Overview content
   * @param {Object} content The content to format
   * @returns {string} Formatted content
   */
  formatContent: (content) => {
    if (!content || typeof content !== 'string') return '';
    
    // Emphasize financial figures
    return content.replace(/(\$\d+(\.\d+)?(M|B|K)?|\d+(\.\d+)?%)/g, '<strong>$1</strong>');
  },
  
  /**
   * Get score for Financial Overview category based on content relevance
   * @param {string} content The content to score
   * @param {string} query Search query
   * @returns {number} Relevance score (0-100)
   */
  getScore: (content, query = '') => {
    if (!content || typeof content !== 'string') return 0;
    
    // Check for keyword matches
    const keywordMatches = FinancialOverviewCategory.keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check for financial figures
    const hasFinancialFigures = /\$\d+(\.\d+)?(M|B|K)?|\d+(\.\d+)?%/.test(content);
    
    // Calculate score based on keyword matches and financial figures
    let score = Math.min(70 + (keywordMatches.length * 5), 100);
    if (hasFinancialFigures) score += 10;
    
    // Boost score if query contains financial terms
    if (query) {
      const queryLower = query.toLowerCase();
      const financialTerms = ['financial', 'finance', 'money', 'revenue', 'profit', 'investment'];
      
      if (financialTerms.some(term => queryLower.includes(term))) {
        score += 10;
      }
    }
    
    return Math.min(score, 100);
  }
};

/**
 * Business Strategy category
 */
export const BusinessStrategyCategory = {
  id: 'business-strategy',
  name: 'Business Strategy',
  description: 'Strategic approaches, business models, and operational plans',
  color: '#0F9D58', // Green
  priority: 1, // High priority
  icon: 'chess',
  keywords: [
    'strategy', 'business model', 'approach', 'plan', 'roadmap',
    'strategic initiative', 'strategic direction', 'strategic planning',
    'vision', 'mission', 'goals', 'objectives', 'execution',
    'competitive strategy', 'growth strategy', 'market entry'
  ],
  
  /**
   * Format Business Strategy content
   * @param {Object} content The content to format
   * @returns {string} Formatted content
   */
  formatContent: (content) => {
    if (!content || typeof content !== 'string') return '';
    return content;
  },
  
  /**
   * Get score for Business Strategy category based on content relevance
   * @param {string} content The content to score
   * @param {string} query Search query
   * @returns {number} Relevance score (0-100)
   */
  getScore: (content, query = '') => {
    if (!content || typeof content !== 'string') return 0;
    
    // Check for keyword matches
    const keywordMatches = BusinessStrategyCategory.keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Calculate score based on keyword matches
    let score = Math.min(70 + (keywordMatches.length * 5), 100);
    
    // Boost score if query contains strategy-related terms
    if (query) {
      const queryLower = query.toLowerCase();
      const strategyTerms = ['strategy', 'plan', 'approach', 'model', 'roadmap'];
      
      if (strategyTerms.some(term => queryLower.includes(term))) {
        score += 10;
      }
    }
    
    return Math.min(score, 100);
  }
};

/**
 * Industry Insights category
 */
export const IndustryInsightsCategory = {
  id: 'industry-insights',
  name: 'Industry Insights',
  description: 'Deep insights into specific industries, sectors, and verticals',
  color: '#DB4437', // Red
  priority: 1, // High priority
  icon: 'industry',
  keywords: [
    'industry', 'sector', 'vertical', 'market segment',
    'industry trends', 'industry analysis', 'industry outlook',
    'industry forecast', 'industry dynamics', 'industry structure',
    'industry participants', 'industry challenges', 'industry opportunities'
  ],
  
  /**
   * Format Industry Insights content
   * @param {Object} content The content to format
   * @returns {string} Formatted content
   */
  formatContent: (content) => {
    if (!content || typeof content !== 'string') return '';
    return content;
  },
  
  /**
   * Get score for Industry Insights category based on content relevance
   * @param {string} content The content to score
   * @param {string} query Search query
   * @returns {number} Relevance score (0-100)
   */
  getScore: (content, query = '') => {
    if (!content || typeof content !== 'string') return 0;
    
    // Check for keyword matches
    const keywordMatches = IndustryInsightsCategory.keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Calculate score based on keyword matches
    let score = Math.min(70 + (keywordMatches.length * 5), 100);
    
    // Boost score if query contains industry-related terms
    if (query) {
      const queryLower = query.toLowerCase();
      const industryTerms = ['industry', 'sector', 'vertical', 'segment'];
      
      if (industryTerms.some(term => queryLower.includes(term))) {
        score += 10;
      }
    }
    
    return Math.min(score, 100);
  }
};

/**
 * Get all broad categories
 * @returns {Array} Array of broad category definitions
 */
export const getBroadCategories = () => {
  return [
    MarketOverviewCategory,
    FinancialOverviewCategory,
    BusinessStrategyCategory,
    IndustryInsightsCategory
  ];
};

// Export for convenience
export default {
  MarketOverviewCategory,
  FinancialOverviewCategory,
  BusinessStrategyCategory,
  IndustryInsightsCategory,
  getBroadCategories
};
