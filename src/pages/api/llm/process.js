const axios = require('axios');
import { logger as log } from '../../../utils/logger';
import { processWithLLM, MODEL_ENDPOINTS, createFallbackResponse } from '../../../utils/llmProcessing';

// Create a log object for consistent logging
const logger = log;

/**
 * Process content with LLM API
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('DEBUG: About to process with LLM');
    
    // Load environment variables directly for debugging
    const togetherApiKey = process.env.TOGETHER_API_KEY;
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    
    // Print API key details for debugging (showing only first and last 5 chars for security)
    const togetherApiKeyFirstChars = togetherApiKey ? `${togetherApiKey.substring(0, 5)}...${togetherApiKey.substring(togetherApiKey.length - 5)}` : 'undefined';
    const perplexityKeyFirstChars = perplexityApiKey ? `${perplexityApiKey.substring(0, 5)}...${perplexityApiKey.substring(perplexityApiKey.length - 5)}` : 'undefined';
    
    console.log('DEBUG: Environment variables check:', {
      hasTogetherApiKey: !!togetherApiKey,
      togetherApiKeyLength: togetherApiKey ? togetherApiKey.length : 0,
      togetherApiKeyPreview: togetherApiKeyFirstChars,
      hasPerplexityApiKey: !!perplexityApiKey,
      perplexityApiKeyLength: perplexityApiKey ? perplexityApiKey.length : 0,
      perplexityApiKeyPreview: perplexityKeyFirstChars,
      nodeEnv: process.env.NODE_ENV,
      enableLogging: process.env.NEXT_PUBLIC_ENABLE_LOGGING,
      envFiles: '.env and .env.local should be properly configured'
    });
    
    // Extract request parameters, using mixtral-8x7b as the default model
    const { query, sources, model = 'mixtral-8x7b', context = '' } = req.body;

    console.log('DEBUG: LLM API request body:', {
      hasQuery: !!query,
      queryLength: query?.length,
      sourcesCount: sources?.length,
      model
    });

    // Validate required parameters
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Format sources for LLM processing
    const safeSourcesArray = Array.isArray(sources) ? sources : [];
    
    // Validate sources have content
    const validSources = safeSourcesArray.filter(source => {
      // Check if source is a valid object
      if (!source || typeof source !== 'object') return false;
      
      // Check if source has either title or content
      const hasTitle = !!source.title;
      const hasContent = !!(source.content || source.snippet || source.description);
      
      return hasTitle || hasContent;
    });
    
    console.log('DEBUG: Processing sources for LLM:', {
      originalSourcesCount: safeSourcesArray.length,
      validSourcesCount: validSources.length,
      firstSourceSample: validSources.length > 0 ? {
        hasTitle: !!validSources[0].title,
        hasContent: !!(validSources[0].content || validSources[0].snippet || validSources[0].description),
        hasUrl: !!validSources[0].url,
        contentType: typeof validSources[0].content,
        contentLength: (validSources[0].content || validSources[0].snippet || validSources[0].description || '')?.length
      } : 'No valid sources'
    });
    
    // Handle case with no valid sources
    if (validSources.length === 0) {
      console.warn('No valid sources provided for LLM processing');
      return res.status(200).json({
        content: `I couldn't find specific information about "${query}". Please try a different search query or provide more context.`,
        followUpQuestions: [
          `Would you like to know more general information about ${query}?`,
          `Can I help you refine your search query?`,
          `Would you like to try a different approach to find information about ${query}?`
        ]
      });
    }
    
    const formattedSources = validSources.map((source, index) => {
      const content = source.content || source.snippet || source.description || 'No content available';
      return `[${index + 1}] ${source.title || 'Untitled'}\n${content}\n`;
    }).join('\n');

    // Create source map for references
    const sourceMap = {};
    validSources.forEach((source, index) => {
      sourceMap[`[${index + 1}]`] = {
        title: source.title || 'Untitled',
        url: source.url || source.link || '',
        source: source.source || 'unknown'
      };
    });

    // Determine if we're using a full prompt or need to format it
    const prompt = query.includes('SEARCH RESULTS:') ? query : `
You are a helpful AI assistant that provides concise and accurate information based on search results.

QUERY: ${query}

SEARCH RESULTS:
${formattedSources}

${context ? `ADDITIONAL CONTEXT: ${context}\n\n` : ''}

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

    // Try to call Together API with fallback models
    let llmResponse = null;
    let modelUsed = null;
    let apiError = null;
    let llmErrorDetails = {};
    
    // First, try the requested model with Together API
    try {
      console.log('DEBUG: Trying to process with Together API');
      const modelPriority = ['mixtral-8x7b', 'mistral-7b', 'gemma-7b'];
      
      // Try each model in priority order
      for (const currentModel of modelPriority) {
        try {
          console.log(`DEBUG: Attempting to use Together API model: ${currentModel}`);
          
          // Use the processWithLLM function directly
          const result = await processWithLLM(
            query,
            validSources,
            currentModel,
            togetherApiKey
          );
          
          console.log(`DEBUG: Successfully processed with Together API using model: ${currentModel}`);
          
          // If we got a proper result object, return it
          return res.status(200).json({
            ...result,
            sourceMap, // Add the sourceMap
            sources: validSources,
            model: `together-${currentModel}`
          });
        } catch (error) {
          console.error(`DEBUG: Error with Together API model ${currentModel}:`, error.message);
          llmErrorDetails[currentModel] = {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
          };
          
          // Continue to next model
          console.log(`DEBUG: Trying next Together API model in priority list`);
        }
      }
      
      // If we get here, all Together API models failed
      throw new Error("All Together API models failed");
    } catch (error) {
      console.error('DEBUG: All Together API models failed:', error.message);
      apiError = error;
      
      // Continue to fallback with Perplexity
    }

    // If all Together API models failed, try Perplexity
    if (!llmResponse) {
      console.log('DEBUG: All Together API models failed, checking for Perplexity fallback');
      
      // Check if we have a Perplexity API key as fallback
      const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
      if (perplexityApiKey && perplexityApiKey !== 'your_perplexity_api_key_here') {
        console.log('DEBUG: Falling back to Perplexity API');
        try {
          // Use the processWithLLM function directly for Perplexity too
          const result = await processWithLLM(
            query,
            validSources,
            'perplexity',
            perplexityApiKey
          );
          
          console.log('DEBUG: Successfully processed with Perplexity API');
          
          return res.status(200).json({
            ...result,
            sourceMap,
            sources: validSources,
            model: 'perplexity-sonar-small'
          });
        } catch (perplexityError) {
          console.error('DEBUG: Perplexity API error:', perplexityError.message);
          llmErrorDetails.perplexity = {
            message: perplexityError.message,
            status: perplexityError.response?.status,
            data: perplexityError.response?.data
          };
          
          // If Perplexity fails too, we'll return a fallback response
          console.log('DEBUG: All LLM providers failed, using fallback response');
          const fallback = createFallbackResponse(query, validSources);
          return res.status(200).json({
            ...fallback,
            sourceMap,
            sources: validSources,
            error: `LLM processing failed with both providers. Try again later.`
          });
        }
      }
      
      // If no Perplexity fallback, return error
      console.log('DEBUG: No valid Perplexity API key found, using fallback response');
      const fallback = createFallbackResponse(query, validSources);
      return res.status(200).json({
        ...fallback,
        sourceMap,
        sources: validSources,
        error: 'LLM API call failed. No fallback LLM provider available.'
      });
    }
    
    // Process the LLM response
    let content = '';
    let followUpQuestions = [];
    
    try {
      const responseText = llmResponse.data.choices[0].text || '';
      
      console.log('DEBUG: Raw LLM response text:', responseText.substring(0, 200) + '...');
      
      // Try to parse JSON from the response
      try {
        // Look for JSON in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          console.log('DEBUG: Found JSON in response:', jsonStr.substring(0, 200) + '...');
          
          try {
            const parsedJson = JSON.parse(jsonStr);
            console.log('DEBUG: Successfully parsed JSON from LLM response:', {
              hasContent: !!parsedJson.content,
              contentType: typeof parsedJson.content,
              contentLength: parsedJson.content?.length,
              hasFollowUpQuestions: !!parsedJson.followUpQuestions,
              followUpQuestionsType: typeof parsedJson.followUpQuestions,
              followUpQuestionsLength: Array.isArray(parsedJson.followUpQuestions) ? parsedJson.followUpQuestions.length : 0
            });
            
            if (parsedJson.content) {
              content = parsedJson.content;
            }
            
            if (parsedJson.followUpQuestions && Array.isArray(parsedJson.followUpQuestions)) {
              followUpQuestions = parsedJson.followUpQuestions;
            }
          } catch (jsonError) {
            // If JSON parsing fails, use the text as content
            console.error('DEBUG: JSON parsing failed:', jsonError.message);
            content = responseText;
          }
        } else {
          // If no JSON found, use the raw text as content
          content = responseText;
          console.log('DEBUG: No JSON found, using raw text as content');
        }
      } catch (parseError) {
        console.error('DEBUG: Error parsing LLM response:', parseError.message);
        content = responseText;
      }
    } catch (error) {
      console.error('DEBUG: Error extracting content from LLM response:', error.message);
      content = "I couldn't process your query properly. Please try again with a more specific question.";
    }
    
    // If we couldn't extract content, provide a fallback
    if (!content || content.length < 10) {
      console.log('DEBUG: Content extraction failed, using fallback content');
      
      // Create a summary from the sources
      const sourceTitles = validSources.map(source => source.title || 'Untitled').slice(0, 5);
      const sourceCount = validSources.length;
      
      content = `Here are the top results for your query "${query}":
      
${sourceTitles.map((title, index) => `${index + 1}. ${title}`).join('\n')}
${sourceCount > 5 ? `\nAnd ${sourceCount - 5} more sources...` : ''}

These sources may contain relevant information for your query. Click on each source to view more details.`;
      
      followUpQuestions = [
        "Could you try rephrasing your question?",
        "Would you like to search in different sources?",
        "Can you provide more specific details in your query?"
      ];
    }
    
    // Ensure we have follow-up questions
    if (!followUpQuestions || !Array.isArray(followUpQuestions) || followUpQuestions.length === 0) {
      followUpQuestions = [
        "Could you tell me more about this topic?",
        "What are the key factors to consider?",
        "Can you provide more specific information?"
      ];
    }
    
    // Return the formatted response
    return res.status(200).json({
      content: content,
      sources: validSources.map(source => ({
        title: source.title || 'Untitled',
        content: source.content || source.snippet || source.description || '',
        url: source.url || source.link || '',
        source: source.source || 'unknown',
        type: source.type || 'source'
      })),
      sourceMap: sourceMap,
      followUpQuestions: followUpQuestions.slice(0, 3),
      model: modelUsed || model,
      query: query // Include the original query in the response
    });
  } catch (error) {
    console.error('DEBUG: Unexpected error in LLM handler:', error.message);
    logger.error('Unexpected error in LLM handler', { error: error.message });
    
    return res.status(500).json({
      error: 'Unexpected error processing LLM request',
      message: error.message
    });
  }
}

// Function to handle Perplexity LLM
async function handlePerplexityLLM(query, sources, sourceMap, perplexityApiKey) {
  try {
    console.log('DEBUG: Calling Perplexity API');
    
    // Format sources for the prompt
    let formattedSources = '';
    if (Array.isArray(sources)) {
      sources.forEach((source, index) => {
        const title = source.title || 'Untitled';
        const content = source.content || 'No content available';
        formattedSources += `Source ${index + 1}: ${title}\n${content}\n\n`;
      });
    } else {
      formattedSources = 'No sources available';
    }
    
    // Prepare the prompt for Perplexity
    const prompt = `
You are a helpful AI assistant that provides concise and accurate information based on search results.

QUERY: ${query}

SEARCH RESULTS:
${formattedSources}

Please provide a concise and informative response that directly answers the query based on the search results.
Include relevant information from the search results and cite your sources using the reference numbers [1], [2], etc.
Also, suggest 3 follow-up questions that the user might want to ask next.
`;

    // Make the API call
    const llmResponse = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-small-chat', // Use the correct model name from MODEL_ENDPOINTS
        messages: [
          { role: 'system', content: 'You are a helpful assistant that provides concise, accurate information based on search results.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${perplexityApiKey}`
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('DEBUG: Perplexity API response received');
    
    if (!llmResponse.data || !llmResponse.data.choices || !llmResponse.data.choices[0]) {
      console.error('DEBUG: Invalid response format from Perplexity API');
      throw new Error('Invalid response format from Perplexity API');
    }
    
    const content = llmResponse.data.choices[0].message.content;
    
    // Extract follow-up questions (simple implementation)
    const followUpQuestions = [];
    const followUpRegex = /follow-up questions?:?\s*(.*?)(?:\n\n|$)/i;
    const followUpMatch = content.match(followUpRegex);
    
    if (followUpMatch && followUpMatch[1]) {
      const questionsText = followUpMatch[1];
      const questions = questionsText.split(/\d+\.\s*/).filter(q => q.trim().length > 0);
      
      // If we found numbered questions, use them
      if (questions.length > 0) {
        questions.forEach(q => {
          if (q.trim().endsWith('?')) {
            followUpQuestions.push(q.trim());
          }
        });
      }
    }
    
    // If we couldn't extract questions, provide default ones
    if (followUpQuestions.length === 0) {
      followUpQuestions.push(
        "Could you tell me more about this topic?",
        "What are the key factors to consider?",
        "Can you provide more specific information?"
      );
    }
    
    return {
      content: content,
      sourceMap: sourceMap,
      followUpQuestions: followUpQuestions.slice(0, 3),
      model: 'perplexity-sonar-small-chat'
    };
  } catch (error) {
    console.error('DEBUG: Perplexity API error:', error.message);
    if (error.response) {
      console.error('DEBUG: Perplexity API error details:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    logger.error('Perplexity API error:', error.message);
    
    return {
      content: "I couldn't process your query with the fallback LLM service. Here are the search results without processing.",
      followUpQuestions: [
        "Would you like to try a different search?",
        "Would you like to search without LLM processing?",
        "Would you like to try again later?"
      ],
      error: `Perplexity API error: ${error.message}`
    };
  }
}