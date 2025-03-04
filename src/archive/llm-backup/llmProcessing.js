import axios from 'axios';
import { logger } from './logger';
import { isLLMResult, addLLMFlags, processLLMResults } from './llm/resultDetector';
import { formatSearchPrompt, createSystemPrompt } from './llm/prompts';

/**
 * Enhanced LLM Processing Module
 * Provides robust handling of LLM interactions for search enhancement
 * Version 2.0 - Complete rewrite for improved reliability and clarity
 */

const log = logger;

// Define the supported model endpoints with their complete configuration
export const MODEL_ENDPOINTS = {
  'default': {
    apiEndpoint: 'https://api.together.xyz/v1/completions',
    apiModelName: 'mistralai/Mistral-7B-v0.1',
    apiKeyEnvVar: 'TOGETHER_API_KEY',
    displayName: 'Default (Mistral 7B)',
    maxTokens: 800,
    temperature: 0.7,
    topP: 0.9,
    headers: {
      'Content-Type': 'application/json',
    },
  },
  'mistral-7b': {
    apiEndpoint: 'https://api.together.xyz/v1/completions',
    apiModelName: 'mistralai/Mistral-7B-v0.1',
    apiKeyEnvVar: 'TOGETHER_API_KEY',
    displayName: 'Mistral 7B',
    maxTokens: 800,
    temperature: 0.7,
    topP: 0.9,
    fallbackModel: 'llama-13b', // Add fallback model reference
    headers: {
      'Content-Type': 'application/json',
    },
  },
  'llama-13b': {
    apiEndpoint: 'https://api.together.xyz/v1/completions',
    apiModelName: 'meta-llama/Llama-2-13b-chat-hf',
    apiKeyEnvVar: 'TOGETHER_API_KEY',
    displayName: 'Llama 2 13B',
    maxTokens: 1024,
    temperature: 0.7,
    topP: 0.9,
    fallbackModel: 'gemma-27b', // Add fallback model reference
    headers: {
      'Content-Type': 'application/json',
    }
  },
  'gemma-27b': {
    apiEndpoint: 'https://api.together.xyz/v1/completions',
    apiModelName: 'google/gemma-2-27b-it',
    apiKeyEnvVar: 'TOGETHER_API_KEY',
    displayName: 'Gemma 27B',
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    headers: {
      'Content-Type': 'application/json',
    }
  },
  'gemma': {
    apiEndpoint: 'https://api.together.xyz/v1/completions',
    apiModelName: 'google/gemma-2-27b-it',
    apiKeyEnvVar: 'TOGETHER_API_KEY',
    displayName: 'Gemma 27B',
    maxTokens: 1024,
    temperature: 0.7,
    topP: 0.9,
    headers: {
      'Content-Type': 'application/json',
    }
  }
};

/**
 * Format the content properly for display in the UI
 * @param {string} content - Raw content from LLM
 * @returns {string} - Properly formatted content with HTML
 */
function formatContentForDisplay(content) {
  if (!content || typeof content !== 'string') return content;
  
  let formatted = content;
  
  // Convert markdown headings to HTML
  formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Convert bullet points to HTML lists
  if (formatted.includes('* ') || formatted.includes('- ')) {
    formatted = formatted.replace(/^\s*[\*\-]\s+(.+)$/gm, '<li>$1</li>');
    if (formatted.includes('<li>')) {
      formatted = formatted.replace(/(<li>.+<\/li>\n?)+/g, '<ul>$&</ul>');
    }
  }
  
  // Convert double line breaks to paragraphs
  formatted = formatted.replace(/\n\n/g, '</p><p>');
  
  // Wrap the content in a proper container
  if (!formatted.startsWith('<div')) {
    formatted = `<div class="llm-content"><p>${formatted}</p></div>`;
  }
  
  return formatted;
}

/**
 * Process content with LLM API to generate insights from search results
 * @param {string} query - The original search query
 * @param {Array} sourceData - Search results to process
 * @param {string} modelKey - Key for LLM model in MODEL_ENDPOINTS
 * @param {string} apiKey - API key for LLM provider
 * @returns {Object} Processed results with content, follow-up questions and source mapping
 */
async function processWithLLM(
  query,
  sourceData,
  modelKey = 'default',
  apiKey = null
) {
  try {
    // Input validation and sanitization
    const sanitizedQuery = typeof query === 'string' ? query.trim() : '';
    
    if (!sanitizedQuery) {
      log.error('Invalid or empty query provided to processWithLLM');
      return createErrorResponse('Empty or invalid query. Please provide a valid search query.');
    }
    
    // Log the request details
    log.info('Processing LLM request', {
      query: sanitizedQuery.substring(0, 50) + (sanitizedQuery.length > 50 ? '...' : ''),
      modelKey,
      sourceCount: sourceData?.length || 0
    });

    // Validate and prepare sources
    const validSources = Array.isArray(sourceData) ? sourceData.filter(source => {
      // Ensure each source has at least one required field
      return source && typeof source === 'object' && 
             (source.content || source.title || source.url || source.text || source.snippet);
    }) : [];
    
    // Early return if no valid sources
    if (validSources.length === 0) {
      log.warn('No valid sources available for LLM processing');
      return createErrorResponse('No valid source data available for your query.');
    }
    
    // Get model configuration with improved model name handling
    // This handles cases where the model name might be slightly different than expected
    let modelConfig;
    
    // Try direct lookup first
    if (MODEL_ENDPOINTS[modelKey]) {
      modelConfig = MODEL_ENDPOINTS[modelKey];
      log.info(`Found exact model match for: ${modelKey}`);
    } 
    // Check for partial matches
    else {
      // Convert to lowercase for comparison
      const normalizedKey = modelKey.toLowerCase();
      
      // Try to find a model that contains the key
      const availableModels = Object.keys(MODEL_ENDPOINTS);
      const matchingModel = availableModels.find(modelName => {
        // Check if the model name contains the requested key or vice versa
        return modelName.includes(normalizedKey) || normalizedKey.includes(modelName);
      });
      
      if (matchingModel) {
        modelConfig = MODEL_ENDPOINTS[matchingModel];
        log.info(`Found partial model match: ${modelKey} -> ${matchingModel}`);
      } else {
        // Fall back to default if no match found
        modelConfig = MODEL_ENDPOINTS['default'];
        log.warn(`No match found for model: ${modelKey}, using default`);
      }
    }
    
    if (!modelConfig) {
      log.error(`Invalid model key: ${modelKey}`);
      return createErrorResponse(`The specified model "${modelKey}" is not supported.`);
    }

    // Validate API key
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 64) {
      log.error('Invalid API key provided to LLM processor');
      return createErrorResponse('Invalid API key. Together API keys should be at least 64 characters.');
    }
  
    // Set up LLM parameters from model configuration
    const maxTokens = modelConfig.maxTokens || 1024;
    const temperature = modelConfig.temperature || 0.7;
    const topP = modelConfig.topP || 0.9;
    
    // Create the prompt using our search prompt formatter
    const prompt = formatSearchPrompt(sanitizedQuery, validSources);
    
    // Log API request details (sensitive info redacted)
    log.info('Preparing LLM API request', { 
      model: modelConfig.apiModelName,
      endpoint: modelConfig.apiEndpoint,
      promptLength: prompt.length,
      maxTokens,
      temperature
    });
    
    // Set up request timeout
    const TIMEOUT_MS = 30000; // 30 seconds
    let timeoutId = setTimeout(() => {
      log.error('LLM request timed out after 30 seconds');
      throw new Error('LLM request timed out. Please try again with a shorter query or fewer sources.');
    }, TIMEOUT_MS);
    
    try {
      // Set up the API request
      const requestBody = {
        model: modelConfig.apiModelName,
        prompt: prompt,
        max_tokens: maxTokens,
        temperature: temperature,
        top_p: topP,
        stop: ["\n\n\n"],
        stream: false
      };
      
      // Add fallback model support (from server/llmProcessor.js)
      const tryModelWithFallback = async (modelConfig) => {
        try {
          // Attempt with current model
          return await makeApiRequest(modelConfig, requestBody);
        } catch (error) {
          // Check if we have a fallback model defined
          const fallbackModelKey = modelConfig.fallbackModel;
          if (fallbackModelKey && MODEL_ENDPOINTS[fallbackModelKey]) {
            log.warn(`Failed to use ${modelConfig.apiModelName}, trying fallback model ${fallbackModelKey}`);
            const fallbackConfig = MODEL_ENDPOINTS[fallbackModelKey];
            // Update request body with new model
            const fallbackRequestBody = {
              ...requestBody,
              model: fallbackConfig.apiModelName
            };
            return await makeApiRequest(fallbackConfig, fallbackRequestBody);
          }
          // No fallback available, re-throw the error
          throw error;
        }
      };
      
      // Helper function for API requests with better error handling
      const makeApiRequest = async (config, body) => {
        const headers = {
          ...config.headers,
          'Authorization': `Bearer ${apiKey}`
        };

        log.debug('Sending request to LLM API', { endpoint: config.apiEndpoint, model: config.apiModelName });
        
        // Make the API call with timeout
        const response = await axios.post(
          config.apiEndpoint,
          body,
          { 
            headers,
            timeout: 60000 // 60 seconds timeout
          }
        );
        
        return response;
      };
      
      // Use the tryModelWithFallback helper to make the API call with fallback support
      const response = await tryModelWithFallback(modelConfig);
      
      // Clear the timeout as we got a response
      clearTimeout(timeoutId);
      
      // Response structure varies by provider, handle accordingly
      if (!response.data) {
        throw new Error('Empty response from LLM API');
      }
      
      // Extract the completion text based on API response format
      let completionText;
      
      if (response.data.choices && response.data.choices.length > 0) {
        // Standard Together API format
        completionText = response.data.choices[0].text;
      } else if (response.data.completion) {
        // Alternative Together API format
        completionText = response.data.completion;
      } else if (response.data.content) {
        // Some APIs return content directly
        completionText = response.data.content;
      } else {
        log.error('Unexpected API response format', { responseKeys: Object.keys(response.data) });
        throw new Error('Unexpected response format from LLM API');
      }
      
      // Validate completion
      if (!completionText || typeof completionText !== 'string') {
        log.error('Invalid completion from LLM API', { type: typeof completionText });
        throw new Error('Invalid completion response from LLM API');
      }
      
      log.info('Received LLM response', { length: completionText.length });
      
      // Format the raw text for display
      const formattedContent = formatContentForDisplay(completionText);
      
      // Process the LLM result to extract insights, sources, etc.
      const processedResult = processLLMResults(formattedContent, validSources, sanitizedQuery);
      
      // Add result flags and metadata
      const enhancedResult = addLLMFlags(processedResult);
      
      return {
        ...enhancedResult,
        rawContent: completionText,
        query: sanitizedQuery,
        model: modelConfig.displayName,
        timestamp: new Date().toISOString()
      };
    } catch (innerError) {
      // Handle errors during API request processing
      clearTimeout(timeoutId);
      log.error('Error during LLM API call', { message: innerError.message });
      throw innerError;
    }
  } catch (error) {
    // Handle any errors that occurred during processing
    log.error('Error in processWithLLM', { 
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 200)
    });
    
    // Return a user-friendly error response
    return createErrorResponse(
      `Error processing your query: ${error.message}. Please try again or use a different model.`
    );
  }
}

/**
 * Helper function to create error response objects
 * @param {string} message - User-facing error message
 * @returns {Object} Standardized error response object
 */
function createErrorResponse(message) {
  return {
    content: `<div class="llm-error"><p>${message}</p></div>`,
    error: true,
    errorMessage: message,
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates clickable links in content for URLs, references, and citations
 * @param {string} content - Content to process
 * @returns {string} - Content with hyperlinks added
 */
function addHyperlinks(content) {
  if (!content || typeof content !== 'string') return content;
  
  // URL pattern - matches common URL formats
  const urlPattern = /(https?:\/\/[^\s\)"'<>]+)/g;
  
  // Process URLs - create actual clickable links
  let processed = content.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Process citation references like [1], [2], etc.
  const citationPattern = /\[(\d+)\]/g;
  processed = processed.replace(citationPattern, '<a href="#citation-$1" class="citation-ref">[$1]</a>');
  
  return processed;
}

// Export the public API
export {
  formatContentForDisplay,
  addHyperlinks,
  MODEL_ENDPOINTS,
  createErrorResponse
};

// Additional exports for llm-exports.js
export {
  isBusinessRelatedQuery,
  createFallbackResponse,
  createSourceMap
};

// Legacy export to maintain backward compatibility
const processWithLLMInternal = async (options = {}) => {
  // Call the new implementation with appropriate parameter mapping
  const { 
    query = '', 
    sources = [], 
    model = 'default', 
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

/**
 * Creates a source map for attributing content to sources
 * @param {Array} sources - The source data to map
 * @returns {Object} A mapping of source IDs to source metadata
 */
function createSourceMap(sources) {
  if (!Array.isArray(sources)) return {};
  
  const sourceMap = {};
  
  sources.forEach((source, index) => {
    if (!source || typeof source !== 'object') return;
    
    const sourceId = String(index + 1); // 1-based indexing for citation
    
    sourceMap[sourceId] = {
      title: source.title || 'Unnamed Source',
      url: source.url || '#',
      id: source.id || `source-${index}`,
      type: source.type || 'web'
    };
  });
  
  return sourceMap;
}

// Export public API
export { 
  formatContentForDisplay,
  addHyperlinks,
  createErrorResponse,
  createSourceMap,
  processWithLLMInternal, // Legacy export for backward compatibility
  isBusinessRelatedQuery
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
    return `Source ${index + 1}: ${source.title || 'Untitled'}\nURL: ${source.url || 'No URL'}\nSource: ${source.source || 'Unknown'}\n${content}\n`;
  }).join('\n');

  // Start with a base prompt
  let prompt = `
You are an expert research analyst synthesizing information from multiple sources to answer a query comprehensively and provide a well-structured response.

QUERY: ${query}

SOURCE INFORMATION:
${formattedSources}

Please synthesize this information to answer the query. DO NOT comment on the search results themselves. Instead, extract the relevant information and create a comprehensive, well-formatted answer.

## REQUIRED OUTPUT FORMAT:
Your response MUST be structured using markdown formatting with clear section headers and properly formatted paragraphs and bullet points.

1. Use '## SECTION TITLE' for all main section headings
2. Use bullet points (•) for lists within sections
3. Create proper paragraphs with line breaks between them
4. Ensure information flows logically between sections
5. Cite sources using [Source N] format

Your response MUST include these sections:

## SUMMARY
Provide a concise 2-3 paragraph summary directly answering the query based on the provided sources.

## KEY POINTS
List 3-5 bullet points with the most important insights from the sources, each point should be 1-2 sentences.
`;

  // Add more specific categories based on query type
  if (isBusinessQuery) {
    prompt += `
## MARKET OVERVIEW
Summarize the current state, trends, and important developments in this market or industry using multiple paragraphs with proper formatting.

## BUSINESS STRATEGY 
Identify strategic approaches, business models, or competitive advantages mentioned in the sources. Organize this into subsections if multiple approaches are found.
`;
  }

  if (isFinanceQuery) {
    prompt += `
## FINANCIAL OVERVIEW
Highlight financial data, metrics, economic factors, and investment considerations mentioned in the sources. Format numbers and percentages consistently.

## RISK FACTORS
Summarize any potential risks, challenges, or considerations an investor should be aware of based on the sources.
`;
  }

  if (isTechQuery) {
    prompt += `
## TECHNOLOGY TRENDS
Describe technological innovations, advancements, or disruptions relevant to the query. Structure this with clear paragraphs and bullet points for specific innovations.

## IMPLEMENTATION CONSIDERATIONS
Highlight practical considerations, challenges, and best practices mentioned in the sources. Include subsections for challenges and best practices if applicable.
`;
  }

  // Add default categories if no specific ones were added
  if (!isBusinessQuery && !isFinanceQuery && !isTechQuery) {
    prompt += `
## DETAILED ANALYSIS
Provide relevant background information and context for understanding the query topic. Structure this with multiple paragraphs that flow logically and cover different aspects of the topic.

## DIFFERENT PERSPECTIVES
Summarize different viewpoints or approaches mentioned in the sources. Use bullet points to highlight contrasting opinions when applicable.
`;
  }

  // Add general instructions for all query types
  prompt += `
## FOLLOW-UP QUESTIONS
Provide 3 specific, thought-provoking follow-up questions that would help the user explore this topic further. Format these as bullet points (•).

## CITATION GUIDELINES:
1. For each section, cite your sources using [Source N] format
2. Ensure every significant fact or claim has a source citation
3. If multiple sources support the same point, list all relevant sources [Source 1, Source 3]
4. If the search results don't contain relevant information for a particular section, explicitly state this limitation

REMEMBER: 
- Your answer must be comprehensive and well-structured with proper markdown formatting
- Each section must have a '## ' heading prefix
- Use bullet points (•) for lists and key points
- Create proper paragraphs with line breaks
- Include all required sections, even if brief
- Always provide source citations`;

  return prompt;

};
