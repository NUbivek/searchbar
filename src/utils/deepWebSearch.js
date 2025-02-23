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
    // Try Serper API first for local development
    const serperApiKey = process.env.SERPER_API_KEY;
    if (serperApiKey) {
      try {
        const response = await axios.post('https://google.serper.dev/search', 
          { q: query },
          { 
            headers: { 
              'X-API-KEY': serperApiKey,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.organic) {
          return response.data.organic.map(result => ({
            source: new URL(result.link).hostname,
            type: 'WebResult',
            content: `${result.title}\n${result.snippet}`,
            url: result.link,
            score: 1
          }));
        }
      } catch (serperError) {
        logger.error('Serper API error:', serperError);
        // Fall through to DuckDuckGo if Serper fails
      }
    }

    // Fallback to DuckDuckGo if Serper is not configured or fails
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
    logger.error('Search error:', error);
    throw error;
  }
}