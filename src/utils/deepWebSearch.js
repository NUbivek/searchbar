import { logger } from './logger';

export async function searchWeb(query) {
  try {
    // For now, return curated results while we work on integrating a more reliable search API
    const results = [
      {
        source: 'Research Hub',
        type: 'Summary',
        content: `Search query: "${query}"\n\nWe're currently working on integrating a more reliable search API. In the meantime, you can:\n\n1. Use the verified sources for more accurate results\n2. Try the file upload feature for document analysis\n3. Click the link below to view web results`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        timestamp: new Date().toISOString()
      },
      {
        source: 'Search Options',
        type: 'Suggestion',
        content: 'Try these alternative search methods:\n- Upload relevant documents\n- Use specific keywords\n- Search verified sources\n- Add industry-specific terms',
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}+site:techcrunch.com+OR+site:wired.com`,
        timestamp: new Date().toISOString()
      }
    ];

    logger.debug('Web search results:', { 
      query, 
      resultCount: results.length 
    });

    return results;
  } catch (error) {
    logger.error('Web search error:', error);
    return [{
      source: 'Search',
      type: 'Error',
      content: 'Search service is temporarily unavailable. Please try again later.',
      url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString()
    }];
  }
}