/**
 * Utility for processing LLM responses and categorizing content
 */
import { isBusinessQuery } from '../utils/contextDetector';

/**
 * Process an LLM response and extract structured data
 * @param {string} llmResponse The raw LLM response text
 * @param {string} query The original search query
 * @param {Object} options Processing options
 * @returns {Object} Processed data with categories and content
 */
export const processLLMResponse = (llmResponse, query, options = {}) => {
  if (!llmResponse || typeof llmResponse !== 'string') {
    console.error('Invalid LLM response provided to processor');
    return {
      categories: [],
      error: 'Invalid LLM response'
    };
  }
  
  try {
    // Check if response is business-focused
    const isBusinessFocused = isBusinessQuery(query);
    
    // Extract categories and content from LLM response
    const extractedData = extractStructuredData(llmResponse, query);
    
    // Process categories with business context if applicable
    if (isBusinessFocused) {
      enhanceWithBusinessContext(extractedData, query);
    }
    
    // Calculate metrics for all content
    calculateContentMetrics(extractedData, query);
    
    return extractedData;
  } catch (error) {
    console.error('Error processing LLM response:', error);
    return {
      categories: [],
      error: 'Error processing LLM response'
    };
  }
};

/**
 * Extract structured data from LLM response text
 * @param {string} responseText The LLM response text
 * @param {string} query The search query
 * @returns {Object} Extracted data with categories and content
 */
export const extractStructuredData = (responseText, query) => {
  // Initialize result structure
  const result = {
    categories: [],
    rawText: responseText
  };
  
  try {
    // Check if response is in JSON format
    if (responseText.includes('{') && responseText.includes('}')) {
      try {
        // Try to find and parse JSON in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]);
          
          // If JSON has categories, use them
          if (Array.isArray(jsonData.categories)) {
            result.categories = jsonData.categories;
            return result;
          }
        }
      } catch (jsonError) {
        console.warn('Failed to parse JSON from LLM response:', jsonError);
      }
    }
    
    // If not JSON or JSON parsing failed, try to extract categories from text
    const categories = extractCategoriesFromText(responseText, query);
    result.categories = categories;
    
    return result;
  } catch (error) {
    console.error('Error extracting structured data from LLM response:', error);
    return result;
  }
};

/**
 * Extract categories from plain text response
 * @param {string} text The response text
 * @param {string} query The search query
 * @returns {Array} Array of category objects
 */
export const extractCategoriesFromText = (text, query) => {
  const categories = [];
  
  try {
    // Split text into sections (potential categories)
    const sections = text.split(/\n\s*#{1,3}\s+/);
    
    // Process each section
    sections.forEach((section, index) => {
      if (index === 0 && !section.trim().startsWith('#')) {
        // Skip introduction section
        return;
      }
      
      // Extract category name from first line
      const lines = section.split('\n');
      let categoryName = lines[0].replace(/^#+\s*/, '').trim();
      
      // Skip if category name is empty
      if (!categoryName) return;
      
      // Clean up category name
      categoryName = categoryName.replace(/:/g, '').trim();
      
      // Generate category ID
      const categoryId = categoryName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      
      // Extract content items from section
      const contentItems = extractContentItems(section, query);
      
      // Add category if it has content
      if (contentItems.length > 0) {
        categories.push({
          id: categoryId,
          name: categoryName,
          content: contentItems,
          llmProcessed: true
        });
      }
    });
    
    // If no categories were found, create a default one
    if (categories.length === 0) {
      categories.push({
        id: 'general',
        name: 'General Results',
        content: extractContentItems(text, query),
        llmProcessed: true
      });
    }
    
    return categories;
  } catch (error) {
    console.error('Error extracting categories from text:', error);
    return [{
      id: 'general',
      name: 'General Results',
      content: [],
      llmProcessed: true
    }];
  }
};

/**
 * Extract content items from a section of text
 * @param {string} sectionText The section text
 * @param {string} query The search query
 * @returns {Array} Array of content items
 */
export const extractContentItems = (sectionText, query) => {
  const contentItems = [];
  
  try {
    // Split into paragraphs
    const paragraphs = sectionText.split(/\n\n+/);
    
    // Skip the first paragraph (usually the category name/description)
    const contentParagraphs = paragraphs.slice(1);
    
    // Process each paragraph as a potential content item
    contentParagraphs.forEach((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      
      // Skip empty paragraphs
      if (!trimmedParagraph) return;
      
      // Skip list markers or other non-content paragraphs
      if (trimmedParagraph.match(/^[•\-\*]\s*$/)) return;
      
      // Create content item
      const contentItem = {
        id: `content-${Date.now()}-${index}`,
        title: extractTitle(trimmedParagraph),
        description: trimmedParagraph,
        llmProcessed: true,
        _relevanceScore: calculateRelevanceScore(trimmedParagraph, query)
      };
      
      contentItems.push(contentItem);
    });
    
    return contentItems;
  } catch (error) {
    console.error('Error extracting content items:', error);
    return [];
  }
};

/**
 * Extract a title from a paragraph
 * @param {string} paragraph The paragraph text
 * @returns {string} Extracted title
 */
export const extractTitle = (paragraph) => {
  try {
    // Split into sentences
    const sentences = paragraph.split(/[.!?]+/);
    
    // Use first sentence as title if it's not too long
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      
      if (firstSentence.length > 0 && firstSentence.length <= 100) {
        return firstSentence;
      }
    }
    
    // If first sentence is too long, create a shorter title
    const words = paragraph.split(/\s+/);
    if (words.length > 5) {
      return words.slice(0, 5).join(' ') + '...';
    }
    
    return paragraph.substring(0, 50) + (paragraph.length > 50 ? '...' : '');
  } catch (error) {
    console.error('Error extracting title:', error);
    return 'Untitled Content';
  }
};

/**
 * Calculate relevance score for content
 * @param {string} content The content text
 * @param {string} query The search query
 * @returns {number} Relevance score (0-100)
 */
export const calculateRelevanceScore = (content, query) => {
  try {
    if (!content || !query) return 50; // Default score
    
    const contentLower = content.toLowerCase();
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    // Calculate term frequency
    let termMatches = 0;
    queryTerms.forEach(term => {
      if (term.length < 3) return; // Skip very short terms
      
      const regex = new RegExp(term, 'gi');
      const matches = contentLower.match(regex);
      
      if (matches) {
        termMatches += matches.length;
      }
    });
    
    // Calculate content length factor (prefer medium-length content)
    const contentLength = content.length;
    let lengthFactor = 1.0;
    
    if (contentLength < 50) {
      lengthFactor = 0.7; // Penalize very short content
    } else if (contentLength > 1000) {
      lengthFactor = 0.9; // Slightly penalize very long content
    } else if (contentLength > 200 && contentLength < 600) {
      lengthFactor = 1.1; // Bonus for ideal length content
    }
    
    // Calculate base score
    const baseScore = Math.min(100, Math.max(0, 
      50 + (termMatches * 10 * lengthFactor)
    ));
    
    return Math.round(baseScore);
  } catch (error) {
    console.error('Error calculating relevance score:', error);
    return 50; // Default score
  }
};

/**
 * Enhance extracted data with business context
 * @param {Object} data The extracted data
 * @param {string} query The search query
 */
export const enhanceWithBusinessContext = (data, query) => {
  try {
    if (!data || !Array.isArray(data.categories)) return;
    
    // Add business category if not present
    let businessCategory = data.categories.find(cat => 
      cat.id === 'business' || 
      cat.name.toLowerCase().includes('business')
    );
    
    if (!businessCategory) {
      // Create business category
      businessCategory = {
        id: 'business',
        name: 'Business Insights',
        content: [],
        llmProcessed: true
      };
      
      // Add to categories
      data.categories.unshift(businessCategory);
    }
    
    // Extract business content from other categories
    data.categories.forEach(category => {
      if (category.id === 'business') return; // Skip business category itself
      
      if (Array.isArray(category.content)) {
        // Find business-related content
        const businessContent = category.content.filter(item => 
          isBusinessContent(item, query)
        );
        
        // Add to business category
        if (businessContent.length > 0) {
          businessCategory.content = [
            ...businessCategory.content,
            ...businessContent.map(item => ({
              ...item,
              sourceCategory: category.name
            }))
          ];
        }
      }
    });
    
    // Deduplicate business content
    if (businessCategory.content.length > 0) {
      const uniqueContent = [];
      const seenTitles = new Set();
      
      businessCategory.content.forEach(item => {
        if (item.title && !seenTitles.has(item.title)) {
          seenTitles.add(item.title);
          uniqueContent.push(item);
        }
      });
      
      businessCategory.content = uniqueContent;
    }
  } catch (error) {
    console.error('Error enhancing with business context:', error);
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

/**
 * Calculate metrics for all content in extracted data
 * @param {Object} data The extracted data
 * @param {string} query The search query
 */
export const calculateContentMetrics = (data, query) => {
  try {
    if (!data || !Array.isArray(data.categories)) return;
    
    // Process each category
    data.categories.forEach(category => {
      if (!Array.isArray(category.content)) return;
      
      // Calculate metrics for each content item
      category.content.forEach(item => {
        // Skip if already has metrics
        if (item._metrics) return;
        
        // Calculate relevance if not already set
        if (typeof item._relevanceScore !== 'number') {
          item._relevanceScore = calculateRelevanceScore(
            item.description || item.title || '', 
            query
          );
        }
        
        // Calculate accuracy score
        const accuracyScore = calculateAccuracyScore(item, query);
        
        // Calculate credibility score
        const credibilityScore = calculateCredibilityScore(item);
        
        // Calculate overall score
        const overallScore = Math.round(
          (item._relevanceScore * 0.5) + 
          (accuracyScore * 0.3) + 
          (credibilityScore * 0.2)
        );
        
        // Set metrics
        item._metrics = {
          relevance: item._relevanceScore,
          accuracy: accuracyScore,
          credibility: credibilityScore,
          overall: overallScore
        };
        
        // Set overall score
        item._overallScore = overallScore;
      });
      
      // Calculate category metrics
      calculateCategoryMetrics(category);
    });
  } catch (error) {
    console.error('Error calculating content metrics:', error);
  }
};

/**
 * Calculate accuracy score for content
 * @param {Object} contentItem The content item
 * @param {string} query The search query
 * @returns {number} Accuracy score (0-100)
 */
export const calculateAccuracyScore = (contentItem, query) => {
  try {
    // Default score
    let score = 70;
    
    // Adjust based on content properties
    if (contentItem.description && contentItem.description.length > 100) {
      score += 10; // Bonus for detailed description
    }
    
    if (contentItem.title && contentItem.title.length > 10) {
      score += 5; // Bonus for good title
    }
    
    // Penalize very short content
    const contentLength = (contentItem.description || '').length;
    if (contentLength < 50) {
      score -= 15;
    }
    
    // Bonus for LLM-processed content
    if (contentItem.llmProcessed || contentItem.aiProcessed) {
      score += 5;
    }
    
    // Ensure score is within range
    return Math.min(100, Math.max(0, score));
  } catch (error) {
    console.error('Error calculating accuracy score:', error);
    return 70; // Default score
  }
};

/**
 * Calculate credibility score for content
 * @param {Object} contentItem The content item
 * @returns {number} Credibility score (0-100)
 */
export const calculateCredibilityScore = (contentItem) => {
  try {
    // Default score
    let score = 65;
    
    // Adjust based on content properties
    if (contentItem.url && contentItem.url.includes('.gov')) {
      score += 20; // High credibility for government sources
    } else if (contentItem.url && contentItem.url.includes('.edu')) {
      score += 15; // High credibility for educational sources
    } else if (contentItem.url && contentItem.url.includes('.org')) {
      score += 10; // Medium-high credibility for organization sources
    }
    
    // Adjust based on source
    if (contentItem.source) {
      const sourceLower = contentItem.source.toLowerCase();
      
      if (['reuters', 'bloomberg', 'wsj', 'financial times', 'harvard', 'mit'].some(
        s => sourceLower.includes(s)
      )) {
        score += 15; // High credibility for reputable sources
      }
    }
    
    // Ensure score is within range
    return Math.min(100, Math.max(0, score));
  } catch (error) {
    console.error('Error calculating credibility score:', error);
    return 65; // Default score
  }
};

/**
 * Calculate metrics for a category
 * @param {Object} category The category
 */
export const calculateCategoryMetrics = (category) => {
  try {
    if (!category || !Array.isArray(category.content) || category.content.length === 0) {
      return;
    }
    
    // Calculate average metrics from content items
    let totalRelevance = 0;
    let totalAccuracy = 0;
    let totalCredibility = 0;
    let totalOverall = 0;
    let itemsWithMetrics = 0;
    
    category.content.forEach(item => {
      if (item._metrics) {
        totalRelevance += item._metrics.relevance || 0;
        totalAccuracy += item._metrics.accuracy || 0;
        totalCredibility += item._metrics.credibility || 0;
        totalOverall += item._metrics.overall || 0;
        itemsWithMetrics++;
      } else if (typeof item._overallScore === 'number') {
        totalOverall += item._overallScore;
        totalRelevance += item._relevanceScore || 0;
        itemsWithMetrics++;
      }
    });
    
    if (itemsWithMetrics > 0) {
      category.metrics = {
        relevance: Math.round(totalRelevance / itemsWithMetrics),
        accuracy: Math.round(totalAccuracy / itemsWithMetrics),
        credibility: Math.round(totalCredibility / itemsWithMetrics),
        overall: Math.round(totalOverall / itemsWithMetrics)
      };
    }
  } catch (error) {
    console.error('Error calculating category metrics:', error);
  }
};
