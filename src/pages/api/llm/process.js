import axios from 'axios';
import { logger } from '../../../utils/logger';

const MODEL_CONFIGS = {
  'perplexity': {
    apiEndpoint: 'https://api.perplexity.ai/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    formatRequest: (prompt) => ({
      model: 'pplx-7b-chat',
      messages: [{ role: 'user', content: prompt }]
    })
  },
  'gemma-2.0': {
    apiEndpoint: 'https://api.together.xyz/inference',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    formatRequest: (prompt) => ({
      model: 'google/gemma-2b',
      prompt,
      max_tokens: 2000
    })
  },
  'mixtral-8x7b': {
    apiEndpoint: 'https://api.together.xyz/inference',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    formatRequest: (prompt) => ({
      model: 'mistralai/mixtral-8x7b',
      prompt,
      max_tokens: 2000
    })
  },
  'deepseek-70b': {
    apiEndpoint: 'https://api.together.xyz/inference',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    formatRequest: (prompt) => ({
      model: 'deepseek-ai/deepseek-70b',
      prompt,
      max_tokens: 2000
    })
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { results, models, apiKeys } = req.body;
    
    if (!results || !models || !apiKeys) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const processedResults = {
      summary: `Found ${results.length} relevant results`,
      contentMap: {}
    };

    // Process with selected models
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const model = models[i];
      const apiKey = apiKeys[i];

      const modelConfig = MODEL_CONFIGS[model.toLowerCase()];
      if (!modelConfig) {
        return res.status(400).json({ error: 'Invalid model selection' });
      }

      // Call the appropriate LLM API
      const response = await axios.post(
        modelConfig.apiEndpoint,
        modelConfig.formatRequest(result.content),
        { headers: modelConfig.headers(apiKey) }
      );

      // Process and format the response
      const processedResult = {
        summary: response.data.choices?.[0]?.message?.content || response.data.choices?.[0]?.text,
        categories: extractCategories(response.data.choices?.[0]?.message?.content || response.data.choices?.[0]?.text),
        suggestions: generateFollowupQuestions(response.data.choices?.[0]?.message?.content || response.data.choices?.[0]?.text)
      };

      processedResults.contentMap[result.url] = processedResult;
    }

    res.status(200).json(processedResults);
  } catch (error) {
    logger.error('LLM processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
}

function extractCategories(text) {
  // Extract logical categories from the LLM output
  const categories = [];
  const lines = text.split('\n');
  
  let currentCategory = null;
  for (const line of lines) {
    if (line.match(/^#+\s/)) {
      currentCategory = line.replace(/^#+\s/, '').trim();
      categories.push(currentCategory);
    }
  }
  
  return categories;
}

function generateFollowupQuestions(text) {
  // Generate follow-up questions based on the content
  const questions = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.includes('?') && line.length > 20) {
      questions.push(line.trim());
    }
  }
  
  return questions.slice(0, 5); // Return top 5 questions
}