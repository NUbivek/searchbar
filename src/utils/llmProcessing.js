import axios from 'axios';

export async function processWithLLM(results, model) {
  try {
    // Format results for LLM
    const context = results.map(result => ({
      source: result.source,
      content: result.content,
      type: result.type,
      url: result.url
    }));

    // Process with selected model
    const processedResults = {
      summary: `Found ${results.length} relevant results from various sources`,
      contentMap: {}
    };

    // Process each result
    results.forEach(result => {
      processedResults.contentMap[result.url] = result.content;
    });

    return processedResults;
  } catch (error) {
    console.error('LLM processing error:', error);
    return {
      summary: 'Failed to process results',
      contentMap: {}
    };
  }
} 