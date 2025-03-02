/**
 * Special category definitions for the search results
 * These are high-priority categories that are evaluated for inclusion in all searches
 */

import { CategoryBase } from './CategoryBase';

/**
 * Key Insights special category
 * This is the highest priority category that is always evaluated for inclusion
 */
export const KeyInsightsCategory = {
  id: 'key-insights',
  name: 'Key Insights',
  description: 'Most important insights related to your search',
  color: '#673AB7', // Purple
  priority: 0, // Highest priority
  icon: 'lightbulb',
  keywords: [
    'key insight', 'important finding', 'critical information', 'takeaway',
    'highlight', 'crucial', 'significant', 'essential', 'primary', 'main point',
    'notable', 'insight', 'key finding', 'core concept', 'fundamental'
  ],
  
  /**
   * Always evaluated for inclusion in results
   */
  alwaysEvaluate: true,
  
  /**
   * Format Key Insights content
   * @param {Object} content The content to format
   * @returns {string} Formatted content with bullet points and emphasis on numbers
   */
  formatContent: (content) => {
    if (!content || typeof content !== 'string') return '';
    
    // Convert any existing bullet points to consistent format
    let formatted = content
      .replace(/•\s+/g, '• ')
      .replace(/\*\s+/g, '• ')
      .replace(/(\d+)\.\s+/g, '• ');
    
    // Add bullet points to lines that don't have them
    formatted = formatted
      .split('\n')
      .map(line => {
        line = line.trim();
        if (line && !line.startsWith('•') && !line.startsWith('-')) {
          return `• ${line}`;
        }
        return line;
      })
      .join('\n');
    
    // Emphasize numbers
    formatted = formatted.replace(/(\d+(\.\d+)?%?)/g, '<strong>$1</strong>');
    
    return formatted;
  },
  
  /**
   * Get score for Key Insights category based on content relevance
   * @param {string} content The content to score
   * @param {string} query Search query
   * @returns {number} Relevance score (0-100)
   */
  getScore: (content, query = '') => {
    if (!content || typeof content !== 'string') return 0;
    
    // Key Insights should prioritize content with numerical data and key findings
    const hasNumbers = /\d+(\.\d+)?%?/.test(content);
    const hasBulletPoints = /•|-|\*|\d+\./.test(content);
    const hasKeywords = KeyInsightsCategory.keywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Calculate base score
    let score = 70; // Start with baseline score
    
    // Adjust score based on content characteristics
    if (hasNumbers) score += 10;
    if (hasBulletPoints) score += 10;
    if (hasKeywords) score += 10;
    
    // Cap score at 100
    return Math.min(score, 100);
  }
};

/**
 * Get all special categories
 * @returns {Array} Array of special category definitions
 */
export const getSpecialCategories = () => {
  return [KeyInsightsCategory];
};

// Export for convenience
export default {
  KeyInsightsCategory,
  getSpecialCategories
};
