/**
 * Utility for mapping LLM responses to categories
 */
import { processLLMResponse } from './LLMResponseProcessor';

/**
 * Map LLM response to categories
 * @param {string} llmResponse The raw LLM response text
 * @param {string} query The original search query
 * @param {Object} options Mapping options
 * @returns {Array} Array of category objects
 */
export const mapLLMResponseToCategories = (llmResponse, query, options = {}) => {
  try {
    // Process the LLM response
    const processedData = processLLMResponse(llmResponse, query, options);
    
    // Return the categories
    return processedData.categories || [];
  } catch (error) {
    console.error('Error mapping LLM response to categories:', error);
    return [];
  }
};

/**
 * Enhance existing categories with LLM insights
 * @param {Array} categories Existing categories
 * @param {string} llmResponse The LLM response
 * @param {string} query The search query
 * @returns {Array} Enhanced categories
 */
export const enhanceCategoriesWithLLM = (categories, llmResponse, query) => {
  try {
    if (!Array.isArray(categories) || categories.length === 0) {
      // If no existing categories, just process the LLM response
      return mapLLMResponseToCategories(llmResponse, query);
    }
    
    // Process the LLM response
    const llmCategories = mapLLMResponseToCategories(llmResponse, query);
    
    if (!Array.isArray(llmCategories) || llmCategories.length === 0) {
      // If no LLM categories, return existing categories
      return categories;
    }
    
    // Enhance existing categories with LLM insights
    const enhancedCategories = [...categories];
    
    // Map of category IDs to their index in the enhancedCategories array
    const categoryMap = {};
    enhancedCategories.forEach((cat, index) => {
      if (cat.id) {
        categoryMap[cat.id] = index;
      }
    });
    
    // Process each LLM category
    llmCategories.forEach(llmCategory => {
      if (!llmCategory.id || !Array.isArray(llmCategory.content)) {
        return;
      }
      
      // Check if category already exists
      if (categoryMap.hasOwnProperty(llmCategory.id)) {
        // Enhance existing category
        const existingIndex = categoryMap[llmCategory.id];
        const existingCategory = enhancedCategories[existingIndex];
        
        // Add LLM content to existing category
        if (Array.isArray(existingCategory.content)) {
          existingCategory.content = [
            ...existingCategory.content,
            ...llmCategory.content.map(item => ({
              ...item,
              fromLLM: true
            }))
          ];
        }
        
        // Add LLM insights if available
        if (Array.isArray(llmCategory.insights)) {
          existingCategory.insights = [
            ...(Array.isArray(existingCategory.insights) ? existingCategory.insights : []),
            ...llmCategory.insights
          ];
        }
        
        // Update metrics if LLM category has metrics
        if (llmCategory.metrics) {
          existingCategory.metrics = {
            ...(existingCategory.metrics || {}),
            llmRelevance: llmCategory.metrics.relevance,
            llmAccuracy: llmCategory.metrics.accuracy,
            llmOverall: llmCategory.metrics.overall
          };
        }
      } else {
        // Add new category
        enhancedCategories.push({
          ...llmCategory,
          fromLLM: true
        });
        
        // Update category map
        categoryMap[llmCategory.id] = enhancedCategories.length - 1;
      }
    });
    
    return enhancedCategories;
  } catch (error) {
    console.error('Error enhancing categories with LLM:', error);
    return categories;
  }
};

/**
 * Create business category from LLM response
 * @param {string} llmResponse The LLM response
 * @param {string} query The search query
 * @returns {Object|null} Business category or null if not found
 */
export const createBusinessCategoryFromLLM = (llmResponse, query) => {
  try {
    // Process the LLM response
    const llmCategories = mapLLMResponseToCategories(llmResponse, query, {
      businessFocus: true
    });
    
    if (!Array.isArray(llmCategories) || llmCategories.length === 0) {
      return null;
    }
    
    // Look for business category
    const businessCategory = llmCategories.find(cat => 
      cat.id === 'business' || 
      cat.name.toLowerCase().includes('business') ||
      cat.id === 'market_analysis' ||
      cat.id === 'financial_data' ||
      cat.id === 'company_info'
    );
    
    if (businessCategory) {
      return {
        ...businessCategory,
        fromLLM: true
      };
    }
    
    // If no business category found, create one from business-related content
    const businessContent = [];
    
    // Collect business content from all categories
    llmCategories.forEach(category => {
      if (Array.isArray(category.content)) {
        category.content.forEach(item => {
          if (isBusinessContent(item, query)) {
            businessContent.push({
              ...item,
              sourceCategory: category.name,
              fromLLM: true
            });
          }
        });
      }
    });
    
    // If business content found, create business category
    if (businessContent.length > 0) {
      return {
        id: 'business',
        name: 'Business Insights',
        content: businessContent,
        fromLLM: true,
        llmProcessed: true
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error creating business category from LLM:', error);
    return null;
  }
};

/**
 * Check if content is business-related
 * @param {Object} contentItem The content item
 * @param {string} query The search query
 * @returns {boolean} Whether the content is business-related
 */
export const isBusinessContent = (contentItem, query) => {
  try {
    if (!contentItem) return false;
    
    const businessTerms = [
      'market', 'business', 'company', 'industry', 'revenue', 'profit', 'financial', 
      'earnings', 'stock', 'investment', 'investor', 'strategy', 'growth', 'sales', 
      'forecast', 'trend', 'competitor', 'acquisition', 'merger'
    ];
    
    // Check title
    if (contentItem.title) {
      const titleLower = contentItem.title.toLowerCase();
      for (const term of businessTerms) {
        if (titleLower.includes(term)) {
          return true;
        }
      }
    }
    
    // Check description
    if (contentItem.description) {
      const descLower = contentItem.description.toLowerCase();
      
      // Count business terms
      let businessTermCount = 0;
      for (const term of businessTerms) {
        if (descLower.includes(term)) {
          businessTermCount++;
        }
        
        // If multiple business terms, consider it business content
        if (businessTermCount >= 2) {
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if content is business-related:', error);
    return false;
  }
};
