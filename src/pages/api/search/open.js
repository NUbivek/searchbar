import axios from 'axios';
import { performSimpleSearch, performSimpleVerifiedSearch } from '../../../utils/searchUtils';
import { logger } from '../../../utils/logger';

// Define valid sources
const VALID_SOURCES = ['web', 'linkedin', 'twitter', 'reddit', 'substack', 'medium', 'crunchbase', 'pitchbook', 'verified'];

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, sources = ['web'], model, customUrls, uploadedFiles } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    let results = [];

    // Check if verified sources is selected
    if (sources.includes('verified')) {
      // Use all verified sources (fmp, sec, edgar)
      const verifiedResults = await performSimpleVerifiedSearch(query, ['fmp', 'sec', 'edgar'], {
        model,
        customUrls,
        uploadedFiles
      });
      results = [...results, ...verifiedResults];
      
      // Filter out 'verified' from sources for regular search
      const otherSources = sources.filter(source => source !== 'verified');
      
      // Only perform regular search if there are other sources selected
      if (otherSources.length > 0) {
        const otherResults = await performSimpleSearch(query, otherSources, {
          model,
          customUrls,
          uploadedFiles
        });
        results = [...results, ...otherResults];
      }
    } else {
      // Perform regular search with selected sources
      results = await performSimpleSearch(query, sources, {
        model,
        customUrls,
        uploadedFiles
      });
    }

    return res.status(200).json({ results });
  } catch (error) {
    logger.error('Error in open search API:', error);
    return res.status(500).json({ error: 'An error occurred during search' });
  }
}
