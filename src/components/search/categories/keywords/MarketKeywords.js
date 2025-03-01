/**
 * Market-related keywords for category classification
 */

// Import base keyword utility if needed
import { KeywordBase } from './KeywordBase';

/**
 * Market keywords with weighted relevance
 */
export const MarketKeywords = {
  // High priority market terms
  highPriority: [
    'market', 'marketplace', 'industry', 'sector', 'vertical',
    'segment', 'niche', 'competition', 'competitor', 'competitive landscape',
    'market share', 'market size', 'market growth', 'market trend', 'market analysis',
    'market forecast', 'market research', 'market report', 'market study',
    'demand', 'supply', 'consumer', 'customer', 'buyer behavior'
  ],
  
  // Medium priority market terms
  mediumPriority: [
    'target market', 'market opportunity', 'market entry', 'market expansion',
    'market penetration', 'market development', 'market position', 'market dynamics',
    'market segmentation', 'market maturity', 'market saturation', 'market disruption',
    'market leader', 'market follower', 'market challenger', 'market nicher',
    'market consolidation', 'market fragmentation', 'market concentration',
    'pricing', 'price point', 'price sensitivity', 'price elasticity'
  ],
  
  // Low priority market terms
  lowPriority: [
    'market conditions', 'market forces', 'market factors', 'market environment',
    'market cycle', 'market stage', 'market phase', 'market performance',
    'market access', 'market barrier', 'market entry barrier', 'market exit barrier',
    'market intelligence', 'market insight', 'market data', 'market statistics',
    'market survey', 'market poll', 'market focus group', 'market interview',
    'demographic', 'psychographic', 'geographic', 'behavioral'
  ],
  
  /**
   * Check if text contains market-related keywords
   * @param {string} text Text to check for keywords
   * @returns {Object} Result with match info
   */
  matches: function(text) {
    if (!text || typeof text !== 'string') return { matched: false, score: 0 };
    
    const lowerText = text.toLowerCase();
    let score = 0;
    let matches = [];
    
    // Check high priority keywords (3x weight)
    this.highPriority.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 3;
        matches.push({ keyword, priority: 'high', weight: 3 });
      }
    });
    
    // Check medium priority keywords (2x weight)
    this.mediumPriority.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 2;
        matches.push({ keyword, priority: 'medium', weight: 2 });
      }
    });
    
    // Check low priority keywords (1x weight)
    this.lowPriority.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 1;
        matches.push({ keyword, priority: 'low', weight: 1 });
      }
    });
    
    return {
      matched: score > 0,
      score,
      matches,
      category: 'market'
    };
  }
};

// For backward compatibility
export default MarketKeywords;