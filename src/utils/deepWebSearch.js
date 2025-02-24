import axios from 'axios';
import { load } from 'cheerio';
import { logger } from './logger';

export async function searchWeb(query, options = {}) {
  const {
    numResults = 10,
    includeKnowledgeGraph = true,
    includeAnswerBox = true
  } = options;

  const SERPER_API_KEY = process.env.SERPER_API_KEY;
  if (!SERPER_API_KEY) {
    throw new Error('SERPER_API_KEY environment variable is not set');
  }

  try {
    const response = await axios.post('https://google.serper.dev/search', 
      { 
        q: query,
        num: numResults,
        gl: 'us',
        hl: 'en'
      },
      { 
        headers: { 
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data) {
      logger.error(`Serper API error: No data in response`);
      return [];
    }

    const data = response.data;
    const results = [];

    // Process organic results
    if (data.organic) {
      results.push(...data.organic.map(result => ({
        title: result.title,
        content: result.snippet,
        url: result.link,
        source: 'Web',
        type: 'WebResult',
        timestamp: new Date().toISOString()
      })));
    }

    // Process knowledge graph if present and requested
    if (includeKnowledgeGraph && data.knowledgeGraph) {
      results.push({
        title: data.knowledgeGraph.title || 'Knowledge Graph',
        content: data.knowledgeGraph.description || '',
        url: data.knowledgeGraph.link || '#',
        source: 'Web',
        type: 'KnowledgeGraph',
        timestamp: new Date().toISOString()
      });
    }

    // Process answer box if present and requested
    if (includeAnswerBox && data.answerBox) {
      results.push({
        title: data.answerBox.title || 'Featured Snippet',
        content: data.answerBox.snippet || data.answerBox.answer || '',
        url: data.answerBox.link || '#',
        source: 'Web',
        type: 'AnswerBox',
        timestamp: new Date().toISOString()
      });
    }

    // Filter out any results without content
    return results.filter(r => r.content && r.content.trim() !== '');

  } catch (error) {
    logger.error('Web search error:', error);
    return [];
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
