/**
 * LLMResultHandler.js
 * Unified utility for handling LLM result detection, formatting and display
 */

import React from 'react';
import { isLLMResult, processLLMResults } from '../../../../utils/llm/resultDetector';

/**
 * Comprehensive LLM result detection
 * Uses multiple detection strategies to ensure reliable detection
 * 
 * @param {Object} result The result object to check
 * @returns {boolean} Whether the result is an LLM result
 */
/**
 * Ultra-enhanced LLM result detection with multiple fallback strategies
 * Uses a comprehensive approach to reliably detect LLM results vs search results
 * 
 * @param {Object} result The result object to check
 * @returns {boolean} Whether the result is an LLM result
 */
export const detectLLMResult = (result) => {
  if (!result) return false;
  
  console.log('DEBUG: Checking if result is LLM:', result);
  
  // STRATEGY 1: Flag-based detection (most reliable) - expanded with comprehensive flags
  // This is the most reliable approach and should be checked first
  const LLM_FLAGS = [
    '__isImmutableLLMResult',
    'isLLMResults', 
    'llmProcessed',
    'aiProcessed',
    'isAIGenerated',
    'isLLM',
    'fromLLM',
    'hasLLMMetadata',
    'llmFormatted',
    'llmGenerated',
    'shouldUseLLM',
    'forceLLM',
    'useLLM',
    'isProcessedByLLM',
    'hasLLMContent',
    'isTogetherAIResult',
    'generatedByLLM',
    'fromLLMAPI',
    'llmContent',
    'generatedContent',
    'aiGenerated',
    'isAI',
    'isAssistant'
  ];
  
  for (const flag of LLM_FLAGS) {
    if (result[flag] === true) {
      console.log(`DEBUG: Detected LLM result by flag: ${flag}`);
      return true;
    }
  }
  
  // STRATEGY 2: Structure-based detection (reliable for API responses)
  // Check for message arrays with assistant/AI roles
  if (result.content && Array.isArray(result.content)) {
    const hasAssistantContent = result.content.some(item => 
      item.type === 'assistant' || 
      item.role === 'assistant' || 
      item.isAssistantMessage ||
      item.type === 'llm' ||
      item.type === 'ai'
    );
    
    if (hasAssistantContent) {
      console.log('DEBUG: Detected LLM result by content structure (assistant/AI messages)');
      return true;
    }
  }
  
  // STRATEGY 3: Type-based detection (common in intentional LLM formatting)
  if (
    result.type === 'llm' || 
    result.type === 'LLMResult' || 
    result.type === 'ai' ||
    result.type === 'assistant' ||
    result.resultType === 'llm'
  ) {
    console.log('DEBUG: Detected LLM result by explicit type declaration');
    return true;
  }
  
  // STRATEGY 4: Field-based heuristics (common in LLM response structures)
  // Check for fields that are typically only present in LLM results
  if (result.synthesizedAnswer || 
      result.summary || 
      result.analysis || 
      result.categories || 
      result.followUpQuestions || 
      result.searchContext || 
      result.sourceDocuments || 
      result.reasoning ||
      result.sources ||
      result.citations) {
    console.log('DEBUG: Detected LLM result by specialized field presence');
    return true;
  }
  
  // STRATEGY 5: Error detection (prioritize LLM-formatted errors)
  // Important to detect error states that should be shown as LLM results
  if ((result.isError === true || result.type === 'error' || result.error === true) &&
      (result.errorType || result.errorMessage || 
       (result.content && typeof result.content === 'string' && 
        result.content.includes('error-message')))) {
    console.log('DEBUG: Detected LLM result by error formatting');
    return true;
  }
  
  // STRATEGY 6: HTML/Markdown content detection (aggressive but necessary fallback)
  // This is more prone to false positives but helps catch formatted content
  if (typeof result.content === 'string') {
    const content = result.content.toLowerCase();
    if (
      // HTML structural elements 
      content.includes('<div class="error-message">') ||
      content.includes('<div class="llm-content">') ||
      content.includes('<h1>') ||
      content.includes('<h2>') ||
      content.includes('<h3>') ||
      content.includes('<ul>') ||
      content.includes('<ol>') ||
      content.includes('<summary>') ||
      content.includes('<analysis>') ||
      // Common LLM response patterns
      content.includes('based on the search results') ||
      content.includes('according to the information provided') ||
      content.includes('i\'ve analyzed') ||
      content.includes('here\'s what i found') ||
      content.includes('key points:') ||
      content.includes('summary:') ||
      content.includes('analysis:') ||
      content.includes('conclusion:') ||
      // Citation patterns
      content.includes('[source') ||
      content.includes('[citation') ||
      // Length-based heuristic (cautious)
      (content.length > 500 && content.includes('\n\n'))
    ) {
      console.log('DEBUG: Detected LLM result by content patterns');
      return true;
    }
  }
  
  return false;
};

/**
 * Process LLM result for display
 * Ensures consistent format regardless of input structure
 * Enhanced with better categorization and formatting
 * 
 * @param {Object} result LLM result to process
 * @returns {Object} Processed result ready for display
 */
/**
 * Enhanced LLM result formatting with improved structure preservation
 * Ensures consistent format for display while preserving original content structure
 * 
 * @param {Object} result LLM result to process
 * @returns {Object} Processed result ready for display with consistent structure
 */
export const formatLLMResult = (result) => {
  // Return empty result if input is empty
  if (!result) {
    return {
      content: 'No content available',
      sourceMap: {},
      followUpQuestions: [],
      __isImmutableLLMResult: true,
      llmProcessed: true,
      isLLMResults: true
    };
  }
  
  // If the result already has necessary LLM flags, prioritize preserving its exact format
  // This is critical to maintain formatting from the original API response
  if (result.__isImmutableLLMResult === true) {
    console.log('DEBUG: Preserving immutable LLM result structure');
    return result;
  }
  
  // Handle error results specially with enhanced error formatting
  if (result.isError || result.type === 'error' || result.error || result.errorType) {
    console.log('DEBUG: Formatting error result with enhanced structure');
    return {
      content: Array.isArray(result.content) 
        ? result.content 
        : (typeof result.content === 'string' && result.content.includes('<div'))
          ? result.content // Preserve HTML error content
          : [{ 
              type: 'error', 
              text: result.content || result.errorMessage || result.message || 'An error occurred',
              isError: true
            }],
      sourceMap: result.sourceMap || {},
      followUpQuestions: [],
      __isImmutableLLMResult: true,
      llmProcessed: true,
      isLLMResults: true,
      isError: true,
      errorType: result.errorType || 'general',
      errorMessage: result.errorMessage || result.message || 'An error occurred'
    };
  }
  
  // Process normal LLM results with structure preservation
  try {
    console.log('DEBUG: Processing LLM result with enhanced formatter');
    // Process categories if present
    let formattedCategories = [];
    let contentArray = [];
    
    // Handle categories in different formats
    if (result.categories) {
      if (Array.isArray(result.categories)) {
        formattedCategories = result.categories;
      } else if (typeof result.categories === 'object') {
        formattedCategories = Object.entries(result.categories).map(([key, value]) => ({
          id: key,
          name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          content: value,
          items: Array.isArray(value) ? value : [{ content: value }]
        }));
      }
    } else if (result.processedCategories) {
      formattedCategories = result.processedCategories;
    }
    
    // Handle content in various formats with priority on preserving original structure
    console.log('DEBUG: Formatting LLM result content:', {
      hasContent: !!result.content,
      contentType: typeof result.content,
      isContentArray: Array.isArray(result.content),
      contentLength: result.content ? (
        typeof result.content === 'string' ? result.content.length : 
        Array.isArray(result.content) ? result.content.length : 'N/A'
      ) : 'N/A'
    });
    
    // CRITICAL: Prioritize preserving original content structure
    // This ensures proper rendering of LLM-generated content
    if (result.content) {
      if (Array.isArray(result.content)) {
        // Preserve array structure exactly as is
        contentArray = result.content;
      } else if (typeof result.content === 'string') {
        // For string content:
        // 1. If it already has HTML, preserve it exactly
        // 2. If it's plain text, enhance with HTML formatting
        
        if (result.content.includes('<') && result.content.includes('>')) {
          // Already contains HTML - preserve as is
          contentArray = [{ type: 'html', html: result.content }];
        } else {
          // Add minimal formatting to improve readability
          // Convert markdown to HTML while preserving structure
          const processedContent = result.content
            .replace(/^## (.+)$/gm, '<h2>$1</h2>') // Level 2 headings
            .replace(/^# (.+)$/gm, '<h1>$1</h1>') // Level 1 headings
            .replace(/^\s*[-*]\s+(.*)/gm, '<li>$1</li>') // Bullet points
            .replace(/\n\n/g, '</p><p>'); // Paragraphs
          
          // Wrap everything in proper container structure
          const wrappedContent = `<div class="llm-content"><p>${processedContent}</p></div>`;
          contentArray = [{ type: 'html', html: wrappedContent }];
        }
      } else if (typeof result.content === 'object') {
        // For non-array objects, stringify with formatting
        contentArray = [{ type: 'text', text: JSON.stringify(result.content, null, 2) }];
      }
    } else if (result.text) {
      // Handle text field
      contentArray = [{ type: 'text', text: result.text }];
    } else if (result.summary) {
      // Handle summary field
      contentArray = [{ type: 'text', text: result.summary }];
    } else if (result.snippet) {
      // Handle snippet field
      contentArray = [{ type: 'text', text: result.snippet }];
    }
    
    // Handle synthesized answer format (common in LLM API responses)
    if (result.synthesizedAnswer) {
      console.log('DEBUG: Processing synthesized answer format');
      let synthesizedContent;
      if (Array.isArray(result.synthesizedAnswer.summary)) {
        synthesizedContent = result.synthesizedAnswer.summary;
      } else if (typeof result.synthesizedAnswer.summary === 'string') {
        synthesizedContent = [{ type: 'text', text: result.synthesizedAnswer.summary }];
      } else {
        synthesizedContent = [{ type: 'text', text: JSON.stringify(result.synthesizedAnswer.summary, null, 2) }];
      }
      
      return {
        content: synthesizedContent,
        sourceMap: result.synthesizedAnswer.sources || {},
        followUpQuestions: result.synthesizedAnswer.followUpQuestions || [],
        categories: formattedCategories,
        __isImmutableLLMResult: true,
        llmProcessed: true,
        isLLMResults: true,
        // Preserve original properties
        ...result,
      };
    }
    
    // Return the fully formatted result with important structure preservation
    return {
      // First include the original result to preserve any important properties
      ...result,
      // Then override specific properties with our formatted versions
      content: contentArray.length > 0 ? contentArray : [{ type: 'text', text: 'No content available' }],
      sourceMap: result.sourceMap || {},
      followUpQuestions: result.followUpQuestions || [],
      categories: formattedCategories,
      // Ensure all LLM flags are set
      __isImmutableLLMResult: true,
      llmProcessed: true,
      isLLMResults: true
    };
  } catch (err) {
    console.error('Error formatting LLM result:', err);
    return {
      content: [{ 
        type: 'error', 
        text: `Error processing result: ${err.message}`,
        isError: true
      }],
      sourceMap: {},
      followUpQuestions: [],
      __isImmutableLLMResult: true,
      llmProcessed: true,
      isLLMResults: true,
      isError: true,
      errorType: 'formatting',
      errorMessage: err.message
    };
  }
};

/**
 * Enhanced LLM Result Component Factory
 * Creates a component for rendering LLM results with consistent styling and improved detection
 * Prioritizes LLM results over regular search results for better user experience
 * 
 * @param {Function} LLMComponent The component to use for rendering LLM results
 * @returns {Function} A component that consistently renders LLM results with enhanced prioritization
 */
export const createLLMResultRenderer = (LLMComponent) => {
  return function LLMResultRenderer({ result, query, options = {} }) {
    // Check for empty or undefined results
    if (!result) {
      console.log('DEBUG: Empty result in LLMResultRenderer');
      return null;
    }
    
    // Enhanced detection and prioritization logic
    // We check if this is an LLM result that should be prioritized
    const isLLM = detectLLMResult(result);
    
    // Add special handling for mixed results that might contain both search and LLM content
    const hasMixedContent = result.results && Array.isArray(result.results) && result.results.length > 0;
    
    // If it's definitely not an LLM result and doesn't contain mixed content, return early
    if (!isLLM && !hasMixedContent) {
      return null;
    }
    
    // For mixed content (common in unified search results), check if any results are LLM results
    if (hasMixedContent) {
      // Check if there's an LLM result in the array that should be prioritized
      const llmResults = result.results.filter(item => detectLLMResult(item));
      
      if (llmResults.length > 0) {
        console.log('DEBUG: Found LLM results in mixed content:', llmResults.length);
        // Extract and prioritize the first LLM result
        const primaryLLMResult = llmResults[0];
        // Format the result for display
        const formattedResult = formatLLMResult(primaryLLMResult);
        // Render using the provided component
        return <LLMComponent result={formattedResult} query={query} options={options} />;
      }
    }
    
    // For direct LLM results, format and display
    if (isLLM) {
      console.log('DEBUG: Rendering direct LLM result');
      // Format the result for display with enhanced formatting
      const formattedResult = formatLLMResult(result);
      
      // Pass through any priority flags to ensure this content takes precedence
      const enhancedOptions = {
        ...options,
        priority: true, // Signal that this is a priority result
        isPrioritized: true
      };
      
      // Render using the provided component with enhanced options
      return <LLMComponent result={formattedResult} query={query} options={enhancedOptions} />;
    }
    
    // If we get here, it's not a detectable LLM result
    return null;
  };
};
