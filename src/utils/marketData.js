import axios from 'axios';
import { MARKET_DATA_SOURCES } from './dataSources';

export async function getMarketData(query) {
  const results = [];
  
  // Search through financial data sources
  for (const source of MARKET_DATA_SOURCES.financial) {
    try {
      const data = await fetchFromSource(source, query);
      if (data) results.push(data);
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
    }
  }

  // Search through industry data sources
  for (const source of MARKET_DATA_SOURCES.industry) {
    try {
      const data = await fetchFromSource(source, query);
      if (data) results.push(data);
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
    }
  }

  return results;
}

async function fetchFromSource(source, query) {
  if (!source.research_portals?.public) return null;

  try {
    const response = await axios.get(source.research_portals.public, {
      params: { q: query },
      timeout: 5000
    });

    return {
      source: source.name,
      type: 'market_data',
      data: response.data,
      metadata: {
        specialty: source.specialty,
        dataTypes: source.data_types
      }
    };
  } catch (error) {
    console.error(`Failed to fetch from ${source.name}:`, error);
    return null;
  }
} 