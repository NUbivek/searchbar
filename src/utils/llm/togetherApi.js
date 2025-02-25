import { withRetry } from '../errorHandling';
import { logger } from '../logger';

const TOGETHER_API_URL = 'https://api.together.xyz/v1/completions';

export async function callTogetherAPI(prompt, modelConfig) {
  const { modelId, maxTokens = 1000, temperature = 0.7 } = modelConfig;

  if (!process.env.TOGETHER_API_KEY) {
    throw new Error('TOGETHER_API_KEY is not set');
  }

  const response = await withRetry(() => 
    fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        prompt,
        max_tokens: maxTokens,
        temperature,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1.1,
        stop: ["</s>", "[/INST]"]
      })
    }).then(res => {
      if (!res.ok) {
        throw new Error(`Together API error: ${res.status} ${res.statusText}`);
      }
      return res.json();
    }), 3);

  if (!response.output || !response.output.choices || !response.output.choices[0]) {
    logger.error('Invalid Together API response:', response);
    throw new Error('Invalid response from Together API');
  }

  return response.output.choices[0].text.trim();
}
