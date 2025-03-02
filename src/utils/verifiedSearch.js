import { VC_FIRMS, MARKET_DATA_SOURCES, searchAcrossDataSources } from './dataSources';
import { searchGovernmentData } from './governmentData';
import { VERIFIED_DATA_SOURCES, searchVerifiedSources as searchVerifiedSourcesInternal } from './verifiedDataSources';
import { debug, info, error, warn } from './logger';
import { withRetry } from './errorHandling';
import axios from 'axios';

export async function searchVerifiedSources(query, options = {}) {
  console.log('searchVerifiedSources called with:', query, options);
  
  // Extract options
  const { sources = [], urls = [], files = [] } = options;
  
  // Simple mock results based on query
  const results = [
    {
      title: `Result for "${query}"`,
      snippet: `This is a search result for "${query}" from verified sources.`,
      link: "https://example.com/result1",
      source: "web"
    },
    {
      title: `LinkedIn result for "${query}"`,
      snippet: `Professional information related to "${query}" from LinkedIn.`,
      link: "https://linkedin.com/search",
      source: "linkedin"
    },
    {
      title: `Twitter discussion about "${query}"`,
      snippet: `Recent tweets and discussions about "${query}" on Twitter/X.`,
      link: "https://twitter.com/search",
      source: "x"
    },
    {
      title: `Reddit threads on "${query}"`,
      snippet: `Community discussions and posts about "${query}" from Reddit.`,
      link: "https://reddit.com/search",
      source: "reddit"
    }
  ];
  
  // Filter results based on selected sources
  const filteredResults = sources.length > 0 
    ? results.filter(result => sources.includes(result.source))
    : results;
  
  // Add custom URL results if any
  const urlResults = urls.map(url => ({
    title: `Custom URL: ${url}`,
    snippet: `Content from custom URL related to "${query}".`,
    link: url,
    source: "custom"
  }));
  
  // Add file results if any
  const fileResults = files.map(file => ({
    title: `File: ${file}`,
    snippet: `Content from uploaded file "${file}" related to "${query}".`,
    link: null,
    source: "file"
  }));
  
  // Combine all results
  return [...filteredResults, ...urlResults, ...fileResults];
}

// Helper function to check if an item matches the query
function matchesQuery(obj, query) {
  if (!query || !obj) return false;
  
  const lowerQuery = query.toLowerCase();
  
  // Check title
  if (obj.title && obj.title.toLowerCase().includes(lowerQuery)) {
    return true;
  }
  
  // Check snippet/description
  if (obj.snippet && obj.snippet.toLowerCase().includes(lowerQuery)) {
    return true;
  }
  
  // Check content
  if (obj.content && obj.content.toLowerCase().includes(lowerQuery)) {
    return true;
  }
  
  return false;
}