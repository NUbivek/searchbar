import axios from 'axios';
import cheerio from 'cheerio';
import { logger } from '../logger';

export async function scrapePitchbook(query) {
  const searchId = Math.random().toString(36).substring(7);
  logger.debug(`[${searchId}] Scraping Pitchbook`, { query });

  try {
    // Set a custom user agent to avoid blocks
    const config = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/'
      },
      timeout: 15000 // 15 second timeout
    };

    // First search Google to find relevant Pitchbook profiles
    const googleResponse = await axios.get(`https://www.google.com/search`, {
      params: {
        q: `site:pitchbook.com/profiles ${query}`,
        num: 20,  // Increased for better coverage
        hl: 'en',
        gl: 'us'
      },
      ...config
    });

    const $ = cheerio.load(googleResponse.data);
    let results = [];

    // Extract company profiles from Google search results using multiple selectors for better coverage
    $('div.g, div.yuRUbf, div[data-hveid]').each((i, element) => {
      try {
        const titleElement = $(element).find('h3, a.L48Cpd, div.BNeawe');
        const title = titleElement.text() || 'Untitled Company';
        
        const linkElement = $(element).find('a[href]');
        const url = linkElement.attr('href') || '';
        
        // Look for snippet using multiple selector patterns
        const snippetElement = $(element).find('div.VwiC3b, div.BNeawe, div[role="complementary"], div.kb0PBd');
        const snippet = snippetElement.text() || 'No description available';

        // If this is a valid PitchBook profile URL
        if (url && url.includes('pitchbook.com/profiles')) {
          // Use our custom format function to generate structured content
          results.push({
            source: 'PitchBook',
            type: 'Company',
            title: title,
            content: formatPitchbookContent(title, snippet, url),
            url: url,
            timestamp: new Date().toISOString(),
            relevanceScore: calculateRelevance(title, snippet, query)
          });
        }
      } catch (parseError) {
        logger.error(`[${searchId}] Error parsing search result:`, parseError.message);
      }
    });

    logger.info(`[${searchId}] Found ${results.length} PitchBook profiles`);
    
    // Sort by relevance score
    results = results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return results.length > 0 ? results : getFallbackResults(query);
  } catch (error) {
    logger.error(`[${searchId}] PitchBook scraping error:`, error.message);
    return getFallbackResults(query);
  }
}

// Format PitchBook content to be more detailed and structured
function formatPitchbookContent(title, snippet, url) {
  // Extract company name from title if possible
  const companyName = title.split('|')[0]?.trim() || title;
  
  // Extract any data points from the snippet
  const financingMatch = snippet.match(/raised ([^\s]+) in ([^\s]+)/);
  const fundingInfo = financingMatch ? `${financingMatch[1]} in ${financingMatch[2]} funding` : '';
  
  const locationMatch = snippet.match(/based in ([^\.,]+)/);
  const location = locationMatch ? locationMatch[1].trim() : '';
  
  const industryMatch = snippet.match(/\bin the ([^\.,]+) sector/);
  const industry = industryMatch ? industryMatch[1].trim() : '';
  
  // Build comprehensive content
  let content = `# ${companyName}\n\n`;
  content += `${snippet}\n\n`;
  
  content += `**PitchBook Profile**\n`;
  
  if (location) {
    content += `**Location**: ${location}\n`;
  }
  
  if (industry) {
    content += `**Industry**: ${industry}\n`;
  }
  
  if (fundingInfo) {
    content += `**Funding**: ${fundingInfo}\n`;
  }
  
  content += `**Source**: PitchBook Database\n`;
  content += `**URL**: ${url}\n`;
  
  return content;
}

// Calculate relevance score for sorting
function calculateRelevance(title, snippet, query) {
  const queryTerms = query.toLowerCase().split(/\s+/);
  let score = 0;
  
  const titleLower = title.toLowerCase();
  const snippetLower = snippet.toLowerCase();
  
  // Check exact matches in title (highest weight)
  if (titleLower.includes(query.toLowerCase())) {
    score += 100;
  }
  
  // Check individual terms in title
  queryTerms.forEach(term => {
    if (titleLower.includes(term)) {
      score += 20;
    }
  });
  
  // Check exact matches in snippet
  if (snippetLower.includes(query.toLowerCase())) {
    score += 50;
  }
  
  // Check individual terms in snippet
  queryTerms.forEach(term => {
    if (snippetLower.includes(term)) {
      score += 10;
    }
  });
  
  return score;
}

// Provide fallback results if the API fails
function getFallbackResults(query) {
  return [{
    source: 'PitchBook',
    type: 'Search',
    title: `PitchBook: ${query}`,
    content: `View ${query} on PitchBook, the premier data source for private and public market intelligence.\n\nPitchBook provides comprehensive data on companies, investors, funds, mergers and acquisitions, and venture capital and private equity deals.\n\nClick to search PitchBook's database.`,
    url: `https://pitchbook.com/search?q=${encodeURIComponent(query)}`,
    timestamp: new Date().toISOString(),
    relevanceScore: 50
  }];
}
