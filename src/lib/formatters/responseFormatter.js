export async function formatResponse(results, model) {
  // Combine and format results
  const combinedContent = results.map(result => ({
    content: result.content,
    source: result.source,
    url: result.url,
    confidence: result.confidence
  }));

  // Process through selected model
  const processedContent = await processWithModel(combinedContent, model);

  return {
    content: processedContent,
    sources: results.map(result => ({
      title: result.source,
      url: result.url,
      confidence: result.confidence
    }))
  };
}

async function processWithModel(content, model) {
  // Implement model-specific processing
  switch (model) {
    case 'perplexity':
      return await processWithPerplexity(content);
    case 'gemma-2-9b':
      return await processWithGemma(content);
    case 'mixtral-8x7b':
      return await processWithMixtral(content);
    default:
      throw new Error('Unsupported model');
  }
} 