/**
 * CategoryFinder.js
 * 
 * Defines all categories with their properties and implements category matching functionality.
 */

import calculateRelevanceScore from '../metrics/calculators/RelevanceCalculator';
import { calculateAccuracy } from '../metrics/calculators/AccuracyCalculator';
import { calculateCredibility } from '../metrics/calculators/CredibilityCalculator';

// Define all categories with their properties
const CATEGORIES = {
  // Special Categories
  keyInsights: {
    id: 'keyInsights',
    name: 'Key Insights',
    description: 'Essential information and key takeaways',
    icon: 'fas fa-lightbulb',
    color: '#673AB7', // Purple
    priority: 0, // Highest priority
    keywords: ['key', 'insight', 'takeaway', 'highlight', 'important', 'essential', 'critical', 'crucial', 'significant', 'notable'],
  },
  
  // Investment Category - Added for investment trends queries
  investmentTrends: {
    id: 'investmentTrends',
    name: 'Investment Trends',
    description: 'Future investment opportunities and market trends',
    icon: 'fas fa-chart-line',
    color: '#2196F3', // Blue
    priority: 0, // Highest priority
    keywords: ['investment', 'invest', 'trend', 'trends', 'future', 'forecast', 'prediction', 'outlook', 
               'opportunity', 'growth', 'emerging', 'ai investment', 'tech investment', '2025', 'market trend',
               'venture capital', 'startup', 'funding', 'investor', 'roi', 'return', 'portfolio', 'asset allocation'],
  },
  
  // Broad Categories (For fallback)
  marketOverview: {
    id: 'marketOverview',
    name: 'Market Overview',
    description: 'General information about the market landscape',
    icon: 'fas fa-chart-line',
    color: '#4285F4', // Blue
    priority: 1,
    keywords: ['market', 'industry', 'sector', 'landscape', 'overview', 'trends', 'segment', 'vertical'],
  },
  
  financialOverview: {
    id: 'financialOverview',
    name: 'Financial Overview',
    description: 'Financial information and metrics',
    icon: 'fas fa-dollar-sign',
    color: '#F4B400', // Yellow
    priority: 1,
    keywords: ['financial', 'finance', 'money', 'capital', 'funding', 'investment', 'revenue', 'profit', 'cost', 'expense', 'budget', 'cash', 'flow'],
  },
  
  businessStrategy: {
    id: 'businessStrategy',
    name: 'Business Strategy',
    description: 'Business models and strategic approaches',
    icon: 'fas fa-chess',
    color: '#0F9D58', // Green
    priority: 1,
    keywords: ['strategy', 'business model', 'approach', 'plan', 'roadmap', 'vision', 'mission', 'goal', 'objective', 'tactic'],
  },
  
  industryInsights: {
    id: 'industryInsights',
    name: 'Industry Insights',
    description: 'Specific insights about the industry',
    icon: 'fas fa-industry',
    color: '#DB4437', // Red
    priority: 1,
    keywords: ['industry', 'sector', 'vertical', 'market segment', 'niche', 'specialization'],
  },
  
  // Specific Categories
  marketIntelligence: {
    id: 'marketIntelligence',
    name: 'Market Intelligence',
    description: 'Detailed market analysis and competitive dynamics',
    icon: 'fas fa-binoculars',
    color: '#3F51B5', // Indigo
    priority: 2,
    keywords: ['industry trends', 'disruption', 'competitive dynamics', 'market positioning', 'market share', 'market analysis', 'competitive landscape', 'market intelligence'],
  },
  
  growthStrategy: {
    id: 'growthStrategy',
    name: 'Growth Strategy',
    description: 'Strategies for growth and expansion',
    icon: 'fas fa-rocket',
    color: '#009688', // Teal
    priority: 2,
    keywords: ['TAM', 'market segmentation', 'customer acquisition', 'retention', 'growth levers', 'expansion', 'scaling', 'market penetration', 'user growth'],
  },
  
  investmentStrategy: {
    id: 'investmentStrategy',
    name: 'Investment Strategy',
    description: 'Investment approaches and portfolio management',
    icon: 'fas fa-hand-holding-usd',
    color: '#795548', // Brown
    priority: 2,
    keywords: ['value creation', 'strategic investment', 'portfolio construction', 'risk-adjusted return', 'investment thesis', 'capital allocation', 'asset allocation', 'diversification'],
  },
  
  financialPerformance: {
    id: 'financialPerformance',
    name: 'Financial Performance',
    description: 'Financial metrics and performance indicators',
    icon: 'fas fa-chart-bar',
    color: '#FFC107', // Amber
    priority: 2,
    keywords: ['revenue', 'unit economics', 'cost structure', 'cash flow', 'profitability', 'margin', 'EBITDA', 'income', 'balance sheet', 'P&L', 'profit and loss', 'financial statement'],
  },
  
  valuationBenchmarking: {
    id: 'valuationBenchmarking',
    name: 'Valuation & Benchmarking',
    description: 'Valuation methodologies and comparative benchmarks',
    icon: 'fas fa-balance-scale',
    color: '#9C27B0', // Purple
    priority: 2,
    keywords: ['DCF', 'comparables', 'multiples', 'benchmarks', 'Rule of 40', 'CAC/LTV', 'valuation', 'worth', 'value', 'price', 'comparable', 'peer', 'competitor'],
  },
  
  exitLiquidity: {
    id: 'exitLiquidity',
    name: 'Exit & Liquidity',
    description: 'Exit strategies and liquidity events',
    icon: 'fas fa-door-open',
    color: '#E91E63', // Pink
    priority: 2,
    keywords: ['M&A', 'exit pathways', 'strategic buyer', 'IPO readiness', 'secondary transactions', 'acquisition', 'merger', 'public offering', 'liquidity event', 'exit strategy'],
  },
  
  maConsolidation: {
    id: 'maConsolidation',
    name: 'M&A & Consolidation',
    description: 'Mergers, acquisitions, and industry consolidation',
    icon: 'fas fa-handshake',
    color: '#FF5722', // Deep Orange
    priority: 2,
    keywords: ['fragmentation', 'roll-up', 'consolidation', 'deal structures', 'synergy', 'merger', 'acquisition', 'takeover', 'buyout', 'integration'],
  },
  
  technologyDigital: {
    id: 'technologyDigital',
    name: 'Technology & Digital',
    description: 'Technology infrastructure and digital transformation',
    icon: 'fas fa-microchip',
    color: '#00BCD4', // Cyan
    priority: 2,
    keywords: ['AI', 'automation', 'digitization', 'data-driven', 'analytics', 'infrastructure', 'technology stack', 'digital transformation', 'software', 'hardware', 'cloud', 'platform'],
  },
  
  operationalEfficiency: {
    id: 'operationalEfficiency',
    name: 'Operational Efficiency',
    description: 'Operational improvements and efficiency gains',
    icon: 'fas fa-cogs',
    color: '#607D8B', // Blue Grey
    priority: 2,
    keywords: ['cost optimization', 'margin expansion', 'scalability', 'execution', 'supply chain', 'operations', 'efficiency', 'productivity', 'process improvement', 'streamlining'],
  },
  
  dataStrategy: {
    id: 'dataStrategy',
    name: 'Data Strategy',
    description: 'Data management, governance, and monetization',
    icon: 'fas fa-database',
    color: '#2196F3', // Blue
    priority: 2,
    keywords: ['data governance', 'interoperability', 'infrastructure', 'monetization', 'AI', 'data management', 'data architecture', 'data pipeline', 'data lake', 'data warehouse'],
  },
  
  platformEconomics: {
    id: 'platformEconomics',
    name: 'Platform Economics',
    description: 'Platform business models and network effects',
    icon: 'fas fa-sitemap',
    color: '#FF9800', // Orange
    priority: 2,
    keywords: ['network effects', 'virality', 'defensibility', 'partnerships', 'value chain', 'platform', 'ecosystem', 'marketplace', 'two-sided market', 'multi-sided platform'],
  },
  
  customerMarket: {
    id: 'customerMarket',
    name: 'Customer & Market',
    description: 'Customer engagement and market positioning',
    icon: 'fas fa-users',
    color: '#8BC34A', // Light Green
    priority: 2,
    keywords: ['brand strategy', 'customer engagement', 'differentiation', 'pricing', 'market share', 'customer experience', 'user experience', 'customer journey', 'customer satisfaction'],
  },
  
  riskCompliance: {
    id: 'riskCompliance',
    name: 'Risk & Compliance',
    description: 'Risk management and regulatory compliance',
    icon: 'fas fa-shield-alt',
    color: '#F44336', // Red
    priority: 2,
    keywords: ['regulatory', 'compliance', 'downside protection', 'risk hedging', 'governance', 'risk management', 'security', 'safety', 'protection', 'mitigation'],
  },
  
  sustainabilityESG: {
    id: 'sustainabilityESG',
    name: 'Sustainability & ESG',
    description: 'Environmental, social, and governance factors',
    icon: 'fas fa-leaf',
    color: '#4CAF50', // Green
    priority: 2,
    keywords: ['ESG compliance', 'reporting', 'stakeholder', 'sustainability', 'impact investing', 'environmental', 'social', 'governance', 'corporate responsibility', 'sustainable'],
  },
  
  capitalMarkets: {
    id: 'capitalMarkets',
    name: 'Capital Markets',
    description: 'Fundraising and capital market activities',
    icon: 'fas fa-university',
    color: '#9E9E9E', // Grey
    priority: 2,
    keywords: ['fundraising', 'investor targeting', 'financing', 'debt', 'equity', 'leverage', 'capital markets', 'public markets', 'private markets', 'venture capital', 'private equity'],
  },
  
  economicTrends: {
    id: 'economicTrends',
    name: 'Economic Trends',
    description: 'Macroeconomic factors and business cycles',
    icon: 'fas fa-globe',
    color: '#CDDC39', // Lime
    priority: 2,
    keywords: ['macroeconomic', 'business cycle', 'interest rate', 'inflation', 'economic environment', 'GDP', 'recession', 'expansion', 'monetary policy', 'fiscal policy'],
  },
  
  performanceMetrics: {
    id: 'performanceMetrics',
    name: 'Performance Metrics',
    description: 'Key performance indicators and metrics',
    icon: 'fas fa-tachometer-alt',
    color: '#FF4081', // Pink A200
    priority: 2,
    keywords: ['KPIs', 'IRR', 'MOIC', 'J-curve', 'capital deployment', 'attribution analysis', 'performance indicators', 'metrics', 'measurement', 'benchmarking'],
  },
  
  competitiveAdvantage: {
    id: 'competitiveAdvantage',
    name: 'Competitive Advantage',
    description: 'Competitive moats and market positioning',
    icon: 'fas fa-trophy',
    color: '#FFD600', // Yellow A700
    priority: 2,
    keywords: ['moats', 'barriers to entry', 'first-mover', 'unique selling proposition', 'category leadership', 'competitive advantage', 'differentiation', 'positioning', 'value proposition'],
  },
};

/**
 * CategoryFinder class for categorizing search results
 */
class CategoryFinder {
  constructor() {
    this.CATEGORIES = CATEGORIES;
  }

  /**
   * Finds the best category for a given content item
   * @param {Object} item - The content item to categorize
   * @param {string} query - The search query
   * @param {Array} sources - The sources associated with the content
   * @returns {Object} The best matching category with scores
   */
  findBestCategory(item, query, sources = []) {
    const matches = this.findMatchingCategories(item, query, sources);
    
    if (!matches || matches.length === 0) {
      return null;
    }
    
    // Check if it's a business query
    const isBusinessQuery = this.isBusinessQuery(query);
    
    // Apply business boost if applicable
    const adjustedMatches = matches.map(match => {
      let { category, score } = match;
      
      // Boost business categories for business queries
      if (isBusinessQuery && this.isBusinessCategory(category)) {
        score = Math.min(0.95, score * 1.2); // 20% boost but cap at 0.95
      }
      
      return { category, score };
    });
    
    // Sort by score and return the best match
    adjustedMatches.sort((a, b) => b.score - a.score);
    return adjustedMatches[0];
  }

  /**
   * Check if a query is business-related
   * @param {string} query - Search query
   * @returns {boolean} - True if business-related query
   */
  isBusinessQuery(query) {
    if (!query || typeof query !== 'string') return false;
    
    const businessTerms = [
      'business', 'company', 'market', 'stock', 'investment', 'investor',
      'finance', 'financial', 'economy', 'economic', 'industry', 'sector',
      'revenue', 'profit', 'earnings', 'growth', 'strategy', 'startup',
      'entrepreneur', 'valuation', 'acquisition', 'merger', 'IPO', 'CEO',
      'CFO', 'COO', 'executive', 'leadership', 'board', 'shareholder',
      'dividend', 'forecast', 'trend', 'analysis', 'report', 'quarterly',
      'fiscal', 'capital', 'funding', 'venture', 'private equity', 'portfolio',
      'asset', 'liability', 'balance sheet', 'income statement', 'cash flow',
      'debt', 'equity', 'credit', 'loan', 'interest rate', 'inflation'
    ];
    
    const queryLower = query.toLowerCase();
    
    return businessTerms.some(term => queryLower.includes(term.toLowerCase()));
  }

  /**
   * Check if a category is business-related
   * @param {Object} category - Category object
   * @returns {boolean} - True if business-related category
   */
  isBusinessCategory(category) {
    if (!category) return false;
    
    const businessCategories = [
      'business', 'finance', 'investing', 'markets', 'economy',
      'entrepreneurship', 'management', 'leadership', 'strategy'
    ];
    
    // Check if category id or name contains business terms
    return businessCategories.some(term => 
      (category.id && category.id.toLowerCase().includes(term)) ||
      (category.name && category.name.toLowerCase().includes(term))
    );
  }

  /**
   * Finds all matching categories for a content item that meet the threshold
   * @param {Object} item - The content item to categorize
   * @param {string} query - The search query
   * @param {Array} sources - The sources associated with the content
   * @param {number} threshold - The minimum score threshold (0-1)
   * @returns {Array} All matching categories with scores that meet the threshold
   */
  findMatchingCategories(item, query, sources = [], threshold = 0.5) {
    if (!item || !this.categories || this.categories.length === 0) {
      return [];
    }
    
    // Extract text content from the item for analysis
    const content = this.extractContent(item);
    if (!content) return [];
    
    // Detect if this is a business query
    const isBusinessQuery = this.isBusinessQuery(query);
    
    // Adjust the threshold based on item verification status
    let effectiveThreshold = threshold;
    
    // For verified sources, use a very low threshold (10%)
    if (item.isVerified) {
      effectiveThreshold = 0.1;
    } 
    // For business queries, lower the threshold slightly
    else if (isBusinessQuery) {
      effectiveThreshold = Math.max(0.3, threshold - 0.05);
    }
    
    // Calculate scores for each category
    const matches = this.categories.map(category => {
      const score = this.calculateCategoryScore(category, content, query, sources);
      
      // Apply business category boost if applicable
      let adjustedScore = score;
      if (isBusinessQuery && this.isBusinessCategory(category)) {
        adjustedScore = Math.min(0.95, score * 1.15); // 15% boost
      }
      
      // Apply verified source boost if applicable
      if (item.isVerified) {
        adjustedScore = Math.min(0.95, adjustedScore * 1.2); // 20% boost for verified sources
      }
      
      return { category, score: adjustedScore };
    });
    
    // Filter by threshold and sort by score
    return matches
      .filter(match => match.score >= effectiveThreshold)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate a match score between a category and content
   * @param {Object} category - Category to match against
   * @param {string} content - Content text
   * @param {string} query - Search query
   * @param {Array} sources - Data sources
   * @returns {number} - Match score (0-1)
   */
  calculateCategoryScore(category, content, query, sources) {
    if (!category || !content) return 0;
    
    let score = 0;
    const contentLower = content.toLowerCase();
    const queryLower = query?.toLowerCase() || '';
    
    // 1. Check primary keywords (most important)
    if (category.primaryKeywords && category.primaryKeywords.length > 0) {
      const primaryMatches = category.primaryKeywords.filter(keyword => 
        contentLower.includes(keyword.toLowerCase())
      );
      
      // Calculate primary keyword score (up to 60% of total)
      if (primaryMatches.length > 0) {
        const keywordMatchScore = Math.min(1, primaryMatches.length / Math.min(5, category.primaryKeywords.length));
        score += keywordMatchScore * 0.6;
      }
    }
    
    // 2. Check secondary keywords (less important)
    if (category.secondaryKeywords && category.secondaryKeywords.length > 0) {
      const secondaryMatches = category.secondaryKeywords.filter(keyword => 
        contentLower.includes(keyword.toLowerCase())
      );
      
      // Calculate secondary keyword score (up to 25% of total)
      if (secondaryMatches.length > 0) {
        const keywordMatchScore = Math.min(1, secondaryMatches.length / Math.min(8, category.secondaryKeywords.length));
        score += keywordMatchScore * 0.25;
      }
    }
    
    // 3. Check if query directly relates to category (up to 15% of total)
    if (query && category.queryTerms && category.queryTerms.length > 0) {
      const queryMatches = category.queryTerms.filter(term => 
        queryLower.includes(term.toLowerCase())
      );
      
      if (queryMatches.length > 0) {
        const queryMatchScore = Math.min(1, queryMatches.length / category.queryTerms.length);
        score += queryMatchScore * 0.15;
      }
    }
    
    // 4. Apply contextual modifiers
    
    // Business content boost
    if (this.isBusinessQuery(query) && this.isBusinessCategory(category)) {
      score = Math.min(0.95, score * 1.1); // Apply 10% boost for business categories
    }
    
    // Recent content boost (if timestamp available)
    if (item && item.timestamp) {
      const now = Date.now();
      const ageInDays = (now - new Date(item.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      
      if (ageInDays < 7) {
        // Recency boost for content less than a week old
        score = Math.min(0.95, score * 1.05);
      }
    }
    
    return score;
  }

  /**
   * Calculate a match score between text and keywords
   * @param {string} text - Text to analyze
   * @param {Array} keywords - Keywords to match against
   * @returns {number} - Match score (0-1)
   */
  calculateKeywordMatchScore(text, keywords) {
    if (!text || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return 0;
    }
    
    const textLower = text.toLowerCase();
    let matches = 0;
    
    // Count how many keywords match in the text
    for (const keyword of keywords) {
      if (keyword && textLower.includes(keyword.toLowerCase())) {
        matches++;
      }
    }
    
    // Calculate score as percentage of matched keywords
    // Cap at 1.0 for a perfect score
    return Math.min(1.0, matches / Math.min(keywords.length, 10));
  }

  /**
   * Finds all matching categories for a content item that meet the threshold
   * @param {Object} item - The content item to categorize
   * @param {string} query - The search query
   * @param {Array} sources - The sources associated with the content
   * @param {number} threshold - The minimum score threshold (0-1)
   * @returns {Array} All matching categories with scores that meet the threshold
   */
  findMatchingCategories(item, query, sources = [], threshold = 0.5) {
    // Skip if item is invalid
    if (!item || typeof item !== 'object') {
      return [];
    }
    
    // Extract text from the item for analysis
    const text = this.extractTextFromItem(item);
    
    if (!text || text.trim().length === 0) {
      return [];
    }
    
    // Find all matching categories
    const matches = [];
    
    // Calculate match score for each category
    Object.values(CATEGORIES).forEach(category => {
      // Calculate keyword match score
      const keywordScore = this.calculateKeywordMatchScore(text, category.keywords);
      
      // Only consider categories with a minimum keyword score
      if (keywordScore > 0.2) {
        // Calculate relevance score
        const relevanceScore = calculateRelevanceScore(text, query);
        
        // Calculate accuracy score
        const accuracyScore = calculateAccuracy(text);
        
        // Calculate credibility score
        const credibilityScore = calculateCredibility(item, sources);
        
        // Calculate combined score (weighted average)
        const combinedScore = (keywordScore * 0.5) + (relevanceScore * 0.3) + (accuracyScore * 0.1) + (credibilityScore * 0.1);
        
        matches.push({
          category,
          score: combinedScore
        });
      }
    });
    
    // Sort matches by score (descending)
    matches.sort((a, b) => b.score - a.score);
    
    // Filter by threshold
    return matches.filter(match => match.score >= threshold);
  }

  /**
   * Finds the best category for a given content item
   * @param {Object} item - The content item to categorize
   * @param {string} query - The search query
   * @param {Array} sources - The sources associated with the content
   * @returns {Object} The best matching category with scores
   */
  findBestCategory(item, query, sources = []) {
    // Skip if item is invalid
    if (!item || typeof item !== 'object') {
      return null;
    }
    
    // Extract text from the item for analysis
    const text = this.extractTextFromItem(item);
    
    if (!text || text.trim().length === 0) {
      return null;
    }
    
    // Find all matching categories
    const matches = this.findMatchingCategories(item, query, sources);
    
    // Return the best match, or null if no matches
    return matches.length > 0 ? matches[0] : null;
  }

  /**
   * Extracts text from an item for analysis
   * @param {Object} item - The item to extract text from
   * @returns {string} The extracted text
   */
  extractTextFromItem(item) {
    if (!item) {
      return '';
    }
    
    let text = '';
    
    // Add title if available
    if (item.title) {
      text += item.title + ' ';
    }
    
    // Add content if available
    if (typeof item.content === 'string') {
      text += item.content + ' ';
    } else if (item.description) {
      text += item.description + ' ';
    } else if (item.snippet) {
      text += item.snippet + ' ';
    }
    
    // Add source if available
    if (item.source) {
      text += item.source + ' ';
    }
    
    return text;
  }

  /**
   * Find categories for an array of results
   * @param {Array} results - The results to categorize
   * @param {string} query - The search query
   * @returns {Array} Categorized results
   */
  findCategories(results, query) {
    if (!results || !Array.isArray(results) || results.length === 0) {
      console.log('DEBUG: No results to categorize');
      return [];
    }

    console.log(`DEBUG: Finding categories for ${results.length} results`);
    
    // First pass: Find categories with high confidence (70%+)
    const firstPassThreshold = 0.7;
    const categorizedResults = [];
    const uncategorizedResults = [];
    
    // Process each result
    results.forEach(result => {
      // Skip if result is invalid
      if (!result || typeof result !== 'object') return;
      
      // Find matching categories for this result
      const matches = this.findMatchingCategories(result, query, results, firstPassThreshold);
      
      if (matches.length > 0) {
        // Use the best matching category
        const bestMatch = matches[0];
        
        // Add category metadata to the result
        const enhancedResult = {
          ...result,
          _category: bestMatch.category.id,
          _categoryName: bestMatch.category.name,
          _categoryScore: bestMatch.score * 100, // Convert to 0-100 scale
          _metrics: {
            relevance: calculateRelevanceScore(this.extractTextFromItem(result), query) * 100,
            accuracy: calculateAccuracy(this.extractTextFromItem(result)) * 100,
            credibility: calculateCredibility(result, results) * 100
          }
        };
        
        categorizedResults.push(enhancedResult);
      } else {
        // Save for second pass
        uncategorizedResults.push(result);
      }
    });
    
    console.log(`DEBUG: First pass categorization: ${categorizedResults.length} categorized, ${uncategorizedResults.length} uncategorized`);
    
    // Second pass: Try to categorize remaining results with lower threshold
    if (uncategorizedResults.length > 0) {
      const secondPassThreshold = 0.5;
      
      uncategorizedResults.forEach(result => {
        // Find matching categories with lower threshold
        const matches = this.findMatchingCategories(result, query, results, secondPassThreshold);
        
        if (matches.length > 0) {
          // Use the best matching category
          const bestMatch = matches[0];
          
          // Add category metadata to the result
          const enhancedResult = {
            ...result,
            _category: bestMatch.category.id,
            _categoryName: bestMatch.category.name,
            _categoryScore: bestMatch.score * 100, // Convert to 0-100 scale
            _metrics: {
              relevance: calculateRelevanceScore(this.extractTextFromItem(result), query) * 100,
              accuracy: calculateAccuracy(this.extractTextFromItem(result)) * 100,
              credibility: calculateCredibility(result, results) * 100
            }
          };
          
          categorizedResults.push(enhancedResult);
        } else {
          // If still no match, add to general category
          const enhancedResult = {
            ...result,
            _category: 'general',
            _categoryName: 'General Results',
            _categoryScore: 60, // Default score
            _metrics: {
              relevance: calculateRelevanceScore(this.extractTextFromItem(result), query) * 100,
              accuracy: calculateAccuracy(this.extractTextFromItem(result)) * 100,
              credibility: calculateCredibility(result, results) * 100
            }
          };
          
          categorizedResults.push(enhancedResult);
        }
      });
      
      console.log(`DEBUG: Second pass categorization complete, total categorized: ${categorizedResults.length}`);
    }
    
    // Group results by category
    const categoryMap = {};
    
    categorizedResults.forEach(result => {
      const categoryId = result._category;
      
      if (!categoryMap[categoryId]) {
        // Get category definition
        const categoryDef = CATEGORIES[categoryId] || {
          id: categoryId,
          name: result._categoryName || categoryId,
          description: `${result._categoryName || categoryId} content`,
          icon: 'document',
          color: '#0066cc',
          priority: 5 // Default priority
        };
        
        categoryMap[categoryId] = {
          id: categoryId,
          name: categoryDef.name,
          description: categoryDef.description,
          icon: categoryDef.icon,
          color: categoryDef.color,
          priority: categoryDef.priority || 5,
          content: []
        };
      }
      
      // Add result to category
      categoryMap[categoryId].content.push(result);
    });
    
    // Convert to array and sort by priority and content length
    const categories = Object.values(categoryMap)
      .filter(category => category.content && category.content.length > 0)
      .sort((a, b) => {
        // First by priority (lower number = higher priority)
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        
        // Then by content length (more content = higher priority)
        return b.content.length - a.content.length;
      })
      .slice(0, 6); // Limit to top 6 categories
    
    console.log(`DEBUG: Final categories: ${categories.length}`);
    
    return categories;
  }
}

// Export the class
export default CategoryFinder;
