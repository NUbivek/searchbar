/**
 * Enhances categories with content from search results if the content is empty
 * This is a utility function to ensure categories always have content
 */

/**
 * Populates empty category content with search results
 * @param {Array} categories - Categories to enhance
 * @param {Array} results - Search results to use for content
 * @returns {Array} - Enhanced categories with content
 */
function enhanceCategoryContent(categories, results) {
  if (!Array.isArray(categories) || categories.length === 0) {
    console.log('enhanceCategoryContent: No categories to enhance');
    return categories;
  }

  if (!Array.isArray(results) || results.length === 0) {
    console.log('enhanceCategoryContent: No results available to enhance categories');
    return categories;
  }

  console.log(`enhanceCategoryContent: Enhancing ${categories.length} categories with ${results.length} results`);
  
  // Loop through each category
  return categories.map(category => {
    // Skip if category already has content
    if (category.content && Array.isArray(category.content) && category.content.length > 0) {
      return category;
    }
    
    // Get 3-5 most relevant results for this category
    // More sophisticated implementations could filter by category keyword relevance
    const contentItems = results.slice(0, Math.min(5, results.length));
    
    console.log(`enhanceCategoryContent: Adding ${contentItems.length} items to category ${category.name || category.id}`);
    
    // Clone the category and add content
    return {
      ...category,
      content: contentItems,
    };
  });
}

module.exports = {
  enhanceCategoryContent
};
