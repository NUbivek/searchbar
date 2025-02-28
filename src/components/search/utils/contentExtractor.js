/**
 * Utility functions for extracting key information from search result content
 */

/**
 * Extract key points from text based on a search query
 * @param {string} text - The text to extract key points from
 * @param {string} query - The search query to use for relevance
 * @param {Object} options - Options for extraction
 * @param {number} options.maxPoints - Maximum number of points to extract (default: 5)
 * @param {number} options.minLength - Minimum length of a key point (default: 30)
 * @param {number} options.maxLength - Maximum length of a key point (default: 150)
 * @returns {Array<string>} Array of key points
 */
export const extractKeyPoints = (text, query, options = {}) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  // Default options
  const {
    maxPoints = 5,
    minLength = 30,
    maxLength = 150
  } = options;

  try {
    // Split query into keywords
    const keywords = query
      ? query.toLowerCase().split(/\s+/).filter(word => word.length > 3)
      : [];

    // Split text into sentences
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const sentences = [];
    let match;
    
    while ((match = sentenceRegex.exec(text)) !== null) {
      const sentence = match[0].trim();
      if (sentence.length >= minLength && sentence.length <= maxLength) {
        // Calculate relevance score
        let score = 0;
        const lowerSentence = sentence.toLowerCase();
        
        // Score based on keyword matches
        keywords.forEach(keyword => {
          if (lowerSentence.includes(keyword)) {
            score += 2;
            
            // Bonus for keyword at the beginning
            if (lowerSentence.indexOf(keyword) < 20) {
              score += 1;
            }
          }
        });
        
        // Score based on information density
        const numberCount = (sentence.match(/\d+/g) || []).length;
        score += numberCount * 0.5;
        
        // Score based on quoted text
        const quoteCount = (sentence.match(/["'][^"']+["']/g) || []).length;
        score += quoteCount * 0.5;
        
        // Score based on business terms
        const businessTerms = [
          'revenue', 'profit', 'market', 'growth', 'investment', 
          'strategy', 'business', 'company', 'industry', 'sector',
          'financial', 'economic', 'forecast', 'trend', 'analysis'
        ];
        
        businessTerms.forEach(term => {
          if (lowerSentence.includes(term)) {
            score += 0.3;
          }
        });
        
        sentences.push({
          text: sentence,
          score: score
        });
      }
    }
    
    // Sort by score and take top N
    return sentences
      .sort((a, b) => b.score - a.score)
      .slice(0, maxPoints)
      .map(item => item.text);
  } catch (error) {
    console.error('Error extracting key points:', error);
    return [];
  }
};

/**
 * Extract key numbers and statistics from text
 * @param {string} text - The text to extract numbers from
 * @param {Object} options - Options for extraction
 * @param {number} options.maxNumbers - Maximum number of numbers to extract (default: 8)
 * @param {number} options.contextLength - Length of context around numbers (default: 40)
 * @returns {Array<Object>} Array of number objects with value and context
 */
export const extractKeyNumbers = (text, options = {}) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  // Default options
  const {
    maxNumbers = 8,
    contextLength = 40
  } = options;

  try {
    const numbers = [];
    
    // Find numbers with currency symbols, percentages, and large number suffixes
    const complexNumberRegex = /(\$?\d+(?:[,.]\d+)?(?:\s*(?:million|billion|trillion|k|M|B|T))?(?:\s*(?:USD|EUR|GBP|JPY|CNY))?|\d+(?:\.\d+)?%)/g;
    
    let match;
    while ((match = complexNumberRegex.exec(text)) !== null) {
      // Get context around the number
      const start = Math.max(0, match.index - contextLength);
      const end = Math.min(text.length, match.index + match[0].length + contextLength);
      const context = text.substring(start, end);
      
      // Calculate importance score
      let score = 0;
      
      // Currency gets higher score
      if (match[0].includes('$') || 
          /USD|EUR|GBP|JPY|CNY/.test(match[0])) {
        score += 3;
      }
      
      // Large numbers get higher score
      if (/million|billion|trillion|M|B|T/.test(match[0])) {
        score += 2;
      }
      
      // Percentages get higher score
      if (match[0].includes('%')) {
        score += 2;
      }
      
      // Context with business terms gets higher score
      const businessTerms = [
        'revenue', 'profit', 'market', 'growth', 'investment', 
        'sales', 'income', 'earnings', 'forecast', 'increase',
        'decrease', 'valuation', 'share', 'stock', 'price'
      ];
      
      businessTerms.forEach(term => {
        if (context.toLowerCase().includes(term)) {
          score += 0.5;
        }
      });
      
      numbers.push({
        value: match[0],
        context: context,
        score: score
      });
    }
    
    // Sort by score and take top N
    return numbers
      .sort((a, b) => b.score - a.score)
      .slice(0, maxNumbers);
  } catch (error) {
    console.error('Error extracting key numbers:', error);
    return [];
  }
};

/**
 * Extract hyperlink-worthy terms from text
 * @param {string} text - The text to extract terms from
 * @param {Object} options - Options for extraction
 * @param {number} options.maxTerms - Maximum number of terms to extract (default: 10)
 * @returns {Array<Object>} Array of term objects with term and context
 */
export const extractHyperlinkTerms = (text, options = {}) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  // Default options
  const { maxTerms = 10 } = options;

  try {
    const terms = [];
    
    // Find quoted terms
    const quoteRegex = /"([^"]{4,50})"/g;
    let match;
    
    while ((match = quoteRegex.exec(text)) !== null) {
      terms.push({
        term: match[1],
        context: match[0],
        type: 'quote',
        score: 3
      });
    }
    
    // Find company names (capitalized terms)
    const companyRegex = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\b/g;
    while ((match = companyRegex.exec(text)) !== null) {
      // Skip if it's at the beginning of a sentence
      const prevChar = text.charAt(Math.max(0, match.index - 1));
      if (prevChar === '.' || prevChar === '!' || prevChar === '?' || prevChar === '\n') {
        continue;
      }
      
      terms.push({
        term: match[1],
        context: match[0],
        type: 'company',
        score: 2
      });
    }
    
    // Find technical terms
    const technicalTerms = [
      'AI', 'ML', 'API', 'SaaS', 'IoT', 'blockchain', 'cloud', 
      'analytics', 'algorithm', 'automation', 'database', 'infrastructure',
      'platform', 'software', 'hardware', 'network', 'security'
    ];
    
    technicalTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      while ((match = regex.exec(text)) !== null) {
        terms.push({
          term: match[0],
          context: match[0],
          type: 'technical',
          score: 1.5
        });
      }
    });
    
    // Sort by score and take top N
    return terms
      .sort((a, b) => b.score - a.score)
      .slice(0, maxTerms);
  } catch (error) {
    console.error('Error extracting hyperlink terms:', error);
    return [];
  }
};

/**
 * Extract business insights from text
 * @param {string} text - The text to extract insights from
 * @param {string} query - The search query
 * @param {Object} options - Options for extraction
 * @param {number} options.maxInsights - Maximum number of insights to extract (default: 5)
 * @param {string} options.categoryName - Optional category name for context
 * @returns {Array<string>} Array of business insights
 */
export const extractBusinessInsights = (text, query, options = {}) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  // Default options
  const { maxInsights = 5, categoryName = '' } = options;

  try {
    // Import context detector if available
    let businessKeywords = [
      'market share', 'revenue growth', 'profit margin', 'competitive advantage',
      'strategic', 'acquisition', 'merger', 'investment', 'expansion', 'forecast',
      'trend', 'opportunity', 'challenge', 'risk', 'performance', 'financial',
      'earnings', 'quarterly', 'annual', 'fiscal', 'outlook', 'guidance'
    ];
    
    // Try to get business context from query
    let isBusinessContext = false;
    try {
      // This will use the contextDetector if it's available
      const contextDetector = require('../metrics/utils/contextDetector');
      if (contextDetector && contextDetector.detectQueryContext) {
        const contexts = contextDetector.detectQueryContext(query);
        isBusinessContext = contexts.includes('business') || contexts.includes('financial');
        
        // If we have access to the BUSINESS_KEYWORDS, use those too
        if (contextDetector.BUSINESS_KEYWORDS && Array.isArray(contextDetector.BUSINESS_KEYWORDS)) {
          businessKeywords = [...businessKeywords, ...contextDetector.BUSINESS_KEYWORDS];
        }
      }
    } catch (e) {
      // If contextDetector is not available, continue with default keywords
      console.debug('Context detector not available, using default business keywords');
    }
    
    // Check if category name indicates business context
    if (categoryName && typeof categoryName === 'string') {
      const businessCategoryTerms = ['business', 'financial', 'market', 'economic', 'company', 'industry', 'corporate'];
      const lowerCategoryName = categoryName.toLowerCase();
      
      businessCategoryTerms.forEach(term => {
        if (lowerCategoryName.includes(term)) {
          isBusinessContext = true;
        }
      });
    }
    
    // Split text into sentences
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const insights = [];
    let match;
    
    while ((match = sentenceRegex.exec(text)) !== null) {
      const sentence = match[0].trim();
      if (sentence.length > 30 && sentence.length < 200) {
        // Calculate business relevance score
        let score = 0;
        const lowerSentence = sentence.toLowerCase();
        
        // Score based on business keywords
        businessKeywords.forEach(keyword => {
          if (lowerSentence.includes(keyword.toLowerCase())) {
            score += 1;
            
            // Bonus for keywords at the beginning of the sentence
            if (lowerSentence.indexOf(keyword.toLowerCase()) < 20) {
              score += 0.5;
            }
          }
        });
        
        // Score based on numbers and percentages
        const numberCount = (sentence.match(/\d+%|\$\d+|\d+ (?:million|billion|trillion)/g) || []).length;
        score += numberCount * 1.5;
        
        // Score based on query relevance
        if (query && typeof query === 'string') {
          const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 3);
          queryTerms.forEach(term => {
            if (lowerSentence.includes(term)) {
              score += 0.5;
            }
          });
        }
        
        // Score based on category name relevance
        if (categoryName && typeof categoryName === 'string') {
          const categoryTerms = categoryName.toLowerCase().split(/\s+/).filter(term => term.length > 3);
          categoryTerms.forEach(term => {
            if (lowerSentence.includes(term)) {
              score += 0.7;
            }
          });
        }
        
        // Boost score if we're in a business context
        if (isBusinessContext) {
          score *= 1.2;
        }
        
        // Only include sentences with sufficient business relevance
        if (score >= 1.5) {
          insights.push({
            text: sentence,
            score: score
          });
        }
      }
    }
    
    // Sort by score and take top N
    return insights
      .sort((a, b) => b.score - a.score)
      .slice(0, maxInsights)
      .map(item => item.text);
  } catch (error) {
    console.error('Error extracting business insights:', error);
    return [];
  }
};
