/**
 * Metrics calculators for search results
 * 
 * Implements algorithms for calculating:
 * - Relevance
 * - Accuracy
 * - Credibility
 * - Recency
 */

import { debug, info, error, warn } from '../../../utils/logger';

// Create a log object for consistent logging
const log = { debug, info, error, warn };

/**
 * Calculate metrics for a given content and sources
 * @param {string} content The content to evaluate
 * @param {Array} sources The sources associated with the content
 * @param {string} query The search query
 * @param {Object} options Options for metrics calculation
 * @returns {Object} Metrics object with relevance, accuracy, credibility, and recency scores
 */
export const calculateMetrics = (content, sources = [], query = '', options = {}) => {
  if (!content) {
    log.warn('No content provided for metrics calculation');
    return DEFAULT_METRICS;
  }
  
  try {
    const relevance = calculateRelevance(content, query, options);
    const accuracy = calculateAccuracy(content, sources, options);
    const credibility = calculateCredibility(sources, options);
    const recency = calculateRecency(sources, options);
    
    return {
      relevance,
      accuracy,
      credibility,
      recency
    };
  } catch (err) {
    log.error('Error calculating metrics:', err);
    return DEFAULT_METRICS;
  }
};

// Default metrics values when calculation fails
export const DEFAULT_METRICS = {
  relevance: 75,
  accuracy: 80,
  credibility: 70,
  recency: 65
};

/**
 * Calculate relevance score based on content and query
 * @param {string} content The content to evaluate
 * @param {string} query The search query
 * @param {Object} options Options for relevance calculation
 * @returns {number} Relevance score (0-100)
 */
const calculateRelevance = (content, query = '', options = {}) => {
  if (!content || !query) {
    return DEFAULT_METRICS.relevance;
  }
  
  try {
    // Normalize content and query
    const normalizedContent = content.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    
    // Extract query keywords (words with 3+ characters)
    const queryKeywords = normalizedQuery
      .split(/\s+/)
      .filter(word => word.length >= 3)
      .map(word => word.replace(/[^\w]/g, ''));
    
    if (queryKeywords.length === 0) {
      return DEFAULT_METRICS.relevance;
    }
    
    // Count keyword occurrences
    let keywordMatches = 0;
    queryKeywords.forEach(keyword => {
      // Use regex with word boundaries for better matching
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = normalizedContent.match(regex);
      
      if (matches) {
        keywordMatches += matches.length;
      }
    });
    
    // Calculate keyword density (matches per 100 words)
    const contentWordCount = normalizedContent.split(/\s+/).length;
    const keywordDensity = (keywordMatches / contentWordCount) * 100;
    
    // Calculate relevance score - base score plus keyword density
    let relevanceScore = 70; // Base score
    
    // Adjust for keyword density - optimal is 2-5%
    if (keywordDensity > 0 && keywordDensity <= 10) {
      relevanceScore += Math.min(25, keywordDensity * 5);
    } else if (keywordDensity > 10) {
      relevanceScore += 25; // Max bonus
    }
    
    // Check for exact phrase matches
    if (normalizedContent.includes(normalizedQuery)) {
      relevanceScore += 5; // Bonus for exact phrase match
    }
    
    // Business context adjustment if specified
    if (options.businessContext) {
      // Add a small bonus for business-focused content
      const businessTerms = ['business', 'company', 'market', 'industry', 'customer', 'product', 'service'];
      const businessTermCount = businessTerms.reduce((count, term) => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const matches = normalizedContent.match(regex);
        return count + (matches ? matches.length : 0);
      }, 0);
      
      // Normalize business term density
      const businessDensity = (businessTermCount / contentWordCount) * 100;
      
      // Add up to 5% bonus for business terms
      relevanceScore += Math.min(5, businessDensity);
    }
    
    // Ensure score is within range
    return Math.max(0, Math.min(100, Math.round(relevanceScore)));
  } catch (err) {
    log.error('Error calculating relevance:', err);
    return DEFAULT_METRICS.relevance;
  }
};

/**
 * Calculate accuracy score based on content and sources
 * @param {string} content The content to evaluate
 * @param {Array} sources The sources associated with the content
 * @param {Object} options Options for accuracy calculation
 * @returns {number} Accuracy score (0-100)
 */
const calculateAccuracy = (content, sources = [], options = {}) => {
  if (!content) {
    return DEFAULT_METRICS.accuracy;
  }
  
  try {
    // Base accuracy score
    let accuracyScore = 75;
    
    // Factual indicators
    const factualIndicators = [
      { pattern: /\b\d+(\.\d+)?%\b/g, bonus: 2 },  // Percentages
      { pattern: /\b\d{4}\b/g, bonus: 1 },         // Years
      { pattern: /\$\d+(\.\d+)?/g, bonus: 1.5 },   // Dollar amounts
      { pattern: /according to|cited|referenced/gi, bonus: 3 } // Citations
    ];
    
    // Calculate content length
    const contentLength = content.length;
    
    // Calculate factual density
    let factualPoints = 0;
    factualIndicators.forEach(indicator => {
      const matches = content.match(indicator.pattern) || [];
      factualPoints += matches.length * indicator.bonus;
    });
    
    // Normalize factual density
    const factualDensity = (factualPoints / (contentLength / 100));
    
    // Adjust score based on factual density
    accuracyScore += Math.min(15, factualDensity * 2);
    
    // Source quality adjustment
    if (sources && sources.length > 0) {
      // More sources generally means better accuracy
      let sourceBonus = Math.min(5, sources.length);
      accuracyScore += sourceBonus;
      
      // Check for reputable domains in sources
      const reputableDomains = [
        'gov', 'edu', 'org', 
        'wikipedia.org', 
        'nytimes.com', 'wsj.com', 'reuters.com', 'bloomberg.com'
      ];
      
      let reputableSources = 0;
      sources.forEach(source => {
        if (source.url) {
          reputableDomains.forEach(domain => {
            if (source.url.includes(domain)) {
              reputableSources++;
            }
          });
        }
      });
      
      // Add bonus for reputable sources
      accuracyScore += Math.min(5, reputableSources * 2);
    } else {
      // Penalty for no sources
      accuracyScore -= 5;
    }
    
    // Ensure score is within range
    return Math.max(0, Math.min(100, Math.round(accuracyScore)));
  } catch (err) {
    log.error('Error calculating accuracy:', err);
    return DEFAULT_METRICS.accuracy;
  }
};

/**
 * Calculate credibility score based on sources
 * @param {Array} sources The sources associated with the content
 * @param {Object} options Options for credibility calculation
 * @returns {number} Credibility score (0-100)
 */
const calculateCredibility = (sources = [], options = {}) => {
  try {
    // Base credibility score
    let credibilityScore = 70;
    
    if (!sources || sources.length === 0) {
      // Penalty for no sources
      return Math.max(50, credibilityScore - 20);
    }
    
    // Credibility factors
    const credibilityFactors = {
      // Source type bonuses
      educational: 15,  // .edu domains
      government: 15,   // .gov domains
      nonProfit: 10,    // .org domains
      news: 10,         // Established news sites
      commercial: 5,    // Commercial sites
      blog: 0,          // Blogs
      social: -5,       // Social media
      
      // Source age bonus (in years)
      ageBonus: {
        0: 0,      // Current year
        1: 2,      // Last year
        2: 1,      // Two years ago
        3: 0,      // Three years ago
        4: -1,     // Four years ago
        5: -2      // Five or more years ago
      }
    };
    
    // Domain credibility assessment
    const domainTypes = {
      educational: ['.edu', 'university', 'college', 'school'],
      government: ['.gov', 'government', 'agency', 'federal', 'state'],
      nonProfit: ['.org', 'foundation', 'association', 'institute'],
      news: ['news', 'times', 'post', 'herald', 'journal', 'tribune', 'reuters', 'bloomberg', 'associated press', 'ap.com'],
      blog: ['blog', 'wordpress', 'medium', 'blogger'],
      social: ['twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok']
    };
    
    let sourceFactor = 0;
    let sourceCount = 0;
    
    // Process each source
    sources.forEach(source => {
      if (!source) return;
      
      sourceCount++;
      let sourceType = 'commercial'; // Default type
      let sourceScore = credibilityFactors.commercial;
      
      // Determine source type from URL
      if (source.url) {
        // Check for domain types
        for (const [type, indicators] of Object.entries(domainTypes)) {
          for (const indicator of indicators) {
            if (source.url.toLowerCase().includes(indicator)) {
              sourceType = type;
              sourceScore = credibilityFactors[type];
              break;
            }
          }
        }
      }
      
      // Age assessment
      let sourceAge = 0; // Default to current
      if (source.date) {
        const publicationDate = new Date(source.date);
        const currentYear = new Date().getFullYear();
        sourceAge = currentYear - publicationDate.getFullYear();
      }
      
      // Apply age bonus/penalty
      const ageModifier = sourceAge >= 5 ? 
        credibilityFactors.ageBonus[5] : 
        credibilityFactors.ageBonus[sourceAge];
      
      sourceFactor += sourceScore + ageModifier;
    });
    
    // Calculate average source factor
    if (sourceCount > 0) {
      sourceFactor = sourceFactor / sourceCount;
    }
    
    // Apply source factor to base score
    credibilityScore += sourceFactor;
    
    // Diversity bonus - more sources is better (up to a point)
    credibilityScore += Math.min(10, sourceCount * 2);
    
    // Ensure score is within range
    return Math.max(0, Math.min(100, Math.round(credibilityScore)));
  } catch (err) {
    log.error('Error calculating credibility:', err);
    return DEFAULT_METRICS.credibility;
  }
};

/**
 * Calculate recency score based on sources
 * @param {Array} sources The sources associated with the content
 * @param {Object} options Options for recency calculation
 * @returns {number} Recency score (0-100)
 */
const calculateRecency = (sources = [], options = {}) => {
  try {
    // Base recency score
    let recencyScore = 60;
    
    if (!sources || sources.length === 0) {
      return recencyScore;
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    let totalMonthsOld = 0;
    let sourcesWithDates = 0;
    
    // Process each source date
    sources.forEach(source => {
      if (!source || !source.date) return;
      
      try {
        const publicationDate = new Date(source.date);
        
        // Calculate months between publication and now
        const yearDiff = currentYear - publicationDate.getFullYear();
        const monthDiff = currentMonth - publicationDate.getMonth();
        const totalMonths = (yearDiff * 12) + monthDiff;
        
        totalMonthsOld += Math.max(0, totalMonths);
        sourcesWithDates++;
      } catch (err) {
        // Skip invalid dates
      }
    });
    
    // Calculate average source age in months
    let averageMonthsOld = 0;
    if (sourcesWithDates > 0) {
      averageMonthsOld = totalMonthsOld / sourcesWithDates;
    }
    
    // Adjust score based on average age
    // - Very recent (0-1 month): 100
    // - Recent (1-3 months): 90-100
    // - Moderately recent (3-6 months): 80-90
    // - Somewhat recent (6-12 months): 70-80
    // - Somewhat old (1-2 years): 60-70
    // - Old (2-3 years): 50-60
    // - Very old (3+ years): below 50
    
    if (averageMonthsOld <= 1) {
      recencyScore = 100;
    } else if (averageMonthsOld <= 3) {
      recencyScore = 100 - ((averageMonthsOld - 1) * 5);
    } else if (averageMonthsOld <= 6) {
      recencyScore = 90 - ((averageMonthsOld - 3) * (10/3));
    } else if (averageMonthsOld <= 12) {
      recencyScore = 80 - ((averageMonthsOld - 6) * (10/6));
    } else if (averageMonthsOld <= 24) {
      recencyScore = 70 - ((averageMonthsOld - 12) * (10/12));
    } else if (averageMonthsOld <= 36) {
      recencyScore = 60 - ((averageMonthsOld - 24) * (10/12));
    } else {
      recencyScore = Math.max(30, 50 - ((averageMonthsOld - 36) * (20/24)));
    }
    
    // Ensure score is within range
    return Math.max(0, Math.min(100, Math.round(recencyScore)));
  } catch (err) {
    log.error('Error calculating recency:', err);
    return DEFAULT_METRICS.recency;
  }
};

export default {
  calculateMetrics,
  DEFAULT_METRICS
};
