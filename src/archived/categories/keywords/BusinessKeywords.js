/**
 * Business-related keywords for category classification
 */

// Import base keyword utility if needed
import { KeywordBase } from './KeywordBase';

/**
 * Business keywords with weighted relevance
 */
export const BusinessKeywords = {
  // High priority business terms
  highPriority: [
    'company', 'business', 'enterprise', 'corporation', 'organization',
    'firm', 'startup', 'venture', 'industry', 'corporate',
    'management', 'executive', 'leadership', 'CEO', 'chief',
    'strategy', 'strategic', 'operation', 'operational', 'business model',
    'competitive', 'competitiveness', 'advantage', 'differentiation'
  ],
  
  // Medium priority business terms
  mediumPriority: [
    'market', 'customer', 'client', 'consumer', 'supplier',
    'vendor', 'partner', 'stakeholder', 'shareholder', 'investor',
    'product', 'service', 'solution', 'offering', 'value proposition',
    'sales', 'revenue', 'profit', 'growth', 'expansion',
    'acquisition', 'merger', 'partnership', 'alliance', 'collaboration',
    'industry', 'sector', 'vertical', 'segment', 'niche'
  ],
  
  // Low priority business terms
  lowPriority: [
    'employee', 'workforce', 'talent', 'team', 'staff',
    'department', 'division', 'unit', 'function', 'role',
    'process', 'procedure', 'policy', 'standard', 'guideline',
    'performance', 'efficiency', 'effectiveness', 'productivity', 'output',
    'resource', 'asset', 'capability', 'competency', 'skill'
  ],
  
  /**
   * Check if text contains business-related keywords
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
      category: 'business'
    };
  }
};

// For backward compatibility
export default BusinessKeywords;