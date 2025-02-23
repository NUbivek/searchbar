import axios from 'axios';

const MODEL_ENDPOINTS = {
  'Mixtral-8x7B': process.env.TOGETHER_API_KEY ? 'https://api.together.xyz/inference' : null,
  'Gemma 2.0 (9B)': process.env.TOGETHER_API_KEY ? 'https://api.together.xyz/inference' : null,
  'Perplexity': process.env.PERPLEXITY_API_KEY ? 'https://api.perplexity.ai/chat/completions' : null,
  'DeepSeek 70B': process.env.TOGETHER_API_KEY ? 'https://api.together.xyz/inference' : null
};

export async function processWithLLM(results, { query, model = 'Mixtral-8x7B' }) {
  try {
    const endpoint = MODEL_ENDPOINTS[model];
    if (!endpoint) {
      throw new Error(`Model ${model} is not configured`);
    }

    const prompt = `
      Analyze and organize the following search results for the query: "${query}"
      
      Search Results:
      ${JSON.stringify(results, null, 2)}
      
      Please:
      1. Organize the information logically
      2. Highlight key findings
      3. Maintain all source links and attributions
      4. Group related information
      5. Remove any redundant information
    `;

    let apiResponse;
    if (model === 'Perplexity') {
      apiResponse = await axios.post(endpoint, {
        model: 'pplx-7b-chat',
        messages: [{ role: 'user', content: prompt }],
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    } else {
      apiResponse = await axios.post(endpoint, {
        model: model === 'Mixtral-8x7B' ? 'mixtral-8x7b-instruct' :
               model === 'Gemma 2.0 (9B)' ? 'gemma-7b-it' :
               'deepseek-70b',
        prompt,
        max_tokens: 2000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // Process the response and maintain the original links and sources
    const processedResults = results.map(result => ({
      ...result,
      content: apiResponse.data.choices[0].message?.content || apiResponse.data.output?.text
    }));

    return processedResults;

  } catch (error) {
    console.error('LLM processing error:', error);
    // Return original results if LLM processing fails
    return results;
  }
}
