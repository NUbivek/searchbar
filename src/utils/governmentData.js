const axios = require('axios');
const { DATA_PROVIDERS } = require('./dataSources');
import { debug, info, error, warn } from './logger';
const { withRetry } = require('./errorHandling');

// Create a logger object for compatibility
const log = {
  debug,
  info,
  error,
  warn
};

// Rate limiting utility
const rateLimiter = new Map();

const checkRateLimit = (provider) => {
    const now = Date.now();
    const limits = provider.rate_limits;
    if (!limits) return true;

    const key = provider.name;
    const state = rateLimiter.get(key) || { requests: [], lastReset: now };

    // Clean up old requests
    state.requests = state.requests.filter(time => now - time < 60000);

    if (state.requests.length >= (limits.per_minute || Infinity)) {
        return false;
    }

    const recentRequests = state.requests.filter(time => now - time < 1000);
    if (recentRequests.length >= (limits.per_second || Infinity)) {
        return false;
    }

    state.requests.push(now);
    rateLimiter.set(key, state);
    return true;
};

// FRED API functions
const searchFREDData = async (query, options = {}) => {
    const fred = DATA_PROVIDERS.government_data.fred;
    const { series_id, category_id, limit = 10 } = options;

    const params = {
        ...fred.search_params,
        search_text: query,
        limit
    };

    if (series_id) params.series_id = series_id;
    if (category_id) params.category_id = category_id;

    try {
        const response = await axios.get(`${fred.base_url}${fred.endpoints.series}/search`, { params });
        return response.data.seriess.map(series => ({
            source: 'FRED',
            type: 'Economic Data',
            title: series.title,
            id: series.id,
            frequency: series.frequency,
            last_updated: series.last_updated,
            url: `https://fred.stlouisfed.org/series/${series.id}`
        }));
    } catch (error) {
        log.error('FRED API error:', error);
        return [];
    }
};

// TD Ameritrade API functions
const searchTDAmeritrade = async (symbol) => {
    const td = DATA_PROVIDERS.financial_data.tdameritrade;
    
    if (!checkRateLimit(td)) {
        log.warn('TD Ameritrade rate limit reached');
        return [];
    }

    try {
        const response = await withRetry(() => 
            axios.get(`${td.base_url}${td.endpoints.quotes}`, {
                params: {
                    ...td.search_params,
                    symbol
                }
            })
        );

        return Object.entries(response.data).map(([sym, data]) => ({
            source: 'TD Ameritrade',
            type: 'Market Data',
            symbol: sym,
            price: data.lastPrice,
            change: data.regularMarketPercentChangeInDouble,
            volume: data.totalVolume,
            url: `https://research.tdameritrade.com/grid/public/research/stocks/summary?symbol=${sym}`
        }));
    } catch (error) {
        log.error('TD Ameritrade API error:', error);
        return [];
    }
};

// Market Data functions
const getMarketData = async (symbol) => {
    const results = [];
    const fmp = DATA_PROVIDERS.financial_data.fmp;

    // Debug logging
    log.info('FMP API key:', process.env.FMP_API_KEY ? 'Present' : 'Not found');
    log.info('Making request to FMP API for symbol:', symbol);

    try {
        const url = `${fmp.base_url}${fmp.endpoints.quote.replace('{symbol}', symbol)}`;
        const params = {
            ...fmp.search_params,
            apikey: process.env.FMP_API_KEY // Explicitly set API key
        };

        log.info('FMP API URL:', url);
        log.info('FMP API params:', { ...params, apikey: '[REDACTED]' });

        const response = await withRetry(async () => {
            return await axios.get(url, { params });
        }, 3);
        
        log.info('FMP API response:', response.data);

        if (response.data?.[0]) {
            results.push({
                source: 'Financial Modeling Prep',
                type: 'Market Data',
                symbol,
                price: response.data[0].price,
                change: response.data[0].changesPercentage,
                volume: response.data[0].volume,
                marketCap: response.data[0].marketCap,
                url: `https://financialmodelingprep.com/financial-summary/${symbol}`
            });
        }
    } catch (error) {
        log.error('FMP API error:', error.message);
        log.error('FMP API error response:', error.response?.data);
        if (error.response?.status === 401) {
            log.error('Invalid FMP API key');
        }
    }

    return results;
};

// SEC EDGAR API functions with XBRL support
const searchSECFilings = async (query) => {
    const sec = DATA_PROVIDERS.government_data.edgar;
    try {
        const response = await axios.get(`${sec.base_url}${sec.endpoints.company}`, {
            headers: sec.headers
        });
        return response.data.filter(company => 
            company.name.toLowerCase().includes(query.toLowerCase())
        ).map(company => ({
            source: 'SEC EDGAR',
            type: 'Company Filing',
            title: company.name,
            cik: company.cik,
            sic: company.sic,
            url: `https://www.sec.gov/edgar/browse/?CIK=${company.cik}`
        }));
    } catch (error) {
        log.error('SEC EDGAR API error:', error);
        return [];
    }
};

// Census Bureau API functions
const searchCensusData = async (query, datasetYear = '2023') => {
    const census = DATA_PROVIDERS.government_data.census;
    try {
        const response = await axios.get(`${census.base_url}${census.endpoints.search}`, {
            params: {
                ...census.search_params,
                q: query,
                year: datasetYear
            }
        });
        return response.data.results.map(result => ({
            source: 'Census Bureau',
            type: 'Economic Data',
            title: result.title,
            id: result.identifier,
            url: result.url
        }));
    } catch (error) {
        log.error('Census Bureau API error:', error);
        return [];
    }
};

// Combined search function
async function searchGovernmentData(query) {
    try {
        const [fredResults, secResults, censusResults] = await Promise.all([
            searchFREDData(query),
            searchSECFilings(query),
            searchCensusData(query)
        ]);

        // Combine all results
        const results = [
            ...fredResults,
            ...secResults,
            ...censusResults
        ];

        log.info(`Found ${results.length} government data results for query: ${query}`);
        return results;
    } catch (error) {
        log.error('Government data search error:', error);
        return [];
    }
}

module.exports = {
    searchFREDData,
    searchTDAmeritrade,
    getMarketData,
    searchSECFilings,
    searchCensusData,
    searchGovernmentData
};
