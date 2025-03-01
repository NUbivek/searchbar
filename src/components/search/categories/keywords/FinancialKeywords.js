/**
 * Financial-related keywords for category classification
 */

// Import base keyword utility if needed
import { KeywordBase } from './KeywordBase';

/**
 * Financial keywords with weighted relevance
 */
export const FinancialKeywords = {
  // High priority financial terms
  highPriority: [
    'financial', 'finance', 'revenue', 'profit', 'earnings',
    'income', 'loss', 'balance sheet', 'cash flow', 'statement',
    'quarterly', 'annual', 'fiscal', 'report', 'EPS', 
    'P/E', 'ROI', 'ROE', 'EBITDA', 'margin', 'profitability',
    'income statement', 'balance sheet', 'cash flow statement'
  ],
  
  // Medium priority financial terms
  mediumPriority: [
    'dividend', 'yield', 'debt', 'asset', 'liability',
    'equity', 'valuation', 'market cap', 'stock price', 'shareholder',
    'investor', 'investment', 'return', 'capital', 'funding',
    'financing', 'loan', 'credit', 'debt-to-equity', 'leverage',
    'liquidity', 'solvency', 'gross margin', 'net margin', 'operating margin'
  ],
  
  // Low priority financial terms
  lowPriority: [
    'budget', 'forecast', 'projection', 'estimate', 'target',
    'financial performance', 'financial health', 'financial condition', 'financial position',
    'financial stability', 'financial strength', 'financial weakness', 'financial risk',
    'cash', 'cash reserves', 'cash position', 'cash balance', 'cash management',
    'cost', 'expense', 'expenditure', 'spending', 'cost structure'
  ],
  
  /**
   * Check if text contains financial-related keywords
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
      category: 'financial'
    };
  }
};

// For backward compatibility
export default FinancialKeywords;