import { performSearch } from '@/services/search';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { query, model, sources, customSources } = req.body;

    // Validate request
    if (!query?.trim()) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Log for debugging
    console.log('Search request:', { query, model, sources, customSources });

    // Perform search
    const results = await performSearch(query, sources, model, customSources);
    
    // Log results for debugging
    console.log('Search results:', results);

    res.status(200).json(results);
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

async function processSearch({ query, filters, searchMode, model, sourceScope, sources }) {
  // Implement your search logic here
  // This is a placeholder implementation
  return {
    content: `Search results for: ${query}`,
    sources: [],
    searchUrls: {}
  };
} 