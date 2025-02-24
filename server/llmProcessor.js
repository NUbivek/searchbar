import fetch from 'node-fetch';
import { rateLimit } from '../src/utils/rateLimiter.js';

// Available models and their configurations
export const SUPPORTED_MODELS = {
  'mixtral-8x7b': {
    provider: 'together',
    modelId: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    maxTokens: 4096,
    temperature: 0.7
  },
  'deepseek-70b': {
    provider: 'together',
    modelId: 'deepseek-ai/deepseek-70b-chat',
    maxTokens: 4096,
    temperature: 0.7
  },
  'gemma-7b': {
    provider: 'together',
    modelId: 'google/gemma-7b-it',
    maxTokens: 4096,
    temperature: 0.7
  }
};

// Helper function to format sources for prompt
function formatSources(sources) {
  return sources.map((source, index) => {
    const sourceNum = index + 1;
    return `[${sourceNum}] ${source.title}\nURL: ${source.url || 'N/A'}\nContent: ${source.content}\n`;
  }).join('\n');
}

// Helper function to create a system prompt
function createSystemPrompt(sources) {
  return `You are a research assistant helping to analyze and synthesize information from multiple sources. 
Your task is to provide accurate, well-structured responses based on the following sources:

${formatSources(sources)}

When referring to information from the sources, cite them using [1], [2], etc. corresponding to their numbers above.
If you're unsure about something or if the sources don't contain relevant information, say so explicitly.
Format your response in Markdown for better readability.`;
}

// Helper function to create a user prompt
function createUserPrompt(query, context = "") {
  return `${context ? context + "\n\n" : ""}Please analyze the provided sources and answer the following question:
${query}

Requirements:
1. Provide a comprehensive answer based on the available sources
2. Use appropriate citations [1], [2], etc. when referencing information
3. If the sources don't contain enough information to fully answer the question, acknowledge this
4. Format the response in clear, readable Markdown
5. Focus on accuracy and relevance`;
}

// Process text with Together AI
async function processWithTogether(prompt, config) {
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
    })
  });

  if (!response.ok) {
    throw new Error(`Together API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.output.choices[0].text;
}

// Main function to process queries with LLM
export async function processWithLLM(query, sources, context = "", modelId = "mixtral-8x7b") {
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
      response = await processWithTogether(fullPrompt, model);
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
      sourceMap
    };
  } catch (error) {
    console.error('LLM Processing Error:', error);
    throw new Error(`Failed to process with LLM: ${error.message}`);
  }
}
