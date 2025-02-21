export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { results, model } = req.body;
    
    // Process with selected model
    const processedResults = {
      summary: `Found ${results.length} relevant results`,
      contentMap: {}
    };

    // Add processed content for each result
    results.forEach(result => {
      processedResults.contentMap[result.url] = result.content;
    });

    res.status(200).json(processedResults);
  } catch (error) {
    console.error('LLM processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
} 