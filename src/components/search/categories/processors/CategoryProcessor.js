import { getDefaultCategories, getCategoriesByKeywords } from '../types/DefaultCategories';

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
  
  // Create categories based on content
  const categories = getDefaultCategories();
  
  // Define fixedCategories here before using it
  let fixedCategories = JSON.parse(JSON.stringify(categories));
  
  // Ensure each category has a content array
  fixedCategories = fixedCategories.map(category => ({
    ...category,
    content: Array.isArray(category.content) ? category.content : []
  }));

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
  
  // Helper function to safely add item to a category
  const safelyAddToCategory = (categoryId, item, maxItems = 5) => {
    // Find the category
    const category = fixedCategories.find(c => c.id === categoryId);
    
    // Check if category exists and has a content array
    if (category && category.content && Array.isArray(category.content)) {
      // Only add if we haven't reached the max items
      if (category.content.length < maxItems) {
        category.content.push(item);
        return true;
      }
    }
    return false;
  };

  // If we still have empty categories, distribute the normalized content
  if (normalizedContent.length > 0) {
    // Distribute content to categories based on content analysis
    normalizedContent.forEach(item => {
      const itemText = getTextFromItem(item).toLowerCase();
      
      // Key Insights - add high relevance items
      if (calculateRelevance(itemText, ['insight', 'key', 'important', 'highlight', 'summary'], query) > 0.6) {
        safelyAddToCategory('key-insights', item);
      }
      
      // Market Analysis
      if (itemText.includes('market') || itemText.includes('analysis') || 
          itemText.includes('trend') || itemText.includes('forecast') ||
          itemText.includes('growth') || itemText.includes('competition')) {
        safelyAddToCategory('market-analysis', item);
      }
      
      // Financial Data
      if (itemText.includes('financial') || itemText.includes('finance') || 
          itemText.includes('revenue') || itemText.includes('profit') ||
          itemText.includes('earnings') || itemText.includes('stock')) {
        safelyAddToCategory('financial-data', item);
      }
      
      // Industry Trends
      if (itemText.includes('industry') || itemText.includes('sector') || 
          itemText.includes('trend') || itemText.includes('development') ||
          itemText.includes('emerging') || itemText.includes('future')) {
        safelyAddToCategory('industry-trends', item);
      }
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
  
  console.log("Final categorized content:", {
    count: nonEmptyCategories.length,
    names: nonEmptyCategories.map(c => c.name),
    contentCounts: nonEmptyCategories.map(c => ({ name: c.name, count: c.content.length }))
  });
  
  return nonEmptyCategories;
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

// For backward compatibility
export const createCategorizedContent = processCategories;