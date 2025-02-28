/**
 * Default category definitions for content categorization
 */

/**
 * Get default categories for search results
 * @param {string} query The search query to help determine relevant categories
 * @returns {Array} Array of default category objects
 */
export const getDefaultCategories = (query = '') => {
  // Generate unique IDs for each category
  const allResultsId = 'cat_all_' + Date.now();
  const keyInsightsId = 'key_insights';
  const marketAnalysisId = 'market_analysis';
  const financialDataId = 'financial_data';
  const companyInfoId = 'company_info';
  const industryTrendsId = 'industry_trends';
  const investmentStrategiesId = 'investment_strategies';
  const economicIndicatorsId = 'economic_indicators';
  const regulatoryInfoId = 'regulatory_info';
  const expertOpinionsId = 'expert_opinions';
  
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
      keywords: []
    },
    {
      id: keyInsightsId,
      name: 'Key Insights',
      icon: 'lightbulb',
      description: 'Most important insights from all sources',
      filter: (item) => true, // Will be filtered by relevance score
      priority: 95,
      color: '#0F9D58', // Google Green
      keywords: ['insight', 'key', 'important', 'highlight', 'summary', 'takeaway', 'conclusion']
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
