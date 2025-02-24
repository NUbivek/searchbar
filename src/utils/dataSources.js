import { PLATFORMS } from './marketDataTypes';
import { ROLES, detectRole } from './roles';

// Platform-specific handle prefixes and URL generators
export const PLATFORM_CONFIG = {
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

// Market Data Sources - Unified Structure
export const MARKET_DATA_SOURCES = {
    financial: [
        {
            name: 'Bloomberg',
            specialty: ['Market Data', 'Financial News', 'Research'],
            data_types: ['Real-time', 'Historical', 'Analytics'],
            research_portals: {
                public: 'https://www.bloomberg.com/markets',
                terminal: 'https://www.bloomberg.com/professional/solution/bloomberg-terminal/'
            },
            handles: {
                x: '@Bloomberg',
                linkedin: 'company/bloomberg'
            },
            verified: true
        },
        {
            name: 'Reuters',
            specialty: ['News', 'Market Data', 'Analysis'],
            data_types: ['Real-time', 'Historical', 'News'],
            research_portals: {
                public: 'https://www.reuters.com/markets',
                terminal: 'https://www.refinitiv.com/en/products/eikon-trading-software'
            },
            handles: {
                x: '@Reuters',
                linkedin: 'company/reuters'
            },
            verified: true
        },
        {
            name: 'Wall Street Journal',
            specialty: ['Financial News', 'Analysis', 'Research'],
            data_types: ['News', 'Analysis', 'Opinion'],
            research_portals: {
                public: 'https://www.wsj.com/news/markets'
            },
            verified: true
        },
        {
            name: 'Financial Times',
            specialty: ['Global Finance', 'Markets', 'Analysis'],
            data_types: ['News', 'Analysis', 'Research'],
            research_portals: {
                public: 'https://www.ft.com/markets'
            },
            verified: true
        },
        {
            name: 'Morningstar',
            specialty: ['Investment Research', 'Fund Analysis'],
            data_types: ['Research', 'Ratings', 'Analysis'],
            research_portals: {
                public: 'https://www.morningstar.com/research'
            },
            verified: true
        },
        {
            name: 'S&P Global',
            specialty: ['Ratings', 'Market Intelligence', 'Analytics'],
            data_types: ['Research', 'Ratings', 'Data'],
            research_portals: {
                public: 'https://www.spglobal.com/marketintelligence'
            },
            verified: true
        },
        {
            name: 'Factset',
            specialty: ['Financial Data', 'Analytics', 'Research'],
            data_types: ['Market Data', 'Company Data', 'Analytics'],
            research_portals: {
                public: 'https://www.factset.com/insights'
            },
            handles: {
                x: '@FactSet',
                linkedin: 'company/factset'
            },
            verified: true
        },
        {
            name: 'Moody\'s',
            specialty: ['Credit Ratings', 'Risk Assessment', 'Research'],
            data_types: ['Ratings', 'Analysis', 'Research'],
            research_portals: {
                public: 'https://www.moodys.com/research'
            },
            handles: {
                x: '@MoodysInvSvc',
                linkedin: 'company/moodys-corporation'
            },
            verified: true
        }
    ],
    industry: [
        {
            name: 'CBInsights',
            specialty: ['Startup Data', 'Market Maps', 'Research'],
            data_types: ['Research Reports', 'Company Data', 'Industry Analysis'],
            research_portals: {
                public: 'https://www.cbinsights.com/research',
                terminal: 'https://www.cbinsights.com/platform'
            },
            handles: {
                x: '@CBinsights',
                linkedin: 'company/cb-insights'
            },
            verified: true
        },
        {
            name: 'PitchBook',
            specialty: ['Private Markets', 'M&A', 'Venture Capital'],
            data_types: ['Company Data', 'Deal Data', 'Industry Reports'],
            research_portals: {
                public: 'https://pitchbook.com/news',
                terminal: 'https://pitchbook.com/platform'
            },
            handles: {
                x: '@PitchBook',
                linkedin: 'company/pitchbook-data'
            },
            verified: true
        },
        {
            name: 'Crunchbase',
            specialty: ['Startup Intelligence', 'Funding Data'],
            data_types: ['Company Data', 'Funding Data', 'Industry Trends'],
            research_portals: {
                public: 'https://news.crunchbase.com'
            },
            handles: {
                x: '@crunchbase',
                linkedin: 'company/crunchbase'
            },
            verified: true
        },
        {
            name: 'Gartner',
            specialty: ['Technology Research', 'Market Analysis'],
            data_types: ['Research', 'Analysis', 'Market Guides'],
            research_portals: {
                public: 'https://www.gartner.com/en/research'
            },
            handles: {
                x: '@Gartner_inc',
                linkedin: 'company/gartner'
            },
            verified: true
        },
        {
            name: 'IDC',
            specialty: ['Technology Markets', 'Industry Research'],
            data_types: ['Market Research', 'Forecasts', 'Analysis'],
            research_portals: {
                public: 'https://www.idc.com/research'
            },
            handles: {
                x: '@IDC',
                linkedin: 'company/idc'
            },
            verified: true
        }
    ],
    consulting: [
        {
            name: 'McKinsey & Company',
            specialty: ['Strategy', 'Industry Insights'],
            data_types: ['Research', 'Analysis', 'Reports'],
            research_portals: {
                public: 'https://www.mckinsey.com/insights'
            },
            handles: {
                x: '@McKinsey',
                linkedin: 'company/mckinsey'
            },
            verified: true
        },
        {
            name: 'Boston Consulting Group',
            specialty: ['Strategy', 'Digital Transformation'],
            data_types: ['Research', 'Analysis', 'Insights'],
            research_portals: {
                public: 'https://www.bcg.com/publications'
            },
            handles: {
                x: '@BCG',
                linkedin: 'company/boston-consulting-group'
            },
            verified: true
        },
        {
            name: 'Bain & Company',
            specialty: ['Strategy', 'Private Equity'],
            data_types: ['Research', 'Industry Analysis'],
            research_portals: {
                public: 'https://www.bain.com/insights'
            },
            handles: {
                x: '@BainAlerts',
                linkedin: 'company/bain-and-company'
            },
            verified: true
        }
    ]
};

// Data Providers for APIs
export const DATA_PROVIDERS = {
    market_data: {
        serper: {
            name: 'Serper',
            description: 'Google Search API for market data',
            base_url: 'https://google.serper.dev/search',
            auth_type: 'api_key',
            auth_header: 'X-API-KEY',
            env_key: 'SERPER_API_KEY',
            rate_limit: '1000/month',
            docs_url: 'https://serper.dev/docs'
        },
        finazon: {
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
        bloomberg: {
            name: 'Bloomberg Enterprise',
            type: 'api',
            data_types: ['Real-time', 'Historical', 'Reference'],
            endpoints: {
                market_data: 'https://www.bloomberg.com/professional/support/api-library/',
                enterprise: 'https://www.bloomberg.com/professional/product/enterprise-data/'
            },
            docs: 'https://www.bloomberg.com/professional/support/api-documentation/',
            free_tier: false
        },
        refinitiv: {
            name: 'Refinitiv',
            type: 'api',
            data_types: ['Real-time', 'Historical', 'News'],
            endpoints: {
                eikon: 'https://developers.refinitiv.com/en/api-catalog/eikon',
                elektron: 'https://developers.refinitiv.com/en/api-catalog/elektron'
            },
            docs: 'https://developers.refinitiv.com',
            free_tier: false
        }
    }
};

// Utility Functions
export const getVerifiedSources = (category) => {
    const sources = category ? MARKET_DATA_SOURCES[category] : MARKET_DATA_SOURCES;
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
        verifiedOnly = true
    } = options;

    const searchId = Math.random().toString(36).substring(7);
    logger.debug(`[${searchId}] Searching across data sources:`, { query, categories, verifiedOnly });

    const results = [];
    const queryLower = query.toLowerCase();

    for (const category of categories) {
        const sources = MARKET_DATA_SOURCES[category] || [];
        for (const source of sources) {
            if (verifiedOnly && !source.verified) continue;

            // Check if query matches source name, description, or category
            const matchesQuery = 
                source.name.toLowerCase().includes(queryLower) ||
                (source.description || '').toLowerCase().includes(queryLower) ||
                category.toLowerCase().includes(queryLower) ||
                (source.tags || []).some(tag => tag.toLowerCase().includes(queryLower));

            if (matchesQuery) {
                logger.debug(`[${searchId}] Found matching source:`, source.name);
                results.push({
                    source: source.name,
                    type: source.type || category,
                    content: source.description || `Data from ${source.name}`,
                    url: source.research_portal || source.research_portals?.public,
                    verified: source.verified,
                    relevance: source.name.toLowerCase() === queryLower ? 1 : 0.5
                });
            }
        }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    logger.debug(`[${searchId}] Search completed`, { resultCount: results.length });
    return results;
};

export default {
    PLATFORM_CONFIG,
    MARKET_DATA_SOURCES,
    DATA_PROVIDERS,
    getVerifiedSources,
    getFreeTierAPIs,
    searchAcrossDataSources
}; 