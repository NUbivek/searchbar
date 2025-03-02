// For market data analytics and vcaccounts list 

import { VC_FIRMS, MARKET_DATA_SOURCES } from '../../utils/dataSources';
import { getMarketData } from '../../utils/marketData';
import { searchVerifiedSources } from '../../utils/verifiedSearch';

export default async function handler(req, res) {
  // Set proper headers
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, options = {}, isNetworkMapMode = false } = req.body;
    
    // If in network map mode, return network data instead of search results
    if (isNetworkMapMode) {
      // Get network data based on selected sources
      const { sources = [] } = options;
      
      const networkData = {
        nodes: [],
        edges: []
      };
      
      // Add placeholder network data for visualization
      if (sources.includes('linkedin')) {
        networkData.nodes.push(
          { id: 'linkedin-user', label: 'You (LinkedIn)', group: 'linkedin' },
          { id: 'linkedin-c1', label: 'Connection 1', group: 'linkedin' },
          { id: 'linkedin-c2', label: 'Connection 2', group: 'linkedin' }
        );
        networkData.edges.push(
          { from: 'linkedin-user', to: 'linkedin-c1' },
          { from: 'linkedin-user', to: 'linkedin-c2' }
        );
      }
      
      if (sources.includes('twitter')) {
        networkData.nodes.push(
          { id: 'twitter-user', label: 'You (Twitter)', group: 'twitter' },
          { id: 'twitter-f1', label: 'Follower 1', group: 'twitter' },
          { id: 'twitter-f2', label: 'Follower 2', group: 'twitter' }
        );
        networkData.edges.push(
          { from: 'twitter-user', to: 'twitter-f1' },
          { from: 'twitter-user', to: 'twitter-f2' }
        );
      }
      
      if (sources.includes('reddit')) {
        networkData.nodes.push(
          { id: 'reddit-user', label: 'You (Reddit)', group: 'reddit' },
          { id: 'reddit-sub1', label: 'Subreddit 1', group: 'reddit' },
          { id: 'reddit-sub2', label: 'Subreddit 2', group: 'reddit' }
        );
        networkData.edges.push(
          { from: 'reddit-user', to: 'reddit-sub1' },
          { from: 'reddit-user', to: 'reddit-sub2' }
        );
      }
      
      return res.status(200).json({
        networkData
      });
    }
    
    // Regular search mode
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const { sources = [], customUrls = [], uploadedFiles = [], model } = options;
    
    // Perform verified sources search
    const results = await searchVerifiedSources(query, {
      sources,
      customUrls,
      uploadedFiles,
      model
    });
    
    return res.status(200).json({
      results
    });
    
  } catch (error) {
    console.error('Verified search error:', error);
    return res.status(500).json({ error: 'Error processing verified search request' });
  }
} 