import axios from 'axios';
import { logger } from './logger';
import chromium from 'chrome-aws-lambda';

// DuckDuckGo search function
async function searchDuckDuckGo(query) {
  try {
    const response = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    return response.data.RelatedTopics.map(topic => ({
      source: 'DuckDuckGo',
      type: 'WebResult',
      content: topic.Text,
      url: topic.FirstURL,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    logger.error('DuckDuckGo search error:', error);
    return [];
  }
}

// Web scraping function
async function scrapeWebResults(query) {
  let browser = null;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('div.g');
      return Array.from(items).map(item => {
        const titleEl = item.querySelector('h3');
        const linkEl = item.querySelector('a');
        const snippetEl = item.querySelector('div.VwiC3b');
        
        return {
          title: titleEl ? titleEl.innerText : '',
          url: linkEl ? linkEl.href : '',
          snippet: snippetEl ? snippetEl.innerText : ''
        };
      });
    });

    return results.map(result => ({
      source: new URL(result.url).hostname,
      type: 'WebResult',
      content: `${result.title}\n${result.snippet}`,
      url: result.url,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    logger.error('Web scraping error:', error);
    return [];
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}

// Main search function
export async function searchWeb(query) {
  try {
    // Run searches in parallel
    const [duckDuckGoResults, scrapedResults] = await Promise.all([
      searchDuckDuckGo(query),
      scrapeWebResults(query)
    ]);

    // Combine and rank results
    const allResults = [...duckDuckGoResults, ...scrapedResults];
    
    // Simple ranking: prioritize results with query terms in title/content
    const queryTerms = query.toLowerCase().split(' ');
    allResults.sort((a, b) => {
      const scoreA = queryTerms.reduce((score, term) => 
        score + (a.content.toLowerCase().includes(term) ? 1 : 0), 0);
      const scoreB = queryTerms.reduce((score, term) => 
        score + (b.content.toLowerCase().includes(term) ? 1 : 0), 0);
      return scoreB - scoreA;
    });

    logger.debug('Web search results:', { 
      query, 
      resultCount: allResults.length 
    });

    return allResults;
  } catch (error) {
    logger.error('Web search error:', error);
    return [{
      source: 'Search',
      type: 'Error',
      content: 'Search service is temporarily unavailable. Please try again later.',
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      timestamp: new Date().toISOString()
    }];
  }
}