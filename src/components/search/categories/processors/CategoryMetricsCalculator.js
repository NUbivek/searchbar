/**
 * Calculates metrics for category evaluation
 * Provides methods to assess relevance, credibility, and accuracy
 */

/**
 * Constants for metrics calculation
 */
const RELEVANCE_WEIGHT = 2.0; // Relevance has 2x weight in final scoring
const CREDIBILITY_WEIGHT = 1.0;
const ACCURACY_WEIGHT = 1.0;
const MIN_THRESHOLD = 70; // Minimum score threshold for categories

/**
 * Calculate relevance score for content relative to query
 * @param {string} content Content text
 * @param {string} query Search query
 * @param {Object} options Additional options
 * @returns {number} Relevance score (0-100)
 */
export const calculateRelevanceScore = (content, query = '', options = {}) => {
  if (!content || typeof content !== 'string') return 0;
  
  const debug = options.debug || false;
  
  // Base relevance starts at 50
  let relevanceScore = 50;
  
  // If no query, just use baseline relevance
  if (!query) return relevanceScore;
  
  const contentLower = content.toLowerCase();
  const queryTerms = query.toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 2);
  
  if (queryTerms.length === 0) return relevanceScore;
  
  // Calculate term frequency
  let matchCount = 0;
  queryTerms.forEach(term => {
    if (contentLower.includes(term)) {
      matchCount++;
      
      // Bonus for term appearing in first paragraph (more relevant content typically starts with key terms)
      const firstParagraph = content.split('\n')[0].toLowerCase();
      if (firstParagraph.includes(term)) {
        relevanceScore += 5;
      }
    }
  });
  
  // Calculate percentage of query terms matched
  const termMatchPercentage = (matchCount / queryTerms.length) * 100;
  
  // Adjust relevance based on term matches
  relevanceScore += termMatchPercentage * 0.5;
  
  // Consider content recency if available (simplified version)
  if (options.contentDate) {
    const contentDate = new Date(options.contentDate);
    const now = new Date();
    const ageInDays = (now - contentDate) / (1000 * 60 * 60 * 24);
    
    // More recent content gets higher relevance
    if (ageInDays < 30) {  // Less than a month old
      relevanceScore += 10;
    } else if (ageInDays < 90) {  // Less than 3 months old
      relevanceScore += 5;
    } else if (ageInDays < 365) {  // Less than a year old
      relevanceScore += 2;
    }
  }
  
  // Check for exact phrase match (significant relevance indicator)
  if (contentLower.includes(query.toLowerCase())) {
    relevanceScore += 15;
  }
  
  // Cap at 100
  relevanceScore = Math.min(relevanceScore, 100);
  
  if (debug) {
    console.log('Relevance calculation:', {
      query,
      matchCount,
      termMatchPercentage,
      finalScore: relevanceScore
    });
  }
  
  return relevanceScore;
};

/**
 * Calculate credibility score for content based on sources
 * @param {Array} sources Source information
 * @param {Object} options Additional options
 * @returns {number} Credibility score (0-100)
 */
export const calculateCredibilityScore = (sources = [], options = {}) => {
  const debug = options.debug || false;
  
  // Default credibility if no sources
  if (!sources || sources.length === 0) return 75;
  
  let credibilityScore = 75; // Start with reasonable baseline
  
  // Factor 1: Number of sources (more sources typically means more credible)
  if (sources.length > 1) {
    credibilityScore += Math.min(sources.length * 2, 10); // Up to +10 for multiple sources
  }
  
  // Factor 2: Source diversity (different domains = more credible)
  const domains = new Set();
  sources.forEach(source => {
    if (source.url) {
      try {
        const domain = new URL(source.url).hostname;
        domains.add(domain);
      } catch (error) {
        // Invalid URL, ignore
      }
    }
  });
  
  if (domains.size > 1) {
    credibilityScore += Math.min(domains.size * 2, 10); // Up to +10 for diverse sources
  }
  
  // Cap at 100
  credibilityScore = Math.min(credibilityScore, 100);
  
  if (debug) {
    console.log('Credibility calculation:', {
      sourceCount: sources.length,
      uniqueDomains: domains.size,
      finalScore: credibilityScore
    });
  }
  
  return credibilityScore;
};

/**
 * Calculate accuracy score for content
 * @param {string} content Content to evaluate
 * @param {Array} sources Sources used
 * @param {Object} options Additional options
 * @returns {number} Accuracy score (0-100)
 */
export const calculateAccuracyScore = (content, sources = [], options = {}) => {
  const debug = options.debug || false;
  
  // Default accuracy if no content
  if (!content || typeof content !== 'string') return 75;
  
  let accuracyScore = 75; // Start with reasonable baseline
  
  // Factor 1: Presence of numerical data (often indicates factual content)
  const numericMatches = content.match(/\d+(\.\d+)?%?/g) || [];
  if (numericMatches.length > 0) {
    accuracyScore += Math.min(numericMatches.length, 10); // Up to +10 for numeric content
  }
  
  // Factor 2: Citation patterns
  const hasCitations = /\(\d{4}\)|\[\d+\]|(\s(et al\.|et\. al\.)|(\d{4},\s)|(\d{4}))/.test(content);
  if (hasCitations) {
    accuracyScore += 5; // +5 for having citations
  }
  
  // Factor 3: Factual language patterns
  const factualPatterns = [
    'according to', 'study shows', 'research indicates', 'data suggests',
    'report finds', 'analysis shows', 'statistics show', 'evidence suggests',
    'survey results', 'findings indicate'
  ];
  
  let factualMatchCount = 0;
  factualPatterns.forEach(pattern => {
    if (content.toLowerCase().includes(pattern)) {
      factualMatchCount++;
    }
  });
  
  accuracyScore += Math.min(factualMatchCount * 2, 10); // Up to +10 for factual language
  
  // Cap at 100
  accuracyScore = Math.min(accuracyScore, 100);
  
  if (debug) {
    console.log('Accuracy calculation:', {
      numericDataCount: numericMatches.length,
      hasCitations,
      factualPhraseCount: factualMatchCount,
      finalScore: accuracyScore
    });
  }
  
  return accuracyScore;
};

/**
 * Calculate combined score with appropriate weighting
 * @param {number} relevanceScore Relevance score (0-100)
 * @param {number} credibilityScore Credibility score (0-100)
 * @param {number} accuracyScore Accuracy score (0-100)
 * @returns {number} Combined weighted score (0-100)
 */
export const calculateCombinedScore = (relevanceScore, credibilityScore, accuracyScore) => {
  const totalWeight = RELEVANCE_WEIGHT + CREDIBILITY_WEIGHT + ACCURACY_WEIGHT;
  
  const weightedScore = (
    (relevanceScore * RELEVANCE_WEIGHT) +
    (credibilityScore * CREDIBILITY_WEIGHT) +
    (accuracyScore * ACCURACY_WEIGHT)
  ) / totalWeight;
  
  return weightedScore;
};

/**
 * Check if a category meets minimum threshold requirements
 * @param {number} relevanceScore Relevance score
 * @param {number} credibilityScore Credibility score
 * @param {number} accuracyScore Accuracy score  
 * @param {number} threshold Minimum threshold (default: 70)
 * @returns {boolean} True if category meets threshold
 */
export const meetsThreshold = (
  relevanceScore, 
  credibilityScore, 
  accuracyScore, 
  threshold = MIN_THRESHOLD
) => {
  return (
    relevanceScore >= threshold &&
    credibilityScore >= threshold &&
    accuracyScore >= threshold
  );
};

/**
 * Calculate all metrics for a category
 * @param {Object} category The category to evaluate
 * @param {string} query The search query
 * @param {Object} options Additional options
 * @returns {Object} Metrics for the category
 */
export const calculateCategoryMetrics = (category, query, options = {}) => {
  const content = typeof category.content === 'string' ? 
    category.content : 
    (Array.isArray(category.content) ? category.content.join('\n\n') : '');
    
  const sources = category.sources || [];
    
  // Calculate individual metrics
  const relevanceScore = calculateRelevanceScore(content, query, options);
  const credibilityScore = calculateCredibilityScore(sources, options);
  const accuracyScore = calculateAccuracyScore(content, sources, options);
  
  // Calculate combined score
  const finalScore = calculateCombinedScore(relevanceScore, credibilityScore, accuracyScore);
  
  // Determine if it passes threshold
  const passesThreshold = meetsThreshold(relevanceScore, credibilityScore, accuracyScore);
  
  return {
    relevanceScore,
    credibilityScore,
    accuracyScore,
    finalScore,
    passesThreshold
  };
};

export default {
  calculateRelevanceScore,
  calculateCredibilityScore,
  calculateAccuracyScore,
  calculateCombinedScore,
  calculateCategoryMetrics,
  meetsThreshold,
  RELEVANCE_WEIGHT,
  CREDIBILITY_WEIGHT,
  ACCURACY_WEIGHT,
  MIN_THRESHOLD
};
