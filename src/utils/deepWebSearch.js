import axios from 'axios';
import { logger } from './logger';

// DuckDuckGo search function
async function searchDuckDuckGo(query) {
  try {
    // Use DuckDuckGo HTML search
    const response = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Extract search results using regex
    const results = [];
    const regex = /<h2 class="result__title">\s*<a.*?href="(.*?)".*?>(.*?)<\/a>/g;
    const snippetRegex = /<a class="result__snippet".*?>(.*?)<\/a>/g;
    
    let match;
    let snippetMatch;
    
    while ((match = regex.exec(response.data)) !== null && (snippetMatch = snippetRegex.exec(response.data)) !== null) {
      const [, url, title] = match;
      const [, snippet] = snippetMatch;
      
      if (url && !url.includes('duckduckgo.com')) {
        results.push({
          source: new URL(url).hostname,
          type: 'WebResult',
          content: `${title}\n${snippet}`,
          url: url,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  } catch (error) {
    logger.error('DuckDuckGo search error:', error);
    return [];
  }
}

// Main search function
export async function searchWeb(query) {
  try {
    const results = await searchDuckDuckGo(query);

    // If no results, add a fallback
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
    return [{
      source: 'Search',
      type: 'Error',
      content: 'Search service is temporarily unavailable. Please try again later.',
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString()
    }];
  }
}