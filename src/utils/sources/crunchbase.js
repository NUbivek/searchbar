import axios from 'axios';
import cheerio from 'cheerio';
import { logger } from '../logger';

export async function scrapeCrunchbase(query) {
  const searchId = Math.random().toString(36).substring(7);
  logger.debug(`[${searchId}] Scraping Crunchbase`, { query });

  try {
    // First search Google to find relevant Crunchbase profiles
    const googleResponse = await axios.get(`https://www.google.com/search`, {
      params: {
        q: `site:crunchbase.com ${query}`,
        num: 10
      }
    });

    const $ = cheerio.load(googleResponse.data);
    const results = [];

    // Extract company profiles from Google search results
    $('div.g').each((i, element) => {
      const title = $(element).find('h3').text();
      const url = $(element).find('a').attr('href');
      const snippet = $(element).find('div.VwiC3b').text();

      if (url && url.includes('crunchbase.com/organization')) {
        results.push({
          source: 'Crunchbase',
          type: 'Company',
          content: `${title}\\n${snippet}`,
          url: url,
          timestamp: new Date().toISOString()
        });
      }
    });

    return results;
  } catch (error) {
    logger.error(`[${searchId}] Crunchbase scraping error:`, error);
    throw error;
  }
}
