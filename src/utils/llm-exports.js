// This file contains the exports needed from llmProcessing.js
// Copy the export statement below to the end of llmProcessing.js:

/*
// Export the main functions
export {
  processWithLLM,
  isBusinessRelatedQuery, 
  createFallbackResponse,
  createDetailedFallback,
  createErrorFallback
};
*/

// For CommonJS compatibility:
/*
// Export the main functions
module.exports = {
  processWithLLM,
  isBusinessRelatedQuery,
  createFallbackResponse,
  createDetailedFallback,
  createErrorFallback
};
*/

// LLM processing utility functions

/**
 * Process search results with LLM
 */
export async function processWithLLM(query, sources, context = "", modelId = "mixtral-8x7b") {
  console.log('processWithLLM called with:', { query, sourcesCount: sources.length, modelId });
  
  // Create a summary based on the query and sources
  const summary = createMockSummary(query, sources);
  
  // Generate follow-up questions based on the query
  const followUpQuestions = generateFollowUpQuestions(query);
  
  // Return the processed result
  return {
    content: summary,
    sourceMap: {},
    followUpQuestions,
    model: modelId
  };
}

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
