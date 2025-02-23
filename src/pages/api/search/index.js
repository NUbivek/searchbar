import { rateLimit } from '../../../utils/rateLimit';
import { processWithLLM } from '../../../utils/llmProcessor';
import { searchVerifiedSources } from '../../../utils/verifiedSearch';
import { scrapeWebsite } from '../../../utils/webScraper';
import axios from 'axios';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await limiter.check(res, 10, 'UNIFIED_SEARCH_TOKEN');
    
    const {
      query,
      sources,
      model,
      customUrls = [],
      uploadedFiles = []
    } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    let results = [];
    const source = sources[0]; // We're only using one source at a time as per UI

    // Handle different sources
    switch (source) {
      case 'Web':
        const webResults = await scrapeWebsite(query);
        results = webResults;
        break;

      case 'LinkedIn':
        const linkedinResponse = await axios.post('/api/search/linkedin', { query });
        results = linkedinResponse.data.results;
        break;

      case 'X':
        const twitterResponse = await axios.post('/api/search/twitter', { query });
        results = twitterResponse.data.results;
        break;

      case 'Reddit':
        const redditResponse = await axios.post('/api/search/reddit', { query });
        results = redditResponse.data.results;
        break;

      case 'Substack':
      case 'Crunchbase':
      case 'Pitchbook':
      case 'Medium':
        // Use web scraping for these sources
        const scrapedResults = await scrapeWebsite(query, source.toLowerCase());
        results = scrapedResults;
        break;

      case 'Verified Sources':
        const verifiedResults = await searchVerifiedSources(query);
        results = verifiedResults;
        break;

      case 'Files + URL':
        // Handle custom files and URLs
        const customResults = await Promise.all([
          ...customUrls.map(url => scrapeWebsite(query, url)),
          ...uploadedFiles.map(file => processFile(file, query))
        ]);
        results = customResults.flat();
        break;

      default:
        throw new Error('Invalid source specified');
    }

    // Process results with selected LLM model
    const processedResults = await processWithLLM(results, {
      query,
      model: model || 'Mixtral-8x7B'
    });

    return res.status(200).json({
      status: 'success',
      results: processedResults.map(result => ({
        ...result,
        source: source === 'Files + URL' ? 'Custom Source' : source
      }))
    });

  } catch (error) {
    console.error('Unified search error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to perform search'
    });
  }
}
