/**
 * Default category definitions for content categorization
 * 
 * This module provides fallback categories when no other categories are available.
 * If you're seeing only these default categories, it might indicate that:
 * 
 * 1. The API didn't return any categories (check API response)
 * 2. Categories weren't properly passed through the component chain
 * 3. There was an error in dynamic category processing
 * 4. CSS module loading issues are preventing categories from displaying
 * 
 * See /docs/CATEGORY_FLOW.md for the complete category flow documentation.
 * 
 * EMERGENCY DISPLAY SYSTEM:
 * To force display categories bypassing React and CSS modules, use:
 * - window.emergencyCategorySystem.inject() - in console
 * - DefaultCategories.injectIntoGlobalScope() - in code
 */

/**
 * Get default categories for search results
 * @param {string} query The search query to help determine relevant categories
 * @returns {Array} Array of default category objects
 */
export const getDefaultCategories = (query = '') => {
  console.log('Generating default categories as fallback - if this appears when categories should be coming from API, check category flow');
  
  // Generate unique IDs for each category - using consistent IDs for better debugging
  // We now use consistent IDs rather than generating timestamps, which made debugging harder
  const allResultsId = 'all_results';
  const searchResultsId = 'searchResults';
  const keyInsightsId = 'key-insights';
  const marketAnalysisId = 'market-analysis';
  const financialDataId = 'financial-data';
  const companyInfoId = 'company-info';
  const industryTrendsId = 'industry-trends';
  const investmentStrategiesId = 'investment-strategies';
  const economicIndicatorsId = 'economic-indicators';
  const regulatoryInfoId = 'regulatory-info';
  const expertOpinionsId = 'expert-opinions';
  
  console.log(`DefaultCategories: Generating categories for query: "${query}"`);
  
  // Base categories that are always included
  const baseCategories = [
    {
      id: allResultsId,
      name: 'All Results',
      icon: 'search',
      description: 'All search results',
      filter: (item) => true, // Include all items
      priority: 100,
      color: '#4285F4', // Google Blue
      keywords: [],
      keyTerms: ['all', 'results', 'search'],
      metrics: {
        relevance: 0.75,
        accuracy: 0.75,
        credibility: 0.75,
        overall: 0.75
      },
      content: [] // Initialize empty content array
    },
    // Alternative category ID used in some places
    {
      id: searchResultsId,
      name: 'Search Results',
      icon: 'search',
      description: 'All search results',
      filter: (item) => true, // Include all items
      priority: 100,
      color: '#4285F4', // Google Blue
      keywords: [],
      keyTerms: ['all', 'results', 'search'],
      metrics: {
        relevance: 0.75,
        accuracy: 0.75,
        credibility: 0.75,
        overall: 0.75
      },
      content: [] // Initialize empty content array
    },
    {
      id: keyInsightsId,
      name: 'Key Insights',
      icon: 'lightbulb',
      description: 'Most important insights from all sources',
      filter: (item) => true, // Will be filtered by relevance score
      priority: 95,
      color: '#0F9D58', // Google Green
      keywords: ['insight', 'key', 'important', 'highlight', 'summary', 'takeaway', 'conclusion'],
      keyTerms: ['insight', 'key', 'important', 'highlight', 'summary', 'takeaway', 'finding', 'main point'],
      metrics: {
        relevance: 0.95,
        accuracy: 0.90,
        credibility: 0.92,
        overall: 0.92
      },
      content: [] // Initialize empty content array
    }
  ];
  
  // Business-focused categories
  const businessCategories = [
    {
      id: marketAnalysisId,
      name: 'Market Analysis',
      icon: 'chart-line',
      description: 'Market trends, analysis, and forecasts',
      priority: 90,
      color: '#4285F4', // Google Blue
      metrics: {
        relevance: 0.85,
        accuracy: 0.82,
        credibility: 0.84,
        overall: 0.84
      },
      keywords: [
        'market', 'analysis', 'trend', 'forecast', 'growth', 'decline', 
        'market share', 'competition', 'competitive landscape', 'market size',
        'market segment', 'market opportunity', 'market research', 'market data',
        'market report', 'market outlook', 'market dynamics', 'market forces'
      ]
    },
    {
      id: financialDataId,
      name: 'Financial Data',
      icon: 'chart-bar',
      description: 'Financial metrics, reports, and performance data',
      priority: 85,
      color: '#34A853', // Google Green
      metrics: {
        relevance: 0.84,
        accuracy: 0.86,
        credibility: 0.85,
        overall: 0.85
      },
      keywords: [
        'financial', 'finance', 'revenue', 'profit', 'earnings', 'income',
        'balance sheet', 'cash flow', 'statement', 'quarterly', 'annual',
        'fiscal', 'report', 'EPS', 'P/E', 'ROI', 'ROE', 'EBITDA', 'margin',
        'dividend', 'yield', 'debt', 'asset', 'liability', 'equity',
        'valuation', 'market cap', 'stock price', 'shareholder'
      ]
    },
    {
      id: companyInfoId,
      name: 'Company Information',
      icon: 'building',
      description: 'Company profiles, leadership, and operations',
      priority: 80,
      color: '#EA4335', // Google Red
      keywords: [
        'company', 'corporation', 'business', 'enterprise', 'firm', 'organization',
        'CEO', 'executive', 'leadership', 'management', 'board', 'director',
        'founder', 'headquarters', 'HQ', 'location', 'employee', 'workforce',
        'subsidiary', 'parent company', 'acquisition', 'merger', 'history',
        'mission', 'vision', 'values', 'culture', 'strategy', 'operation'
      ]
    },
    {
      id: industryTrendsId,
      name: 'Industry Trends',
      icon: 'industry',
      description: 'Industry-specific trends and developments',
      priority: 75,
      color: '#FBBC05', // Google Yellow
      keywords: [
        'industry', 'sector', 'vertical', 'trend', 'development', 'innovation',
        'disruption', 'transformation', 'shift', 'change', 'evolution',
        'technology', 'advancement', 'adoption', 'standard', 'practice',
        'benchmark', 'best practice', 'emerging', 'established', 'mature',
        'growing', 'declining', 'consolidation', 'fragmentation'
      ]
    },
    {
      id: investmentStrategiesId,
      name: 'Investment Strategies',
      icon: 'money-bill-wave',
      description: 'Investment approaches, strategies, and recommendations',
      priority: 70,
      color: '#4285F4', // Google Blue
      keywords: [
        'investment', 'strategy', 'portfolio', 'allocation', 'diversification',
        'risk', 'return', 'opportunity', 'recommendation', 'advice', 'advisory',
        'fund', 'mutual fund', 'ETF', 'stock', 'bond', 'equity', 'fixed income',
        'asset class', 'alternative', 'hedge fund', 'private equity', 'venture capital',
        'long-term', 'short-term', 'trading', 'buy', 'sell', 'hold', 'overweight',
        'underweight', 'target price', 'upside', 'downside', 'potential'
      ]
    },
    {
      id: economicIndicatorsId,
      name: 'Economic Indicators',
      icon: 'chart-line',
      description: 'Macroeconomic data and indicators',
      priority: 65,
      color: '#34A853', // Google Green
      keywords: [
        'economic', 'economy', 'GDP', 'inflation', 'deflation', 'unemployment',
        'employment', 'job', 'labor', 'wage', 'income', 'consumer', 'spending',
        'retail', 'sales', 'housing', 'real estate', 'construction', 'manufacturing',
        'service', 'trade', 'export', 'import', 'deficit', 'surplus', 'debt',
        'interest rate', 'federal reserve', 'central bank', 'monetary policy',
        'fiscal policy', 'tax', 'budget', 'stimulus', 'recession', 'depression',
        'recovery', 'expansion', 'contraction', 'cycle', 'growth', 'forecast'
      ]
    },
    {
      id: regulatoryInfoId,
      name: 'Regulatory Information',
      icon: 'gavel',
      description: 'Regulatory updates, compliance, and legal information',
      priority: 60,
      color: '#EA4335', // Google Red
      keywords: [
        'regulation', 'regulatory', 'compliance', 'legal', 'law', 'legislation',
        'policy', 'rule', 'standard', 'guideline', 'requirement', 'mandate',
        'SEC', 'FDA', 'EPA', 'FTC', 'FINRA', 'CFTC', 'FDIC', 'OCC', 'Federal',
        'state', 'local', 'international', 'global', 'enforcement', 'penalty',
        'fine', 'sanction', 'investigation', 'audit', 'examination', 'review',
        'approval', 'denial', 'license', 'permit', 'certification', 'accreditation'
      ]
    },
    {
      id: expertOpinionsId,
      name: 'Expert Opinions',
      icon: 'user-tie',
      description: 'Analysis and opinions from industry experts and analysts',
      priority: 55,
      color: '#FBBC05', // Google Yellow
      keywords: [
        'expert', 'analyst', 'opinion', 'analysis', 'perspective', 'view',
        'outlook', 'forecast', 'prediction', 'projection', 'estimate',
        'assessment', 'evaluation', 'judgment', 'commentary', 'insight',
        'research', 'report', 'note', 'recommendation', 'rating', 'upgrade',
        'downgrade', 'initiate', 'coverage', 'target', 'consensus'
      ]
    }
  ];
  
  // Determine which categories to include based on query
  const lowerQuery = query.toLowerCase();
  let categories = [...baseCategories];
  
  // Always include all business categories for now
  // In a more advanced implementation, we could filter based on query relevance
  categories = [...categories, ...businessCategories];
  
  return categories;
};

/**
 * Get categories based on keywords in content
 * @param {string} query The search query
 * @param {Array|Object|string} content Content to analyze for keywords
 * @returns {Array} Array of category objects that match the content
 */
export const getCategoriesByKeywords = (query = '', content = []) => {
  try {
    // Convert query to string if it's not already
    const queryStr = typeof query === 'string' ? query.toLowerCase() : '';
    
    // Convert content to array if it's not already
    const contentArray = Array.isArray(content) ? content : [content];
    
    // Extract text from all content items
    let contentText = '';
    contentArray.forEach(item => {
      if (typeof item === 'string') {
        contentText += ' ' + item.toLowerCase();
      } else if (item && typeof item === 'object') {
        // Extract text from common fields
        const fields = ['title', 'description', 'content', 'text', 'snippet'];
        fields.forEach(field => {
          if (item[field] && typeof item[field] === 'string') {
            contentText += ' ' + item[field].toLowerCase();
          }
        });
      }
    });
    
    // Combine query and content text for matching
    const combinedText = queryStr + ' ' + contentText;
    
    // Get all possible categories
    const allCategories = getDefaultCategories(query);
    
    // Filter to categories whose keywords appear in the content or query
    const matchedCategories = allCategories.filter(category => {
      if (!category.keywords || category.keywords.length === 0) {
        return false; // Skip categories without keywords
      }
      
      // Calculate how many keywords match
      const matchCount = category.keywords.reduce((count, keyword) => {
        return combinedText.includes(keyword.toLowerCase()) ? count + 1 : count;
      }, 0);
      
      // Require at least 2 keyword matches or 10% of keywords to match
      const minMatches = Math.max(2, Math.ceil(category.keywords.length * 0.1));
      return matchCount >= minMatches;
    });
    
    // Always include the base categories (All Results and Key Insights)
    const baseCategories = allCategories.filter(cat => 
      cat.name === 'All Results' || cat.name === 'Key Insights'
    );
    
    // Combine base categories with matched categories, removing duplicates
    const combinedCategories = [...baseCategories];
    
    matchedCategories.forEach(category => {
      if (!combinedCategories.some(cat => cat.id === category.id)) {
        combinedCategories.push(category);
      }
    });
    
    return combinedCategories;
  } catch (error) {
    console.error('Error in getCategoriesByKeywords:', error);
    // Return base categories as fallback
    return getDefaultCategories(query).filter(cat => 
      cat.name === 'All Results' || cat.name === 'Key Insights'
    );
  }
};

/**
 * Get emergency fallback categories that will always render
 * These categories use simplified structure and guarantee display
 * 
 * @param {string} query The search query
 * @returns {Array} Emergency fallback categories
 */
export const getEmergencyCategories = (query = '') => {
  console.log('Generating EMERGENCY categories for query:', query);
  return [
    {
      id: 'key_insights_emergency',
      name: 'Key Insights',
      icon: 'lightbulb',
      description: 'Most important insights from all sources',
      content: [],
      color: '#0F9D58', // Google Green
      metrics: {
        relevance: 0.95,
        accuracy: 0.90,
        credibility: 0.92,
        overall: 0.92
      },
      _source: 'emergency_fallback'
    },
    {
      id: 'all_results_emergency',
      name: 'All Results',
      icon: 'search',
      description: 'All search results',
      content: [],
      color: '#4285F4', // Google Blue
      metrics: {
        relevance: 0.75,
        accuracy: 0.75,
        credibility: 0.75,
        overall: 0.75
      },
      _source: 'emergency_fallback'
    },
    {
      id: 'answers_emergency',
      name: 'Answers',
      icon: 'question_answer',
      description: 'Direct answers to your query',
      content: [],
      color: '#DB4437', // Google Red
      metrics: {
        relevance: 0.85,
        accuracy: 0.82,
        credibility: 0.80,
        overall: 0.82
      },
      _source: 'emergency_fallback'
    }
  ];
};

/**
 * Validate and fix categories to ensure they have all required fields
 * @param {Array} categories Categories to validate
 * @param {string} query The search query
 * @returns {Array} Valid categories or emergency categories if none are valid
 */
export const validateAndFixCategories = (categories, query = '') => {
  // Validate categories is an array
  if (!Array.isArray(categories)) {
    console.error('Categories is not an array, using emergency fallback');
    return getEmergencyCategories(query);
  }
  
  // Validate categories has items
  if (categories.length === 0) {
    console.error('Categories array is empty, using emergency fallback');
    return getEmergencyCategories(query);
  }
  
  // Validate each category has required fields
  const validCategories = categories.filter(cat => {
    if (!cat || typeof cat !== 'object') return false;
    if (!cat.id || !cat.name) return false;
    return true;
  });
  
  // If no valid categories, use emergency fallback
  if (validCategories.length === 0) {
    console.error('No valid categories found, using emergency fallback');
    return getEmergencyCategories(query);
  }
  
  // Fix any categories with missing fields
  return validCategories.map(cat => ({
    id: cat.id || `category-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
    name: cat.name || 'Unnamed Category',
    icon: cat.icon || 'category',
    description: cat.description || `Category for ${cat.name || 'results'}`,
    content: Array.isArray(cat.content) ? cat.content : [],
    color: cat.color || '#4285F4',
    metrics: cat.metrics || {
      relevance: 0.75,
      accuracy: 0.75,
      credibility: 0.75,
      overall: 0.75
    },
    _source: cat._source || 'fixed_by_validation'
  }));
};

/**
 * Inject categories into the global scope for emergency access
 * @param {Array} categories Categories to inject
 * @param {string} query The search query
 * @returns {Array} The injected categories
 */
export const injectIntoGlobalScope = (categories, query = '') => {
  if (typeof window === 'undefined') return;
  
  // Validate and fix categories
  const validatedCategories = validateAndFixCategories(categories, query);
  
  // Store in multiple locations for redundancy
  window.__apiDirectCategories = validatedCategories;
  window.__lastAPICategories = validatedCategories;
  window.__allCategories = validatedCategories;
  window.__lastCategoriesReceived = validatedCategories;
  window.__processedCategories = validatedCategories;
  window.__intelligentSearchCategories = validatedCategories;
  window.__globalCategoryStorage = validatedCategories;
  
  console.log(`✅ Injected ${validatedCategories.length} categories into global scope`);
  
  // Attempt to trigger any listeners
  if (typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('categoriesInjected', {
      detail: { categories: validatedCategories, query }
    }));
  }
  
  return validatedCategories;
};

// Add emergency category methods to global namespace for console access
if (typeof window !== 'undefined') {
  // First, see if we have previously defined categories
  const existingCategories = 
    window.__globalCategoryStorage || 
    window.__lastCategoriesReceived || 
    window.__allCategories;
    
  // Export methods to window for direct console access
  window.DefaultCategories = {
    getDefaultCategories,
    getCategoriesByKeywords,
    getEmergencyCategories,
    validateAndFixCategories,
    injectIntoGlobalScope,
    // Add utility method for forcing category display from console
    forceDisplay: () => {
      // Get categories from any available source
      const categories = 
        existingCategories || 
        getEmergencyCategories();
      
      // Inject into global scope
      injectIntoGlobalScope(categories);
      
      // Try to trigger emergency display
      if (window.emergencyCategorySystem && typeof window.emergencyCategorySystem.inject === 'function') {
        window.emergencyCategorySystem.inject();
      }
      
      console.log('Forced category display with', categories.length, 'categories');
      return categories;
    }
  };
  
  // Initialize emergency categories if none exist
  if (!existingCategories) {
    const emergencyCategories = getEmergencyCategories();
    injectIntoGlobalScope(emergencyCategories);
    console.log('Initialized emergency categories as none were found');
  }
}
