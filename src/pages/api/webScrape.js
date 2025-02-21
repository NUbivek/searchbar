import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, sources } = req.body;

  try {
    const results = await Promise.all(
      sources.map(source => scrapeSource(source, query))
    );

    res.status(200).json({
      summary: `Found results across ${sources.length} sources`,
      results: results.flat()
    });
  } catch (error) {
    console.error('Web scraping error:', error);
    res.status(500).json({ error: 'Scraping failed' });
  }
}

async function scrapeSource(source, query) {
  const sourceConfigs = {
    'Crunchbase': {
      url: `https://www.crunchbase.com/search/organizations/field/organizations/location_identifiers/${query}`,
      selector: '.identifier-label'
    },
    'Medium': {
      url: `https://medium.com/search?q=${query}`,
      selector: '.postArticle-content'
    },
    'Substack': {
      url: `https://substack.com/search?q=${query}`,
      selector: '.post-preview'
    }
  };

  const config = sourceConfigs[source];
  if (!config) return [];

  const response = await axios.get(config.url);
  const $ = cheerio.load(response.data);
  
  return $(config.selector)
    .map((_, el) => ({
      source,
      title: $(el).find('h2').text().trim(),
      content: $(el).text().trim(),
      url: $(el).find('a').attr('href')
    }))
    .get();
} 