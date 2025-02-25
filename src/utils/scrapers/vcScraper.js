import axios from 'axios';
import cheerio from 'cheerio';
import { VC_FIRMS } from '../dataSources';

// VC websites to scrape
const VC_WEBSITES = {
  'ycombinator': {
    baseUrl: 'https://www.ycombinator.com',
    blogUrl: 'https://www.ycombinator.com/blog',
    selectors: {
      posts: '.post-item',
      title: '.post-title',
      content: '.post-excerpt',
      link: 'a'
    }
  },
  'paulgraham': {
    baseUrl: 'http://paulgraham.com',
    essaysUrl: 'http://paulgraham.com/articles.html',
    selectors: {
      posts: 'table tr',
      title: 'a',
      link: 'a'
    }
  }
};

export async function searchVCWebsites(query) {
  try {
    const results = await Promise.allSettled([
      searchYC(query),
      searchPaulGraham(query),
      searchVCBlogs(query)
    ]);

    return results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);
  } catch (error) {
    console.error('VC content search error:', error);
    return [];
  }
}

async function searchYC(query) {
  const config = VC_WEBSITES.ycombinator;
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

async function searchPaulGraham(query) {
  const config = VC_WEBSITES.paulgraham;
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

async function searchVCBlogs(query) {
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

async function searchVCBlog(firm, query) {
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
    console.error(`Error scraping ${firm.name} blog:`, error);
    return [];
  }
}

function matchesQuery(query, ...texts) {
  const searchTerms = query.toLowerCase().split(' ');
  const combinedText = texts.join(' ').toLowerCase();
  return searchTerms.every(term => combinedText.includes(term));
} 