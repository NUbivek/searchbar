import { logger } from '../../../utils/logger';
import { performCombinedSearch } from '../../../utils/combinedSearch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    const sources = await performCombinedSearch(query, 'crunchbase');
    return res.status(200).json({ sources });
  } catch (error) {
    logger.error('Crunchbase search failed:', error);
    return res.status(500).json({ message: 'Search failed', error: error.message });
  }
}
