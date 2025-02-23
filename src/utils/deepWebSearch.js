import axios from 'axios';
import { logger } from './logger';

// DuckDuckGo search function
async function searchDuckDuckGo(query) {
  try {
    const response = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`);
    const results = [];

    // Process Related Topics
    if (response.data.RelatedTopics) {
      response.data.RelatedTopics.forEach(topic => {
        if (topic.Result) {
          results.push({
            source: 'DuckDuckGo',
            type: 'WebResult',
            content: topic.Text,
            url: topic.FirstURL,
            timestamp: new Date().toISOString()
          });
        }
      });
    }

    // Process Abstract
    if (response.data.Abstract) {
      results.push({
        source: response.data.AbstractSource || 'DuckDuckGo',
        type: 'Summary',
        content: response.data.Abstract,
        url: response.data.AbstractURL,
        timestamp: new Date().toISOString()
      });
    }

    // Process Infobox
    if (response.data.Infobox) {
      const infoContent = response.data.Infobox.content
        .map(item => `${item.label}: ${item.value}`)
        .join('\n');
      
      results.push({
        source: 'DuckDuckGo',
        type: 'Information',
        content: infoContent,
        url: response.data.AbstractURL,
        timestamp: new Date().toISOString()
      });
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

    // If no results from DuckDuckGo, add a fallback
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