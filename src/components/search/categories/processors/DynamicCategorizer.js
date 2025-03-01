/**
 * Dynamic content categorization based on text analysis
 * Creates categories on-the-fly from content sections
 */

import { findBestCategories } from './CategoryFinder';

/**
 * Create dynamic categories from content
 * @param {string} text Text content to categorize
 * @param {Array} sources Sources used in the content
 * @param {string} query Search query
 * @param {Object} options Additional options
 * @returns {Array} Categorized content sections
 */
export const createDynamicCategoriesFromText = (text, sources = [], query = '', options = {}) => {
  if (!text) return [];
  
  const debug = options.debug || false;
  
  if (debug) {
    console.log('DynamicCategorizer: Creating categories for query:', query);
    console.log('DynamicCategorizer: Content preview:', text.substring(0, 100) + '...');
    console.log('DynamicCategorizer: Sources count:', sources.length);
  }
  
  // Split content into logical sections
  // This is a simplified approach - in a real implementation, we might use
  // NLP or other techniques to identify coherent sections
  const sections = splitIntoSections(text);
  
  if (debug) {
    console.log('DynamicCategorizer: Split content into', sections.length, 'sections');
  }
  
  // Apply category detection to each section
  const categorizedSections = sections.map(section => {
    const sectionCategories = findBestCategories(section.content, query, options);
    
    return {
      ...section,
      categories: sectionCategories,
      primaryCategory: sectionCategories.length > 0 ? sectionCategories[0] : null
    };
  });
  
  // Group sections by primary category
  const categoryGroups = {};
  
  categorizedSections.forEach(section => {
    if (section.primaryCategory) {
      const categoryId = section.primaryCategory.id;
      
      if (!categoryGroups[categoryId]) {
        categoryGroups[categoryId] = {
          category: section.primaryCategory,
          sections: []
        };
      }
      
      categoryGroups[categoryId].sections.push(section);
    }
  });
  
  // Create final category contents by combining sections
  const categories = Object.values(categoryGroups).map(group => {
    const combinedContent = group.sections
      .map(section => section.content)
      .join('\n\n');
    
    return {
      ...group.category,
      content: combinedContent,
      formattedContent: group.category.formatContent ? 
        group.category.formatContent(combinedContent) : 
        combinedContent
    };
  });
  
  // Sort by category priority then by score
  categories.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.score - a.score;
  });
  
  if (debug) {
    console.log('DynamicCategorizer: Created', categories.length, 'dynamic categories');
  }
  
  return categories;
};

/**
 * Split text into logical sections for categorization
 * @param {string} text Text to split into sections
 * @returns {Array} Array of section objects
 */
const splitIntoSections = (text) => {
  if (!text) return [];
  
  // Simple implementation - split by double newlines
  // In a real implementation, this would be more sophisticated
  const sectionTexts = text.split(/\n\s*\n+/);
  
  return sectionTexts
    .filter(sectionText => sectionText.trim().length > 50) // Skip very short sections
    .map((content, index) => ({
      id: `section-${index}`,
      content: content.trim(),
      index
    }));
};

export default {
  createDynamicCategoriesFromText,
  splitIntoSections
};
