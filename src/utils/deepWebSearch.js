import axios from 'axios';
import { load } from 'cheerio';
import { logger } from './logger';

export async function searchWeb(query, searchId = Math.random().toString(36).substring(7)) {
  logger.debug(`[${searchId}] Starting web search`, { query });

  try {
    // Verify Serper API key is present
    const serperApiKey = process.env.SERPER_API_KEY;
    if (!serperApiKey) {
      logger.error(`[${searchId}] Missing Serper API key`);
      return [{
        source: 'Web',
        type: 'ConfigError',
        content: 'Search API key not configured. Please check environment variables.',
        url: '#',
        timestamp: new Date().toISOString()
      }];
    }

    // Search with Serper API
    const response = await axios.post('https://google.serper.dev/search', 
      { 
        q: query,
        num: 10,
        gl: 'us',
        hl: 'en'
      },
      { 
        headers: { 
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data) {
      logger.error(`[${searchId}] No data in Serper API response`);
      return [{
        source: 'Web',
        type: 'SearchError',
        content: 'Search service returned an invalid response. Please try again.',
        url: '#',
        timestamp: new Date().toISOString()
      }];
    }

    const results = [];

    // Process organic results
    if (response.data.organic) {
      const organicResults = response.data.organic
        .filter(result => result.link && result.title)
        .map(result => ({
          source: 'Web',
          type: 'WebResult',
          content: result.snippet || '',
          url: result.link,
          timestamp: new Date().toISOString(),
          title: result.title
        }));
      results.push(...organicResults);
    }

    // Process knowledge graph if present
    if (response.data.knowledgeGraph) {
      const kg = response.data.knowledgeGraph;
      if (kg.title && kg.description) {
        results.push({
          source: 'Web',
          type: 'KnowledgeGraph',
          content: kg.description,
          url: kg.link || '#',
          timestamp: new Date().toISOString(),
          title: kg.title
        });
      }
    }

    // Process answer box if present
    if (response.data.answerBox) {
      const answer = response.data.answerBox;
      if (answer.answer || answer.snippet) {
        results.push({
          source: 'Web',
          type: 'AnswerBox',
          content: answer.answer || answer.snippet,
          url: answer.link || '#',
          timestamp: new Date().toISOString(),
          title: answer.title || 'Quick Answer'
        });
      }
    }

    // Return results if we found any
    if (results.length > 0) {
      logger.debug(`[${searchId}] Web search successful`, { resultCount: results.length });
      return results;
    }

    // No results case
    logger.debug(`[${searchId}] No web results found`);
    return [{
      source: 'Web',
      type: 'NoResults',
      content: 'No results found. Try refining your search query.',
      url: '#',
      timestamp: new Date().toISOString()
    }];

  } catch (error) {
    logger.error(`[${searchId}] Web search error:`, error.message);
    return [{
      source: 'Web',
      type: 'SearchError',
      content: 'Unable to search at this time. Please try again later.',
      url: '#',
      timestamp: new Date().toISOString()
    }];
  }
}

async function enrichResults(results) {
  return Promise.all(results.map(async result => {
    try {
      if (!result.url || result.url === '#') return result;

      const response = await axios.get(result.url);
      const $ = load(response.data);

      // Extract full content
      const fullContent = $('body').text().trim();
      
      // Extract metadata
      const metadata = {
        description: $('meta[name="description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content'),
        author: $('meta[name="author"]').attr('content')
      };

      return {
        ...result,
        fullContent,
        metadata,
        enriched: true
      };
    } catch (error) {
      return result;
    }
  }));
}

function rankAndDeduplicate(results) {
  // Remove duplicates based on URL
  const uniqueResults = results.reduce((acc, current) => {
    const exists = acc.find(item => item.url === current.url);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Sort by score
  return uniqueResults
    .map(result => ({ ...result, score: calculateScore(result) }))
    .sort((a, b) => b.score - a.score);
}

function calculateScore(result) {
  let score = 0;
  
  // Base score for verified sources
  if (result.verified) score += 2;
  
  // Score for content completeness
  if (result.fullContent) score += 2;
  if (result.metadata?.description) score += 1;
  if (result.metadata?.keywords) score += 1;
  if (result.metadata?.author) score += 1;
  
  // Score for result type
  switch (result.type) {
    case 'abstract':
      score += 3;
      break;
    case 'related':
      score += 1;
      break;
    default:
      break;
  }
  
  return score;
}
