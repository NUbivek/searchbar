import axios from 'axios';
import { load } from 'cheerio';
import { logger } from './logger';

// Enhanced web search with provider fallback chain:
// 1) Serper (if configured)
// 2) Brave Search API (if configured)
// 3) DuckDuckGo HTML scraping (no API key)
export async function deepWebSearch(query, options = {}) {
  const {
    maxResults = 10,
    maxRetries = 3,
    initialBackoff = 1000,
    apiKey = process.env.SERPER_API_KEY
  } = options;

  if (!query) {
    console.error('ERROR: No query provided for deep web search');
    throw new Error('Search query is required');
  }

  console.log(`DEBUG: Starting deep web search for query: "${query}"`);

  // 1) Try Serper first if key exists
  if (apiKey) {
    let retries = 0;
    let backoffTime = initialBackoff;

    while (retries <= maxRetries) {
      try {
        console.log(`DEBUG: Attempt ${retries + 1}/${maxRetries + 1} for Serper API search`);

        const response = await axios.post(
          'https://google.serper.dev/search',
          {
            q: query,
            gl: 'us',
            hl: 'en',
            autocorrect: true
          },
          {
            headers: {
              'X-API-KEY': apiKey,
              'Content-Type': 'application/json'
            },
            timeout: 30000,
            timeoutErrorMessage: 'Search request to Serper API timed out'
          }
        );

        const results = processSerperResponse(response.data, query).slice(0, maxResults);
        console.log(`DEBUG: Successfully retrieved ${results.length} results from Serper API`);
        return results;
      } catch (error) {
        retries++;

        console.error(`ERROR: Serper API search failed (attempt ${retries}/${maxRetries + 1}):`, error.message);
        if (error.response) {
          console.error(`ERROR: Response status: ${error.response.status}`);
          console.error(`ERROR: Response data:`, JSON.stringify(error.response.data));
        }

        if (retries > maxRetries) {
          console.warn('WARN: Serper unavailable; falling back to next provider');
          break;
        }

        console.log(`DEBUG: Retrying in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        backoffTime *= 2;
      }
    }
  } else {
    console.warn('WARN: SERPER_API_KEY missing; skipping Serper and using fallback providers');
  }

  // 2) Try Brave Search API (free tier supported) if key is present
  const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (braveApiKey) {
    try {
      const braveResults = await searchWithBrave(query, braveApiKey, maxResults);
      if (braveResults.length > 0) {
        console.log(`DEBUG: Retrieved ${braveResults.length} results from Brave Search API`);
        return braveResults;
      }
    } catch (error) {
      console.warn('WARN: Brave Search fallback failed:', error.message);
    }
  }

  // 3) Fallback: DuckDuckGo HTML (no API key)
  try {
    const ddgResults = await searchWithDuckDuckGoHtml(query, maxResults);
    if (ddgResults.length > 0) {
      console.log(`DEBUG: Retrieved ${ddgResults.length} results from DuckDuckGo HTML fallback`);
      return ddgResults;
    }
  } catch (error) {
    console.warn('WARN: DuckDuckGo HTML fallback failed:', error.message);
  }

  // 4) Last-resort fallback: Hacker News Algolia search (free/public)
  try {
    const hnResults = await searchWithHackerNews(query, maxResults);
    if (hnResults.length > 0) {
      console.log(`DEBUG: Retrieved ${hnResults.length} results from Hacker News fallback`);
      return hnResults;
    }
  } catch (error) {
    console.warn('WARN: Hacker News fallback failed:', error.message);
  }

  throw new Error('Web search failed across Serper/Brave/DuckDuckGo/HackerNews fallback chain');
}

async function searchWithBrave(query, apiKey, maxResults = 10) {
  const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
    params: {
      q: query,
      count: Math.max(1, Math.min(maxResults, 20)),
      country: 'us',
      search_lang: 'en'
    },
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': apiKey
    },
    timeout: 15000
  });

  const items = response.data?.web?.results || [];
  return items.map(item => ({
    title: item.title || 'Untitled',
    url: item.url || '',
    snippet: item.description || '',
    source: 'web',
    type: 'organic',
    relevanceScore: calculateRelevance({ title: item.title, snippet: item.description }, query)
  }));
}

async function searchWithDuckDuckGoHtml(query, maxResults = 10) {
  const response = await axios.get('https://html.duckduckgo.com/html/', {
    params: { q: query },
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SearchbarBot/1.0; +https://research.bivek.ai)'
    }
  });

  const $ = load(response.data);
  const results = [];

  $('.result').each((_, el) => {
    if (results.length >= maxResults) return;

    const title = $(el).find('a.result__a').text().trim();
    const rawHref = $(el).find('a.result__a').attr('href') || '';
    const snippet = $(el).find('.result__snippet').text().trim();
    const url = normalizeDuckDuckGoLink(rawHref);

    if (!title || !url) return;

    results.push({
      title,
      url,
      snippet,
      source: 'web',
      type: 'organic',
      relevanceScore: calculateRelevance({ title, snippet }, query)
    });
  });

  return results;
}

async function searchWithHackerNews(query, maxResults = 10) {
  const response = await axios.get('https://hn.algolia.com/api/v1/search', {
    params: {
      query,
      tags: 'story',
      hitsPerPage: Math.max(1, Math.min(maxResults, 20))
    },
    timeout: 15000
  });

  const hits = response.data?.hits || [];
  return hits
    .filter(hit => hit.url && hit.title)
    .map(hit => ({
      title: hit.title,
      url: hit.url,
      snippet: hit.story_text || `Points: ${hit.points || 0} • Author: ${hit.author || 'unknown'}`,
      source: 'hackernews',
      type: 'organic',
      relevanceScore: calculateRelevance({ title: hit.title, snippet: hit.story_text || '' }, query)
    }));
}

function normalizeDuckDuckGoLink(href) {
  if (!href) return '';
  try {
    if (href.startsWith('http://') || href.startsWith('https://')) return href;

    const parsed = new URL(href, 'https://duckduckgo.com');
    const uddg = parsed.searchParams.get('uddg');
    if (uddg) return decodeURIComponent(uddg);

    return parsed.toString();
  } catch {
    return '';
  }
}

// Process the Serper API response
function processSerperResponse(data, originalQuery) {
  const results = [];
  
  try {
    // Process organic results
    if (data.organic && Array.isArray(data.organic)) {
      data.organic.forEach(item => {
        results.push({
          title: item.title || 'Untitled',
          url: item.link || '',
          snippet: item.snippet || '',
          source: 'web',
          type: 'organic',
          relevanceScore: calculateRelevance(item, originalQuery)
        });
      });
    }
    
    // Process knowledge graph if available
    if (data.knowledgeGraph) {
      const kg = data.knowledgeGraph;
      results.push({
        title: kg.title || 'Knowledge Graph',
        url: kg.website || '',
        snippet: kg.description || '',
        source: 'knowledge_graph',
        type: 'knowledge_graph',
        relevanceScore: 0.95 // Knowledge graph is usually highly relevant
      });
    }
    
    // Process answer box if available
    if (data.answerBox) {
      const answer = data.answerBox;
      results.push({
        title: answer.title || 'Answer',
        url: answer.link || '',
        snippet: answer.answer || answer.snippet || '',
        source: 'answer_box',
        type: 'answer_box',
        relevanceScore: 0.98 // Answer box is usually the most relevant
      });
    }
    
    // Process related searches if available
    if (data.relatedSearches && Array.isArray(data.relatedSearches)) {
      data.relatedSearches.forEach(item => {
        results.push({
          title: `Related: ${item.query}`,
          url: '',
          snippet: `Related search query: ${item.query}`,
          source: 'related_search',
          type: 'related_search',
          relevanceScore: 0.7
        });
      });
    }
    
    // Sort by relevance
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error('ERROR: Failed to process Serper API response:', error);
    
    // Return any results we managed to extract before the error
    if (results.length > 0) {
      console.log(`DEBUG: Returning ${results.length} partial results despite processing error`);
      return results;
    }
    
    // If we couldn't extract any results, throw an error
    throw new Error(`Failed to process search results: ${error.message}`);
  }
}

// Calculate relevance score based on result content and query
function calculateRelevance(result, query) {
  let score = 0.8; // Base score
  
  // Ensure query is a string before proceeding
  if (!query || typeof query !== 'string') {
    return score; // Return base score if query is invalid
  }
  
  const queryTerms = query.toLowerCase().split(/\s+/);
  
  // Check title for query terms
  if (result.title) {
    const titleLower = result.title.toLowerCase();
    queryTerms.forEach(term => {
      if (titleLower.includes(term)) {
        score += 0.05;
      }
    });
  }
  
  // Check snippet for query terms
  if (result.snippet) {
    const snippetLower = result.snippet.toLowerCase();
    queryTerms.forEach(term => {
      if (snippetLower.includes(term)) {
        score += 0.03;
      }
    });
  }
  
  // Adjust score based on position (if available)
  if (result.position) {
    score -= (result.position * 0.01); // Lower position is better
  }
  
  // Cap the score at 0.99
  return Math.min(score, 0.99);
}
