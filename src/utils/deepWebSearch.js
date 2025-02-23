import axios from 'axios';
import { logger } from './logger';

export async function searchWeb(query) {
  try {
    // Use Serper API for real search results
    const response = await axios.post('https://google.serper.dev/search', {
      q: query,
      num: 5 // Limit to 5 results for better performance
    }, {
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const results = [];

    // Process organic search results
    if (response.data.organic) {
      response.data.organic.forEach(result => {
        results.push({
          source: result.link ? new URL(result.link).hostname : 'Search Result',
          type: 'WebResult',
          content: `${result.title}\n${result.snippet}`,
          url: result.link,
          timestamp: new Date().toISOString()
        });
      });
    }

    // Process knowledge graph if available
    if (response.data.knowledgeGraph) {
      const kg = response.data.knowledgeGraph;
      results.push({
        source: 'Knowledge Graph',
        type: 'Summary',
        content: `${kg.title}\n${kg.description || ''}\n${kg.attributes ? Object.entries(kg.attributes).map(([k, v]) => `${k}: ${v}`).join('\n') : ''}`,
        url: kg.url || `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        timestamp: new Date().toISOString()
      });
    }

    // Add top news results if available
    if (response.data.news && response.data.news.length > 0) {
      response.data.news.slice(0, 3).forEach(news => {
        results.push({
          source: news.source || new URL(news.link).hostname,
          type: 'News',
          content: `${news.title}\n${news.snippet}`,
          url: news.link,
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