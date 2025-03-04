/**
 * Unified LLM Exports
 * 
 * This file centralizes all LLM processing exports to ensure consistent implementation
 * across the codebase. It imports from llmProcessing.js and re-exports the needed functions.
 * 
 * IMPORTANT: This replaces the previous standalone implementation to avoid duplication.
 */

// Import all necessary functions from the main implementation
import { 
  processWithLLM,
  isBusinessRelatedQuery,
  createFallbackResponse,
  createErrorResponse,
  MODEL_ENDPOINTS,
  formatContentForDisplay,
  addIntelligentHyperlinks,
  createSourceMap
} from './llmProcessing';

// Re-export all the functions to maintain backward compatibility
export {
  processWithLLM,
  isBusinessRelatedQuery,
  createFallbackResponse,
  createErrorResponse,
  MODEL_ENDPOINTS,
  formatContentForDisplay,
  addIntelligentHyperlinks,
  createSourceMap
};

// For logging
console.log('LLM exports initialized with standardized implementation');

// Export default for CommonJS compatibility if needed
export default {
  processWithLLM,
  isBusinessRelatedQuery,
  createFallbackResponse,
  createErrorResponse,
  MODEL_ENDPOINTS,
  formatContentForDisplay,
  addIntelligentHyperlinks,
  createSourceMap
};

/**
 * Create a mock summary based on the query and sources
 */
function createMockSummary(query, sources) {
  const sourceCount = sources.length;
  const sourceTitles = sources.slice(0, 3).map(s => s.title || 'Untitled Source').join(', ');
  
  return `# Results for "${query}"

Based on the ${sourceCount} sources I reviewed, here's what I found about "${query}":

## Key Points

- ${query} is a topic of interest in multiple domains
- Several sources including ${sourceTitles} provide valuable information
- The information appears to be consistent across sources
- There are both technical and non-technical aspects to consider

## Details

The search results indicate that ${query} has been discussed in various contexts. According to the sources, this topic has relevance in both academic and practical applications.

## Conclusion

When considering "${query}", it's important to evaluate the information from multiple perspectives. The sources provided offer a good starting point for deeper research.
`;
}

/**
 * Generate follow-up questions based on the query
 */
function generateFollowUpQuestions(query) {
  return [
    `What are the latest developments in ${query}?`,
    `How does ${query} compare to similar topics?`,
    `What are the practical applications of ${query}?`,
    `Who are the leading experts on ${query}?`
  ];
}
