import axios from 'axios';
import { deepWebSearch } from './deepWebSearch';
import { debug, info, error, warn } from './logger';
import { SourceTypes } from './constants';

const searchWithSerper = async (query, domain, searchId) => {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error('Serper API key not configured');
  }

  try {
    const response = await axios.post('https://google.serper.dev/search', 
      { 
        q: `site:${domain} ${query}`,
        num: 10
      },
      { 
        headers: { 
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data?.organic) {
      return [];
    }

    return response.data.organic
      .filter(result => result.link && result.link.includes(domain))
      .map(result => ({
        source: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
        type: 'SearchResult',
        content: `${result.title}\n${result.snippet || ''}`,
        url: result.link,
        timestamp: new Date().toISOString(),
        title: result.title
      }));
  } catch (error) {
    error(`[${searchId}] Serper API error for ${domain}:`, error.message);
    return [{
      source: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
      type: 'SearchError',
      content: `Unable to search ${domain} at this time. Please try again later.`,
      url: `https://${domain}/search?q=${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString()
    }];
  }
};

export async function searchOpenSources(query, sources = [SourceTypes.WEB], searchId = Math.random().toString(36).substring(7)) {
  debug(`[${searchId}] Starting open search`, { query, sources });

  try {
    const results = [];

    // Process each source in parallel
    const searchPromises = sources.map(async (source) => {
      try {
        let sourceResults = [];

        switch (source) {
          case 'Web':
            // If no results from custom sources, try web search as fallback
            if (sourceResults.length === 0) {
              debug(`No results from ${source}, falling back to web search...`);
              sourceResults = await deepWebSearch(query, searchId);
            }
            break;

          case SourceTypes.LINKEDIN:
            sourceResults = await searchWithSerper(query, 'linkedin.com', searchId);
            break;

          case SourceTypes.TWITTER:
            sourceResults = await searchWithSerper(query, 'twitter.com', searchId);
            break;

          case SourceTypes.REDDIT:
            sourceResults = await searchWithSerper(query, 'reddit.com', searchId);
            break;

          case SourceTypes.SUBSTACK:
            sourceResults = await searchWithSerper(query, 'substack.com', searchId);
            break;

          case SourceTypes.MEDIUM:
            sourceResults = await searchWithSerper(query, 'medium.com', searchId);
            break;

          case SourceTypes.CRUNCHBASE:
            sourceResults = await searchWithSerper(query, 'crunchbase.com', searchId);
            break;

          case SourceTypes.PITCHBOOK:
            sourceResults = await searchWithSerper(query, 'pitchbook.com', searchId);
            break;

          default:
            warn(`[${searchId}] Unsupported source type: ${source}`);
            return;
        }

        if (sourceResults.length > 0) {
          results.push(...sourceResults);
        }
      } catch (error) {
        error(`[${searchId}] Error searching ${source}:`, error.message);
        results.push({
          source,
          type: 'SearchError',
          content: `Error searching ${source}. Please try again later.`,
          url: '#',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Wait for all searches to complete
    await Promise.all(searchPromises);

    debug(`[${searchId}] Open search completed`, { 
      resultsCount: results.length,
      sources: sources.join(', ')
    });

    return results;

  } catch (error) {
    error(`[${searchId}] Open search error:`, error.message);
    throw error;
  }
}