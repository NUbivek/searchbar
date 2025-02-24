import axios from 'axios';
import { logger } from '../../../utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const searchId = Math.random().toString(36).substring(7);

  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Use Serper API for web search
    const serperApiKey = process.env.SERPER_API_KEY;
    if (!serperApiKey) {
      throw new Error('Serper API key not configured');
    }

    const response = await axios.post('https://google.serper.dev/search', 
      { 
        q: query,
        num: 10,
        gl: 'us',
        hl: 'en'
      },
      { 
        headers: { 
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const results = [];

    // Process organic results
    if (response.data?.organic) {
      const organicResults = response.data.organic
        .filter(result => result.link && result.title)
        .map(result => ({
          source: 'Web',
          type: 'WebResult',
          content: result.snippet || '',
          url: result.link,
          timestamp: new Date().toISOString(),
          title: result.title
        }));
      results.push(...organicResults);
    }

    // Process knowledge graph if available
    if (response.data?.knowledgeGraph) {
      const kg = response.data.knowledgeGraph;
      if (kg.title && kg.description) {
        results.push({
          source: 'Knowledge Graph',
          type: 'KnowledgeGraph',
          content: kg.description,
          url: kg.url || '#',
          timestamp: new Date().toISOString(),
          title: kg.title
        });
      }
    }

    // Process "People Also Ask" if available
    if (response.data?.peopleAlsoAsk) {
      const paaResults = response.data.peopleAlsoAsk
        .filter(item => item.question && item.snippet)
        .map(item => ({
          source: 'People Also Ask',
          type: 'RelatedQuestion',
          content: item.snippet,
          url: item.link || '#',
          timestamp: new Date().toISOString(),
          title: item.question
        }));
      results.push(...paaResults);
    }

    // Return results
    return res.status(200).json({ results });

  } catch (error) {
    logger.error(`[${searchId}] Web search error:`, error);
    return res.status(500).json({
      message: 'Web search failed',
      error: error.message
    });
  }
}
