/**
 * calculatorUtils.js
 * Shared utility functions for metric calculators
 */

/**
 * Check if text contains numbers or statistics
 * @param {string} text - Text to analyze
 * @returns {boolean} - Whether text contains numbers
 */
export const containsNumbers = (text) => {
  if (!text) return false;
  return /\d+%|\d+\.\d+|\$\d+|\d+ (million|billion|trillion)/.test(text);
};

/**
 * Check if text contains dates
 * @param {string} text - Text to analyze
 * @returns {boolean} - Whether text contains dates
 */
export const containsDates = (text) => {
  if (!text) return false;
  return /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}-\d{1,2}|january|february|march|april|may|june|july|august|september|october|november|december \d{1,2},? \d{2,4}/i.test(text);
};

/**
 * Check if text contains specific details
 * @param {string} text - Text to analyze
 * @returns {boolean} - Whether text contains specific details
 */
export const containsSpecificDetails = (text) => {
  if (!text) return false;
  
  // Check for specific names, places, or identifiers
  const hasProperNouns = /[A-Z][a-z]+ [A-Z][a-z]+|[A-Z][a-z]+ (Corp|Inc|LLC|Ltd|Co|Company|Group)/g.test(text);
  
  // Check for specific measurements or quantities
  const hasMeasurements = /\d+ (percent|kg|mb|gb|tb|mm|cm|m|km|miles|pounds|tons|shares|users|customers|employees)/i.test(text);
  
  // Check for specific time periods
  const hasTimePeriods = /\d+ (seconds|minutes|hours|days|weeks|months|years|quarters|decades)/i.test(text);
  
  return hasProperNouns || hasMeasurements || hasTimePeriods;
};

/**
 * Check if text contains precise data
 * @param {string} text - Text to analyze
 * @returns {boolean} - Whether text contains precise data
 */
export const containsPreciseData = (text) => {
  if (!text) return false;
  return /\d+\.\d+%|\d+\.\d+|\$\d+\.\d+|\d{1,3},\d{3}\.\d+/.test(text);
};

/**
 * Extract year from date string or timestamp
 * @param {string|number|Date} date - Date to extract year from
 * @returns {number|null} - Year or null if invalid
 */
export const extractYear = (date) => {
  if (!date) return null;
  
  try {
    // Handle Date object
    if (date instanceof Date) {
      return date.getFullYear();
    }
    
    // Handle timestamp (number)
    if (typeof date === 'number') {
      return new Date(date).getFullYear();
    }
    
    // Handle ISO date string
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}/)) {
      return parseInt(date.substring(0, 4), 10);
    }
    
    // Handle year only
    if (typeof date === 'string' && date.match(/^\d{4}$/)) {
      return parseInt(date, 10);
    }
    
    // Try to parse as date
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.getFullYear();
    }
    
    // Extract year from text with regex
    const yearMatch = date.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      return parseInt(yearMatch[0], 10);
    }
    
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Get current year
 * @returns {number} - Current year
 */
export const getCurrentYear = () => {
  return new Date().getFullYear();
};

/**
 * Calculate recency score based on year
 * @param {number} year - Year to calculate score for
 * @returns {number} - Score between 0-1
 */
export const calculateRecencyScore = (year) => {
  if (!year) return 0.5;
  
  const currentYear = getCurrentYear();
  
  if (year >= currentYear) {
    return 1.0; // Current year gets perfect score
  } else if (year === currentYear - 1) {
    return 0.9; // Last year
  } else if (year === currentYear - 2) {
    return 0.8; // Two years ago
  } else if (year === currentYear - 3) {
    return 0.7; // Three years ago
  } else if (year >= currentYear - 5) {
    return 0.6; // 4-5 years ago
  } else if (year >= currentYear - 10) {
    return 0.5; // 6-10 years ago
  } else if (year >= currentYear - 15) {
    return 0.4; // 11-15 years ago
  } else if (year >= currentYear - 20) {
    return 0.3; // 16-20 years ago
  } else {
    return 0.2; // More than 20 years ago
  }
};

/**
 * Check if a source domain matches any in a list
 * @param {string} source - Source domain to check
 * @param {Array} domainList - List of domains to match against
 * @returns {boolean} - Whether source matches any domain in the list
 */
export const matchesDomain = (source, domainList) => {
  if (!source || !domainList || !Array.isArray(domainList)) return false;
  
  const sourceLower = source.toLowerCase();
  return domainList.some(domain => sourceLower.includes(domain.toLowerCase()));
};

/**
 * Normalize a score to be between 0 and 1
 * @param {number} score - Score to normalize
 * @returns {number} - Normalized score
 */
export const normalizeScore = (score) => {
  return Math.min(Math.max(score, 0), 1.0);
};

export default {
  containsNumbers,
  containsDates,
  containsSpecificDetails,
  containsPreciseData,
  extractYear,
  getCurrentYear,
  calculateRecencyScore,
  matchesDomain,
  normalizeScore
};
