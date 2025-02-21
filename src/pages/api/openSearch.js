import { searchOpenSources } from '../../utils/openSearch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, model, sources } = req.body;
    const results = await searchOpenSources(query, {
      model,
      sources
    });
    res.status(200).json(results);
  } catch (error) {
    console.error('Open search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
} 