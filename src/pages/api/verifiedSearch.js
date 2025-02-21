// For market data analytics and vcaccounts list 

import { VC_FIRMS, MARKET_DATA_SOURCES } from '../../utils/dataSources';
import { getMarketData } from '../../utils/marketData';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.query;

  try {
    const results = await getMarketData(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error in verified search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 