import axios from 'axios';

export async function processWithLLM(results, model) {
  try {
    const response = await fetch('/api/llm/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results, model })
    });
    
    return await response.json();
  } catch (error) {
    console.error('LLM processing error:', error);
    return {
      summary: 'Failed to process results with LLM',
      contentMap: {}
    };
  }
} 