/**
 * RelevanceCalculator.js
 * Calculates the relevance score for search results based on query match, recency, and content quality.
 * Enhanced with domain-specific boosting, personalization, and improved topic detection.
 */

import { 
  containsNumbers, 
  containsDates, 
  containsSpecificDetails, 
  containsPreciseData,
  calculateRecencyScore as utilsCalculateRecencyScore,
  matchesDomain,
  normalizeScore
} from '../../utils/calculatorUtils';

import {
  DISPLAY_THRESHOLD,
  TOPIC_CATEGORIES,
  DOMAIN_SPECIFIC_SOURCES
} from '../../utils/calculatorData';

// Constants for weighting different factors
const WEIGHTS = {
  QUERY_MATCH: 0.40,
  RECENCY: 0.35,    // Increased weight for recency
  CONTENT_QUALITY: 0.15,
  DOMAIN_RELEVANCE: 0.10, // New factor for domain-specific relevance
};

// Minimum threshold for relevance score (70%)
const RELEVANCE_THRESHOLD = DISPLAY_THRESHOLD;

// Domain-specific high-value sources
const DOMAIN_SPECIFIC_SOURCES = DOMAIN_SPECIFIC_SOURCES;

// Topic categories for better matching
const TOPIC_CATEGORIES = TOPIC_CATEGORIES;

/**
 * Calculate the relevance score for a search result
 * @param {Object} result - The search result object
 * @param {string} query - The search query
 * @param {Object} options - Additional options for personalization
 * @returns {number} - Relevance score (0-100)
 */
export const calculateRelevanceScore = (result, query, options = {}) => {
  if (!result || !query) {
    return 0;
  }

  // Calculate query match score
  const queryMatchScore = calculateQueryMatchScore(result, query);
  
  // Calculate recency score
  const recencyScore = utilsCalculateRecencyScore(result.timestamp || result.date || new Date());
  
  // Calculate content quality score
  const contentQualityScore = calculateContentQualityScore(result, query);
  
  // Calculate domain-specific relevance score (new)
  const domainRelevanceScore = calculateDomainRelevanceScore(result, query, options);
  
  // Calculate weighted average
  const weightedScore = 
    (queryMatchScore * WEIGHTS.QUERY_MATCH) +
    (recencyScore * WEIGHTS.RECENCY) +
    (contentQualityScore * WEIGHTS.CONTENT_QUALITY) +
    (domainRelevanceScore * WEIGHTS.DOMAIN_RELEVANCE);
  
  // Apply personalization boost if applicable
  const personalizedScore = applyPersonalizationBoost(weightedScore, result, options);
  
  // Convert to percentage and round to nearest integer
  const finalScore = Math.round(personalizedScore * 100);
  
  // Ensure score is at least at the threshold for displayed results
  return Math.max(finalScore, RELEVANCE_THRESHOLD);
};

/**
 * Calculate how well the result matches the query
 * @param {Object} result - The search result
 * @param {string} query - The search query
 * @returns {number} - Score between 0-1
 */
const calculateQueryMatchScore = (result, query) => {
  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/);
  
  // Check title match
  const titleMatch = result.title ? 
    queryTerms.filter(term => result.title.toLowerCase().includes(term)).length / queryTerms.length : 0;
  
  // Check content match
  const contentMatch = result.content ? 
    queryTerms.filter(term => result.content.toLowerCase().includes(term)).length / queryTerms.length : 0;
  
  // Check exact phrase match (higher weight)
  const exactPhraseMatch = result.content && result.content.toLowerCase().includes(normalizedQuery) ? 1 : 0;
  
  // Check topic relevance - if the query and content are in the same topic category
  const topicRelevance = calculateTopicRelevance(normalizedQuery, result);
  
  // Check source-topic alignment - if the source specializes in the query topic
  const sourceTopicAlignment = calculateSourceTopicAlignment(normalizedQuery, result.source, result.sourceType);
  
  // Enhanced: Check for semantic similarity using key phrases
  const semanticSimilarity = result.keyPhrases && queryTerms.length > 0 ? 
    calculateSemanticSimilarity(queryTerms, result.keyPhrases) : 0;
  
  // Weighted combination
  return (titleMatch * 0.20) + 
         (contentMatch * 0.20) + 
         (exactPhraseMatch * 0.15) + 
         (topicRelevance * 0.15) + 
         (sourceTopicAlignment * 0.15) +
         (semanticSimilarity * 0.15);
};

/**
 * Calculate semantic similarity between query terms and key phrases
 * @param {Array} queryTerms - Array of query terms
 * @param {Array} keyPhrases - Array of key phrases from the content
 * @returns {number} - Score between 0-1
 */
const calculateSemanticSimilarity = (queryTerms, keyPhrases) => {
  if (!keyPhrases || keyPhrases.length === 0) return 0;
  
  // Count how many query terms appear in key phrases
  let matchCount = 0;
  
  for (const term of queryTerms) {
    for (const phrase of keyPhrases) {
      if (phrase.toLowerCase().includes(term)) {
        matchCount++;
        break; // Count each term only once
      }
    }
  }
  
  return matchCount / queryTerms.length;
};

/**
 * Calculate topic relevance between query and content
 * @param {string} query - The search query
 * @param {Object} result - The search result
 * @returns {number} - Score between 0-1
 */
const calculateTopicRelevance = (query, result) => {
  // Determine query topics
  const queryTopics = [];
  for (const [topic, keywords] of Object.entries(TOPIC_CATEGORIES)) {
    if (keywords.some(keyword => query.includes(keyword))) {
      queryTopics.push(topic);
    }
  }
  
  // If no specific topics detected in query, return middle score
  if (queryTopics.length === 0) return 0.5;
  
  // Check if result has topic metadata
  if (result.topics && result.topics.length > 0) {
    // Check for direct topic matches
    const matchingTopics = queryTopics.filter(queryTopic => 
      result.topics.some(resultTopic => resultTopic.toUpperCase() === queryTopic)
    );
    
    if (matchingTopics.length > 0) {
      return 0.8 + (Math.min(matchingTopics.length, 3) * 0.05); // Up to 0.95 for multiple matches
    }
  }
  
  // If no explicit topics, check content for topic keywords
  if (result.content) {
    const contentLower = result.content.toLowerCase();
    let keywordMatches = 0;
    
    for (const topic of queryTopics) {
      const keywords = TOPIC_CATEGORIES[topic];
      for (const keyword of keywords) {
        if (contentLower.includes(keyword)) {
          keywordMatches++;
        }
      }
    }
    
    // Score based on keyword density
    return Math.min(0.5 + (keywordMatches * 0.05), 0.9);
  }
  
  return 0.5; // Default middle score
};

/**
 * Calculate source-topic alignment
 * @param {string} query - The search query
 * @param {string} source - The source of the result
 * @param {string} sourceType - The type of source
 * @returns {number} - Score between 0-1
 */
const calculateSourceTopicAlignment = (query, source, sourceType) => {
  if (!source) return 0.5;
  
  // Financial data sources for financial queries
  const financialSources = [
    'bloomberg', 'wsj', 'ft.com', 'cnbc', 'marketwatch',
    'yahoo.finance', 'investing.com', 'morningstar', 'seeking alpha',
    'nasdaq', 'nyse', 'sec.gov', 'federalreserve', 'treasury.gov',
    'imf.org', 'worldbank.org', 'bis.org', 'oecd.org'
  ];
  
  // Business sources for business queries
  const businessSources = [
    'hbr.org', 'forbes', 'inc.com', 'entrepreneur.com', 'fastcompany',
    'businessinsider', 'fortune.com', 'mckinsey.com', 'bcg.com', 'bain.com'
  ];
  
  // Tech sources for tech queries
  const techSources = [
    'techcrunch', 'wired', 'cnet', 'theverge', 'arstechnica',
    'zdnet', 'venturebeat', 'engadget', 'gizmodo', 'slashdot'
  ];
  
  // Real estate sources for real estate queries
  const realEstateSources = [
    'zillow', 'redfin', 'realtor.com', 'trulia', 'loopnet',
    'crexi', 'costar', 'nareit.com', 'nar.realtor'
  ];
  
  // Determine query topics
  let queryTopics = [];
  for (const [topic, keywords] of Object.entries(TOPIC_CATEGORIES)) {
    if (keywords.some(keyword => query.includes(keyword))) {
      queryTopics.push(topic);
    }
  }
  
  // If no specific topics detected, return middle score
  if (queryTopics.length === 0) return 0.5;
  
  // Check source type first (most reliable indicator)
  if (sourceType) {
    // Direct matches between source type and query topic
    const sourceTypeLower = sourceType.toLowerCase();
    
    if (queryTopics.includes('FINANCE') && 
        (sourceTypeLower === 'financial_data' || sourceTypeLower === 'financial_news')) {
      return 0.9;
    }
    
    if (queryTopics.includes('BUSINESS') && 
        (sourceTypeLower === 'business_news' || sourceTypeLower === 'business_journal')) {
      return 0.9;
    }
    
    if (queryTopics.includes('TECHNOLOGY') && sourceTypeLower === 'tech_news') {
      return 0.9;
    }
    
    if (queryTopics.includes('REAL_ESTATE') && sourceTypeLower === 'real_estate') {
      return 0.9;
    }
    
    if (queryTopics.includes('CRYPTO') && sourceTypeLower === 'crypto_news') {
      return 0.9;
    }
  }
  
  // Check source domain against specialized sources
  const sourceLower = source.toLowerCase();
  
  if (queryTopics.includes('FINANCE') || queryTopics.includes('ECONOMICS')) {
    if (financialSources.some(s => sourceLower.includes(s))) {
      return 0.85;
    }
  }
  
  if (queryTopics.includes('BUSINESS')) {
    if (businessSources.some(s => sourceLower.includes(s))) {
      return 0.85;
    }
  }
  
  if (queryTopics.includes('TECHNOLOGY')) {
    if (techSources.some(s => sourceLower.includes(s))) {
      return 0.85;
    }
  }
  
  if (queryTopics.includes('REAL_ESTATE')) {
    if (realEstateSources.some(s => sourceLower.includes(s))) {
      return 0.85;
    }
  }
  
  // Default score if no special alignment found
  return 0.5;
};

/**
 * Calculate recency score based on timestamp
 * @param {Date|string} timestamp - The result timestamp
 * @returns {number} - Score between 0-1
 */
const calculateRecencyScore = (timestamp) => {
  const resultDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  
  // Invalid date check
  if (isNaN(resultDate.getTime())) {
    return 0.5; // Default to middle score if date is invalid
  }
  
  // Get the year of the content
  const contentYear = resultDate.getFullYear();
  const currentYear = now.getFullYear();
  
  // PRIORITY: Sources from 2022 or newer get significantly higher scores
  // Current year (2025) content gets maximum score
  if (contentYear === currentYear) return 1.0;
  
  // Last year (2024) content gets very high score
  if (contentYear === currentYear - 1) return 0.9;
  
  // 2023 content gets high score
  if (contentYear === 2023) return 0.8;
  
  // 2022 content gets good score
  if (contentYear === 2022) return 0.7;
  
  // For content older than 2022, calculate based on age in days with a much lower base score
  const ageInDays = (now - resultDate) / (1000 * 60 * 60 * 24);
  
  // 2021 content gets moderate score
  if (contentYear === 2021) return 0.5;
  
  // 2020 content gets lower score
  if (contentYear === 2020) return 0.4;
  
  // 2019 content gets minimal score
  if (contentYear === 2019) return 0.3;
  
  // Content from 2018 or older gets very low score
  return 0.2;
};

/**
 * Calculate content quality score based on various factors
 * @param {Object} result - The search result
 * @param {string} query - The search query
 * @returns {number} - Score between 0-1
 */
const calculateContentQualityScore = (result, query) => {
  let score = 0.5; // Default middle score
  
  // Factor 1: Content length (longer content often has more value, up to a point)
  if (result.content) {
    const contentLength = result.content.length;
    if (contentLength > 5000) score += 0.15;
    else if (contentLength > 2000) score += 0.1;
    else if (contentLength > 1000) score += 0.07;
    else if (contentLength > 500) score += 0.05;
  }
  
  // Factor 2: Source credibility (if available)
  if (result.sourceCredibility) {
    score += result.sourceCredibility * 0.15;
  }
  
  // Factor 3: Has structured data (tables, lists, etc.)
  if (result.hasStructuredData) {
    score += 0.1;
  }
  
  // Factor 4: Contains query-relevant data types
  if (query && result.content) {
    const queryLower = query.toLowerCase();
    const contentLower = result.content.toLowerCase();
    
    // Check for financial data in financial queries
    if (TOPIC_CATEGORIES.FINANCE.some(term => queryLower.includes(term))) {
      // Check for financial data patterns (numbers, percentages, ratios)
      if (/\$\d+|\d+%|\d+\.\d+x|\d+\s*\/\s*\d+/.test(contentLower)) {
        score += 0.1;
      }
    }
    
    // Check for dates/timeline in historical queries
    if (queryLower.includes('history') || queryLower.includes('timeline') || 
        queryLower.includes('trend') || queryLower.includes('over time')) {
      // Check for date patterns
      if (/\b(19|20)\d{2}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4}\b/i.test(contentLower)) {
        score += 0.1;
      }
    }
  }
  
  // Factor 5: Contains images or multimedia
  if (result.hasImages || result.hasMultimedia) {
    score += 0.05;
  }
  
  // Cap at 1.0
  return Math.min(score, 1.0);
};

/**
 * Calculate domain-specific relevance score
 * @param {Object} result - The search result
 * @param {string} query - The search query
 * @param {Object} options - Additional options
 * @returns {number} - Score between 0-1
 */
const calculateDomainRelevanceScore = (result, query, options = {}) => {
  if (!result.source) return 0.5;
  
  const sourceLower = result.source.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  
  // Determine query topics
  const queryTopics = [];
  for (const [topic, keywords] of Object.entries(TOPIC_CATEGORIES)) {
    if (keywords.some(keyword => normalizedQuery.includes(keyword))) {
      queryTopics.push(topic);
    }
  }
  
  // If no specific topics detected, return neutral score
  if (queryTopics.length === 0) return 0.6;
  
  // Check if source is a domain-specific high-value source for any of the detected topics
  let domainScore = 0.5;
  
  for (const topic of queryTopics) {
    const domainSources = DOMAIN_SPECIFIC_SOURCES[topic] || [];
    if (domainSources.some(domain => sourceLower.includes(domain))) {
      domainScore = 0.9; // High score for domain-specific sources
      break;
    }
  }
  
  // Boost for specialized industry sources
  if (result.sourceType === 'industry_publication' || 
      result.sourceType === 'research_institution' ||
      result.sourceType === 'government') {
    domainScore += 0.1;
  }
  
  return Math.min(domainScore, 1.0);
};

/**
 * Apply personalization boost based on user preferences
 * @param {number} score - Base score
 * @param {Object} result - The search result
 * @param {Object} options - Personalization options
 * @returns {number} - Adjusted score
 */
const applyPersonalizationBoost = (score, result, options = {}) => {
  if (!options.userPreferences) return score;
  
  let boostFactor = 1.0;
  const { preferredSources, preferredTopics, preferredAuthors } = options.userPreferences;
  
  // Boost for preferred sources
  if (preferredSources && result.source) {
    const sourceLower = result.source.toLowerCase();
    if (preferredSources.some(source => sourceLower.includes(source.toLowerCase()))) {
      boostFactor += 0.05;
    }
  }
  
  // Boost for preferred topics
  if (preferredTopics && result.topics) {
    const resultTopics = Array.isArray(result.topics) ? result.topics : [result.topics];
    const hasPreferredTopic = resultTopics.some(topic => 
      preferredTopics.some(preferred => preferred.toLowerCase() === topic.toLowerCase())
    );
    
    if (hasPreferredTopic) {
      boostFactor += 0.05;
    }
  }
  
  // Boost for preferred authors
  if (preferredAuthors && result.author) {
    const authorLower = result.author.toLowerCase();
    if (preferredAuthors.some(author => authorLower.includes(author.toLowerCase()))) {
      boostFactor += 0.05;
    }
  }
  
  return Math.min(score * boostFactor, 1.0);
};

export default calculateRelevanceScore;