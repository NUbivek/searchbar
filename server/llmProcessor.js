import fetch from 'node-fetch';
import { rateLimit } from '../src/utils/rateLimiter.js';
import { logger } from '../src/utils/logger.js';

// Available models and their configurations
export const SUPPORTED_MODELS = {
  'mixtral-8x7b': {
    provider: 'together',
    modelId: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    maxTokens: 4096,
    temperature: 0.7,
    fallback: 'deepseek-70b'
  },
  'deepseek-70b': {
    provider: 'together',
    modelId: 'deepseek-ai/deepseek-70b-chat',
    maxTokens: 4096,
    temperature: 0.7,
    fallback: 'gemma-7b'
  },
  'gemma-7b': {
    provider: 'together',
    modelId: 'google/gemma-7b-it',
    maxTokens: 4096,
    temperature: 0.7,
    fallback: null
  }
};

// Constants
const MAX_SOURCE_LENGTH = 10000;
const MAX_PROMPT_LENGTH = 20000;
const REQUEST_TIMEOUT = 60000; // 60 seconds

// Helper function to format sources for prompt
function formatSources(sources) {
  return sources.map((source, index) => {
    const sourceNum = index + 1;
    const content = source.content.slice(0, MAX_SOURCE_LENGTH);
    return `[${sourceNum}] ${source.title}\nURL: ${source.url || 'N/A'}\nContent: ${content}\n`;
  }).join('\n');
}

// Helper function to create a system prompt
function createSystemPrompt(sources) {
  const formattedSources = formatSources(sources);
  const prompt = `You are a research assistant helping to analyze and synthesize information from multiple sources. 
Your task is to provide accurate, well-structured responses based on the following sources:

${formattedSources}

When referring to information from the sources, cite them using [1], [2], etc. corresponding to their numbers above.
If you're unsure about something or if the sources don't contain relevant information, say so explicitly.
Format your response in Markdown for better readability.`;

  return prompt.slice(0, MAX_PROMPT_LENGTH);
}

// Helper function to create a user prompt
function createUserPrompt(query, context = "") {
  const prompt = `${context ? context + "\n\n" : ""}Please analyze the provided sources and answer the following question:
${query}

Requirements:
1. Organize your response into 3-4 relevant categories based on the content
2. For each category:
   - Provide a clear heading using ## Markdown syntax
   - Present key findings and insights
   - Use appropriate citations [1], [2], etc.
3. If certain aspects are not covered by the sources, acknowledge this
4. End with a ## Summary section highlighting the main points
5. Keep the response focused and well-structured

Example format:
## Category 1
Key findings with citations [1], [2]

## Category 2
Additional insights with citations [3]

## Summary
Brief overview of main points`;

  return prompt.slice(0, MAX_PROMPT_LENGTH);
}

// Retry helper function
async function retryWithBackoff(fn, retries = 3, backoff = 1000) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i === retries - 1) throw error;
      
      // Don't retry on validation errors
      if (error.message.includes('validation') || error.message.includes('invalid')) {
        throw error;
      }

      // Calculate backoff with jitter
      const jitter = Math.random() * 1000;
      const delay = (backoff * Math.pow(2, i)) + jitter;
      
      logger.warn(`Retry ${i + 1}/${retries} after ${Math.round(delay)}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

// Process text with Together AI
async function processWithTogether(prompt, config) {
  const makeRequest = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch('https://api.together.xyz/inference', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.TOGETHER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.modelId,
          prompt: prompt,
          max_tokens: config.maxTokens,
          temperature: config.temperature,
          top_p: 0.7,
          top_k: 50,
          repetition_penalty: 1.1
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const error = new Error(`Together API error: ${response.statusText}`);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      return data.output.choices[0].text;
    } finally {
      clearTimeout(timeout);
    }
  };

  return retryWithBackoff(makeRequest);
}

// Main function to process queries with LLM
export async function processWithLLM(query, sources, context = "", modelId = "gemma-7b") {
  // Validate model
  const model = SUPPORTED_MODELS[modelId.toLowerCase()];
  if (!model) {
    throw new Error(`Unsupported model: ${modelId}`);
  }

  // Rate limit check
  await rateLimit(model.provider);

  try {
    // Create prompts
    const systemPrompt = createSystemPrompt(sources);
    const userPrompt = createUserPrompt(query, context);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Process with model
    let response;
    if (model.provider === 'together') {
      try {
        response = await processWithTogether(fullPrompt, model);
      } catch (error) {
        // Try fallback model if available
        if (model.fallback) {
          logger.warn(`Failed to use ${modelId}, trying fallback model ${model.fallback}`);
          return processWithLLM(query, sources, context, model.fallback);
        }
        throw error;
      }
    } else {
      throw new Error(`Unsupported provider: ${model.provider}`);
    }

    // Extract source references
    const sourceMap = {};
    sources.forEach((source, index) => {
      const sourceNum = index + 1;
      if (response.includes(`[${sourceNum}]`)) {
        sourceMap[sourceNum] = {
          title: source.title,
          url: source.url || 'N/A',
          source: source.source
        };
      }
    });

    return {
      content: response,
      sourceMap,
      model: modelId
    };
  } catch (error) {
    logger.error('LLM Processing Error:', error);
    throw new Error(`Failed to process with LLM: ${error.message}`);
  }
}
