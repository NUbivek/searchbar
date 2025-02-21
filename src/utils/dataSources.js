import { PLATFORMS } from './marketDataTypes';
import { ROLES, detectRole } from './roles';

// Platform-specific handle prefixes and URL generators
export const PLATFORMS = {
    x: {
        prefix: '@',
        urlPrefix: 'https://twitter.com/',
        getUrl: (handle) => `https://twitter.com/${handle.replace('@', '')}`
    },
    linkedin: {
        prefix: '/in/',
        urlPrefix: 'https://linkedin.com/',
        getUrl: (handle) => `https://linkedin.com${handle}`
    },
    reddit: {
        prefix: 'u/',
        urlPrefix: 'https://reddit.com/user/',
        getUrl: (handle) => `https://reddit.com/user/${handle.replace('u/', '')}`
    },
    substack: {
        prefix: '',
        urlPrefix: 'https://',
        getUrl: (handle) => `https://${handle}`
    }
};

// VC Firms data
export const VC_FIRMS = {
    'a16z': {
        name: 'Andreessen Horowitz',
        handles: {
            x: '@a16z',
            linkedin: 'company/andreessen-horowitz',
            substack: 'future.a16z.com'
        },
        aum: '35B+',
        tier: 1,
        focus: ['Software', 'Crypto', 'BioTech', 'FinTech'],
        partners: [
            {
                name: 'Marc Andreessen',
                handles: {
                    x: '@pmarca',
                    linkedin: '/in/mandreessen',
                    substack: 'pmarca.substack.com'
                },
                focus: ['Enterprise', 'Software', 'Fintech'],
                verified: true
            },
            // ... rest of the partners data
        ]
    },
    'sequoia': {
        name: 'Sequoia Capital',
        tier: 1,
        focus: ['Enterprise', 'Consumer', 'Deep Tech'],
        handles: {
            substack: 'https://www.sequoiacap.com/feed/',
            linkedin: 'https://www.linkedin.com/company/sequoia-capital'
        }
    }
    // Add more VC firms as needed
};

// Market Data Sources
export const MARKET_DATA_SOURCES = {
    'financial': [
        {
            name: 'Bloomberg',
            specialty: ['Market Data', 'Financial News'],
            data_types: ['Real-time', 'Historical'],
            research_portals: {
                public: 'https://www.bloomberg.com/markets'
            },
            handles: {
                x: '@Bloomberg',
                linkedin: 'company/bloomberg'
            },
            verified: true
        },
        {
            name: 'Goldman Sachs',
            specialty: ['Global Markets', 'Technology', 'Healthcare', 'ESG'],
            data_types: ['Market Research', 'Industry Reports', 'Economic Forecasts'],
            research_portals: {
                public: 'https://www.goldmansachs.com/insights',
                subscription: 'https://research.gs.com'
            },
            handles: {
                x: '@GoldmanSachs',
                linkedin: 'company/goldman-sachs',
                substack: 'gs.insights.com'
            },
            verified: true
        }
        // ... rest of the financial sources
    ],
    'industry': [
        {
            name: 'CBInsights',
            specialty: ['Startup Data', 'Market Maps'],
            data_types: ['Research Reports', 'Company Data'],
            research_portals: {
                public: 'https://www.cbinsights.com/research'
            },
            handles: {
                x: '@CBinsights',
                linkedin: 'company/cb-insights'
            },
            verified: true
        }
        // ... rest of the industry sources
    ]
};

// Export utility functions
export const getVCsByTier = (tier) => {
    return Object.entries(VC_FIRMS)
        .filter(([_, firm]) => firm.tier === tier)
        .map(([key, firm]) => ({ key, ...firm }));
};

// ... rest of the utility functions

export default {
    VC_FIRMS,
    MARKET_DATA_SOURCES,
    PLATFORMS,
    getVCsByTier,
    // ... other exports
};

// Add new data source categories
export const DATA_PROVIDERS = {
    'market_data': {
        'finazon': {
            name: 'Finazon',
            type: 'api',
            data_types: ['Real-time', 'Historical', 'Fundamental'],
            endpoints: {
                stocks: 'https://api.finazon.io/v1/stocks',
                forex: 'https://api.finazon.io/v1/forex',
                crypto: 'https://api.finazon.io/v1/crypto'
            },
            docs: 'https://finazon.io/docs',
            free_tier: true
        },
        'twelvedata': {
            name: 'Twelve Data',
            type: 'api',
            data_types: ['Real-time', 'Historical', 'Technical'],
            endpoints: {
                stocks: 'https://api.twelvedata.com/stocks',
                forex: 'https://api.twelvedata.com/forex',
                crypto: 'https://api.twelvedata.com/crypto'
            },
            docs: 'https://twelvedata.com/docs',
            free_tier: true
        },
        'alphavantage': {
            name: 'Alpha Vantage',
            type: 'api',
            data_types: ['Historical', 'Fundamental', 'Technical'],
            endpoints: {
                stocks: 'https://www.alphavantage.co/query',
                forex: 'https://www.alphavantage.co/forex',
                crypto: 'https://www.alphavantage.co/crypto'
            },
            docs: 'https://www.alphavantage.co/documentation',
            free_tier: true
        }
    },
    'financial_news': {
        'ft': {
            name: 'Financial Times',
            type: 'news',
            url: 'https://www.ft.com',
            rss_feed: 'https://www.ft.com/rss/home',
            api_docs: 'https://developer.ft.com',
            verified: true
        },
        'yahoo_finance': {
            name: 'Yahoo Finance',
            type: 'aggregator',
            url: 'https://finance.yahoo.com',
            api_endpoint: 'https://yfapi.net',
            docs: 'https://www.yahoofinanceapi.com/docs',
            free_tier: true
        }
    },
    'consulting': {
        'deloitte': {
            name: 'Deloitte',
            type: 'big_four',
            research_portal: 'https://www2.deloitte.com/insights',
            handles: {
                x: '@Deloitte',
                linkedin: 'company/deloitte'
            },
            verified: true
        },
        'pwc': {
            name: 'PwC',
            type: 'big_four',
            research_portal: 'https://www.pwc.com/insights',
            handles: {
                x: '@PwC',
                linkedin: 'company/pwc'
            },
            verified: true
        },
        'ey': {
            name: 'EY',
            type: 'big_four',
            research_portal: 'https://www.ey.com/insights',
            handles: {
                x: '@EY_Global',
                linkedin: 'company/ernst-and-young'
            },
            verified: true
        },
        'kpmg': {
            name: 'KPMG',
            type: 'big_four',
            research_portal: 'https://home.kpmg/insights',
            handles: {
                x: '@KPMG',
                linkedin: 'company/kpmg'
            },
            verified: true
        }
    }
};

// Add utility functions for data access
export const getVerifiedSources = (category) => {
    const sources = category ? DATA_PROVIDERS[category] : DATA_PROVIDERS;
    return Object.entries(sources)
        .filter(([_, source]) => source.verified)
        .reduce((acc, [key, source]) => ({...acc, [key]: source}), {});
};

export const getFreeTierAPIs = () => {
    return Object.entries(DATA_PROVIDERS.market_data)
        .filter(([_, api]) => api.free_tier)
        .reduce((acc, [key, api]) => ({...acc, [key]: api}), {});
};

export const searchAcrossDataSources = async (query, options = {}) => {
    const {
        categories = ['market_data', 'financial_news', 'consulting'],
        verifiedOnly = true,
        includeRoles = true
    } = options;

    const results = [];

    for (const category of categories) {
        const sources = DATA_PROVIDERS[category];
        for (const [key, source] of Object.entries(sources)) {
            if (verifiedOnly && !source.verified) continue;

            try {
                const data = await fetchDataFromSource(source, query);
                if (data) {
                    results.push({
                        source: key,
                        type: source.type,
                        data: includeRoles ? enrichWithRoles(data) : data,
                        metadata: {
                            timestamp: new Date().toISOString(),
                            category,
                            verified: source.verified
                        }
                    });
                }
            } catch (error) {
                console.error(`Error fetching from ${key}:`, error);
            }
        }
    }

    return results;
};

function enrichWithRoles(data) {
    if (Array.isArray(data)) {
        return data.map(item => enrichWithRoles(item));
    }
    if (typeof data === 'object' && data !== null) {
        return {
            ...data,
            role: detectRole(data.title || data.description || ''),
            enriched: true
        };
    }
    return data;
}

async function fetchDataFromSource(source, query) {
    // Implementation depends on source type and API
    // This is a placeholder for the actual implementation
    return null;
}

export default {
    ...DATA_PROVIDERS,
    getVerifiedSources,
    getFreeTierAPIs,
    searchAcrossDataSources
}; 