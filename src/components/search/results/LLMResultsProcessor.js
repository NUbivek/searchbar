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
   * @returns {Object} Processed results
   */
  processResults(results, query, options = {}) {
    const processingOptions = {
      ...this.options,
      ...options
    };
    
    // Detect business focus if not explicitly set
    if (processingOptions.businessFocus === undefined) {
      processingOptions.businessFocus = isBusinessQuery(query);
    }
    
    // Detect query context
    const queryContext = detectQueryContext(query);
    
    try {
      // Process base LLM response
      const processedResponse = this.processLLMResponse(results, query, {
        ...processingOptions,
        context: queryContext
      });
      
      // Add source attributions
      this.mapSourceAttributions(processedResponse, results);
      
      // Add metrics if requested
      if (processingOptions.calculateMetrics) {
        this.calculateResultMetrics(processedResponse, query);
      }
      
      // Extract insights if requested
      if (processingOptions.extractInsights) {
        this.extractInsights(processedResponse, query);
      }
      
      // Enhance categories if requested
      if (processingOptions.enhanceCategories) {
        this.enhanceCategories(processedResponse, query, queryContext);
      }
      
      return processedResponse;
    } catch (error) {
      log.error('Error processing LLM results:', error);
      return {
        error: `Failed to process results: ${error.message}`,
        results: results
      };
    }
  }
  
  /**
   * Process the raw LLM response
   * @param {Array} results The search results to process
   * @param {string} query The search query
   * @param {Object} options Processing options
   * @returns {Object} Processed response
   * @private
   */
  processLLMResponse(results, query, options) {
    try {
      // Extract text content from results
      const textContent = this.extractTextContent(results);
      
      // Process with LLM response processor
      return processLLMResponse(textContent, query, options);
    } catch (error) {
      log.error('Error in LLM response processing:', error);
      throw error;
    }
  }
  
  /**
   * Extract text content from search results
   * @param {Array} results The search results
   * @returns {string} Combined text content
   * @private
   */
  extractTextContent(results) {
    if (!Array.isArray(results)) {
      return String(results || '');
    }
    
    return results.map(result => {
      if (typeof result === 'string') {
        return result;
      }
      if (result && typeof result === 'object') {
        return result.content || result.text || JSON.stringify(result);
      }
      return String(result || '');
    }).join('\n\n');
  }
  
  /**
   * Map source attributions to processed response
   * @param {Object} processedResponse The processed response
   * @param {Array} originalResults The original search results
   * @returns {Object} Updated processed response
   * @private
   */
  mapSourceAttributions(processedResponse, originalResults) {
    if (!processedResponse || !processedResponse.categories) {
      return processedResponse;
    }
    
    try {
      // Map categories to sources
      const sourceMappings = mapLLMResponseToCategories(
        processedResponse.categories,
        originalResults
      );
      
      // Add source mappings to response
      processedResponse.sourceMappings = sourceMappings;
      
      return processedResponse;
    } catch (error) {
      log.error('Error mapping source attributions:', error);
      return processedResponse;
    }
  }
  
  /**
   * Calculate metrics for processed results
   * @param {Object} processedResponse The processed response
   * @param {string} query The search query
   * @returns {Object} Updated processed response with metrics
   * @private
   */
  calculateResultMetrics(processedResponse, query) {
    if (!processedResponse || !processedResponse.categories) {
      return processedResponse;
    }
    
    try {
      // Add metrics to each category
      processedResponse.categories = processedResponse.categories.map(category => {
        if (!category.scores) {
          category.scores = {
            relevance: this.calculateRelevanceScore(category, query),
            accuracy: this.calculateAccuracyScore(category),
            credibility: this.calculateCredibilityScore(category)
          };
        }
        
        // Add metrics to each item in the category
        if (Array.isArray(category.items)) {
          category.items = category.items.map(item => {
            if (!item.scores) {
              item.scores = {
                relevance: this.calculateRelevanceScore(item, query),
                accuracy: this.calculateAccuracyScore(item),
                credibility: this.calculateCredibilityScore(item)
              };
            }
            return item;
          });
        }
        
        return category;
      });
      
      return processedResponse;
    } catch (error) {
      log.error('Error calculating result metrics:', error);
      return processedResponse;
    }
  }
  
  /**
   * Calculate relevance score for content
   * @param {Object} content The content
   * @param {string} query The search query
   * @returns {number} Relevance score (0-1)
   * @private
   */
  calculateRelevanceScore(content, query) {
    // Simple implementation - can be enhanced with more sophisticated scoring
    const text = content.text || content.content || '';
    const title = content.title || '';
    
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentText = (title + ' ' + text).toLowerCase();
    
    let matches = 0;
    queryWords.forEach(word => {
      if (contentText.includes(word)) {
        matches++;
      }
    });
    
    return Math.min(1, Math.max(0.5, matches / queryWords.length));
  }
  
  /**
   * Calculate accuracy score for content
   * @param {Object} content The content
   * @returns {number} Accuracy score (0-1)
   * @private
   */
  calculateAccuracyScore(content) {
    // Placeholder implementation - in a real implementation
    // this would use various heuristics to determine accuracy
    return 0.8; // Default score
  }
  
  /**
   * Calculate credibility score for content
   * @param {Object} content The content
   * @returns {number} Credibility score (0-1)
   * @private
   */
  calculateCredibilityScore(content) {
    // Placeholder implementation - in a real implementation
    // this would evaluate sources for credibility
    return 0.85; // Default score
  }
  
  /**
   * Extract insights from processed response
   * @param {Object} processedResponse The processed response
   * @param {string} query The search query
   * @returns {Object} Updated processed response with insights
   * @private
   */
  extractInsights(processedResponse, query) {
    if (!processedResponse || !processedResponse.categories) {
      return processedResponse;
    }
    
    try {
      // Extract key insights from categories
      const keyInsights = [];
      
      processedResponse.categories.forEach(category => {
        if (Array.isArray(category.items)) {
          category.items.forEach(item => {
            const text = item.text || item.content || '';
            
            // Extract insights using heuristics
            const sentences = text.split(/[.!?]+/);
            sentences.forEach(sentence => {
              const trimmed = sentence.trim();
              
              // Check if sentence contains insight markers
              if (
                trimmed.length > 20 && 
                (
                  trimmed.includes('important') ||
                  trimmed.includes('significant') ||
                  trimmed.includes('key') ||
                  trimmed.includes('crucial') ||
                  trimmed.includes('essential') ||
                  /\d+%/.test(trimmed) // Contains a percentage
                )
              ) {
                keyInsights.push(trimmed);
              }
            });
          });
        }
      });
      
      // Add insights to processed response
      processedResponse.insights = keyInsights.slice(0, 5); // Limit to top 5 insights
      
      return processedResponse;
    } catch (error) {
      log.error('Error extracting insights:', error);
      return processedResponse;
    }
  }
  
  /**
   * Enhance categories in processed response
   * @param {Object} processedResponse The processed response
   * @param {string} query The search query
   * @param {string} context The query context
   * @returns {Object} Updated processed response with enhanced categories
   * @private
   */
  enhanceCategories(processedResponse, query, context) {
    // Placeholder for category enhancement logic
    return processedResponse;
  }
}

/**
 * Process LLM results using a processor instance
 * @param {Array} llmResults The search results to process
 * @param {string} query The search query
 * @param {Object} options Processing options
 * @returns {Object} Processed results
 */
export const processLLMResults = (llmResults, query, options = {}) => {
  const processor = new LLMResultsProcessor(options);
  return processor.processResults(llmResults, query, options);
};

/**
 * Extract insights from LLM results
 * @param {Array} llmResults The search results to process
 * @param {string} query The search query
 * @returns {Array} Extracted insights
 */
export const extractInsightsFromLLM = (llmResults, query) => {
  const processor = new LLMResultsProcessor({ extractInsights: true });
  const processed = processor.processResults(llmResults, query);
  return processed.insights || [];
};

export default {
  LLMResultsProcessor,
  processLLMResults,
  extractInsightsFromLLM
};
