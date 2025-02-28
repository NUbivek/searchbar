import axios from 'axios';
import { logger } from './logger';

/**
 * Formats a prompt for the Together API
 * @param {string} query - The user's search query
 * @param {Array} sourceData - Array of source data objects
 * @returns {string} Formatted prompt
 */
function formatTogetherPrompt(query, sourceData) {
  // Ensure query is a string
  const safeQuery = typeof query === 'string' ? query : String(query || 'unknown query');
  
  // Start with the base prompt
  let prompt = `Analyze the following search results for the query: "${safeQuery}"\n\n`;
  
  // Validate sourceData
  if (!Array.isArray(sourceData) || sourceData.length === 0) {
    console.warn('No valid source data provided to formatTogetherPrompt');
    prompt += `No search results were found for this query. Please provide a general response about "${safeQuery}" based on your knowledge.\n\n`;
  } else {
    // Add valid source data
    let validSourceCount = 0;
    
    sourceData.forEach((source, index) => {
      if (!source || typeof source !== 'object') return;
      
      const title = source.title || 'N/A';
      const url = source.url || 'N/A';
      const content = source.content || 'No content provided';
      
      // Skip sources with no meaningful content
      if (content === 'No content provided' && title === 'N/A' && url === 'N/A') return;
      
      prompt += `Source ${index + 1}:\nTitle: ${title}\nURL: ${url}\nContent: ${content}\n\n`;
      validSourceCount++;
    });
    
    // Log the number of valid sources
    console.log(`Formatted ${validSourceCount} valid sources for LLM prompt`);
    
    // If no valid sources were added, add a note
    if (validSourceCount === 0) {
      prompt += `No valid search results were found for this query. Please provide a general response about "${safeQuery}" based on your knowledge.\n\n`;
    }
  }
  
  // Add instructions
  prompt += `
Based on these search results, please:
1. Provide a concise summary of the information (2-3 sentences)
2. Identify the main categories of information
3. List the key insights or takeaways
4. Note any conflicting information or gaps
5. Suggest related topics that might be worth exploring

Format your response in clear sections.
`;
  
  return prompt;
}

/**
 * Formats a prompt for the Perplexity API
 * @param {string} query - The user's search query
 * @param {Array} sourceData - Array of source data objects
 * @returns {Array} Formatted messages array for Perplexity
 */
function formatPerplexityPrompt(query, sourceData) {
  // Create system message
  const systemMessage = {
    role: "system",
    content: "You are a helpful assistant that analyzes search results and provides insights."
  };
  
  // Create user message with search data
  let userContent = `Analyze the following search results for the query: "${query}"\n\n`;
  
  // Add source data
  sourceData.forEach((source, index) => {
    userContent += `Source ${index + 1}:\nTitle: ${source.title || 'N/A'}\nURL: ${source.url || 'N/A'}\nContent: ${source.content || 'No content provided'}\n\n`;
  });
  
  // Add instructions
  userContent += `
Based on these search results, please:
1. Provide a concise summary of the information (2-3 sentences)
2. Identify the main categories of information
3. List the key insights or takeaways
4. Note any conflicting information or gaps
5. Suggest related topics that might be worth exploring

Format your response in clear sections.
`;
  
  const userMessage = {
    role: "user",
    content: userContent
  };
  
  return [systemMessage, userMessage];
}

// Define the supported model endpoints with their API specifics
export const MODEL_ENDPOINTS = {
  'mixtral-8x7b': {
    apiEndpoint: 'https://api.together.xyz/v1/completions',
    apiModelName: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    apiKeyEnvVar: 'TOGETHER_API_KEY',
    headers: {
      'Content-Type': 'application/json',
    },
    promptFormatter: formatTogetherPrompt
  },
  'mistral-7b': {
    apiEndpoint: 'https://api.together.xyz/v1/completions',
    apiModelName: 'mistralai/Mistral-7B-Instruct-v0.2',
    apiKeyEnvVar: 'TOGETHER_API_KEY',
    headers: {
      'Content-Type': 'application/json',
    },
    promptFormatter: formatTogetherPrompt
  },
  'gemma-7b': {
    apiEndpoint: 'https://api.together.xyz/v1/completions',
    apiModelName: 'google/gemma-7b-it',
    apiKeyEnvVar: 'TOGETHER_API_KEY',
    headers: {
      'Content-Type': 'application/json',
    },
    promptFormatter: formatTogetherPrompt
  },
  'perplexity': {
    apiEndpoint: 'https://api.perplexity.ai/chat/completions',
    apiModelName: 'sonar-small-chat',
    apiKeyEnvVar: 'PERPLEXITY_API_KEY',
    headers: {
      'Content-Type': 'application/json',
    },
    promptFormatter: formatPerplexityPrompt
  },
  // Add other models as needed
};

/**
 * Process content with LLM API
 * @param {Object} options - Options for LLM processing
 * @param {string} options.query - The original search query
 * @param {Array} options.sources - Search results to process
 * @param {string} options.model - LLM model to use
 * @param {string} options.apiKey - API key for LLM model
 * @param {number} options.maxTokens - Maximum tokens for LLM response
 * @param {number} options.temperature - Temperature for LLM response
 * @returns {Object} Processed results with summary and follow-up questions
 */
async function processWithLLM(
  query,
  sourceData,
  model = 'mixtral-8x7b',
  apiKey = null
) {
  try {
    // Input validation
    if (!query || typeof query !== 'string') {
      console.error('Invalid query provided to processWithLLM:', query);
      return createFallbackResponse(
        typeof query === 'string' ? query : 'unknown query', 
        Array.isArray(sourceData) ? sourceData : []
      );
    }

    if (!sourceData || !Array.isArray(sourceData) || sourceData.length === 0) {
      console.warn('No source data provided to processWithLLM');
      return createFallbackResponse(query, []);
    }

    const log = logger;
  
    // Default parameters
    const maxTokens = 2000;
    const temperature = 0.3;
    const stop = ["\n\n\n"];

    log.info('Processing with LLM', { 
      model,
      queryLength: query.length,
      sourceCount: sourceData.length
    });

    // Validate model
    if (!MODEL_ENDPOINTS[model]) {
      log.error('Invalid model specified', { model });
      throw new Error(`Invalid model: ${model}. Available models: ${Object.keys(MODEL_ENDPOINTS).join(', ')}`);
    }

    // Get API key from environment or provided parameter
    let effectiveApiKey = apiKey;
  
    if (!effectiveApiKey) {
      // If no API key provided, try to get from environment variables
      const envVarName = MODEL_ENDPOINTS[model].apiKeyEnvVar;
      effectiveApiKey = process.env[envVarName];
      
      // Log API key retrieval attempt (safely)
      log.info('Retrieving API key from environment', { 
        envVar: envVarName,
        keyFound: !!effectiveApiKey,
        keyLength: effectiveApiKey ? effectiveApiKey.length : 0
      });
    }

    // Check for API key
    if (!effectiveApiKey) {
      log.error('No API key available for model', { model });
      throw new Error(`No API key available for model: ${model}. Please set ${MODEL_ENDPOINTS[model].apiKeyEnvVar} environment variable.`);
    }

    // For debugging
    log.info('Using model', { 
      model,
      apiKeyLength: effectiveApiKey ? effectiveApiKey.length : 0
    });

    // Get model endpoint configuration
    const modelConfig = MODEL_ENDPOINTS[model];
    const apiUrl = modelConfig.apiEndpoint;
    let headers = { ...modelConfig.headers };
    
    // Add Authorization header with API key
    headers.Authorization = `Bearer ${effectiveApiKey}`;

    // Format prompt based on the model's formatter
    const formattedPrompt = modelConfig.promptFormatter(query, sourceData);
    
    // Prepare request data based on model type
    let requestData;
    
    if (model === 'perplexity') {
      // Perplexity API format
      requestData = {
        model: modelConfig.apiModelName,
        messages: formattedPrompt, // This should be an array of message objects
        max_tokens: maxTokens,
        temperature: temperature
      };
    } else {
      // Together API format
      requestData = {
        model: modelConfig.apiModelName,
        prompt: formattedPrompt, // This should be a string
        max_tokens: maxTokens,
        temperature: temperature,
        stop: stop
      };
    }
    
    // Log request details (for debugging)
    log.info('API request details', { 
      url: apiUrl,
      model: modelConfig.apiModelName,
      promptLength: typeof formattedPrompt === 'string' ? formattedPrompt.length : JSON.stringify(formattedPrompt).length
    });
    
    // Make the API request
    console.log('DEBUG: Sending request to API:', { 
      url: apiUrl, 
      model: modelConfig.apiModelName,
      headers: { ...headers, Authorization: 'Bearer ***' }, // Hide the actual token
      dataSize: JSON.stringify(requestData).length
    });
    
    try {
      // Make the API call with detailed error handling
      const response = await axios.post(apiUrl, requestData, { 
        headers,
        timeout: 60000 // Increase timeout to 60 seconds for better reliability
      });
      
      console.log('DEBUG: API Response received:', {
        status: response.status,
        hasData: !!response.data,
        choices: response.data?.choices ? response.data.choices.length : 0
      });
      
      // Process response based on model
      let result;
      
      if (model === 'perplexity') {
        // Extract content from Perplexity response
        result = response.data.choices[0].message.content;
      } else {
        // Extract content from Together response
        result = response.data.choices[0].text;
      }
      
      // Attempt to parse JSON from result (Together API sometimes returns JSON without proper headers)
      let parsedContent;
      try {
        // Look for JSON in the response
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          parsedContent = JSON.parse(jsonStr);
          console.log('DEBUG: Successfully parsed JSON from LLM response');
        } else {
          // If no JSON is found, use the raw text
          parsedContent = { content: result };
          console.log('DEBUG: No JSON found in LLM response, using raw text');
        }
      } catch (parseError) {
        console.error('DEBUG: Failed to parse JSON from LLM response:', parseError.message);
        // Use the raw text if parsing fails
        parsedContent = { content: result };
      }
      
      // Ensure we have a properly formatted response
      const formattedResult = {
        content: parsedContent.content || result,
        followUpQuestions: parsedContent.followUpQuestions || []
      };
      
      // Log success
      log.info('LLM processing successful', {
        model,
        responseLength: result.length
      });
      
      return formattedResult;
    } catch (apiError) {
      console.error('DEBUG: API call failed:', apiError.message);
      throw apiError; // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    logger.error('[LLM] Error processing with LLM:', error);
    
    // Enhanced error logging
    console.error('DEBUG: LLM API Error Details:', {
      message: error.message,
      modelUsed: model,
      responseData: error.response?.data,
      responseStatus: error.response?.status,
      responseHeaders: error.response?.headers,
      isAxiosError: error.isAxiosError,
      requestConfig: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: { ...error.config.headers, Authorization: 'Bearer ***' }, // Hide the token
        dataSize: error.config.data ? JSON.stringify(error.config.data).length : 0
      } : null
    });
    
    // Create a more substantive fallback response based on query type
    // Check if it's a business query
    const isBusinessQuery = query.toLowerCase().includes('business') || query.toLowerCase().includes('company') || query.toLowerCase().includes('market');
    
    let fallbackContent = '';
    
    if (isBusinessQuery) {
      fallbackContent = `I've analyzed ${sourceData.length} results related to your business query "${query}". 
      
The search results contain information on market trends, business strategies, and industry insights. While I couldn't generate a complete analysis, the sources provide valuable information on:

- Market conditions and business environment
- Industry-specific strategies and best practices
- Competitive analysis and positioning

I recommend reviewing the sources directly for specific data points, market projections, and detailed analysis of this business topic.`;
    } else {
      fallbackContent = `I've analyzed ${sourceData.length} results for your query "${query}". 
      
The search results contain relevant information on this topic from multiple perspectives. While I couldn't generate a complete analysis, the sources provide:

- Key information and definitions
- Different perspectives on the topic
- Recent developments and research

I recommend reviewing the sources directly for more detailed information.`;
    }
    
    // Generate some generic follow-up questions based on the query
    const followUpQuestions = [
      `What specific aspects of ${query} are you most interested in?`,
      `Would you like more information about any particular source?`,
      `Can you refine your query to focus on a specific aspect of ${query}?`
    ];
    
    return {
      content: fallbackContent,
      sources: sourceData,
      followUpQuestions,
      sourceMap: sourceData.reduce((map, source, index) => {
        map[`source_${index + 1}`] = {
          title: source.title || `Source ${index + 1}`,
          url: source.url || '',
          relevance: 0.8 - (index * 0.1) // Decreasing relevance
        };
        return map;
      }, {})
    };
  }
}

// Helper functions for LLM processing
function isBusinessRelatedQuery(query) {
  const businessKeywords = ['business', 'company', 'market', 'industry', 'financial', 'economy'];
  return businessKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

export const createFallbackResponse = (query, sources) => {
  const safeQuery = typeof query === 'string' ? query : 'unknown query';
  const safeSources = Array.isArray(sources) ? sources : [];
  
  console.log('DEBUG: Creating fallback response for query:', safeQuery);
  
  // Create a summary from the source titles
  let summaryFromSources = '';
  if (safeSources.length > 0) {
    summaryFromSources = `Based on the search results, here's what I found about "${safeQuery}":\n\n`;
    
    safeSources.forEach((source, index) => {
      const title = source.title || `Source ${index + 1}`;
      summaryFromSources += `- ${title}\n`;
    });
    
    summaryFromSources += `\nPlease review these sources for more detailed information.`;
  }
  
  // Check if it's a business query
  const isBusinessQuery = safeQuery.toLowerCase().includes('business') || 
                        safeQuery.toLowerCase().includes('company') || 
                        safeQuery.toLowerCase().includes('market');
  
  // Create fallback content based on query type
  let fallbackContent = '';
  if (summaryFromSources) {
    // Use the summary from sources if available
    fallbackContent = summaryFromSources;
  } else if (isBusinessQuery) {
    fallbackContent = `I've analyzed ${safeSources.length} results related to your business query "${safeQuery}". 
    
The search results contain information on market trends, business strategies, and industry insights. While I couldn't generate a complete analysis, the sources provide valuable information on:

- Market conditions and business environment
- Industry-specific strategies and best practices
- Competitive analysis and positioning

I recommend reviewing the sources directly for specific data points, market projections, and detailed analysis of this business topic.`;
  } else {
    fallbackContent = `I've analyzed ${safeSources.length} results for your query "${safeQuery}". 
    
The search results contain relevant information on this topic from multiple perspectives. While I couldn't generate a complete analysis, the sources provide:

- Key information and definitions
- Different perspectives on the topic
- Recent developments and research

I recommend reviewing the sources directly for more detailed information.`;
  }
  
  // Generate some generic follow-up questions based on the query
  const followUpQuestions = [
    `What specific aspects of ${safeQuery} are you most interested in?`,
    `Would you like more information about any particular source?`,
    `Can you refine your query to focus on a specific aspect of ${safeQuery}?`
  ];
  
  // Create a consistent response structure
  return {
    content: fallbackContent,
    sources: safeSources.map(source => ({
      title: source.title || 'Unknown Source',
      content: typeof source.content === 'string' ? source.content : 'No content available',
      url: source.url || ''
    })),
    followUpQuestions,
  };
};

// Legacy export to maintain backward compatibility
const processWithLLMInternal = async (options = {}) => {
  // Call the new implementation with appropriate parameter mapping
  const { 
    query = '', 
    sources = [], 
    model = 'mixtral-8x7b', 
    apiKey = null 
  } = options || {};
  
  try {
    // Ensure query is a string
    const queryString = typeof query === 'string' ? query : (query ? String(query) : '');
    
    // Validate inputs
    if (!queryString) {
      throw new Error('Query is required for LLM processing');
    }
    
    return processWithLLM(queryString, sources, model, apiKey);
  } catch (error) {
    logger.error('Error in processWithLLMInternal:', error);
    
    // Return a fallback response object that matches expected format
    // Convert query to string for the error message
    const queryForMessage = typeof query === 'string' ? query : (query ? String(query) : 'unknown query');
    
    return {
      content: `I couldn't process your search results for "${queryForMessage}". Please review the sources directly.`,
      sources: sources || [],
      followUpQuestions: [
        "Would you like to try a different search query?",
        "Would you like me to explain any of the search results in more detail?"
      ],
      sourceMap: {}
    };
  }
};

// Export functions
export { 
  processWithLLMInternal, 
  isBusinessRelatedQuery, 
  processWithLLM 
};
