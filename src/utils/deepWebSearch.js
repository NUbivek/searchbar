import axios from 'axios';
import { logger } from './logger';

export async function searchWeb(query) {
  try {
    // Use Perplexity API for search
    const response = await axios.post('https://api.perplexity.ai/search', {
      query: query,
      max_results: 5
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const results = [];

    if (response.data.results) {
      response.data.results.forEach(result => {
        results.push({
          source: result.url ? new URL(result.url).hostname : 'Search Result',
          type: 'WebResult',
          content: result.text,
          url: result.url,
          timestamp: new Date().toISOString()
        });
      });
    }

    // If no results found, provide a helpful message
    if (results.length === 0) {
      results.push({
        source: 'Search',
        type: 'NoResults',
        content: 'No results found. Try refining your search query.',
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        timestamp: new Date().toISOString()
      });
    }

    logger.debug('Web search results:', { 
      query, 
      resultCount: results.length 
    });

    return results;
  } catch (error) {
    logger.error('Web search error:', error);
    
    // Return a more specific error message
    const errorMessage = error.response?.data?.message || error.message || 'Search service is temporarily unavailable';
    return [{
      source: 'Search',
      type: 'Error',
      content: `Search error: ${errorMessage}. Please try again later.`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString()
    }];
  }
}