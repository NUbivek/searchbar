/**
 * Category Processor Module
 * 
 * This module is responsible for processing search results into categories.
 * 
 * =====================================================================
 * ACTION ITEM: FIRST PLACE TO CHECK WHEN CATEGORY TABS ARE NOT DISPLAYING
 * =====================================================================
 * 
 * If category tabs are not displaying correctly, follow this flow to diagnose:
 * 
 * 1. API (search/index.js):
 *    - Categories generated here via processCategories
 *    - Check console logs for "Generated ${categories.length} initial categories"
 *    - Ensure categories included in API response
 * 
 * 2. Search Flow (searchFlowHelper.js):
 *    - Categories should be extracted from API response
 *    - Check logs for "Received ${categories.length} categories from search API"
 * 
 * 3. Component Chain:
 *    - VerifiedSearch → SearchResultsWrapper → IntelligentSearchResults → ModernCategoryDisplay → CategoryRibbon
 *    - Categories should flow through this chain
 *    - Check console logs at each step
 * 
 * For detailed documentation, see: /docs/CATEGORY_FLOW.md
 */

import { getDefaultCategories } from '../types/DefaultCategories';
import { getSpecialCategories } from '../types/SpecialCategories';
import { getBroadCategories } from '../types/BroadCategories';
import { getSpecificCategories } from '../types/SpecificCategories';
import { findBestCategories } from './CategoryFinder';
import { createDynamicCategoriesFromText } from './DynamicCategorizer';
import { matchCategories } from './CategoryMatcher';
import { 
  calculateRelevanceScore, 
  calculateCredibilityScore,
  calculateAccuracyScore,
  calculateCombinedScore,
  MIN_THRESHOLD
} from './CategoryMetricsCalculator';

/**
 * Process content to extract and categorize into different categories
 * @param {Array|Object|string} content The content to categorize
 * @param {string} query The search query
 * @param {Object} options Additional options
 * @returns {Array} Array of category objects with their content
 */
export const processCategories = (content, query = '', options = {}) => {
  console.log("processCategories called with:", { 
    contentType: typeof content, 
    contentIsArray: Array.isArray(content),
    query,
    contentSample: Array.isArray(content) && content.length > 0 ? 
      JSON.stringify(content[0]).substring(0, 100) + '...' : 
      (typeof content === 'object' ? JSON.stringify(content).substring(0, 100) + '...' : 'Not an object'),
    options
  });

  // If content is empty or undefined, return an empty array
  if (!content || (Array.isArray(content) && content.length === 0)) {
    console.log("No content to process, returning empty array");
    return [];
  }
  
  // Enable debugging if specified
  const debug = options.debug || false;
  
  try {

  // Normalize content to array format
  const normalizedContent = normalizeContent(content);
  console.log("Normalized content:", {
    length: normalizedContent.length,
    sample: normalizedContent.length > 0 ? 
      JSON.stringify(normalizedContent[0]).substring(0, 100) + '...' : 'Empty array'
  });
  
  // If normalized content is empty, return an empty array
  if (!normalizedContent || normalizedContent.length === 0) {
    console.log("No normalized content, returning empty array");
    return [];
  }
  
  // Extract LLM response if provided
  const llmResponse = options.llmResponse || '';
  console.log("LLM response:", {
    hasResponse: !!llmResponse,
    responseType: typeof llmResponse,
    responseLength: typeof llmResponse === 'string' ? llmResponse.length : 0,
    responseSample: typeof llmResponse === 'string' ? llmResponse.substring(0, 100) + '...' : 'Not a string'
  });

  // Ensure LLM response is a string
  let safeLlmResponse = '';
  if (typeof llmResponse === 'string') {
    safeLlmResponse = llmResponse;
  } else if (llmResponse && typeof llmResponse === 'object') {
    try {
      safeLlmResponse = JSON.stringify(llmResponse);
    } catch (err) {
      console.error("Error stringifying LLM response:", err);
      safeLlmResponse = String(llmResponse);
    }
  }
  
  // DIAGNOSTIC: Trying to generate categories from both specialized sources and content analysis
  console.log('Beginning category generation for query:', query);
  
  // First try to get categories based on the query context
  let categories = [];
  
  // Use categoryFinder if available to generate context-aware categories
  if (options.categoryFinder) {
    try {
      console.log('Using categoryFinder to find categories');
      categories = options.categoryFinder.findCategories(query, { 
        includeSpecific: true,
        includeBroad: true,
        includeAll: true
      });
      console.log(`CategoryFinder generated ${categories.length} categories`);
    } catch (err) {
      console.error('Error using categoryFinder:', err);
    }
  }
  
  // If no categories from categoryFinder, get default ones
  if (!categories || categories.length === 0) {
    console.log('No categories from categoryFinder, using default categories');
    categories = getDefaultCategories(query);
  }
  
  // Add some specialized categories based on query analysis
  // For business/market queries
  if (query.match(/business|market|industry|company|financial|stock|investment|economic/i) || options.forceMultipleCategories) {
    console.log('Detected business/market context, adding specialized categories');
    // Get only the business categories that don't already exist
    const businessCategories = getSpecificCategories().filter(c => 
      ['market_analysis', 'financial_data', 'company_info', 'industry_trends', 'investment_strategies'].includes(c.id) &&
      !categories.some(existing => existing.id === c.id || existing.id.replace('-', '_') === c.id)
    );
    
    console.log(`Adding ${businessCategories.length} business-specific categories`);
    categories = [
      ...categories,
      ...businessCategories
    ];
  }
  
  // For technical/technology queries
  if (query.match(/technology|tech|software|hardware|digital|ai|artificial intelligence|machine learning|data|programming/i) || options.forceMultipleCategories) {
    console.log('Detected technology context, adding tech categories');
    categories = [
      ...categories,
      ...getSpecificCategories().filter(c => 
        ['technology_trends', 'technical_analysis', 'product_reviews', 'research_papers'].includes(c.id)
      )
    ];
  }
  
  // Define fixedCategories here before using it
  let fixedCategories = JSON.parse(JSON.stringify(categories));
  
  // Ensure each category has a content array
  fixedCategories = fixedCategories.map(category => ({
    ...category,
    content: Array.isArray(category.content) ? category.content : []
  }));
  
  console.log(`Prepared ${fixedCategories.length} initial categories for content distribution`);

  // Process LLM response to extract insights for each category
  if (safeLlmResponse && typeof safeLlmResponse === 'string') {
    console.log("Processing LLM response for insights:", {
      responseLength: safeLlmResponse.length,
      responseSample: safeLlmResponse.substring(0, 100) + '...'
    });
    
    // Check if the LLM response contains an error message
    if (safeLlmResponse.toLowerCase().includes("couldn't process") || 
        safeLlmResponse.toLowerCase().includes("error") || 
        safeLlmResponse.toLowerCase().includes("failed")) {
      console.log("LLM response contains error message, not adding any content");
      return [];
    }
    
    // Extract insights from LLM response for each category
    
    // Key Insights
    const keyInsightsRegex = /key\s+insights|important\s+points|main\s+takeaways|key\s+findings|highlights/i;
    if (keyInsightsRegex.test(safeLlmResponse)) {
      // Extract paragraphs that might contain key insights
      const paragraphs = safeLlmResponse.split('\n\n').filter(p => p.trim().length > 0);
      const keyInsightsParagraphs = paragraphs.filter(p => 
        keyInsightsRegex.test(p) || 
        /\binsight|\bkey\b|\bimportant\b|\bhighlight\b|\bsummary\b/i.test(p)
      );
      
      // Add key insights to the category
      if (keyInsightsParagraphs.length > 0) {
        keyInsightsParagraphs.forEach(paragraph => {
          const keyInsightsCategory = fixedCategories.find(c => c.id === 'key-insights');
          if (keyInsightsCategory && keyInsightsCategory.content) {
            keyInsightsCategory.content.push({
              title: 'Key Insight',
              content: paragraph,
              source: 'LLM Analysis',
              type: 'insight'
            });
          }
        });
      }
    }
    
    // Market Analysis
    const marketAnalysisRegex = /market\s+analysis|market\s+trends|market\s+growth|market\s+forecast|competition|market\s+share/i;
    if (marketAnalysisRegex.test(safeLlmResponse)) {
      // Extract paragraphs that might contain market analysis
      const paragraphs = safeLlmResponse.split('\n\n').filter(p => p.trim().length > 0);
      const marketAnalysisParagraphs = paragraphs.filter(p => 
        marketAnalysisRegex.test(p) || 
        /\bmarket\b|\banalysis\b|\btrend\b|\bforecast\b|\bgrowth\b|\bcompetition\b/i.test(p)
      );
      
      // Add market analysis to the category
      if (marketAnalysisParagraphs.length > 0) {
        marketAnalysisParagraphs.forEach(paragraph => {
          const marketAnalysisCategory = fixedCategories.find(c => c.id === 'market-analysis');
          if (marketAnalysisCategory && marketAnalysisCategory.content) {
            marketAnalysisCategory.content.push({
              title: 'Market Analysis',
              content: paragraph,
              source: 'LLM Analysis',
              type: 'market'
            });
          }
        });
      }
    }
    
    // Financial Data
    const financialDataRegex = /financial\s+data|revenue|profit|earnings|income|balance\s+sheet|financial\s+performance/i;
    if (financialDataRegex.test(safeLlmResponse)) {
      // Extract paragraphs that might contain financial data
      const paragraphs = safeLlmResponse.split('\n\n').filter(p => p.trim().length > 0);
      const financialDataParagraphs = paragraphs.filter(p => 
        financialDataRegex.test(p) || 
        /\bfinancial\b|\brevenue\b|\bprofit\b|\bearnings\b|\bincome\b|\bbalance\s+sheet\b/i.test(p)
      );
      
      // Add financial data to the category
      if (financialDataParagraphs.length > 0) {
        financialDataParagraphs.forEach(paragraph => {
          const financialDataCategory = fixedCategories.find(c => c.id === 'financial-data');
          if (financialDataCategory && financialDataCategory.content) {
            financialDataCategory.content.push({
              title: 'Financial Data',
              content: paragraph,
              source: 'LLM Analysis',
              type: 'financial'
            });
          }
        });
      }
    }
    
    // Industry Trends
    const industryTrendsRegex = /industry\s+trends|sector\s+trends|industry\s+development|innovation|technological\s+advancement/i;
    if (industryTrendsRegex.test(safeLlmResponse)) {
      // Extract paragraphs that might contain industry trends
      const paragraphs = safeLlmResponse.split('\n\n').filter(p => p.trim().length > 0);
      const industryTrendsParagraphs = paragraphs.filter(p => 
        industryTrendsRegex.test(p) || 
        /\bindustry\b|\bsector\b|\btrend\b|\bdevelopment\b|\binnovation\b/i.test(p)
      );
      
      // Add industry trends to the category
      if (industryTrendsParagraphs.length > 0) {
        industryTrendsParagraphs.forEach(paragraph => {
          const industryTrendsCategory = fixedCategories.find(c => c.id === 'industry-trends');
          if (industryTrendsCategory && industryTrendsCategory.content) {
            industryTrendsCategory.content.push({
              title: 'Industry Trend',
              content: paragraph,
              source: 'LLM Analysis',
              type: 'industry'
            });
          }
        });
      }
    }
    
    // If we couldn't extract specific insights, use the entire LLM response
    if (fixedCategories.every(c => c.content && c.content.length === 0)) {
      // Split the LLM response into paragraphs
      const paragraphs = safeLlmResponse.split('\n\n').filter(p => p.trim().length > 0);
      
      // Find the key insights category or create it if it doesn't exist
      let keyInsightsCategory = fixedCategories.find(c => c.id === 'key-insights');
      
      // If the category doesn't exist, create it
      if (!keyInsightsCategory) {
        keyInsightsCategory = {
          id: 'key-insights',
          name: 'Key Insights',
          description: 'Important insights from search results',
          icon: 'lightbulb',
          content: [],
          metrics: { relevance: 0.9, accuracy: 0.8, credibility: 0.7, overall: 0.8 },
          color: '#4285F4'
        };
        fixedCategories.push(keyInsightsCategory);
      }
      
      // Add each paragraph to the Key Insights category
      paragraphs.forEach((paragraph, index) => {
        if (keyInsightsCategory && keyInsightsCategory.content) {
          keyInsightsCategory.content.push({
            title: `Insight ${index + 1}`,
            content: paragraph,
            source: 'LLM Analysis',
            type: 'insight'
          });
        }
      });
    }
  } else {
    console.log("No LLM response to process, will use normalized content only");
  }
  
  // Helper function to safely add item to a category with improved matching
  const safelyAddToCategory = (categoryId, item, maxItems = 15) => {
    // Find the category with flexible ID matching (handles both dash and underscore formats)
    const category = fixedCategories.find(c => 
      c.id === categoryId || 
      c.id.replace(/-/g, '_') === categoryId || 
      c.id.replace(/_/g, '-') === categoryId
    );
    
    // Check if category exists and has a content array
    if (category && category.content && Array.isArray(category.content)) {
      // Check if item is already in the category to avoid duplicates
      const isDuplicate = category.content.some(existing => 
        (existing.id && item.id && existing.id === item.id) || 
        (existing.title && item.title && existing.title === item.title) ||
        (existing.url && item.url && existing.url === item.url)
      );
      
      if (!isDuplicate && category.content.length < maxItems) {
        console.log(`Adding item "${item.title || 'Untitled'}" to category ${category.name}`);
        category.content.push(item);
        return true;
      }
    } else {
      console.log(`Could not find category with ID: ${categoryId}`);
    }
    return false;
  };

  // If we still have empty categories, distribute the normalized content
  if (normalizedContent.length > 0) {
    console.log(`Distributing ${normalizedContent.length} content items to categories`);
    
    // Distribute ALL content to the all_results category first
    const allResultsCategory = fixedCategories.find(c => 
      c.id === 'all_results' || c.id === 'searchResults' || c.name.toLowerCase().includes('all results')
    );
    
    if (allResultsCategory) {
      console.log(`Adding all ${normalizedContent.length} items to '${allResultsCategory.name}' category`);
      allResultsCategory.content = [...normalizedContent];
    }
    
    // Enhanced content distribution with better context detection
    normalizedContent.forEach(item => {
      const itemText = getTextFromItem(item).toLowerCase();
      let assignedCount = 0;
      
      // Create category detection patterns
      const categoryPatterns = [
        { id: 'key-insights', patterns: ['insight', 'key', 'important', 'highlight', 'summary', 'takeaway', 'finding'] },
        { id: 'market-analysis', patterns: ['market', 'analysis', 'trend', 'forecast', 'growth', 'competition', 'share', 'segment', 'opportunity'] },
        { id: 'financial-data', patterns: ['financial', 'finance', 'revenue', 'profit', 'earnings', 'stock', 'investment', 'return', 'cash', 'expense', 'budget'] },
        { id: 'industry-trends', patterns: ['industry', 'sector', 'trend', 'development', 'emerging', 'future', 'innovation'] },
        { id: 'technology-trends', patterns: ['technology', 'tech', 'innovation', 'digital', 'software', 'hardware', 'ai', 'automation'] },
        { id: 'company-info', patterns: ['company', 'business', 'corporation', 'enterprise', 'organization', 'firm', 'startup'] },
        { id: 'investment-strategies', patterns: ['invest', 'portfolio', 'asset', 'allocation', 'strategy', 'diversification', 'risk'] },
        { id: 'economic-indicators', patterns: ['economic', 'economy', 'gdp', 'inflation', 'unemployment', 'interest rate', 'fiscal', 'monetary'] }
      ];
      
      // Check against each pattern set
      categoryPatterns.forEach(({ id, patterns }) => {
        // Check if any pattern matches
        const matches = patterns.some(pattern => itemText.includes(pattern));
        if (matches) {
          if (safelyAddToCategory(id, item)) {
            assignedCount++;
          }
        }
      });
      
      // For items with low match confidence, add to key insights
      if (assignedCount === 0) {
        // Try to calculate a relevance score for key insights
        const keyInsightsScore = calculateRelevance(itemText, ['important', 'key', 'insight', 'main', 'critical', 'essential'], query);
        
        if (keyInsightsScore > 0.5) {
          safelyAddToCategory('key-insights', item);
        } else {
          // If nothing else matches, add to key insights anyway as a fallback
          safelyAddToCategory('key-insights', item);
        }
      }
    });
    
    // Log distribution results
    fixedCategories.forEach(category => {
      console.log(`Category "${category.name}" has ${category.content?.length || 0} items`);
    });
  }
  
  // Remove empty categories
  const nonEmptyCategories = fixedCategories.filter(category => category.content && category.content.length > 0);
  
  // If all categories are empty, add a default message to Key Insights
  if (nonEmptyCategories.length === 0) {
    const keyInsightsCategory = fixedCategories.find(c => c.id === 'key-insights');
    if (keyInsightsCategory && keyInsightsCategory.content) {
      keyInsightsCategory.content.push({
        title: 'No Insights Available',
        content: 'No specific insights could be extracted for this query. Try refining your search.',
        source: 'System',
        type: 'insight'
      });
      nonEmptyCategories.push(keyInsightsCategory);
    }
  }
  
  // Limit categories to 5-6 to fit in one row
  // First, ensure Key Insights category is included if it exists
  const keyInsightsCategory = nonEmptyCategories.find(c => 
    c.id === 'key-insights' || c.id === 'key_insights' || c.name === 'Key Insights'
  );
  
  // Sort the remaining categories by overall score in descending order
  const otherCategories = nonEmptyCategories
    .filter(c => c.id !== 'key-insights' && c.id !== 'key_insights' && c.name !== 'Key Insights')
    .sort((a, b) => {
      const aScore = a.metrics?.overall || 0;
      const bScore = b.metrics?.overall || 0;
      return bScore - aScore; // Descending order
    });
  
  // Combine Key Insights with top 4-5 highest scoring categories for a total of 5-6
  let finalCategories = [];
  const MAX_CATEGORIES = 6;
  
  // Add Key Insights first if it exists
  if (keyInsightsCategory) {
    finalCategories.push(keyInsightsCategory);
  }
  
  // Add remaining top categories up to MAX_CATEGORIES total
  const remainingSlots = MAX_CATEGORIES - finalCategories.length;
  finalCategories = [
    ...finalCategories,
    ...otherCategories.slice(0, remainingSlots)
  ];
  
  console.log("Final categorized content after limiting:", {
    count: finalCategories.length,
    names: finalCategories.map(c => c.name),
    contentCounts: finalCategories.map(c => ({ name: c.name, count: c.content.length }))
  });
  
  return finalCategories;
  } catch (error) {
    console.error("Error in processCategories:", error);
    
    // Critical fallback - if all else fails, return a single generic category
    try {
      const fallbackContent = Array.isArray(content) ? 
        content.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('\n\n') :
        (typeof content === 'string' ? content : JSON.stringify(content));
      
      return [{
        id: 'key-insights',
        name: 'Key Insights',
        content: fallbackContent,
        formattedContent: fallbackContent,
        color: '#673AB7',
        isFallback: true,
        error: error.message
      }];
    } catch (criticalError) {
      console.error("Critical error in category fallback:", criticalError);
      return [];
    }
  }
};

/**
 * Normalize content into a standard array format
 * @param {Array|Object|string} content The content to normalize
 * @returns {Array} Normalized content array
 */
const normalizeContent = (content) => {
  console.log("normalizeContent called with content type:", typeof content);
  
  // If content is null or undefined, return empty array
  if (!content) {
    console.log("Content is null or undefined, returning empty array");
    return [];
  }
  
  // If content is already an array, return it
  if (Array.isArray(content)) {
    console.log("Content is already an array with length:", content.length);
    
    // Special handling for chat history format
    if (content.length > 0) {
      // Check if it's a chat history format
      const hasChatFormat = content.some(item => 
        item && typeof item === 'object' && 
        (item.type === 'user' || item.type === 'assistant')
      );
      
      if (hasChatFormat) {
        console.log("Detected chat format in array");
        // Extract content from assistant messages
        const assistantMessages = content.filter(item => item && item.type === 'assistant');
        if (assistantMessages.length > 0) {
          const latestMessage = assistantMessages[assistantMessages.length - 1];
          console.log("Latest assistant message:", latestMessage);
          
          if (latestMessage.content) {
            if (Array.isArray(latestMessage.content)) {
              console.log("Using content array from latest assistant message with length:", latestMessage.content.length);
              return latestMessage.content;
            } else if (typeof latestMessage.content === 'string') {
              console.log("Using content from latest assistant message as single item");
              return [{ text: latestMessage.content, type: 'text' }];
            } else if (typeof latestMessage.content === 'object') {
              console.log("Using content object from latest assistant message");
              return [latestMessage.content];
            }
          }
        
          // If we couldn't extract content from assistant messages, return empty array
          console.log("No usable content found in chat history");
          return [];
        }
        
        // Check if the array contains objects with specific search result properties
        const hasSearchResultFormat = content.some(item => 
          item && typeof item === 'object' && 
          (item.title || item.snippet || item.link || item.url)
        );
        
        if (hasSearchResultFormat) {
          console.log("Detected search result format in array");
          // Transform search results to a more consistent format
          return content.map(item => {
            if (item && typeof item === 'object') {
              return {
                title: item.title || '',
                description: item.snippet || item.description || item.content || '',
                url: item.link || item.url || '',
                type: 'search_result',
                ...item // Keep original properties
              };
            }
            return item;
          });
        }
      }
      
      return content;
    }
    
    // Check if the array contains objects with specific search result properties
    const hasSearchResultFormat = content.some(item => 
      item && typeof item === 'object' && 
      (item.title || item.snippet || item.link || item.url)
    );
    
    if (hasSearchResultFormat) {
      console.log("Detected search result format in array");
      // Transform search results to a more consistent format
      return content.map(item => {
        if (item && typeof item === 'object') {
          return {
            title: item.title || '',
            description: item.snippet || item.description || item.content || '',
            url: item.link || item.url || '',
            type: 'search_result',
            ...item // Keep original properties
          };
        }
        return item;
      });
    }
    
    return content;
  }
  
  // If content is a string, convert to array with single item
  if (typeof content === 'string') {
    console.log("Content is a string, converting to array");
    return [{ text: content, type: 'text' }];
  }
  
  // If content is an object, convert to array with single item
  if (typeof content === 'object') {
    console.log("Content is an object, converting to array");
    
    // Check if it's a search result object with specific properties
    if (content.results || content.items || content.data) {
      const resultArray = content.results || content.items || content.data;
      if (Array.isArray(resultArray)) {
        console.log("Found results/items/data array in object, using that with length:", resultArray.length);
        return resultArray;
      }
    }
    
    return [content];
  }
  
  // Default fallback - return empty array
  console.log("Content is of unsupported type, returning empty array");
  return [];
};

/**
 * Categorize content items into appropriate categories
 * @param {Array} content Normalized content array
 * @param {Array} categories Array of category definitions
 * @param {string} query The search query
 * @returns {Array} Array of categories with their content
 */
const categorizeContent = (content, categories, query) => {
  // If no content or categories, return empty array
  if (!content || content.length === 0 || !categories || categories.length === 0) {
    return [];
  }
  
  // Make a deep copy of the categories to avoid modifying the original
  const categoriesCopy = JSON.parse(JSON.stringify(categories));
  
  // Process each content item
  content.forEach(item => {
    // Get text representation of the item for keyword matching
    const itemText = getTextFromItem(item);
    
    // For each category, check if the item belongs
    categoriesCopy.forEach(category => {
      // Skip if category doesn't have keywords
      if (!category.keywords || !Array.isArray(category.keywords)) return;
      
      // Calculate relevance score
      const relevanceScore = calculateRelevance(itemText, category.keywords, query);
      
      // If relevance score is above threshold, add to category
      if (relevanceScore > 0.4) { // 40% threshold
        // Create a copy of the item with relevance score
        const itemWithScore = {
          ...item,
          _relevanceScore: relevanceScore
        };
        
        // Add to category content
        if (!category.content) category.content = [];
        category.content.push(itemWithScore);
      }
    });
  });
  
  // Sort content within each category by relevance
  categoriesCopy.forEach(category => {
    if (category.content && category.content.length > 0) {
      category.content.sort((a, b) => (b._relevanceScore || 0) - (a._relevanceScore || 0));
    }
  });
  
  // Only return categories that have content
  return categoriesCopy.filter(category => category.content && category.content.length > 0);
};

/**
 * Extract text content from an item for keyword matching
 * @param {Object|string} item Content item
 * @returns {string} Text representation of the item
 */
const getTextFromItem = (item) => {
  // If item is a string, return it directly
  if (typeof item === 'string') {
    return item;
  }
  
  // If item is an object, extract text from common properties
  if (typeof item === 'object' && item !== null) {
    // For search result type items, combine title and description
    if (item.type === 'search_result' || item.title || item.snippet || item.link || item.url) {
      const titleText = item.title || '';
      const descriptionText = item.snippet || item.description || item.content || '';
      return `${titleText} ${descriptionText}`.trim();
    }
    
    // Try to extract text from common properties
    const textProperties = ['text', 'content', 'title', 'description', 'snippet', 'summary'];
    
    for (const prop of textProperties) {
      if (item[prop] && typeof item[prop] === 'string') {
        return item[prop];
      }
    }
    
    // If no text properties found, stringify the object
    try {
      return JSON.stringify(item);
    } catch (e) {
      console.error("Failed to stringify item:", e);
      return '';
    }
  }
  
  // Default fallback
  return '';
};

/**
 * Calculate relevance score for an item based on keywords
 * @param {string} text The text to search in
 * @param {Array} keywords Array of keywords to match
 * @param {string} query The original search query
 * @returns {number} Relevance score between 0 and 1
 */
const calculateRelevance = (text, keywords, query) => {
  // If no text or keywords, return 0
  if (!text || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return 0;
  }
  
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  const lowerQuery = query ? query.toLowerCase() : '';
  
  // Count keyword matches
  let matchCount = 0;
  let totalKeywords = 0;
  
  // Process each keyword
  keywords.forEach(keyword => {
    // Skip wildcard keyword
    if (keyword === '*') return;
    
    totalKeywords++;
    
    // Check if keyword is in text
    if (lowerText.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  });
  
  // If no valid keywords were processed, return 0
  if (totalKeywords === 0) {
    return 0;
  }
  
  // Calculate base score from keyword matches
  let score = matchCount / totalKeywords;
  
  // Boost score if the query is directly mentioned in the text
  if (lowerQuery && lowerText.includes(lowerQuery)) {
    score += 0.2; // Add 20% boost for direct query match
  }
  
  // Cap score at 1.0
  return Math.min(score, 1.0);
};

/**
 * Process a single category to include content and metrics
 * @param {Object} category The category to process
 * @param {Array} content Content items to possibly include
 * @param {string} query The search query
 * @returns {Object} Processed category object
 */
export const processCategory = (category, content = [], query = '') => {
  console.log(`Processing category: ${category.name}`);
  
  if (!category || !Array.isArray(content)) {
    console.warn('Invalid inputs to processCategory');
    return category;
  }
  
  try {
    // Filter content based on category's filter function or keywords
    let categoryContent = content;
    if (typeof category.filter === 'function') {
      categoryContent = content.filter(category.filter);
    } else if (category.keywords && category.keywords.length > 0) {
      // Filter by keywords if filter function is not provided
      categoryContent = content.filter(item => {
        const text = getTextFromItem(item);
        return calculateRelevance(text, category.keywords, query) > 0.3;
      });
    }
    
    // Add content to the category
    const updatedCategory = {
      ...category,
      content: categoryContent,
      contentCount: categoryContent.length
    };
    
    // Add metrics if they don't exist
    if (!updatedCategory.metrics) {
      updatedCategory.metrics = {
        relevance: 0.8,
        accuracy: 0.8,
        credibility: 0.8,
        overall: 0.8
      };
    }
    
    return updatedCategory;
  } catch (error) {
    console.error(`Error processing category ${category.name}:`, error);
    return {
      ...category,
      content: [],
      contentCount: 0,
      metrics: category.metrics || {
        relevance: 0.5,
        accuracy: 0.5,
        credibility: 0.5,
        overall: 0.5
      },
      error: error.message
    };
  }
};

  // Code was moved to processCategories

// For backward compatibility
export const createCategorizedContent = processCategories;

/**
 * Generate categories based on content and query context
 * @param {string|Array} content Content to categorize
 * @param {string} query Search query
 * @param {Array} sources Source information 
 * @param {Object} options Additional options
 * @returns {Array} Generated categories
 */
export const generateCategories = (content, query = '', sources = [], options = {}) => {
  console.log("generateCategories called with query:", query);
  
  // Enable debugging if specified
  const debug = options.debug || false;
  
  try {
    // Normalize content to string if it's an array
    const contentText = Array.isArray(content)
      ? content.map(item => {
          if (typeof item === 'string') return item;
          return item?.content || item?.text || JSON.stringify(item);
        }).join('\n\n')
      : (typeof content === 'string' ? content : JSON.stringify(content));
    
    // Get all available categories
    const allCategories = [
      ...getSpecialCategories(),
      ...getSpecificCategories(),
      ...getBroadCategories()
    ];
    
    // Match content to categories
    const matchedCategories = matchCategories(contentText, allCategories, query, sources, { debug });
    
    // Filter to categories that meet threshold
    const qualifyingCategories = matchedCategories.filter(cat => cat.meetsThreshold);
    
    // Apply fallback if needed
    let selectedCategories;
    
    if (qualifyingCategories.length >= 3) {
      // Enough qualifying categories, use them
      selectedCategories = qualifyingCategories.slice(0, 6); // Limit to 6
    } else if (qualifyingCategories.length > 0) {
      // Some qualifying categories, but not enough - lower the threshold
      const lowerThresholdCategories = matchedCategories.filter(cat => 
        cat.relevanceScore >= 65 && cat.credibilityScore >= 65 && cat.accuracyScore >= 65
      ).slice(0, 6);
      
      selectedCategories = lowerThresholdCategories;
    } else {
      // No qualifying categories - use default fallback
      const defaultCategories = getDefaultCategories(query);
      
      selectedCategories = defaultCategories.map(category => ({
        ...category,
        content: contentText,
        formattedContent: contentText,
        sources,
        isFallback: true
      }));
    }
    
    // Format categories with content
    const formattedCategories = selectedCategories.map(category => {
      // Format content based on category formatting function or use as-is
      const formattedContent = typeof category.formatContent === 'function'
        ? category.formatContent(contentText)
        : contentText;
      
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
        priority: category.priority,
        content: contentText,
        formattedContent,
        sources,
        relevanceScore: category.relevanceScore,
        credibilityScore: category.credibilityScore,
        accuracyScore: category.accuracyScore,
        combinedScore: category.combinedScore,
        finalScore: category.finalScore,
        isFallback: category.isFallback || false
      };
    });
    
    // Sort by priority then by score
    formattedCategories.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.finalScore - a.finalScore;
    });
    
    return formattedCategories;
  } catch (error) {
    console.error("Error in generateCategories:", error);
    
    // Critical fallback - return Key Insights category
    const keyInsightsCategory = getSpecialCategories()[0];
    return [{
      ...keyInsightsCategory,
      content: typeof content === 'string' ? content : 'No content available',
      formattedContent: typeof content === 'string' ? content : 'No content available',
      sources,
      isFallback: true,
      error: error.message
    }];
  }
};