import { searchWeb } from '../../../utils/deepWebSearch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, mode, sources } = req.body;
    
    // Get web search results
    const webResults = await searchWeb(query);
    
    // Return the results
    res.status(200).json({ results: webResults });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
