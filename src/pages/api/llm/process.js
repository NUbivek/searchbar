import { logger } from '../../../utils/logger';

const SUPPORTED_MODELS = {
  'mixtral-8x7b': {
    provider: 'together',
    modelId: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    maxTokens: 4096,
    temperature: 0.7
  },
  'deepseek-70b': {
    provider: 'together',
    modelId: 'deepseek-ai/deepseek-coder-70b-instruct',
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

async function processWithTogether(prompt, config) {
  const response = await fetch('https://api.together.xyz/inference', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.modelId,
      prompt: prompt,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      top_p: 0.7,
      top_k: 50,
      repetition_penalty: 1.1,
      stop: ["</s>", "[/INST]"]
    })
  });

  if (!response.ok) {
    throw new Error(`Together API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.output.choices[0].text;
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
    const modelConfig = SUPPORTED_MODELS[model.toLowerCase()];
    if (!modelConfig) {
      logger.warn('Unsupported model, falling back to mixtral-8x7b', { requestedModel: model });
      modelConfig = SUPPORTED_MODELS['mixtral-8x7b'];
    }

    const prompt = createPrompt(sources, query, context);
    const result = await processWithTogether(prompt, modelConfig);

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
      model: modelConfig.modelId
    };

    // Log success
    logger.info('LLM processing completed', {
      query,
      model: modelConfig.modelId,
      sourceCount: sources.length,
      followUpCount: followUpQuestions.length
    });

    return res.status(200).json(processedResults);
  } catch (error) {
    logger.error('LLM processing error:', error);
    return res.status(500).json({
      error: 'Processing failed',
      details: error.message
    });
  }
}