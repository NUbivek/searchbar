/**
 * DynamicCategorizer.js
 * Implements dynamic content categorization based on content analysis and query relevance.
 */

import { findBestCategory, getAllCategories } from './CategoryFinder';
import MetricsCalculator from '../metrics/MetricsCalculator';
import { getDefaultCategories } from './types/DefaultCategories';
import { isBusinessQuery } from '../utils';
import { debug, info, error, warn } from '../../../utils/logger';

// Create a log object for consistent logging
const log = { debug, info, error, warn };

// Maximum number of categories to display
const MAX_CATEGORIES = 6;

// Minimum threshold for metrics (70%)
const MIN_THRESHOLD = 70;

// Lower threshold for edge cases (65%)
const LOWER_THRESHOLD = 65;

// Business category priority boost factor
const BUSINESS_PRIORITY_BOOST = 3;

/**
 * Dynamically categorize content based on query and content analysis
 * @param {Array} content Content items to categorize
 * @param {string} query Search query
 * @param {Object} options Categorization options
 * @returns {Array} Categorized content
 */
export const dynamicCategorize = (content, query, options = {}) => {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return [];
  }

  log.debug('DynamicCategorizer: Starting dynamic categorization');
  log.debug(`Query: "${query}"`);
  log.debug(`Content items: ${content.length}`);

  // Determine if this is a business query
  const businessQueryContext = isBusinessQuery(query);
  if (businessQueryContext) {
    log.info('DynamicCategorizer: Detected business query context');
  }

  // Get default categories based on query
  const categories = getDefaultCategories(query);
  
  // Initialize categories with empty content arrays
  const initializedCategories = categories.map(category => ({
    ...category,
    content: [],
    metrics: { relevance: 0, accuracy: 0, credibility: 0, overall: 0 }
  }));
  
  // Track content assignments to prevent duplicates
  const contentAssignmentMap = new Map();
  
  // First pass: Calculate metrics and assign to best matching categories
  content.forEach(item => {
    // Skip if item is not valid
    if (!item || typeof item !== 'object') return;
    
    // Use pre-calculated metrics if available (from LLM processing)
    let metrics;
    if (item._metrics && typeof item._metrics === 'object') {
      metrics = item._metrics;
    } else {
      // Calculate metrics for the item if not already available
      metrics = {
        relevance: MetricsCalculator.calculateRelevance(item, query),
        accuracy: MetricsCalculator.calculateAccuracy(item),
        credibility: MetricsCalculator.calculateCredibility(item)
      };
      
      // Calculate overall score with 2x weighting for relevance
      metrics.overall = Math.round((metrics.relevance * 2 + metrics.accuracy + metrics.credibility) / 4);
    }
    
    // Find best matching category for this item
    const bestMatch = findBestCategory({
      content: item,
      query: query,
      metrics: metrics,
      options: {
        ...options,
        businessContext: businessQueryContext
      }
    });
    
    if (bestMatch && bestMatch.category && bestMatch.score >= (MIN_THRESHOLD / 100)) {
      // Create a unique identifier for this content item
      const contentId = item.id || item.url || JSON.stringify(item).substring(0, 100);
      
      // Skip if already assigned to a higher scoring category
      if (contentAssignmentMap.has(contentId) && 
          contentAssignmentMap.get(contentId).score > bestMatch.score) {
        return;
      }
      
      // Get category from initialized categories
      const categoryMatch = initializedCategories.find(c => c.id === bestMatch.category.id);
      
      if (categoryMatch) {
        // Add content to category with score
        categoryMatch.content.push({
          ...item,
          _categoryScore: bestMatch.score * 100,
          _metrics: metrics
        });
        
        // Track assignment
        contentAssignmentMap.set(contentId, {
          categoryId: bestMatch.category.id,
          score: bestMatch.score
        });
      }
    }
  });
  
  // Second pass for uncategorized content using lower threshold
  content.forEach(item => {
    // Skip if item is not valid
    if (!item || typeof item !== 'object') return;
    
    // Create a unique identifier for this content item
    const contentId = item.id || item.url || JSON.stringify(item).substring(0, 100);
    
    // Skip if already assigned
    if (contentAssignmentMap.has(contentId)) return;
    
    // Use pre-calculated metrics if available
    let metrics;
    if (item._metrics && typeof item._metrics === 'object') {
      metrics = item._metrics;
    } else {
      // Calculate metrics for the item
      metrics = {
        relevance: MetricsCalculator.calculateRelevance(item, query),
        accuracy: MetricsCalculator.calculateAccuracy(item),
        credibility: MetricsCalculator.calculateCredibility(item)
      };
      
      // Calculate overall score
      metrics.overall = Math.round((metrics.relevance * 2 + metrics.accuracy + metrics.credibility) / 4);
    }
    
    // Find all matching categories with lower threshold
    const matches = getAllCategories({
      content: item,
      query: query,
      metrics: metrics,
      threshold: LOWER_THRESHOLD / 100,
      options: {
        ...options,
        businessContext: businessQueryContext
      }
    });
    
    // Use the highest scoring match
    if (matches && matches.length > 0) {
      const bestMatch = matches[0];
      
      // Get category from initialized categories
      const categoryMatch = initializedCategories.find(c => c.id === bestMatch.category.id);
      
      if (categoryMatch) {
        // Add content to category with score
        categoryMatch.content.push({
          ...item,
          _categoryScore: bestMatch.score * 100,
          _metrics: metrics
        });
        
        // Track assignment
        contentAssignmentMap.set(contentId, {
          categoryId: bestMatch.category.id,
          score: bestMatch.score
        });
      }
    }
  });
  
  // Filter categories to those with content and calculate metrics
  const categoriesWithContent = initializedCategories
    .filter(category => category.content && category.content.length > 0)
    .map(category => {
      // Calculate category-level metrics
      const metrics = {
        relevance: calculateAverageMetric(category.content, 'relevance'),
        accuracy: calculateAverageMetric(category.content, 'accuracy'),
        credibility: calculateAverageMetric(category.content, 'credibility')
      };
      
      // Calculate overall score with 2x relevance weighting
      metrics.overall = Math.round((metrics.relevance * 2 + metrics.accuracy + metrics.credibility) / 4);
      
      // Apply business boost if applicable
      if (businessQueryContext && isBusinessCategory(category)) {
        category.priority = (category.priority || 5) - BUSINESS_PRIORITY_BOOST;
        log.debug(`Applied business boost to category: ${category.name}`);
      }
      
      return {
        ...category,
        metrics
      };
    });
  
  // Sort categories by priority first, then by overall metrics
  categoriesWithContent.sort((a, b) => {
    // First by priority (lower = higher priority)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    
    // Then by overall metrics
    return b.metrics.overall - a.metrics.overall;
  });
  
  // Apply diversity algorithms to ensure optimal category distribution
  const diverseCategories = ensureDiversity(categoriesWithContent);
  
  // Limit to maximum number of categories
  const finalCategories = diverseCategories.slice(0, MAX_CATEGORIES);
  
  // Sort content within each category by relevance (descending)
  finalCategories.forEach(category => {
    category.content.sort((a, b) => {
      const aRelevance = a._metrics?.relevance || a._relevanceScore || 0;
      const bRelevance = b._metrics?.relevance || b._relevanceScore || 0;
      return bRelevance - aRelevance;
    });
  });
  
  log.debug(`DynamicCategorizer: Completed with ${finalCategories.length} categories`);
  return finalCategories;
};

/**
 * Calculate average metric value for content items
 * @param {Array} contentItems Array of content items
 * @param {string} metricName Name of the metric to calculate
 * @returns {number} Average metric value (0-100)
 */
const calculateAverageMetric = (contentItems, metricName) => {
  if (!contentItems || contentItems.length === 0) return 0;
  
  let total = 0;
  let count = 0;
  
  contentItems.forEach(item => {
    const metricValue = item._metrics?.[metricName] || 0;
    if (metricValue > 0) {
      total += metricValue;
      count++;
    }
  });
  
  return count > 0 ? Math.round(total / count) : 0;
};

/**
 * Check if a category is business-related
 * @param {Object} category Category object to check
 * @returns {boolean} True if business-related
 */
const isBusinessCategory = (category) => {
  if (!category) return false;
  
  // Direct ID match for business categories
  const businessCategoryIds = [
    'business', 
    'financial', 
    'investment',
    'investmentTrends',
    'financialOverview',
    'businessStrategy',
    'marketOverview',
    'economicTrends',
    'ventureFunding'
  ];
  
  // Check for direct ID match
  if (businessCategoryIds.includes(category.id)) {
    return true;
  }
  
  // Check keywords for business terms
  const businessKeywords = [
    'business', 'market', 'financial', 'investment', 'economic', 'strategy', 
    'revenue', 'profit', 'investor', 'venture', 'funding', 'growth', 'trend',
    'forecast', 'opportunity', 'portfolio', 'asset', 'roi', 'return'
  ];
  
  // Check if any business keywords exist in category keywords
  if (category.keywords && Array.isArray(category.keywords)) {
    for (const keyword of category.keywords) {
      const lowerKeyword = keyword.toLowerCase();
      if (businessKeywords.some(bk => lowerKeyword.includes(bk))) {
        return true;
      }
    }
  }
  
  // Check name and description
  if (category.name) {
    const lowerName = category.name.toLowerCase();
    if (businessKeywords.some(bk => lowerName.includes(bk))) {
      return true;
    }
  }
  
  if (category.description) {
    const lowerDesc = category.description.toLowerCase();
    if (businessKeywords.some(bk => lowerDesc.includes(bk))) {
      return true;
    }
  }
  
  return false;
};

/**
 * Ensure diversity of content across categories
 * @param {Array} categories Categories with content
 * @returns {Array} Categories with diverse content
 */
export const ensureDiversity = (categories) => {
  if (!categories || categories.length <= 1) return categories;
  
  // Create a map to track content assignments
  const contentMap = new Map();
  
  // Find the "All Results" category - this one can have duplicates
  const allResultsCategory = categories.find(cat => cat.name === 'All Results');
  
  // First pass: collect all content items and their best category match
  categories.forEach(category => {
    // Skip the "All Results" category in deduplication
    if (category.name === 'All Results') return;
    
    if (category.content && Array.isArray(category.content)) {
      category.content.forEach(item => {
        // Create a unique key for this content item
        const itemKey = item._contentId || item.url || item.link || 
                       (item.title && (item.title + (item.description || '')));
        
        if (!itemKey) return; // Skip if we can't identify this item
        
        if (!contentMap.has(itemKey)) {
          // First time seeing this item, add it with this category
          contentMap.set(itemKey, {
            item,
            bestCategory: category,
            bestScore: item._categoryScore || item._relevanceScore || 0,
            categories: [category]
          });
        } else {
          // We've seen this item before, check if this category is a better match
          const entry = contentMap.get(itemKey);
          const currentScore = item._categoryScore || item._relevanceScore || 0;
          
          // Add this category to the list
          entry.categories.push(category);
          
          // Update best category if this score is higher
          if (currentScore > entry.bestScore) {
            entry.bestScore = currentScore;
            entry.bestCategory = category;
            entry.item = item; // Use the item from the best category
          }
        }
      });
    }
  });
  
  // Second pass: create new categories with deduplicated content
  const deduplicatedCategories = categories.map(category => {
    // Don't modify the "All Results" category
    if (category.name === 'All Results') return category;
    
    // Create a new content array for this category
    const newContent = [];
    
    // Add items that belong to this category
    Array.from(contentMap.values()).forEach(entry => {
      if (entry.bestCategory.id === category.id) {
        newContent.push(entry.item);
      }
    });
    
    // Create a new category with deduplicated content
    return {
      ...category,
      content: newContent
    };
  });
  
  return deduplicatedCategories;
};

/**
 * Create dynamically categorized content from text
 * @param {string} text - The text content to categorize
 * @param {Array} sources - Array of sources for the content
 * @param {string} query - The search query
 * @returns {Object} Object containing categorized content and metrics
 */
export const createDynamicCategoriesFromText = (text, sources = [], query = '') => {
  // If no text, return empty result
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return {
      categories: [],
      metrics: {
        relevance: 0,
        credibility: 0,
        accuracy: 0
      }
    };
  }

  // Split content into logical sections
  const sections = splitContentIntoSections(text);

  // Categorize each section
  const categorizedSections = sections.map(section => {
    // Find best category for this section
    const category = findBestCategory(section.content, section.title, query);
    
    // Calculate metrics for this section
    const metrics = calculateSectionMetrics(section, sources, query);
    
    return {
      ...section,
      category,
      metrics
    };
  });

  // Filter sections by minimum threshold
  let filteredSections = categorizedSections.filter(section => 
    section.metrics.relevance >= MIN_THRESHOLD &&
    section.metrics.credibility >= MIN_THRESHOLD &&
    section.metrics.accuracy >= MIN_THRESHOLD
  );

  // Edge case: If fewer than 3 categories meet the threshold, lower the threshold
  if (countUniqueCategories(filteredSections) < 3) {
    filteredSections = categorizedSections.filter(section => 
      section.metrics.relevance >= LOWER_THRESHOLD &&
      section.metrics.credibility >= LOWER_THRESHOLD &&
      section.metrics.accuracy >= LOWER_THRESHOLD
    );
  }

  // Edge case: If no categories meet even the lowered threshold, use only "Key Insights"
  if (filteredSections.length === 0) {
    // Find the highest scoring section overall
    const highestScoringSection = categorizedSections.reduce((best, current) => {
      const bestScore = best.metrics.relevance + best.metrics.credibility + best.metrics.accuracy;
      const currentScore = current.metrics.relevance + current.metrics.credibility + current.metrics.accuracy;
      return currentScore > bestScore ? current : best;
    }, categorizedSections[0] || { metrics: { relevance: 0, credibility: 0, accuracy: 0 } });
    
    // Force it into Key Insights category
    if (highestScoringSection) {
      highestScoringSection.category = { id: 'key_insights', name: 'Key Insights' };
      filteredSections = [highestScoringSection];
    }
  }

  // Apply relevance weighting (2x multiplier) and sort
  const weightedSections = filteredSections.map(section => {
    const weightedRelevance = section.metrics.relevance * 2; // 2x multiplier for relevance
    const weightedTotal = weightedRelevance + section.metrics.credibility + section.metrics.accuracy;
    
    return {
      ...section,
      weightedScore: weightedTotal
    };
  });

  // Sort by weighted score (descending)
  weightedSections.sort((a, b) => b.weightedScore - a.weightedScore);

  // Ensure diversity by selecting top sections from different categories
  const diverseSections = ensureSectionDiversity(weightedSections);

  // Limit to MAX_CATEGORIES
  const finalSections = diverseSections.slice(0, MAX_CATEGORIES);

  // Group by category
  const categorizedContent = groupByCategory(finalSections);

  // Calculate overall metrics
  const overallMetrics = calculateOverallMetrics(finalSections);

  return {
    categories: categorizedContent,
    metrics: overallMetrics
  };
};

/**
 * Split content into logical sections
 * @param {string} content - The content to split
 * @returns {Array} Array of section objects
 */
const splitContentIntoSections = (content) => {
  // If content is empty, return empty array
  if (!content || content.trim() === '') {
    return [];
  }

  // Try to split by markdown headings first
  const headingSections = content.split(/(?=^#{1,3}\s+.+$)/m);
  
  if (headingSections.length > 1) {
    // Content has markdown headings, use them as section boundaries
    return headingSections.map(section => {
      // Extract title from heading
      const titleMatch = section.match(/^(#{1,3})\s+(.+)$/m);
      const title = titleMatch ? titleMatch[2].trim() : '';
      
      // Remove heading from content
      const sectionContent = titleMatch 
        ? section.replace(/^#{1,3}\s+.+$/m, '').trim() 
        : section.trim();
      
      return {
        title,
        content: sectionContent
      };
    }).filter(section => section.content.trim() !== ''); // Remove empty sections
  }
  
  // Try to split by newlines with potential section titles
  const paragraphs = content.split(/\n\n+/);
  
  if (paragraphs.length > 1) {
    // Look for potential section titles (short lines followed by longer content)
    const sections = [];
    let currentSection = null;
    
    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (trimmedParagraph === '') continue;
      
      // Check if this looks like a title (short, no punctuation at end, not starting with bullet)
      const isTitleLike = trimmedParagraph.length < 100 && 
                          !trimmedParagraph.match(/[.,:;]$/) &&
                          !trimmedParagraph.match(/^[•\-*]/);
      
      if (isTitleLike) {
        // Start a new section
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmedParagraph,
          content: ''
        };
      } else if (currentSection) {
        // Add to current section
        currentSection.content += (currentSection.content ? '\n\n' : '') + trimmedParagraph;
      } else {
        // No current section, create one without a title
        currentSection = {
          title: '',
          content: trimmedParagraph
        };
      }
    }
    
    // Add the last section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    if (sections.length > 1) {
      return sections;
    }
  }
  
  // If no clear sections, split into roughly equal chunks
  const contentLength = content.length;
  const idealChunkSize = 500; // Aim for ~500 character chunks
  const numChunks = Math.max(1, Math.min(5, Math.ceil(contentLength / idealChunkSize)));
  const chunkSize = Math.ceil(contentLength / numChunks);
  
  const chunks = [];
  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, contentLength);
    
    // Try to find a natural break point (end of sentence)
    let adjustedEnd = end;
    if (end < contentLength) {
      const nextPeriod = content.indexOf('.', end - 50);
      if (nextPeriod > 0 && nextPeriod < end + 50) {
        adjustedEnd = nextPeriod + 1;
      }
    }
    
    chunks.push({
      title: '',
      content: content.substring(start, adjustedEnd).trim()
    });
  }
  
  return chunks;
};

/**
 * Calculate metrics for a section
 * @param {Object} section - The section object
 * @param {Array} sources - Array of sources
 * @param {string} query - The search query
 * @returns {Object} Metrics object
 */
const calculateSectionMetrics = (section, sources, query) => {
  // Create a result object for the metrics calculation
  const result = {
    content: section.content,
    title: section.title,
    sources: sources
  };

  // Calculate individual metrics
  const relevance = MetricsCalculator.calculateRelevance(result, query);
  const credibility = MetricsCalculator.calculateCredibility(result);
  const accuracy = MetricsCalculator.calculateAccuracy(result);

  return {
    relevance,
    credibility,
    accuracy
  };
};

/**
 * Count unique categories in sections
 * @param {Array} sections - Array of categorized sections
 * @returns {number} Number of unique categories
 */
const countUniqueCategories = (sections) => {
  const uniqueCategories = new Set();
  
  sections.forEach(section => {
    if (section.category && section.category.id) {
      uniqueCategories.add(section.category.id);
    }
  });
  
  return uniqueCategories.size;
};

/**
 * Ensure diversity of categories for sections
 * @param {Array} sections - Array of categorized sections
 * @returns {Array} Array with diverse categories
 */
const ensureSectionDiversity = (sections) => {
  if (!sections || sections.length === 0) return [];
  
  // Create a map to track which content has been assigned to which categories
  const contentAssignmentMap = new Map();
  
  // First pass: count how many categories each content item is assigned to
  sections.forEach(section => {
    const contentId = section.content + (section.title || ''); // Create a simple content identifier
    
    if (!contentAssignmentMap.has(contentId)) {
      contentAssignmentMap.set(contentId, {
        categoryCount: 1,
        categories: [section.category],
        sections: [section]
      });
    } else {
      const entry = contentAssignmentMap.get(contentId);
      entry.categoryCount += 1;
      entry.categories.push(section.category);
      entry.sections.push(section);
    }
  });
  
  // Second pass: for content assigned to multiple categories, keep only the best match
  const diverseSections = [];
  
  contentAssignmentMap.forEach(assignment => {
    if (assignment.categoryCount === 1) {
      // If content is only in one category, keep it as is
      diverseSections.push(assignment.sections[0]);
    } else {
      // Content is in multiple categories, find the best match
      const bestCategory = assignment.categories.reduce((best, current) => {
        // Higher relevance score wins
        const currentScore = assignment.sections.find(s => s.category.id === current.id)?.metrics?.relevance || 0;
        const bestScore = best?.metrics?.relevance || 0;
        
        return currentScore > bestScore ? current : best;
      }, null);
      
      // Create a new section with only the best category
      const bestSection = assignment.sections.find(s => s.category.id === bestCategory.id);
      diverseSections.push(bestSection);
    }
  });
  
  // Ensure we have at least MIN_THRESHOLD% unique content in each category
  const uniqueContentPerCategory = new Map();
  
  // Count unique content per category
  diverseSections.forEach(section => {
    const category = section.category;
    if (!uniqueContentPerCategory.has(category)) {
      uniqueContentPerCategory.set(category, 1);
    } else {
      uniqueContentPerCategory.set(category, uniqueContentPerCategory.get(category) + 1);
    }
  });
  
  return diverseSections;
};

/**
 * Group sections by category
 * @param {Array} sections - Array of categorized sections
 * @returns {Array} Array of category objects with content
 */
const groupByCategory = (sections) => {
  const categoryMap = new Map();
  
  // Group sections by category
  sections.forEach(section => {
    const categoryId = section.category.id;
    
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        ...section.category,
        content: [],
        metrics: {
          relevance: 0,
          credibility: 0,
          accuracy: 0
        }
      });
    }
    
    const category = categoryMap.get(categoryId);
    
    // Add section to category content
    category.content.push({
      title: section.title,
      content: section.content,
      metrics: section.metrics
    });
    
    // Update category metrics (use highest values)
    category.metrics.relevance = Math.max(category.metrics.relevance, section.metrics.relevance);
    category.metrics.credibility = Math.max(category.metrics.credibility, section.metrics.credibility);
    category.metrics.accuracy = Math.max(category.metrics.accuracy, section.metrics.accuracy);
  });
  
  // Convert map to array and sort by priority
  return Array.from(categoryMap.values())
    .sort((a, b) => {
      // Sort by priority first (lower number = higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Then by relevance
      return b.metrics.relevance - a.metrics.relevance;
    });
};

/**
 * Calculate overall metrics from all sections
 * @param {Array} sections - Array of categorized sections
 * @returns {Object} Overall metrics object
 */
const calculateOverallMetrics = (sections) => {
  if (!sections || sections.length === 0) {
    return {
      relevance: 0,
      credibility: 0,
      accuracy: 0
    };
  }
  
  // Calculate average metrics
  const totalRelevance = sections.reduce((sum, section) => sum + section.metrics.relevance, 0);
  const totalCredibility = sections.reduce((sum, section) => sum + section.metrics.credibility, 0);
  const totalAccuracy = sections.reduce((sum, section) => sum + section.metrics.accuracy, 0);
  
  return {
    relevance: Math.round(totalRelevance / sections.length),
    credibility: Math.round(totalCredibility / sections.length),
    accuracy: Math.round(totalAccuracy / sections.length)
  };
};

export default {
  createDynamicCategoriesFromText,
  dynamicCategorize,
  ensureDiversity,
  MAX_CATEGORIES,
  MIN_THRESHOLD,
  LOWER_THRESHOLD
};
