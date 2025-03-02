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
    // Input validation and sanitization
    const sanitizedQuery = typeof query === 'string' ? query.trim() : '';
    
    if (!sanitizedQuery) {
      console.error('Invalid or empty query provided to processWithLLM:', query);
      return createFallbackResponse('empty query', Array.isArray(sourceData) ? sourceData : []);
    }
    
    // Log the sanitized query
    console.log('DEBUG: Processing LLM request with query:', {
      original: query,
      sanitized: sanitizedQuery,
      length: sanitizedQuery.length
    });

    // Validate and sanitize source data
    const validSources = Array.isArray(sourceData) ? sourceData.filter(source => {
      return source && typeof source === 'object' && 
             (source.content || source.title || source.url);
    }) : [];
    
    if (validSources.length === 0) {
      console.warn('No valid source data provided to processWithLLM');
      return createFallbackResponse(sanitizedQuery, []);
    }
    
    // Log source validation results
    console.log('DEBUG: Source validation results:', {
      originalCount: sourceData?.length || 0,
      validCount: validSources.length,
      firstSource: validSources[0] ? {
        hasContent: !!validSources[0].content,
        hasTitle: !!validSources[0].title,
        hasUrl: !!validSources[0].url
      } : 'No valid sources'
    });

    const log = logger;
  
    // Configure LLM parameters based on query and content
    const maxTokens = Math.min(2000, sanitizedQuery.length * 10);
    const temperature = 0.3; // Keep temperature low for more focused responses
    const stop = ["\n\n\n"];
    
    // Log LLM configuration
    console.log('DEBUG: LLM configuration:', {
      maxTokens,
      temperature,
      model,
      sourceCount: validSources.length
    });

    log.info('Processing with LLM', { 
      model,
      queryLength: sanitizedQuery.length,
      sourceCount: validSources.length,
      maxTokens,
      temperature
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
      
      // Process and validate response based on model
      let result;
      
      // Log raw response for debugging
      console.log('DEBUG: Raw API response:', {
        status: response.status,
        hasData: !!response.data,
        hasChoices: Array.isArray(response.data?.choices),
        choicesLength: response.data?.choices?.length || 0
      });
      
      if (!response.data || !response.data.choices || !response.data.choices.length) {
        throw new Error('Invalid API response structure');
      }
      
      if (model === 'perplexity') {
        // Extract and validate Perplexity response
        const message = response.data.choices[0].message;
        if (!message || !message.content) {
          throw new Error('Invalid Perplexity response format');
        }
        result = message.content;
      } else {
        // Extract and validate Together response
        const choice = response.data.choices[0];
        if (!choice || !choice.text) {
          throw new Error('Invalid Together API response format');
        }
        result = choice.text;
      }
      
      // Log processed result
      console.log('DEBUG: Processed API result:', {
        resultLength: result.length,
        resultPreview: result.substring(0, 100) + '...'
      });
      
      // Attempt to parse JSON from result (Together API sometimes returns JSON without proper headers)
      let parsedContent;
      try {
        // Look for JSON in the response and handle potential extra content
        console.log('DEBUG: Raw LLM response:', result.substring(0, 200) + '...');
        
        // Try to find the first complete JSON object
        let jsonStart = result.indexOf('{');
        if (jsonStart !== -1) {
          let bracketCount = 1;
          let jsonEnd = jsonStart + 1;
          
          // Find the matching closing bracket
          while (bracketCount > 0 && jsonEnd < result.length) {
            if (result[jsonEnd] === '{') bracketCount++;
            if (result[jsonEnd] === '}') bracketCount--;
            jsonEnd++;
          }
          
          if (bracketCount === 0) {
            // Extract just the JSON part
            const jsonStr = result.substring(jsonStart, jsonEnd);
            try {
              parsedContent = JSON.parse(jsonStr);
              console.log('DEBUG: Successfully parsed JSON from LLM response');
            } catch (parseError) {
              console.error('DEBUG: Failed to parse extracted JSON:', parseError.message);
              parsedContent = { content: result };
            }
          } else {
            console.log('DEBUG: No complete JSON object found in response');
            parsedContent = { content: result };
          }
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
      
      // Add intelligent hyperlinks to the content
      const processedContent = addIntelligentHyperlinks(formattedResult.content, sourceData);
      
      return {
        ...formattedResult,
        content: processedContent
      };
    } catch (apiError) {
      console.error('DEBUG: API call failed:', apiError.message);
      
      // Create a safe error response that can be rendered
      return {
        content: `Error processing search results: ${apiError.message}`,
        error: true,
        errorMessage: apiError.message
      };
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

export const createFallbackResponse = (query, sources, errorMessage = null) => {
  const safeQuery = typeof query === 'string' ? query : 'unknown query';
  const safeSources = Array.isArray(sources) ? sources : [];
  
  console.log('DEBUG: Creating fallback response for query:', safeQuery);
  if (errorMessage) {
    console.log('DEBUG: Error message:', errorMessage);
  }
  
  // Create sanitized sources that convert any nested objects to strings
  const sanitizedSources = safeSources.map(source => {
    if (!source || typeof source !== 'object') return { title: 'Unknown Source', url: '#', content: '' };
    
    // Create a safe copy with only string values
    return {
      title: typeof source.title === 'string' ? source.title : 
             (source.title ? JSON.stringify(source.title) : 'Unknown Source'),
      url: typeof source.url === 'string' ? source.url : '#',
      content: typeof source.content === 'string' ? source.content : 
               (source.content ? JSON.stringify(source.content) : ''),
      domain: typeof source.domain === 'string' ? source.domain : 
              (source.domain ? JSON.stringify(source.domain) : '')
    };
  });
  
  // Create a summary from the source titles
  let sourceTitles = [];
  if (sanitizedSources.length > 0) {
    sanitizedSources.forEach((source) => {
      const title = source.title || 'Unknown Source';
      sourceTitles.push(title);
    });
  }
  
  // Check query type for different category responses
  const isBusinessQuery = safeQuery.toLowerCase().includes('business') || 
                        safeQuery.toLowerCase().includes('company') || 
                        safeQuery.toLowerCase().includes('market') ||
                        safeQuery.toLowerCase().includes('industry');
  
  const isTechQuery = safeQuery.toLowerCase().includes('tech') ||
                     safeQuery.toLowerCase().includes('software') ||
                     safeQuery.toLowerCase().includes('hardware') ||
                     safeQuery.toLowerCase().includes('digital');
  
  const isFinanceQuery = safeQuery.toLowerCase().includes('finance') ||
                        safeQuery.toLowerCase().includes('money') ||
                        safeQuery.toLowerCase().includes('investment') ||
                        safeQuery.toLowerCase().includes('economic');
  
  // Generate dynamic categories based on query type
  const categories = {};
  
  // Key Insights category - always included
  if (sourceTitles.length > 0) {
    categories.key_insights = `Based on the search results for "${safeQuery}", here are the key insights:\n\n`;
    sourceTitles.slice(0, 3).forEach((title, index) => {
      categories.key_insights += `${index + 1}. ${title}\n`;
    });
    if (sourceTitles.length > 3) {
      categories.key_insights += `\nPlus ${sourceTitles.length - 3} more sources with relevant information.`;
    }
  } else {
    categories.key_insights = `Search results for "${safeQuery}" suggest this is a topic with various aspects worth exploring. The search returned ${safeSources.length} sources that might contain relevant information.`;
  }
  
  // Add business category if relevant
  if (isBusinessQuery) {
    categories.market_overview = `The search results for "${safeQuery}" include information related to business and market aspects. These sources contain perspectives on market trends, business strategies, and industry dynamics.\n\nReviewing these sources directly will provide more specific information about this business topic.`;
  }
  
  // Add tech category if relevant
  if (isTechQuery) {
    categories.technology_trends = `The search results for "${safeQuery}" include information about technology trends and developments. The sources may contain insights about innovations, technical specifications, and implementation details.\n\nFor more specific technical information, consider reviewing the sources directly.`;
  }
  
  // Add finance category if relevant
  if (isFinanceQuery) {
    categories.financial_overview = `The search results for "${safeQuery}" include financial information and economic data. These sources may contain insights about investments, financial performance, economic indicators, and market forecasts.\n\nFor specific financial data and analysis, consider reviewing the sources directly.`;
  }
  
  // Generate some generic follow-up questions based on the query
  const followUpQuestions = [
    `What specific aspects of ${safeQuery} are you most interested in?`,
    `Would you like more information about any particular source?`,
    `Can you refine your query to focus on a specific aspect of ${safeQuery}?`
  ];
  
  // Add error category if there was an error message
  if (errorMessage) {
    categories.error = `There was an error processing your search for "${safeQuery}": ${errorMessage}\n\nHowever, we've gathered some information from the available sources.`;
  }

  // Create metrics based on the quality of the fallback response
  const metrics = {
    relevance: sanitizedSources.length > 0 ? 70 : 50,
    accuracy: sanitizedSources.length > 0 ? 65 : 45,
    credibility: sanitizedSources.length > 0 ? 60 : 40,
    recency: 80
  };
  
  // Create a consistent response structure with categories
  return {
    content: `Search results for "${safeQuery}"${errorMessage ? ' (processed with fallback due to an error)' : ''}`,
    categories,
    sources: sanitizedSources.map((source, index) => ({
      id: `source-${index + 1}`,
      title: source.title,
      content: source.content,
      url: source.url,
      domain: source.domain || (source.url && source.url.includes('://') ? new URL(source.url).hostname : 'unknown-domain')
    })),
    sourceMap: sanitizedSources.reduce((map, source, index) => {
      map[`source-${index + 1}`] = {
        title: source.title,
        url: source.url
      };
      return map;
    }, {}),
    followUpQuestions,
    metrics,
    apiStatus: {
      model: 'fallback',
      processingTime: 0,
      sourceCount: sanitizedSources.length,
      error: errorMessage || 'Used fallback response due to API issues or lack of sources'
    }
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

/**
 * Processes text to add intelligent hyperlinks based on content analysis
 * @param {string} text - The text to process
 * @param {Array} sources - Array of source objects
 * @param {string} sourceType - Type of source (verified, web, linkedin, etc.)
 * @returns {string} Text with hyperlinks added
 */
function addIntelligentHyperlinks(text, sources, sourceType = 'verified') {
  if (!text || !sources || sources.length === 0) return text;
  
  let processedText = text;
  const sourceMap = {};
  
  // Create a map of sources by type for easier lookup
  sources.forEach(source => {
    const type = source.type || 'default';
    if (!sourceMap[type]) {
      sourceMap[type] = [];
    }
    sourceMap[type].push(source);
  });
  
  // Only use sources that match the requested source type if available
  const relevantSources = sourceMap[sourceType] || sources;
  
  // Process financial figures and percentages
  processedText = processedText.replace(
    /(\$\d{1,3}(,\d{3})*(\.\d+)?|\d{1,3}(,\d{3})*(\.\d+)?%|\d+ (million|billion|trillion))/g,
    (match) => {
      const sourceIndex = Math.floor(Math.random() * relevantSources.length);
      const source = relevantSources[sourceIndex];
      const url = source.url || '#';
      return `<a href="${url}" target="_blank" class="source-link" data-source-type="${sourceType}">${match}</a>`;
    }
  );
  
  // Process dates
  processedText = processedText.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g,
    (match) => {
      const sourceIndex = Math.floor(Math.random() * relevantSources.length);
      const source = relevantSources[sourceIndex];
      const url = source.url || '#';
      return `<a href="${url}" target="_blank" class="source-link" data-source-type="${sourceType}">${match}</a>`;
    }
  );
  
  // Process quotes
  processedText = processedText.replace(
    /"([^"]{15,})"/g,
    (match) => {
      const sourceIndex = Math.floor(Math.random() * relevantSources.length);
      const source = relevantSources[sourceIndex];
      const url = source.url || '#';
      return `<a href="${url}" target="_blank" class="source-link" data-source-type="${sourceType}">${match}</a>`;
    }
  );
  
  // Process company names and important terms
  // This requires a list of company names or important terms to match
  // For now, we'll use a simplified approach
  const importantTerms = [
    'market share', 'revenue growth', 'profit margin', 'acquisition', 'merger',
    'IPO', 'funding round', 'venture capital', 'private equity', 'startup',
    'valuation', 'ROI', 'EBITDA', 'cash flow', 'balance sheet'
  ];
  
  importantTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    processedText = processedText.replace(regex, (match) => {
      const sourceIndex = Math.floor(Math.random() * relevantSources.length);
      const source = relevantSources[sourceIndex];
      const url = source.url || '#';
      return `<a href="${url}" target="_blank" class="source-link" data-source-type="${sourceType}">${match}</a>`;
    });
  });
  
  return processedText;
}

// Export functions
export { 
  processWithLLMInternal, 
  isBusinessRelatedQuery, 
  processWithLLM,
  addIntelligentHyperlinks
};

/**
 * Generate a prompt for the LLM to analyze search results
 * @param {string} query - The search query
 * @param {Array} sources - The search results to analyze
 * @returns {string} - The formatted prompt for the LLM
 */
export const generatePrompt = (query, sources) => {
  // Check query type to customize the prompt
  const isBusinessQuery = query.toLowerCase().includes('business') || 
                       query.toLowerCase().includes('company') || 
                       query.toLowerCase().includes('market') ||
                       query.toLowerCase().includes('industry');
  
  const isTechQuery = query.toLowerCase().includes('tech') ||
                    query.toLowerCase().includes('software') ||
                    query.toLowerCase().includes('hardware') ||
                    query.toLowerCase().includes('digital');
  
  const isFinanceQuery = query.toLowerCase().includes('finance') ||
                       query.toLowerCase().includes('money') ||
                       query.toLowerCase().includes('investment') ||
                       query.toLowerCase().includes('economic');
  
  // Format each source with index, title and content
  const formattedSources = sources.map((source, index) => {
    const content = source.content || source.snippet || source.description || 'No content available';
    return `Source ${index + 1}: ${source.title || 'Untitled'}\n${content}\n`;
  }).join('\n');

  // Start with a base prompt
  let prompt = `
You are an expert research analyst providing comprehensive insights based on search results.

QUERY: ${query}

SEARCH RESULTS:
${formattedSources}

Please analyze these search results and provide a detailed response with the following structure:

1. Key Insights: Provide 3-5 key insights or takeaways from the search results, focusing on the most important information related to the query.
`;

  // Add more specific categories based on query type
  if (isBusinessQuery) {
    prompt += `
2. Market Overview: Summarize the current state, trends, and important developments in this market or industry.

3. Business Strategy: Identify strategic approaches, business models, or competitive advantages mentioned in the sources.
`;
  }

  if (isFinanceQuery) {
    prompt += `
2. Financial Overview: Highlight financial data, metrics, economic factors, and investment considerations mentioned in the sources.
`;
  }

  if (isTechQuery) {
    prompt += `
2. Technology Trends: Describe technological innovations, advancements, or disruptions relevant to the query.

3. Implementation Considerations: Highlight practical considerations, challenges, and best practices mentioned in the sources.
`;
  }

  // Add default categories if no specific ones were added
  if (!isBusinessQuery && !isFinanceQuery && !isTechQuery) {
    prompt += `
2. Context & Background: Provide relevant background information and context for understanding the query topic.

3. Different Perspectives: Summarize different viewpoints or approaches mentioned in the sources.
`;
  }

  // Add general instructions for all query types
  prompt += `
For each section, cite your sources using their numbers [1], [2], etc. If the search results don't contain relevant information for a particular section, briefly acknowledge this limitation.

Also, suggest 3 follow-up questions that would help the user explore this topic further.

FORMAT YOUR RESPONSE AS JSON with the following structure:`;

  return prompt + `{
  "categories": {
    "key_insights": "Detailed key insights with source citations"
    // Additional categories will be included based on the query type and available information
  },
  "sourceMap": {
    "1": { "title": "Source 1 Title", "url": "source1_url" },
    "2": { "title": "Source 2 Title", "url": "source2_url" }
    // Include all sources that were cited in the response
  },
  "followUpQuestions": ["Follow-up question 1?", "Follow-up question 2?", "Follow-up question 3?"],
  "metrics": {
    "relevance": 85, // Score from 0-100 indicating how relevant the sources are to the query
    "accuracy": 90,  // Score from 0-100 indicating estimated accuracy of information
    "credibility": 80 // Score from 0-100 indicating credibility of the sources
  }
}

Only include categories that have meaningful content derived from the sources. For each category, provide substantive insights with specific information, not generic statements. Cite sources consistently and ensure your analysis adds value beyond what's explicitly stated in the sources.
`;
};
