// CategoryFinder.js
// Defines categories and their properties for the search results

export const CATEGORY_COLORS = {
  KEY_INSIGHTS: '#673AB7',
  MARKET_OVERVIEW: '#4285F4',
  FINANCIAL_OVERVIEW: '#F4B400',
  BUSINESS_STRATEGY: '#0F9D58',
  INDUSTRY_INSIGHTS: '#DB4437',
};

export const CATEGORIES = {
  KEY_INSIGHTS: {
    id: 'key_insights',
    name: 'Key Insights',
    priority: 0,
    color: CATEGORY_COLORS.KEY_INSIGHTS,
    keywords: ['key', 'important', 'critical', 'essential', 'significant'],
    isSpecial: true,
  },
  MARKET_OVERVIEW: {
    id: 'market_overview',
    name: 'Market Overview',
    priority: 1,
    color: CATEGORY_COLORS.MARKET_OVERVIEW,
    keywords: ['market', 'industry', 'sector', 'landscape', 'overview', 'trends'],
  },
  // ... Add all other categories as defined in requirements
};

const RELEVANCE_WEIGHT = 2.0;
const MIN_THRESHOLD = 70;
const FALLBACK_THRESHOLD = 65;

export function findBestCategories(content, query, sources) {
  const scores = calculateCategoryScores(content, query, sources);
  const filteredScores = filterCategoriesByThreshold(scores);
  return selectTopCategories(filteredScores);
}

function calculateCategoryScores(content, query, sources) {
  return Object.entries(CATEGORIES).map(([id, category]) => {
    const relevance = calculateRelevanceScore(content, query, category);
    const credibility = calculateCredibilityScore(sources, category);
    const accuracy = calculateAccuracyScore(content, sources, category);
    
    const weightedScore = (relevance * RELEVANCE_WEIGHT + credibility + accuracy) / (2 + RELEVANCE_WEIGHT);
    
    return {
      id,
      category,
      scores: { relevance, credibility, accuracy },
      weightedScore,
    };
  });
}

function calculateRelevanceScore(content, query, category) {
  // Implement relevance scoring based on:
  // - Keyword matching
  // - Semantic similarity
  // - Content freshness
  // Return score between 0-100
  return 0; // Placeholder
}

function calculateCredibilityScore(sources, category) {
  // Implement credibility scoring based on:
  // - Source reputation
  // - Source diversity
  // - Source verification status
  // Return score between 0-100
  return 0; // Placeholder
}

function calculateAccuracyScore(content, sources, category) {
  // Implement accuracy scoring based on:
  // - Data consistency
  // - Numerical precision
  // - Source agreement
  // Return score between 0-100
  return 0; // Placeholder
}

function filterCategoriesByThreshold(scores) {
  const threshold = scores.length < 3 ? FALLBACK_THRESHOLD : MIN_THRESHOLD;
  return scores.filter(score => 
    Object.values(score.scores).every(value => value >= threshold)
  );
}

function selectTopCategories(scores) {
  // Always include Key Insights if it meets threshold
  const keyInsights = scores.find(s => s.category.isSpecial);
  const otherCategories = scores
    .filter(s => !s.category.isSpecial)
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .slice(0, 5);

  return keyInsights ? [keyInsights, ...otherCategories] : otherCategories;
}
