import axios from 'axios';
import { logger } from './logger.js';

// Try to import the processWithLLM function from llmProcessing.js
let processWithLLMInternal;
try {
  // Use dynamic import for ESM module
  import('./llmProcessing.js').then(module => {
    processWithLLMInternal = module.processWithLLMInternal;
    console.log('DEBUG: Successfully imported processWithLLMInternal from llmProcessing module', {
      hasFunction: typeof processWithLLMInternal === 'function',
      moduleKeys: Object.keys(module)
    });
  }).catch(importError => {
    console.error('DEBUG: Failed to import processWithLLMInternal from llmProcessing:', importError);
    processWithLLMInternal = null;
  });
} catch (importError) {
  console.error('DEBUG: Failed to set up dynamic import for llmProcessing:', importError);
  processWithLLMInternal = null;
}

// Simple in-memory cache for LLM responses
const llmResponseCache = {};
const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Process search results with an LLM
 * @param {Object} options - LLM processing options
 * @param {string} options.query - Search query
 * @param {Array} options.sources - Search results to process
 * @param {string} options.model - LLM model to use
 * @param {number} options.maxTokens - Maximum tokens for response
 * @param {number} options.temperature - Temperature for response
 * @returns {Object} - Processed results
 */
const processWithLLM = async (options) => {
  const {
    query,
    sources = [],
    model = 'mixtral-8x7b',
    maxTokens = 2048,
    temperature = 0.7
  } = options || {};

  let enhancedResults = [];

  try {
    // Validate query
    if (!query || typeof query !== 'string' || query.trim() === '') {
      console.warn('DEBUG: Missing or empty query in processWithLLM');
      return {
        content: "I couldn't process your request because no search query was provided. Please try again with a specific query.",
        error: "Missing search query",
        followUpQuestions: [
          "Would you like to try a search with a specific query?",
          "Can I help you formulate a search query?"
        ]
      };
    }

    // Format the results for LLM processing
    const formattedResults = Array.isArray(sources) ? sources : [sources];

    // Ensure all results have the necessary properties
    enhancedResults = formattedResults.map(result => {
      return {
        title: result.title || 'Untitled',
        content: result.content || result.snippet || result.description || '',
        url: result.url || result.link || '',
        source: result.source || 'Unknown',
        type: result.type || 'Unknown'
      };
    });

    // Create a prompt for the LLM
    const prompt = createLLMPrompt(query, enhancedResults);

    // Create a cache key based on the prompt and model
    const cacheKey = `${Buffer.from(prompt).toString('base64').substring(0, 100)}_${model}`;

    // Check if we have a cached response
    if (llmResponseCache[cacheKey] && llmResponseCache[cacheKey].timestamp > Date.now() - CACHE_TTL) {
      console.log('DEBUG: Using cached LLM response');
      return llmResponseCache[cacheKey].data;
    }

    console.log('DEBUG: Calling LLM processing with', {
      model,
      resultsCount: enhancedResults.length
    });

    // Use the llmProcessing implementation if available
    if (processWithLLMInternal && typeof processWithLLMInternal === 'function') {
      try {
        console.log('DEBUG: Using llmProcessing implementation');
        const response = await processWithLLMInternal({
          query,
          sources: enhancedResults,
          model,
          maxTokens,
          temperature
        });

        // Cache the response
        llmResponseCache[cacheKey] = {
          timestamp: Date.now(),
          data: response
        };

        return response;
      } catch (llmError) {
        console.error('DEBUG: Error using llmProcessing implementation:', llmError);
        logger.warn('Error using llmProcessing implementation, falling back to callLLMAPI', { 
          error: llmError.message || String(llmError) 
        });
      }
    } else {
      console.log('DEBUG: llmProcessing implementation not available, using callLLMAPI directly');
    }

    // Fall back to the old implementation
    const response = await callLLMAPI(query, enhancedResults, {
      maxTokens,
      temperature,
      model
    }, enhancedResults);

    // Check if we got an error response
    if (response && response.error) {
      console.log('DEBUG: LLM API returned an error response:', response.error);
      return response;
    }

    return response;
  } catch (error) {
    console.error('DEBUG: LLM API call failed:', error.message);
    logger.error('LLM API call failed:', error.message);

    // Return a properly structured error response
    return {
      error: error.message || 'An error occurred during LLM processing',
      content: `I was unable to process the search results due to an error: ${error.message || 'Unknown error'}`,
      followUpQuestions: [
        'Would you like to try a different search query?',
        'Would you like to try a different model?',
        'Would you like to search for something else?'
      ],
      sources: enhancedResults || [],
      sourceMap: {}
    };
  }
};

// Helper functions
const createLLMPrompt = (query, results) => {
  // Format the prompt for the LLM
  const formattedSources = results.map((source, index) => {
    return `[${index + 1}] ${source.title || 'Untitled'}\n${source.content}\n`;
  }).join('\n');

  return `
You are a helpful AI assistant that provides concise and accurate information based on search results.

QUERY: ${query}

SEARCH RESULTS:
${formattedSources}

Please provide a comprehensive answer to the query based on the search results. 
Include relevant information from the sources and cite them using their numbers [1], [2], etc.
Focus on providing accurate, factual information without adding unsupported claims.
If the search results don't contain relevant information to answer the query, acknowledge this limitation.

Also, suggest 3 follow-up questions that the user might want to ask next.

FORMAT YOUR RESPONSE AS JSON with the following structure:
{
  "content": "Your comprehensive answer here with source citations [1], [2], etc.",
  "followUpQuestions": ["Follow-up question 1?", "Follow-up question 2?", "Follow-up question 3?"]
}
`;
};

/**
 * Call the LLM API to process search results
 * @param {string} query The search query
 * @param {Array} results The search results to process
 * @param {Object} options Additional options for processing
 * @param {Array} originalSources Original sources to include in processing
 * @returns {Promise<Object>} The processed results
 */
const callLLMAPI = async (query, results, options = {}, originalSources = []) => {
  try {
    // Prepare enhanced results with standardized source format
    const enhancedResults = Array.isArray(results) ? results.map(result => {
      // Ensure each result has all required properties
      return {
        ...result,
        title: result.title || result.name || 'Untitled',
        content: result.content || result.snippet || result.description || '',
        url: result.url || result.link || '',
        source: result.source || 'unknown'
      };
    }) : [];

    // Combine with original sources if provided
    const combinedSources = [...enhancedResults];

    // Add original sources if they're not already included
    if (Array.isArray(originalSources) && originalSources.length > 0) {
      console.log(`Adding ${originalSources.length} original sources to LLM API call`);

      originalSources.forEach(source => {
        // Check if this source is already in the combined sources
        const isDuplicate = combinedSources.some(
          existing => existing.url === source.url || 
                     (existing.title === source.title && existing.content === source.content)
        );

        if (!isDuplicate) {
          combinedSources.push({
            ...source,
            title: source.title || source.name || 'Untitled',
            content: source.content || source.snippet || source.description || '',
            url: source.url || source.link || '',
            source: source.source || 'unknown',
            isOriginalSource: true
          });
        }
      });
    }

    // Log the combined sources for debugging
    console.log('DEBUG: Combined sources for LLM API:', {
      totalSources: combinedSources.length,
      enhancedResultsCount: enhancedResults.length,
      originalSourcesCount: originalSources.length,
      firstSourceSample: combinedSources.length > 0 ? {
        hasTitle: !!combinedSources[0].title,
        hasContent: !!combinedSources[0].content,
        hasUrl: !!combinedSources[0].url,
        contentLength: combinedSources[0].content?.length
      } : 'No sources'
    });

    // Return appropriate error if query is missing or empty
    if (!query || typeof query !== 'string' || query.trim() === '') {
      console.warn('DEBUG: Missing or empty query in callLLMAPI');
      return {
        content: "I couldn't process your request because no search query was provided. Please try again with a specific query.",
        error: "Missing search query",
        followUpQuestions: [
          "Would you like to try a search with a specific query?",
          "Can I help you formulate a search query?"
        ]
      };
    }

    // Now that we've validated query is a string, we can safely use substring
    console.log('DEBUG: Sending request to LLM API with query:', query.substring(0, 50) + '...');

    const response = await fetch('/api/llm/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        sources: combinedSources,
        options
      }),
    });

    if (!response.ok) {
      console.error('DEBUG: LLM API error:', response.status, response.statusText);
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    // Log the raw response
    const rawResponseText = await response.text();
    console.log('DEBUG: Raw LLM API response text:', rawResponseText.substring(0, 200) + '...');

    // Parse the response
    let data;
    try {
      data = JSON.parse(rawResponseText);
    } catch (error) {
      console.error('DEBUG: Error parsing LLM API response:', error);
      throw new Error('Invalid JSON response from LLM API');
    }

    // Log the parsed response
    console.log('DEBUG: Parsed LLM API response:', {
      hasData: !!data,
      hasContent: !!data?.content,
      contentType: typeof data?.content,
      contentLength: data?.content?.length,
      hasSourceMap: !!data?.sourceMap,
      hasSourcesArray: Array.isArray(data?.sources),
      sourcesLength: Array.isArray(data?.sources) ? data?.sources.length : 0,
      followUpQuestionsLength: Array.isArray(data?.followUpQuestions) ? data?.followUpQuestions.length : 0
    });

    // Ensure the response has the expected structure
    if (!data || !data.content) {
      console.error('Invalid LLM API response:', data);
      throw new Error('Invalid response from LLM API');
    }

    // Add the original sources to the response if they're not already included
    if (!data.sources || !Array.isArray(data.sources) || data.sources.length === 0) {
      console.log('No sources in LLM API response, adding original sources');
      data.sources = combinedSources;
    }

    return data;
  } catch (error) {
    console.error('Error calling LLM API:', error);
    throw error;
  }
};

const extractContentFromLLMResponse = (response) => {
  // Extract content from the LLM response
  if (!response || !response.data) {
    logger.error('Invalid response from LLM API');
    return null;
  }

  console.log('DEBUG: Extracting content from LLM response:', {
    responseType: typeof response.data,
    hasContent: !!response.data.content,
    contentType: typeof response.data.content
  });

  // Try to extract content from different possible response structures
  try {
    // Direct access to content property (most common case)
    if (response.data.content && typeof response.data.content === 'string') {
      console.log('DEBUG: Found content directly in response.data.content');
      return response.data.content;
    }

    // If response.data is a string, try to parse it as JSON
    if (typeof response.data === 'string') {
      try {
        console.log('DEBUG: Attempting to parse string response as JSON');
        const parsedData = JSON.parse(response.data);
        if (parsedData.content) {
          console.log('DEBUG: Found content in parsed JSON');
          return parsedData.content;
        }
      } catch (parseError) {
        // If it's not valid JSON, just return the string
        console.log('DEBUG: Response is not valid JSON, using as raw text');
        return response.data;
      }
    }

    // If response.data is an object with text or answer properties
    if (response.data.text) {
      console.log('DEBUG: Found content in response.data.text');
      return response.data.text;
    }

    if (response.data.answer) {
      console.log('DEBUG: Found content in response.data.answer');
      return response.data.answer;
    }

    // Check for choices array (direct LLM API response format)
    if (response.data.choices && response.data.choices.length > 0) {
      const choice = response.data.choices[0];
      console.log('DEBUG: Found choices array in response');

      if (choice.text) {
        console.log('DEBUG: Using content from choice.text');
        return choice.text;
      }

      if (choice.message && choice.message.content) {
        console.log('DEBUG: Using content from choice.message.content');
        return choice.message.content;
      }

      // Try to extract JSON from choice text if present
      if (choice.text || choice.message?.content) {
        const textToCheck = choice.text || choice.message.content;
        try {
          // Look for JSON pattern
          const jsonMatch = textToCheck.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedJson = JSON.parse(jsonMatch[0]);
            if (parsedJson.content) {
              console.log('DEBUG: Extracted content from JSON in choice text');
              return parsedJson.content;
            }
          }
        } catch (jsonError) {
          console.log('DEBUG: Failed to parse JSON from choice text');
          // Continue to other extraction methods
        }
      }
    }

    // If we can't find content, log and return a default message
    logger.warn('Could not extract content from LLM response:', response.data);
    console.error('DEBUG: Failed to extract content from response:', response.data);
    return "I processed your query, but couldn't generate a proper response. Please try again or rephrase your question.";
  } catch (error) {
    logger.error('Error extracting content from LLM response:', error);
    console.error('DEBUG: Error in content extraction:', error.message);
    return "An error occurred while processing your query. Please try again later.";
  }
};

const extractFollowUpQuestionsFromLLMResponse = (response) => {
  // Extract follow-up questions from the LLM response
  if (!response || !response.data) {
    console.log('DEBUG: Invalid response for follow-up questions extraction');
    return [];
  }

  console.log('DEBUG: Extracting follow-up questions from response:', {
    responseType: typeof response.data,
    hasFollowUpQuestions: !!response.data.followUpQuestions,
    isFollowUpArray: Array.isArray(response.data.followUpQuestions)
  });

  // Try to extract follow-up questions from different possible response structures
  try {
    // If response.data.followUpQuestions exists, use it
    if (response.data.followUpQuestions && Array.isArray(response.data.followUpQuestions)) {
      console.log('DEBUG: Found follow-up questions directly in response');
      return response.data.followUpQuestions;
    }

    // If response.data is a string, try to parse it as JSON
    if (typeof response.data === 'string') {
      try {
        console.log('DEBUG: Attempting to parse string response as JSON for follow-up questions');
        const parsedData = JSON.parse(response.data);
        if (parsedData.followUpQuestions && Array.isArray(parsedData.followUpQuestions)) {
          console.log('DEBUG: Found follow-up questions in parsed JSON');
          return parsedData.followUpQuestions;
        }
      } catch (parseError) {
        // If it's not valid JSON, return empty array
        console.log('DEBUG: Response is not valid JSON for follow-up questions');
        return [];
      }
    }

    // If response.data has questions or follow_up_questions
    if (response.data.questions && Array.isArray(response.data.questions)) {
      console.log('DEBUG: Found questions array in response');
      return response.data.questions;
    }

    if (response.data.follow_up_questions && Array.isArray(response.data.follow_up_questions)) {
      console.log('DEBUG: Found follow_up_questions array in response');
      return response.data.follow_up_questions;
    }

    // Try to extract from content if it contains a section with follow-up questions
    const content = extractContentFromLLMResponse(response);
    if (content && typeof content === 'string') {
      console.log('DEBUG: Attempting to extract follow-up questions from content text');

      // Look for sections that might contain follow-up questions
      const followUpSections = [
        /Follow-up questions:([\s\S]*?)(?:\n\n|$)/i,
        /Questions you might want to ask:([\s\S]*?)(?:\n\n|$)/i,
        /You might also want to ask:([\s\S]*?)(?:\n\n|$)/i
      ];

      for (const regex of followUpSections) {
        const match = content.match(regex);
        if (match && match[1]) {
          const questions = match[1]
            .split(/\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0 && (line.includes('?') || line.startsWith('-') || line.match(/^\d+\./)))
            .map(line => line.replace(/^[-*•]|\d+\.\s+/, '').trim());

          if (questions.length > 0) {
            console.log('DEBUG: Extracted follow-up questions from content text:', questions);
            return questions;
          }
        }
      }
    }

    // Default follow-up questions if none found
    console.log('DEBUG: Using default follow-up questions');
    return [
      "Can you tell me more about this topic?",
      "What are the key aspects I should know about?",
      "How does this information apply in practice?"
    ];
  } catch (error) {
    logger.error('Error extracting follow-up questions from LLM response:', error);
    console.error('DEBUG: Error in follow-up questions extraction:', error.message);
    return [];
  }
};

const extractSourceMapFromLLMResponse = (response) => {
  // Extract source map from the LLM response
  if (!response || !response.data) {
    console.log('DEBUG: Invalid response for source map extraction');
    return {};
  }

  console.log('DEBUG: Extracting source map from response:', {
    responseType: typeof response.data,
    hasSourceMap: !!response.data.sourceMap,
    isSourceMapObject: typeof response.data.sourceMap === 'object'
  });

  // Try to extract source map from different possible response structures
  try {
    // If response.data.sourceMap exists, use it
    if (response.data.sourceMap && typeof response.data.sourceMap === 'object') {
      console.log('DEBUG: Found source map directly in response');
      return response.data.sourceMap;
    }

    // If response.data is a string, try to parse it as JSON
    if (typeof response.data === 'string') {
      try {
        console.log('DEBUG: Attempting to parse string response as JSON for source map');
        const parsedData = JSON.parse(response.data);
        if (parsedData.sourceMap && typeof parsedData.sourceMap === 'object') {
          console.log('DEBUG: Found source map in parsed JSON');
          return parsedData.sourceMap;
        }
      } catch (parseError) {
        // If it's not valid JSON, return empty object
        console.log('DEBUG: Response is not valid JSON for source map');
        return {};
      }
    }

    // If response.data has sources or citations
    if (response.data.sources && Array.isArray(response.data.sources)) {
      console.log('DEBUG: Found sources array in response');
      return response.data.sources.reduce((map, source, index) => {
        map[`[${index + 1}]`] = source;
        return map;
      }, {});
    }

    if (response.data.citations && Array.isArray(response.data.citations)) {
      console.log('DEBUG: Found citations array in response');
      return response.data.citations.reduce((map, citation, index) => {
        map[citation] = response.data.sources[index];
        return map;
      }, {});
    }

    // Default source map if none found
    console.log('DEBUG: Using default source map');
    return {};
  } catch (error) {
    logger.error('Error extracting source map from LLM response:', error);
    console.error('DEBUG: Error in source map extraction:', error.message);
    return {};
  }
};

// Export functions
export {
  callLLMAPI as processWithLLM
};
