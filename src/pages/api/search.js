import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;

  try {
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q,
        format: 'json',
        t: 'ResearchHub',
        ia: 'web',
        kl: 'wt-wt',
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
} 