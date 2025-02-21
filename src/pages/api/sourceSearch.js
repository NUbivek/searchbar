import axios from 'axios';
import { API_CONFIG } from '@/config/api-config';

const sourceHandlers = {
  'LinkedIn': async (query) => {
    const response = await axios.get(`${API_CONFIG.SOCIAL.LINKEDIN.BASE_URL}/search`, {
      headers: {
        'Authorization': `Bearer ${process.env.LINKEDIN_API_KEY}`,
        'X-Restli-Protocol-Version': '2.0.0'
      },
      params: {
        q: query,
        type: 'company,content',
        count: 20
      }
    });
    return formatLinkedInResults(response.data);
  },

  'X': async (query) => {
    const response = await axios.get(`${API_CONFIG.SOCIAL.TWITTER.BASE_URL}/tweets/search/recent`, {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_API_KEY}`
      },
      params: {
        query: query,
        max_results: 20,
        'tweet.fields': 'created_at,author_id,entities,public_metrics'
      }
    });
    return formatTwitterResults(response.data);
  },

  'Reddit': async (query) => {
    const response = await axios.get(`${API_CONFIG.SOCIAL.REDDIT.BASE_URL}/search`, {
      headers: {
        'Authorization': `Bearer ${process.env.REDDIT_API_KEY}`
      },
      params: {
        q: query,
        limit: 20,
        sort: 'relevance'
      }
    });
    return formatRedditResults(response.data);
  }
};

// Result formatters to standardize output
const formatLinkedInResults = (data) => ({
  items: data.elements.map(element => ({
    title: element.title || element.text,
    url: element.permalink || element.navigationUrl,
    author: element.author?.name,
    timestamp: element.timeCreated,
    type: 'linkedin'
  }))
});

const formatTwitterResults = (data) => ({
  items: data.data.map(tweet => ({
    title: tweet.text,
    url: `https://twitter.com/user/status/${tweet.id}`,
    author: tweet.author_id,
    timestamp: tweet.created_at,
    type: 'twitter'
  }))
});

const formatRedditResults = (data) => ({
  items: data.data.children.map(post => ({
    title: post.data.title,
    url: `https://reddit.com${post.data.permalink}`,
    author: post.data.author,
    timestamp: post.data.created_utc,
    type: 'reddit'
  }))
});

export default async function handler(req, res) {
  const { source, query } = req.query;
  
  try {
    if (!sourceHandlers[source]) {
      throw new Error(`Unsupported source: ${source}`);
    }

    const results = await sourceHandlers[source](query);
    res.status(200).json(results);
  } catch (error) {
    console.error(`${source} search error:`, error);
    res.status(500).json({ 
      error: error.message,
      source: source 
    });
  }
} 