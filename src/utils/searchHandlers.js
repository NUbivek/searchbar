import axios from 'axios';

// Social Media APIs
export const searchLinkedIn = async (query) => {
  return await axios.get('/api/sourceSearch', {
    params: { 
      source: 'LinkedIn',
      query,
      apiKey: process.env.LINKEDIN_API_KEY
    }
  });
};

export const searchTwitter = async (query) => {
  return await axios.get('/api/sourceSearch', {
    params: { 
      source: 'X',
      query,
      apiKey: process.env.TWITTER_API_KEY
    }
  });
};

export const searchReddit = async (query) => {
  return await axios.get('/api/sourceSearch', {
    params: { 
      source: 'Reddit',
      query,
      apiKey: process.env.REDDIT_API_KEY
    }
  });
};

// Web Scraping Sources
export const searchWebSources = async (query, sources) => {
  return await axios.post('/api/webScrape', {
    query,
    sources: sources // ['Crunchbase', 'Pitchbook', 'Medium', 'Substack']
  });
};

// Verified Sources
export const searchVerifiedSources = async (query) => {
  return await axios.get('/api/verifiedSearch', {
    params: { query }
  });
};

// Combined search function
export const searchSpecificSource = async (source, query) => {
  switch(source) {
    case 'Web':
      return await searchWebSources(query, ['Web']);
    case 'LinkedIn':
      return await searchLinkedIn(query);
    case 'X':
      return await searchTwitter(query);
    case 'Reddit':
      return await searchReddit(query);
    case 'Crunchbase':
    case 'Pitchbook':
    case 'Medium':
    case 'Substack':
      return await searchWebSources(query, [source]);
    case 'Verified Sources':
      return await searchVerifiedSources(query);
    default:
      throw new Error(`Unsupported source: ${source}`);
  }
};

export const searchCustomSources = async (query, files, urls) => {
  const formData = new FormData();
  formData.append('query', query);
  files.forEach(file => formData.append('files', file));
  formData.append('urls', JSON.stringify(urls));

  const response = await axios.post('/api/customSearch', formData);
  return response.data;
}; 