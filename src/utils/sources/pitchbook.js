import axios from 'axios';
import cheerio from 'cheerio';
import { logger } from '../logger';

export async function scrapePitchbook(query) {
  const searchId = Math.random().toString(36).substring(7);
  logger.debug(`[${searchId}] Scraping Pitchbook`, { query });

  try {
    // First search Google to find relevant Pitchbook profiles
    const googleResponse = await axios.get(`https://www.google.com/search`, {
      params: {
        q: `site:pitchbook.com/profiles ${query}`,
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

      if (url && url.includes('pitchbook.com/profiles')) {
        results.push({
          source: 'Pitchbook',
          type: 'Company',
          content: `${title}\\n${snippet}`,
          url: url,
          timestamp: new Date().toISOString()
        });
      }
    });

    return results;
  } catch (error) {
    logger.error(`[${searchId}] Pitchbook scraping error:`, error);
    throw error;
  }
}
