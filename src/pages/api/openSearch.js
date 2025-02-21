import { searchOpenSources } from '../../utils/openSearch';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, model, sources, customUrls, uploadedFiles } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await searchOpenSources({
      query,
      model,
      sources: sources || ['Web'],
      customUrls: customUrls || [],
      uploadedFiles: uploadedFiles || []
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error('Open search error:', error);
    return res.status(500).json({ error: error.message });
  }
} 