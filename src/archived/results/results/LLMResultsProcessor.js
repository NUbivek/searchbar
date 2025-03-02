/**
 * Processor for LLM search results
 */
import { processLLMResponse, mapLLMResponseToCategories } from '../llm';
import { isBusinessQuery, detectQueryContext } from '../utils/contextDetector';
import { debug, info, warn, error } from '../../../utils/logger';

// Create a log object for consistent logging
const log = { debug, info, warn, error };

/**
 * Class for processing LLM search results
 */
export class LLMResultsProcessor {
  /**
   * Create a new LLM results processor
   * @param {Object} options Processor options
   */
  constructor(options = {}) {
    this.options = {
      businessFocus: false,
      extractInsights: true,
      calculateMetrics: true,
      enhanceCategories: true,
      ...options
    };
  }

  /**
   * Process search results with LLM enhancements
   * @param {Array} results The search results to process
   * @param {string} query The search query
   * @param {Object} options Processing options
   * @returns {Promise<Array>} Processed results as categories
   */
  async processResults(results, query, options = {}) {
    try {
      // Merge options
      const processingOptions = {
        ...this.options,
        ...options
      };

      // Detect query context if not provided
      if (!processingOptions.context) {
        processingOptions.context = detectQueryContext(query);
      }

      // Check if we have LLM results
      const hasLLMResults = Array.isArray(results) && results.some(item => 
        item && typeof item === 'object' && 
        (item.hasOwnProperty('llmProcessed') || item.hasOwnProperty('aiProcessed'))
      );

      // If we have LLM results, process them
      if (hasLLMResults) {
        return this.processLLMResults(results, query, processingOptions);
      }

      // Otherwise, convert standard results to categories
      return this.convertResultsToCategories(results, query, processingOptions);
    } catch (err) {
      log.error('Error in LLMResultsProcessor.processResults:', err);
      throw err;
    }
  }

  /**
   * Process LLM results and convert them to categories
   * @param {Object} llmResults The LLM results object
   * @param {string} query The search query
   * @param {Object} options Processing options
   * @returns {Array} Array of category objects
   */
  processLLMResults(llmResults, query, options = {}) {
    try {
      if (!llmResults || !Array.isArray(llmResults)) {
        log.error('Invalid LLM results provided to processor');
        return [];
      }
      
      // Find the LLM content in the results
      const llmContent = llmResults.find(item => 
        item && typeof item === 'object' && 
        (item.hasOwnProperty('llmProcessed') || item.hasOwnProperty('aiProcessed'))
      );
      
      if (!llmContent || !llmContent.content) {
        log.warn('No valid LLM content found in results');
        return this.convertResultsToCategories(llmResults, query, options);
      }
      
      // Process LLM response
      const categories = mapLLMResponseToCategories(llmContent.content, query, {
        businessFocus: options.context?.isBusinessQuery || options.businessFocus,
        enhanceCategories: options.enhanceCategories,
        calculateMetrics: options.calculateMetrics
      });
      
      // Extract insights if needed
      if (options.extractInsights) {
        categories.forEach(category => {
          if (!category.insights || category.insights.length === 0) {
            category.insights = this.extractInsightsFromLLM(llmContent, query, category);
          }
        });
      }
      
      return categories;
    } catch (error) {
      log.error('Error processing LLM results:', error);
      return [];
    }
  }

  /**
   * Convert standard search results to categories
   * @param {Array} results The search results
   * @param {string} query The search query
   * @param {Object} options Processing options
   * @returns {Array} Array of category objects
   */
  convertResultsToCategories(results, query, options = {}) {
    try {
      if (!results || !Array.isArray(results)) {
        return [];
      }

      // Create default "All Results" category
      const allResultsCategory = {
        id: 'all_results',
        name: 'All Results',
        content: [...results],
        type: 'default'
      };

      // Create categories based on result types
      const categories = [allResultsCategory];

      // Check if we should create a business category
      if (options.context?.isBusinessQuery || options.businessFocus) {
        // Filter business-related results
        const businessResults = results.filter(item => {
          if (!item || typeof item !== 'object') return false;
          
          const title = (item.title || '').toLowerCase();
          const description = (item.description || item.snippet || '').toLowerCase();
          
          return (
            title.includes('business') || 
            title.includes('company') || 
            title.includes('market') || 
            title.includes('financial') ||
            title.includes('industry') ||
            description.includes('business analysis') ||
            description.includes('market report') ||
            description.includes('financial data') ||
            description.includes('company profile')
          );
        });

        if (businessResults.length > 0) {
          categories.push({
            id: 'business',
            name: 'Business Insights',
            content: businessResults,
            type: 'business'
          });
        }
      }

      // Add technical category if relevant
      if (options.context?.isTechnicalQuery) {
        // Filter technical results
        const technicalResults = results.filter(item => {
          if (!item || typeof item !== 'object') return false;
          
          const title = (item.title || '').toLowerCase();
          const description = (item.description || item.snippet || '').toLowerCase();
          
          return (
            title.includes('technical') || 
            title.includes('technology') || 
            title.includes('software') || 
            title.includes('hardware') ||
            title.includes('development') ||
            title.includes('programming') ||
            description.includes('technical specification') ||
            description.includes('developer') ||
            description.includes('software') ||
            description.includes('technology')
          );
        });

        if (technicalResults.length > 0) {
          categories.push({
            id: 'technical',
            name: 'Technical Information',
            content: technicalResults,
            type: 'technical'
          });
        }
      }

      return categories;
    } catch (error) {
      log.error('Error converting results to categories:', error);
      return [];
    }
  }

  /**
   * Extract insights from LLM results
   * @param {Object} llmResults The LLM results object
   * @param {string} query The search query
   * @param {Object} category The category to extract insights for
   * @returns {Array} Array of insights
   */
  extractInsightsFromLLM(llmResults, query, category) {
    try {
      if (!llmResults || !llmResults.content) {
        return [];
      }
      
      const content = llmResults.content;
      const insights = [];
      
      // Look for insights section in content
      if (typeof content === 'string') {
        // Look for insights section
        const insightsMatch = content.match(/key insights:?\s*([\s\S]*?)(?:\n\n|\n#|\n\*\*|$)/i);
        if (insightsMatch && insightsMatch[1]) {
          // Split insights by bullet points or newlines
          const insightLines = insightsMatch[1]
            .split(/\n\s*[-•*]\s*|\n\s*\d+\.\s*|\n+/)
            .filter(line => line.trim().length > 0);
          
          insightLines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.length > 10 && !insights.includes(trimmed)) {
              insights.push(trimmed);
            }
          });
        }
      }
      
      // If no insights found and category is provided, try to extract from category content
      if (insights.length === 0 && category && category.content) {
        // Extract from category content descriptions
        category.content.forEach(item => {
          if (!item || typeof item !== 'object') return;
          
          const description = item.description || item.snippet || '';
          if (description.length > 50) {
            // Extract sentences that might contain insights
            const sentences = description
              .split(/[.!?]+/)
              .map(s => s.trim())
              .filter(s => s.length > 20 && s.length < 150);
            
            // Add sentences that contain key terms
            const keyTerms = this.getKeyTermsForCategory(category.type || 'default');
            sentences.forEach(sentence => {
              const containsKeyTerm = keyTerms.some(term => 
                sentence.toLowerCase().includes(term.toLowerCase())
              );
              
              if (containsKeyTerm && !insights.includes(sentence)) {
                insights.push(sentence);
              }
            });
          }
        });
      }
      
      // Return top insights (limit to 5)
      return insights.slice(0, 5);
    } catch (error) {
      log.error('Error extracting insights from LLM results:', error);
      return [];
    }
  }

  /**
   * Get key terms for a category type
   * @param {string} categoryType The category type
   * @returns {Array<string>} Array of key terms
   */
  getKeyTermsForCategory(categoryType) {
    switch (categoryType) {
      case 'business':
        return ['revenue', 'profit', 'market', 'growth', 'strategy', 'company', 'business', 'industry'];
      case 'technical':
        return ['technology', 'software', 'hardware', 'algorithm', 'system', 'platform', 'development'];
      case 'news':
        return ['announced', 'reported', 'released', 'launched', 'unveiled', 'today', 'recently'];
      case 'academic':
        return ['research', 'study', 'analysis', 'findings', 'paper', 'theory', 'hypothesis'];
      case 'financial':
        return ['investment', 'stock', 'market', 'financial', 'earnings', 'revenue', 'profit'];
      default:
        return ['important', 'significant', 'key', 'major', 'critical', 'essential', 'primary'];
    }
  }
}

// Export the original functions for backward compatibility
export const processLLMResults = (llmResults, query) => {
  const processor = new LLMResultsProcessor();
  return processor.processLLMResults(llmResults, query);
};

export const extractInsightsFromLLM = (llmResults, query) => {
  const processor = new LLMResultsProcessor();
  return processor.extractInsightsFromLLM(llmResults, query);
};

export default {
  LLMResultsProcessor,
  processLLMResults,
  extractInsightsFromLLM
};