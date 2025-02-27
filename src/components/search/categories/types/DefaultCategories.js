/**
 * Default category definitions for content categorization
 */

/**
 * Get default categories for search results
 * @returns {Array} Array of default category objects
 */
export const getDefaultCategories = () => {
  console.log("Getting default categories");
  
  // Generate unique IDs for each category
  const allResultsId = 'cat_all_' + Date.now();
  const webResultsId = 'cat_web_' + Date.now();
  const textResultsId = 'cat_text_' + Date.now();
  const codeResultsId = 'cat_code_' + Date.now();
  const imageResultsId = 'cat_image_' + Date.now();
  
  const categories = [
    {
      id: allResultsId,
      name: 'All Results',
      icon: 'search',
      description: 'All search results',
      filter: (item) => true, // Include all items
      priority: 100
    },
    {
      id: webResultsId,
      name: 'Web Results',
      icon: 'globe',
      description: 'Web search results',
      filter: (item) => {
        return item && (
          (item.url || item.link) || 
          (item.type && (item.type === 'web' || item.type === 'search_result'))
        );
      },
      priority: 90
    },
    {
      id: textResultsId,
      name: 'Text',
      icon: 'file-text',
      description: 'Text content',
      filter: (item) => {
        return item && (
          (item.type && item.type === 'text') ||
          (typeof item.content === 'string' && item.content.length > 0) ||
          (typeof item.text === 'string' && item.text.length > 0)
        );
      },
      priority: 80
    },
    {
      id: codeResultsId,
      name: 'Code',
      icon: 'code',
      description: 'Code snippets',
      filter: (item) => {
        return item && (
          (item.type && item.type === 'code') ||
          (item.language && typeof item.language === 'string') ||
          (item.code && typeof item.code === 'string')
        );
      },
      priority: 70
    },
    {
      id: imageResultsId,
      name: 'Images',
      icon: 'image',
      description: 'Image results',
      filter: (item) => {
        return item && (
          (item.type && item.type === 'image') ||
          (item.imageUrl || item.image_url || item.img || item.src)
        );
      },
      priority: 60
    }
  ];
  
  console.log("Default categories created:", categories.map(c => c.name).join(', '));
  return categories;
};

/**
 * Get categories based on content keywords
 * @param {string} content Content to analyze
 * @returns {Array} Array of category objects that match the content
 */
export const getCategoriesByKeywords = (content) => {
  console.log("getCategoriesByKeywords called");
  
  // Convert content to lowercase for case-insensitive matching
  const contentLower = typeof content === 'string' ? content.toLowerCase() : '';
  
  // Define keyword sets for different categories
  const keywordSets = {
    'education': ['education', 'learning', 'student', 'school', 'university', 'college', 'course', 'class'],
    'technology': ['technology', 'software', 'hardware', 'digital', 'computer', 'internet', 'online', 'app'],
    'health': ['health', 'medical', 'medicine', 'doctor', 'patient', 'hospital', 'clinic', 'treatment'],
    'finance': ['finance', 'money', 'investment', 'market', 'stock', 'fund', 'bank', 'financial'],
    'business': ['business', 'company', 'corporate', 'industry', 'organization', 'enterprise', 'firm', 'startup'],
    'science': ['science', 'scientific', 'research', 'study', 'experiment', 'laboratory', 'discovery', 'innovation']
  };
  
  // Check content against each keyword set
  const matchedCategories = [];
  
  Object.entries(keywordSets).forEach(([category, keywords]) => {
    // Check if content contains any of the keywords
    const matches = keywords.filter(keyword => contentLower.includes(keyword));
    
    // If there are matches, add the category
    if (matches.length > 0) {
      matchedCategories.push({
        id: `category-${category}`,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        keywords: matches
      });
    }
  });
  
  return matchedCategories;
};
