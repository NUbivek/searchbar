import { logger } from '../../../utils/logger';

const SUPPORTED_MODELS = {
  'mixtral-8x7b': {
    provider: 'together',
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.7,
    top_k: 50,
    repetition_penalty: 1,
    stop: ['</s>', '[/INST]']
  },
  'gemma-2-9b': {
    provider: 'together',
    model: 'google/gemma-2-9b-it',
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.7,
    top_k: 50,
    repetition_penalty: 1,
    stop: ['<end_of_turn>']
  },
  'deepseek-70b': {
    provider: 'together',
    model: 'meta-llama/Llama-2-70b-chat-hf',
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.7,
    top_k: 50,
    repetition_penalty: 1,
    stop: ['</s>', '<|end_of_text|>', '[/INST]']
  }
};

async function processWithTogether(prompt, config) {
  const API_KEY = process.env.TOGETHER_API_KEY;
  if (!API_KEY) {
    throw new Error('Together API key not found');
  }

  try {
    logger.info(`Processing with Together API using model: ${config.model}`);
    
    const response = await fetch('https://api.together.xyz/inference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: config.model,
        prompt: prompt,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        top_p: config.top_p,
        top_k: config.top_k,
        repetition_penalty: config.repetition_penalty,
        stop: config.stop
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Together API error: ${response.status}`, { 
        errorDetails: errorText,
        model: config.model
      });
      throw new Error(`Together API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.output.choices[0].text.trim();
  } catch (error) {
    logger.error('Error processing with Together API:', error);
    throw error;
  }
}

async function processWithProvider(prompt, config) {
  switch (config.provider) {
    case 'together':
      return processWithTogether(prompt, config);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

function formatSources(results) {
  return results.map((result, index) => {
    const sourceNum = index + 1;
    return `[${sourceNum}] ${result.title || 'Untitled'}\nURL: ${result.url || 'N/A'}\nSource: ${result.source}\nContent: ${result.content}\n`;
  }).join('\n');
}

function createPrompt(results, query, context = '') {
  const contextSection = context ? `\nPrevious Context:\n${context}\n` : '';

  return `You are an AI research assistant analyzing search results. Given the following query and sources, 
provide a comprehensive but concise summary that answers the query. Focus on key insights and patterns.

Query: "${query}"
${contextSection}

Sources:
${formatSources(results)}

Requirements:
1. Provide a direct and focused answer to the query
2. Use appropriate citations [1], [2], etc. when referencing information
3. Format the response in markdown with proper headings and lists
4. Include relevant links for companies, user handles, author names, etc.
5. Organize information into logical categories
6. Keep the response concise and focused on the query
7. Suggest 3 relevant follow-up questions based on the findings

Response:`;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, sources, model = 'mixtral-8x7b', context = '' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!sources || !Array.isArray(sources)) {
      return res.status(400).json({ error: 'Sources array is required' });
    }

    // Process with LLM
    let modelConfig = SUPPORTED_MODELS[model.toLowerCase()];
    if (!modelConfig) {
      logger.warn('Unsupported model, falling back to mixtral-8x7b', { requestedModel: model });
      modelConfig = SUPPORTED_MODELS['mixtral-8x7b'];
    }

    const prompt = createPrompt(sources, query, context);
    
    try {
      const result = await processWithProvider(prompt, modelConfig);
      
      // Extract follow-up questions
      const followUpMatch = result.match(/Follow-up questions:([\s\S]*?)(?:\n\n|$)/i);
      const followUpQuestions = followUpMatch ? 
        followUpMatch[1].match(/\d+\.\s*(.*?)(?=\n|$)/g)?.map(q => q.replace(/^\d+\.\s*/, '')) || [] 
        : [];

      // Extract source references and build source map
      const sourceMap = {};
      const refRegex = /\[(\d+)\]/g;
      let match;
      while ((match = refRegex.exec(result)) !== null) {
        const index = parseInt(match[1]) - 1;
        if (index >= 0 && index < sources.length) {
          const source = sources[index];
          sourceMap[`source_${index + 1}`] = {
            url: source.url || '',
            title: source.title || 'Untitled',
            source: source.source || 'Unknown'
          };
        }
      }

      const processedResults = {
        content: result,
        sourceMap,
        followUpQuestions,
        model: modelConfig.model
      };

      // Log success
      logger.info('LLM processing completed', {
        query,
        model: modelConfig.model,
        sourceCount: sources.length,
        followUpCount: followUpQuestions.length
      });

      return res.status(200).json(processedResults);
    } catch (modelError) {
      // If the requested model fails and it's not already mixtral, try mixtral as fallback
      if (model.toLowerCase() !== 'mixtral-8x7b') {
        logger.warn(`Model ${model} failed, falling back to mixtral-8x7b`, { error: modelError.message });
        
        try {
          const fallbackConfig = SUPPORTED_MODELS['mixtral-8x7b'];
          const fallbackResult = await processWithProvider(prompt, fallbackConfig);
          
          // Extract follow-up questions for fallback
          const followUpMatch = fallbackResult.match(/Follow-up questions:([\s\S]*?)(?:\n\n|$)/i);
          const followUpQuestions = followUpMatch ? 
            followUpMatch[1].match(/\d+\.\s*(.*?)(?=\n|$)/g)?.map(q => q.replace(/^\d+\.\s*/, '')) || [] 
            : [];

          // Extract source references and build source map for fallback
          const sourceMap = {};
          const refRegex = /\[(\d+)\]/g;
          let match;
          while ((match = refRegex.exec(fallbackResult)) !== null) {
            const index = parseInt(match[1]) - 1;
            if (index >= 0 && index < sources.length) {
              const source = sources[index];
              sourceMap[`source_${index + 1}`] = {
                url: source.url || '',
                title: source.title || 'Untitled',
                source: source.source || 'Unknown'
              };
            }
          }

          const processedResults = {
            content: fallbackResult,
            sourceMap,
            followUpQuestions,
            model: fallbackConfig.model,
            note: `Originally requested model (${model}) failed, using Mixtral as fallback.`
          };

          logger.info('LLM processing completed with fallback model', {
            query,
            originalModel: model,
            fallbackModel: fallbackConfig.model,
            sourceCount: sources.length,
            followUpCount: followUpQuestions.length
          });

          return res.status(200).json(processedResults);
        } catch (fallbackError) {
          // If even the fallback fails, throw the original error
          throw modelError;
        }
      } else {
        // If mixtral was the original model and it failed, rethrow the error
        throw modelError;
      }
    }
  } catch (error) {
    logger.error('LLM processing error:', error);
    return res.status(500).json({
      error: 'Processing failed',
      details: error.message
    });
  }
}