import { getDefaultCategories, getCategoriesByKeywords } from '../types/DefaultCategories';

/**
 * Process content to extract and categorize into different categories
 * @param {Array|Object|string} content The content to categorize
 * @param {string} query The search query
 * @returns {Array} Array of category objects with their content
 */
export const processCategories = (content, query = '') => {
  console.log("processCategories called with:", { 
    contentType: typeof content, 
    contentIsArray: Array.isArray(content),
    query,
    contentSample: Array.isArray(content) && content.length > 0 ? 
      JSON.stringify(content[0]).substring(0, 100) + '...' : 
      (typeof content === 'object' ? JSON.stringify(content).substring(0, 100) + '...' : 'Not an object')
  });

  // Normalize content to array format
  const normalizedContent = normalizeContent(content);
  console.log("Normalized content:", {
    length: normalizedContent.length,
    sample: normalizedContent.length > 0 ? 
      JSON.stringify(normalizedContent[0]).substring(0, 100) + '...' : 'Empty array'
  });
  
  // Get default categories based on query
  const defaultCategories = getDefaultCategories(query);
  console.log("Default categories:", {
    count: defaultCategories.length,
    names: defaultCategories.map(c => c.name)
  });
  
  // Process each content item and assign to categories
  const categorizedContent = categorizeContent(normalizedContent, defaultCategories, query);
  console.log("Final categorized content:", {
    count: categorizedContent.length,
    names: categorizedContent.map(c => c.name),
    contentCounts: categorizedContent.map(c => ({ name: c.name, count: c.content.length }))
  });
  
  return categorizedContent;
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
  console.log("categorizeContent called with:", { 
    contentLength: content.length, 
    categoriesLength: categories.length 
  });
  
  // Initialize categories with their content arrays
  const categorizedContent = categories.map(category => ({
    ...category,
    content: []
  }));
  
  // Process each content item
  content.forEach((item, index) => {
    // Convert item to string for keyword matching
    const itemText = getTextFromItem(item);
    console.log(`Processing item ${index}:`, { 
      hasTitle: !!item.title, 
      hasURL: !!(item.url || item.link),
      textLength: itemText?.length || 0,
      itemType: item.type || 'unknown'
    });
    
    // For each category, check if the item belongs to it
    categorizedContent.forEach(category => {
      // Special case for "All Results" category (matches everything)
      if (category.keywords.includes('*')) {
        category.content.push({
          ...item,
          relevance: 100,
          index
        });
        return;
      }
      
      // Special case for "Web Results" category (matches items with URLs)
      if (category.id === 'web-results' && (item.url || item.link)) {
        category.content.push({
          ...item,
          relevance: 90,
          index
        });
        return;
      }
      
      // Calculate relevance score for this item in this category
      const relevance = calculateRelevance(itemText, category.keywords, query);
      
      // If relevance is above threshold, add to category
      if (relevance > 0) {
        category.content.push({
          ...item,
          relevance,
          index
        });
      }
    });
  });
  
  // Sort content within each category by relevance
  categorizedContent.forEach(category => {
    category.content.sort((a, b) => b.relevance - a.relevance);
  });
  
  // Filter out categories with no content
  const filteredCategories = categorizedContent.filter(category => category.content.length > 0);
  
  console.log("Categorized content:", { 
    totalCategories: filteredCategories.length,
    categoryNames: filteredCategories.map(c => c.name),
    contentCounts: filteredCategories.map(c => ({ name: c.name, count: c.content.length }))
  });
  
  return filteredCategories;
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
 * Calculate relevance score for an item against a category
 * @param {string} itemText Text content of the item
 * @param {Array} keywords Category keywords
 * @param {string} query The search query
 * @returns {number} Relevance score (0-100)
 */
const calculateRelevance = (itemText, keywords, query) => {
  // If no text to match, return 0
  if (!itemText) {
    return 0;
  }
  
  // Convert to lowercase for case-insensitive matching
  const text = itemText.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Initialize score
  let score = 0;
  
  // Check for keyword matches
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    
    // Exact match has higher score
    if (text.includes(keywordLower)) {
      // Exact match
      score += 30;
      
      // Bonus for exact query match
      if (keywordLower === queryLower) {
        score += 20;
      }
      
      // Bonus for match at beginning
      if (text.startsWith(keywordLower)) {
        score += 10;
      }
      
      // Bonus for multiple occurrences
      const occurrences = (text.match(new RegExp(keywordLower, 'g')) || []).length;
      if (occurrences > 1) {
        score += Math.min(occurrences * 5, 20); // Cap at 20 points
      }
    }
    // Partial match (word boundary)
    else if (new RegExp(`\\b${keywordLower}`, 'i').test(text)) {
      score += 15;
    }
    // Substring match
    else if (text.includes(keywordLower.substring(0, Math.max(3, keywordLower.length - 2)))) {
      score += 5;
    }
  });
  
  // Cap score at 100
  return Math.min(score, 100);
};

// For backward compatibility
export const createCategorizedContent = processCategories;