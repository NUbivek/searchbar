// UTC timestamp: 2025-02-17 02:11:51
// User: NUbivek

import { MODELS } from '@/config/constants';
import { formatPromptForModel, getModelStopTokens } from '@/utils/modelHelpers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
  if (!TOGETHER_API_KEY) {
    return res.status(401).json({ message: 'Together API key is missing' });
  }

  try {
    const { query, filters, searchMode, model, sourceScope, sources } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const selectedModel = MODELS.find(m => m.id === model);
    if (!selectedModel) {
      return res.status(400).json({ message: 'Invalid model selection' });
    }

    const prompt = constructPrompt(query, searchMode, filters, sourceScope, sources);

    const requestBody = {
      model: selectedModel.apiModel,
      prompt: formatPromptForModel(prompt, selectedModel),
      max_tokens: 512,
      temperature: 0.7,
      top_p: 0.9,
      stop: getModelStopTokens(selectedModel.id)
    };

    const response = await fetch('https://api.together.xyz/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}: ${JSON.stringify(data)}`);
    }

    return res.status(200).json({
      result: {
        content: data.choices?.[0]?.text || JSON.stringify(data),
        sources: [],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Search processing error:', error);
    return res.status(500).json({
      message: error.message,
      details: error.response?.data || error
    });
  }
}

function constructPrompt(query, searchMode, filters, sourceScope, sources) {
  let prompt = `Search query: ${query}\nSearch mode: ${searchMode}\n`;

  const activeSources = Object.entries(filters)
    .filter(([_, isActive]) => isActive)
    .map(([source]) => source)
    .join(', ');
  prompt += `Active sources: ${activeSources}\n`;

  if (searchMode === 'verified') {
    prompt += `Source scope: ${sourceScope}\n`;
  }

  if (sources) {
    if (sources.files?.length > 0) {
      prompt += `Custom files: ${sources.files.join(', ')}\n`;
    }
    if (sources.urls?.length > 0) {
      prompt += `Custom URLs: ${sources.urls.join(', ')}\n`;
    }
  }

  return prompt;
}