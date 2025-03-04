/**
 * LLM Prompts Utility
 * 
 * Centralized location for all LLM prompt templates
 * Eliminates redundancies across the codebase
 */
import { debug, info, warn, error } from '../logger';

/**
 * Formats a prompt for the Together API
 * @param {string} query - The user's search query
 * @param {Array} sourceData - Array of source data objects
 * @returns {string} Formatted prompt
 */
export function formatSearchPrompt(query, sourceData) {
  // Ensure query is a string
  const safeQuery = typeof query === 'string' ? query : String(query || 'unknown query');
  
  // Start with the base prompt
  let prompt = `Analyze the following search results for the query: "${safeQuery}"\n\n`;
  
  // Validate sourceData
  if (!Array.isArray(sourceData) || sourceData.length === 0) {
    warn('No valid source data provided to formatSearchPrompt');
    prompt += `No search results were found for this query. Please provide a general response about "${safeQuery}" based on your knowledge.\n\n`;
  } else {
    // Add valid source data
    let validSourceCount = 0;
    
    sourceData.forEach((source, index) => {
      if (!source || typeof source !== 'object') return;
      
      const title = source.title || 'N/A';
      const url = source.url || 'N/A';
      const content = source.content || source.snippet || 'No content provided';
      
      prompt += `SOURCE [${index + 1}]: ${title}\n`;
      prompt += `URL: ${url}\n`;
      prompt += `CONTENT: ${content}\n\n`;
      
      validSourceCount++;
    });
    
    if (validSourceCount === 0) {
      prompt += `No valid search results were found. Please provide a general response about "${safeQuery}" based on your knowledge.\n\n`;
    }
  }
  
  // Add instructions for formatting the response
  prompt += `
Based on the search results above, provide a comprehensive answer to the query: "${safeQuery}"

Your response must be structured as follows:

1. SUMMARY: Begin with 1-2 well-written paragraphs that synthesize the key information and directly answer the query.

2. KEY POINTS: Provide 4-6 bullet points highlighting the most important facts, using this format:
   • [Key Point 1] [Source citation]
   • [Key Point 2] [Source citation]

3. DETAILED ANALYSIS: Provide 2-3 paragraphs with more detailed information organized by subtopics or categories.

4. FOLLOW-UP QUESTIONS: Suggest 3 meaningful follow-up questions the user might want to ask next.

Cite sources using [1], [2], etc. Include all relevant metrics, data points, and factual information.
Format your response with proper Markdown including headings (##), bullet points, and paragraph breaks.`;

  return prompt;
}

/**
 * Creates a system prompt for LLM API
 * @param {Object} options - System prompt options
 * @returns {string} Formatted system prompt
 */
export function createSystemPrompt(options = {}) {
  const {
    enhanceCategories = true,
    includeInsights = true,
    businessFocus = false
  } = options;
  
  let systemPrompt = `You are an advanced AI research assistant that excels at synthesizing information from multiple sources into cohesive, well-structured responses. Your specialty is providing comprehensive analysis with clear organization and formatting.`;
  
  if (businessFocus) {
    systemPrompt += ` Focus on business-relevant information, such as market data, competitive analysis, and industry trends.`;
  }
  
  if (enhanceCategories) {
    systemPrompt += ` You prioritize organizing information into clear, logical categories with proper headings (##) and subheadings (###).`;
  }
  
  if (includeInsights) {
    systemPrompt += ` You add insightful analysis that connects information from different sources, identifies patterns, and provides context that helps users understand the bigger picture.`;
  }
  
  // Always add formatting guidance
  systemPrompt += ` Your responses always include a well-written summary paragraph, concise bullet points for key information, and detailed explanations with appropriate formatting including proper spacing, paragraphs, and markdown elements.`;
  
  return systemPrompt;
}

export default {
  formatSearchPrompt,
  createSystemPrompt
};
