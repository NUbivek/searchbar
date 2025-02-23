import axios from 'axios';
import { logger } from './logger';

export async function searchWeb(query) {
  try {
    // DuckDuckGo API endpoint (no API key required)
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: query,
        format: 'json',
        no_html: 1,
        no_redirect: 1
      }
    });

    const results = [];

    // Process instant answer
    if (response.data.AbstractText) {
      results.push({
        source: 'DuckDuckGo',
        type: 'Abstract',
        content: response.data.AbstractText,
        url: response.data.AbstractURL,
        timestamp: new Date().toISOString()
      });
    }

    // Process related topics
    if (response.data.RelatedTopics) {
      response.data.RelatedTopics.forEach(topic => {
        if (topic.Text) {
          results.push({
            source: 'DuckDuckGo',
            type: 'Related',
            content: topic.Text,
            url: topic.FirstURL,
            timestamp: new Date().toISOString()
          });
        }
      });
    }

    // Process results
    if (response.data.Results) {
      response.data.Results.forEach(result => {
        results.push({
          source: result.FirstURL.split('/')[2], // Extract domain as source
          type: 'WebResult',
          content: result.Text,
          url: result.FirstURL,
          timestamp: new Date().toISOString()
        });
      });
    }

    return results;
  } catch (error) {
    logger.error('Deep web search error:', error);
    throw error;
  }
}