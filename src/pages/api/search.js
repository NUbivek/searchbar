import { searchVerifiedSources } from '../../utils/verifiedSearch';
import { searchOpenSources } from '../../utils/openSearch';
import { processWithLLM } from '../../utils/llmProcessing';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, mode, sources, model, customUrls, files } = req.body;

  try {
    // Step 1: Source-specific search
    const sourceResults = mode === 'verified'
      ? await searchVerifiedSources(query, { customUrls, files })
      : await searchOpenSources(query, sources);

    // Step 2: Process with LLM
    const llmResults = await processWithLLM(sourceResults, model);

    // Step 3: Format results
    const formattedResults = {
      summary: llmResults.summary,
      categories: llmResults.categories,
      sources: sourceResults.map(result => ({
        title: result.title,
        url: result.url,
        type: result.type,
        author: result.author
      }))
    };

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
} 