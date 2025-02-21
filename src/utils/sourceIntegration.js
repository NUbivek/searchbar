import axios from 'axios';
import cheerio from 'cheerio';
import { rateLimiter } from './rateLimiter';
import { withRetry } from './errorHandling';

export const sourceHandlers = {
  substack: async (query) => {
    await rateLimiter.checkLimit('substack');
    return withRetry(async () => {
      const response = await axios.get('https://substack.com/api/v1/search', {
        params: {
          query,
          type: 'posts',
          limit: 20
        }
      });

      return response.data.map(post => ({
        title: post.title,
        content: post.description,
        url: post.canonical_url,
        author: post.author.name,
        publication: post.publication.name,
        type: 'substack',
        timestamp: post.published_at
      }));
    });
  },

  crunchbase: async (query) => {
    await rateLimiter.checkLimit('crunchbase');
    return withRetry(async () => {
      // Use web scraping instead of API
      const response = await axios.get(`https://www.crunchbase.com/search/companies?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ResearchBot/1.0;)'
        }
      });
      const $ = cheerio.load(response.data);
      const results = [];

      $('.company-result').each((_, element) => {
        const $el = $(element);
        results.push({
          title: $el.find('.company-title').text().trim(),
          content: $el.find('.company-description').text().trim(),
          url: 'https://www.crunchbase.com' + $el.find('a.company-link').attr('href'),
          type: 'crunchbase',
          metadata: {
            industry: $el.find('.company-industry').text().trim(),
            location: $el.find('.company-location').text().trim()
          }
        });
      });

      return results;
    });
  },

  pitchbook: async (query) => {
    await rateLimiter.checkLimit('pitchbook');
    return withRetry(async () => {
      // Use web scraping instead of API
      const response = await axios.get(`https://pitchbook.com/profiles/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ResearchBot/1.0;)'
        }
      });
      const $ = cheerio.load(response.data);
      const results = [];

      $('.profile-card').each((_, element) => {
        const $el = $(element);
        results.push({
          title: $el.find('.profile-name').text().trim(),
          content: $el.find('.profile-description').text().trim(),
          url: 'https://pitchbook.com' + $el.find('a.profile-link').attr('href'),
          type: 'pitchbook',
          metadata: {
            category: $el.find('.profile-category').text().trim()
          }
        });
      });

      return results;
    });
  },

  medium: async (query) => {
    await rateLimiter.checkLimit('medium');
    return withRetry(async () => {
      // Since Medium doesn't have a public API, we'll scrape the search results
      const response = await axios.get(`https://medium.com/search?q=${encodeURIComponent(query)}`);
      const $ = cheerio.load(response.data);
      const results = [];

      $('article').each((_, element) => {
        const $el = $(element);
        results.push({
          title: $el.find('h2').text().trim(),
          content: $el.find('p').text().trim(),
          url: $el.find('a').attr('href'),
          author: $el.find('.author').text().trim(),
          type: 'medium',
          timestamp: $el.find('time').attr('datetime')
        });
      });

      return results;
    });
  }
};

// Helper function to search across all sources
export async function searchAllSources(query, selectedSources) {
  const searchPromises = selectedSources.map(source => 
    sourceHandlers[source](query)
  );

  const results = await Promise.allSettled(searchPromises);
  
  return results
    .filter(result => result.status === 'fulfilled')
    .flatMap(result => result.value);
} 