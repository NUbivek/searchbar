/**
 * Utility functions for extracting insights from category content
 */
import { getKeyTermsForCategory } from './categoryUtils';

/**
 * Extract insights from category content
 * @param {Object} category The category
 * @param {string} query The search query
 * @returns {Array<string>} Array of insights
 */
export const extractCategoryInsights = (category, query) => {
  if (!category || !Array.isArray(category.content) || category.content.length === 0) {
    return [];
  }
  
  try {
    // If category already has insights, use those
    if (Array.isArray(category.insights) && category.insights.length > 0) {
      return category.insights;
    }
    
    // Extract insights from content
    const insights = [];
    const seenInsights = new Set();
    
    // Look for key insights in content
    category.content.forEach(item => {
      if (!item || typeof item !== 'object') return;
      
      // Check for key insights in item
      if (Array.isArray(item.keyInsights)) {
        item.keyInsights.forEach(insight => {
          if (typeof insight === 'string' && insight.length > 10 && !seenInsights.has(insight)) {
            insights.push(insight);
            seenInsights.add(insight);
          }
        });
      }
      
      // Check for key points in item
      if (Array.isArray(item.keyPoints)) {
        item.keyPoints.forEach(point => {
          if (typeof point === 'string' && point.length > 10 && !seenInsights.has(point)) {
            insights.push(point);
            seenInsights.add(point);
          }
        });
      }
      
      // Extract from description if needed
      if (insights.length < 3 && typeof item.description === 'string' && item.description.length > 50) {
        // Look for sentences with key terms
        const sentences = item.description.split(/[.!?]+/).filter(s => s.trim().length > 20);
        
        // Keywords based on category type
        const keyTerms = getKeyTermsForCategory(category.type || 'default');
        
        sentences.forEach(sentence => {
          const trimmedSentence = sentence.trim();
          if (trimmedSentence.length > 20 && trimmedSentence.length < 150) {
            // Check if sentence contains key terms
            const containsKeyTerm = keyTerms.some(term => 
              trimmedSentence.toLowerCase().includes(term.toLowerCase())
            );
            
            if (containsKeyTerm && !seenInsights.has(trimmedSentence)) {
              insights.push(trimmedSentence);
              seenInsights.add(trimmedSentence);
            }
          }
        });
      }
    });
    
    // Return top insights
    return insights.slice(0, 5);
  } catch (error) {
    console.error('Error extracting category insights:', error);
    return [];
  }
};

/**
 * Extract business insights from category content
 * @param {Object} category The category
 * @param {string} query The search query
 * @returns {Array<string>} Array of business insights
 */
export const extractBusinessInsightsFromCategory = (category, query) => {
  if (!category || !Array.isArray(category.content) || category.content.length === 0) {
    return [];
  }
  
  try {
    // If category already has business insights, use those
    if (Array.isArray(category.businessInsights) && category.businessInsights.length > 0) {
      return category.businessInsights;
    }
    
    // Combine all content text
    const allContent = category.content.map(item => {
      return [
        item.title || '',
        item.description || item.snippet || '',
        item.content || ''
      ].join(' ');
    }).join(' ');
    
    // Use the contentExtractor to extract business insights
    try {
      const { extractBusinessInsights } = require('../../utils/contentExtractor');
      return extractBusinessInsights(allContent, query, { 
        maxInsights: 8,
        categoryName: category.name || ''
      });
    } catch (error) {
      console.error('Error importing extractBusinessInsights:', error);
      return [];
    }
  } catch (error) {
    console.error('Error extracting business insights from category:', error);
    return [];
  }
};

/**
 * Categorize insights into business categories
 * @param {Array<string>} insights Array of insights
 * @returns {Object} Object with categorized insights
 */
export const categorizeBusinessInsights = (insights) => {
  if (!Array.isArray(insights) || insights.length === 0) {
    return { uncategorized: [] };
  }
  
  const categories = {
    market: ['market', 'industry', 'sector', 'trend', 'growth', 'demand', 'supply'],
    financial: ['revenue', 'profit', 'financial', 'earnings', 'margin', 'cost', 'price', 'sales'],
    strategy: ['strategy', 'plan', 'goal', 'objective', 'initiative', 'mission', 'vision'],
    competitive: ['competitor', 'competition', 'advantage', 'position', 'market share', 'differentiation'],
    risk: ['risk', 'challenge', 'threat', 'uncertainty', 'issue', 'problem', 'concern']
  };
  
  const categorized = {
    market: [],
    financial: [],
    strategy: [],
    competitive: [],
    risk: [],
    uncategorized: []
  };
  
  insights.forEach(insight => {
    if (!insight || typeof insight !== 'string') return;
    
    const lowerInsight = insight.toLowerCase();
    let matched = false;
    
    // Check each category
    Object.entries(categories).forEach(([category, terms]) => {
      if (matched) return;
      
      // Check if insight contains any category terms
      const hasMatch = terms.some(term => lowerInsight.includes(term));
      
      if (hasMatch) {
        categorized[category].push(insight);
        matched = true;
      }
    });
    
    // If not matched to any category, add to uncategorized
    if (!matched) {
      categorized.uncategorized.push(insight);
    }
  });
  
  return categorized;
};
