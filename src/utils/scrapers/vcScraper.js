import axios from 'axios';
import cheerio from 'cheerio';
import { VC_FIRMS } from '../dataSources';
import { logger } from '../logger';

// Platform configurations
const PLATFORMS = {
  crunchbase: {
    baseUrl: 'https://www.crunchbase.com',
    searchUrl: 'https://www.crunchbase.com/search/companies',
    selectors: {
      companies: '.company-result',
      name: '.company-name',
      description: '.company-description',
      link: '.company-link'
    }
  },
  pitchbook: {
    baseUrl: 'https://pitchbook.com',
    searchUrl: 'https://pitchbook.com/profiles',
    selectors: {
      companies: '.profile-card',
      name: '.profile-name',
      description: '.profile-description',
      link: '.profile-link'
    }
  },
  medium: {
    baseUrl: 'https://medium.com',
    searchUrl: 'https://medium.com/search',
    selectors: {
      articles: 'article',
      title: 'h2',
      preview: '.preview-content',
      author: '.author-name',
      link: 'a'
    }
  },
  substack: {
    baseUrl: 'https://substack.com',
    searchUrl: 'https://substack.com/search',
    selectors: {
      posts: '.post-preview',
      title: '.post-title',
      preview: '.post-preview-content',
      author: '.writer-name',
      link: 'a'
    }
  },
  ycombinator: {
    baseUrl: 'https://www.ycombinator.com',
    blogUrl: 'https://www.ycombinator.com/blog',
    selectors: {
      posts: '.post-item',
      title: '.post-title',
      content: '.post-excerpt',
      link: 'a'
    }
  },
  paulgraham: {
    baseUrl: 'http://paulgraham.com',
    essaysUrl: 'http://paulgraham.com/articles.html',
    selectors: {
      posts: 'table tr',
      title: 'a',
      link: 'a'
    }
  }
};

// Scraping functions for each platform
export async function searchCrunchbase(query) {
  try {
    const results = await scrapeWithProxy(PLATFORMS.crunchbase.searchUrl, {
      params: { query },
      selectors: PLATFORMS.crunchbase.selectors,
      transform: (el, $) => ({
        source: 'Crunchbase',
        type: 'Company',
        content: $(el).find(PLATFORMS.crunchbase.selectors.description).text(),
        url: PLATFORMS.crunchbase.baseUrl + $(el).find(PLATFORMS.crunchbase.selectors.link).attr('href'),
        name: $(el).find(PLATFORMS.crunchbase.selectors.name).text()
      })
    });
    return results;
  } catch (error) {
    logger.error('Crunchbase scraping error:', error);
    return [];
  }
}

export async function searchPitchbook(query) {
  try {
    const results = await scrapeWithProxy(PLATFORMS.pitchbook.searchUrl, {
      params: { q: query },
      selectors: PLATFORMS.pitchbook.selectors,
      transform: (el, $) => ({
        source: 'Pitchbook',
        type: 'Company',
        content: $(el).find(PLATFORMS.pitchbook.selectors.description).text(),
        url: PLATFORMS.pitchbook.baseUrl + $(el).find(PLATFORMS.pitchbook.selectors.link).attr('href'),
        name: $(el).find(PLATFORMS.pitchbook.selectors.name).text()
      })
    });
    return results;
  } catch (error) {
    logger.error('Pitchbook scraping error:', error);
    return [];
  }
}

export async function searchMedium(query) {
  try {
    const results = await scrapeWithProxy(PLATFORMS.medium.searchUrl, {
      params: { q: query },
      selectors: PLATFORMS.medium.selectors,
      transform: (el, $) => ({
        source: 'Medium',
        type: 'Article',
        content: $(el).find(PLATFORMS.medium.selectors.preview).text(),
        url: $(el).find(PLATFORMS.medium.selectors.link).attr('href'),
        contributors: [$(el).find(PLATFORMS.medium.selectors.author).text()],
        title: $(el).find(PLATFORMS.medium.selectors.title).text()
      })
    });
    return results;
  } catch (error) {
    logger.error('Medium scraping error:', error);
    return [];
  }
}

export async function searchSubstack(query) {
  try {
    const results = await scrapeWithProxy(PLATFORMS.substack.searchUrl, {
      params: { query },
      selectors: PLATFORMS.substack.selectors,
      transform: (el, $) => ({
        source: 'Substack',
        type: 'Newsletter',
        content: $(el).find(PLATFORMS.substack.selectors.preview).text(),
        url: $(el).find(PLATFORMS.substack.selectors.link).attr('href'),
        contributors: [$(el).find(PLATFORMS.substack.selectors.author).text()],
        title: $(el).find(PLATFORMS.substack.selectors.title).text()
      })
    });
    return results;
  } catch (error) {
    logger.error('Substack scraping error:', error);
    return [];
  }
}

export async function searchYC(query) {
  const config = PLATFORMS.ycombinator;
  const response = await axios.get(config.blogUrl);
  const $ = cheerio.load(response.data);
  const results = [];

  $(config.selectors.posts).each((_, element) => {
    const $el = $(element);
    const title = $el.find(config.selectors.title).text();
    const content = $el.find(config.selectors.content).text();
    
    if (matchesQuery(query, title, content)) {
      results.push({
        title,
        content,
        url: new URL($el.find(config.selectors.link).attr('href'), config.baseUrl).toString(),
        source: 'YCombinator',
        type: 'blog',
        timestamp: new Date($el.find('.post-date').text()).toISOString()
      });
    }
  });

  return results;
}

export async function searchPaulGraham(query) {
  const config = PLATFORMS.paulgraham;
  const response = await axios.get(config.essaysUrl);
  const $ = cheerio.load(response.data);
  const results = [];

  $(config.selectors.posts).each((_, element) => {
    const $el = $(element);
    const title = $el.find(config.selectors.title).text();
    const link = $el.find(config.selectors.link).attr('href');
    
    if (matchesQuery(query, title)) {
      results.push({
        title,
        url: new URL(link, config.baseUrl).toString(),
        source: 'Paul Graham Essays',
        type: 'essay'
      });
    }
  });

  return results;
}

export async function searchVCBlogs(query) {
  // Get top VC firms from our database
  const topVCs = Object.values(VC_FIRMS)
    .filter(firm => firm.tier === 1)
    .slice(0, 50); // Top 50 firms

  const results = await Promise.allSettled(
    topVCs.map(firm => searchVCBlog(firm, query))
  );

  return results
    .filter(result => result.status === 'fulfilled')
    .flatMap(result => result.value);
}

export async function searchVCBlog(firm, query) {
  if (!firm.handles?.substack) return [];

  try {
    const response = await axios.get(firm.handles.substack);
    const $ = cheerio.load(response.data);
    const results = [];

    $('.post-preview').each((_, element) => {
      const $el = $(element);
      const title = $el.find('.post-title').text();
      const content = $el.find('.post-excerpt').text();
      
      if (matchesQuery(query, title, content)) {
        results.push({
          title,
          content,
          url: $el.find('a').attr('href'),
          source: firm.name,
          type: 'blog',
          metadata: {
            firm: firm.name,
            firmType: 'VC'
          }
        });
      }
    });

    return results;
  } catch (error) {
    logger.error(`Error scraping ${firm.name} blog:`, error);
    return [];
  }
}

export async function searchVCWebsites(query) {
  try {
    const results = await Promise.allSettled([
      searchYC(query),
      searchPaulGraham(query),
      searchVCBlogs(query),
      searchCrunchbase(query),
      searchPitchbook(query),
      searchMedium(query),
      searchSubstack(query)
    ]);

    return results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);
  } catch (error) {
    logger.error('VC content search error:', error);
    return [];
  }
}

// Helper function for scraping with proxy rotation
async function scrapeWithProxy(url, options) {
  const { params, selectors, transform } = options;
  
  try {
    const response = await axios.get(url, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      proxy: {
        host: process.env.PROXY_HOST,
        port: process.env.PROXY_PORT,
        auth: {
          username: process.env.PROXY_USERNAME,
          password: process.env.PROXY_PASSWORD
        }
      }
    });

    const $ = cheerio.load(response.data);
    const elements = $(selectors.companies || selectors.posts || selectors.articles);
    
    return Array.from(elements).map(el => transform(el, $));
  } catch (error) {
    logger.error('Proxy scraping error:', error);
    throw error;
  }
}

// Helper function to check if text matches query
function matchesQuery(query, ...texts) {
  const searchTerms = query.toLowerCase().split(' ');
  const fullText = texts.join(' ').toLowerCase();
  return searchTerms.every(term => fullText.includes(term));
}