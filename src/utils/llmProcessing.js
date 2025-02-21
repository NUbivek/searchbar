import axios from 'axios';

export async function processWithLLM(results, model) {
  // Format the input for the LLM
  const context = results.map(result => ({
    content: result.content,
    source: result.url,
    type: result.type
  }));

  const prompt = `
    Analyze and synthesize the following information:
    ${JSON.stringify(context)}
    
    Please provide:
    1. A concise summary
    2. Key findings categorized by topic
    3. Relevant source citations
    4. Suggested follow-up questions
  `;

  try {
    const response = await axios.post('/api/llm', {
      prompt,
      model,
      options: {
        temperature: 0.7,
        max_tokens: 1000
      }
    });

    // Structure the LLM output
    return {
      summary: response.data.summary,
      categories: response.data.categories,
      sources: response.data.sources,
      followUpQuestions: response.data.followUpQuestions
    };
  } catch (error) {
    console.error('LLM processing error:', error);
    throw error;
  }
} 