/**
 * Data sources utilities for search
 */

// Simple logger implementation
const logger = {
    debug: (...args) => console.debug('[DEBUG]', ...args),
    info: (...args) => console.info('[INFO]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    error: (...args) => console.error('[ERROR]', ...args)
};

// Platform configurations for social and content platforms
const PLATFORMS = {
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

// Platform-specific handle prefixes and URL generators
const PLATFORM_CONFIG = {
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
const MARKET_DATA_SOURCES = {
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
const DATA_PROVIDERS = {
    financial_data: {
        fmp: {
            name: 'Financial Modeling Prep',
            type: 'api',
            data_types: ['Market Data', 'Financial Statements', 'Company Info'],
            base_url: 'https://financialmodelingprep.com/api/v3',
            docs: 'https://site.financialmodelingprep.com/developer/docs',
            free_tier: true,
            endpoints: {
                quote: '/quote/{symbol}',
                profile: '/profile/{symbol}',
                financials: '/income-statement/{symbol}'
            },
            search_params: {
                apikey: process.env.FMP_API_KEY
            },
            rate_limits: {
                per_second: 10,
                per_minute: 300
            }
        }
    },
    government_data: {
        edgar: {
            name: 'SEC EDGAR',
            type: 'api',
            data_types: ['Company Filings', 'Financial Statements', 'XBRL Data'],
            base_url: 'https://data.sec.gov/',
            docs: 'https://www.sec.gov/developer',
            free_tier: true,
            endpoints: {
                submissions: 'submissions/CIK{cik}.json',
                company: 'files/company.json',
                filings: 'files/dera/data/financial-statements/',
                forms: 'files/forms/{accessionNumber}.xml'
            },
            headers: {
                'User-Agent': 'SearchBar/1.0 (organization: NUbivek Research; contact: research@example.com) - Academic Research Tool'
            }
        },
        fred: {
            name: 'Federal Reserve Economic Data (FRED)',
            type: 'api',
            data_types: ['Economic Data', 'Financial Indicators', 'Research'],
            base_url: 'https://api.stlouisfed.org/fred/',
            docs: 'https://fred.stlouisfed.org/docs/api/fred/',
            free_tier: true,
            endpoints: {
                series: 'series',
                category: 'category',
                releases: 'releases'
            },
            search_params: {
                api_key: process.env.FRED_API_KEY,
                file_type: 'json'
            }
        },
        sec: {
            name: 'SEC EDGAR',
            type: 'api',
            data_types: ['Company Filings', 'Financial Statements', 'Disclosures'],
            base_url: 'https://www.sec.gov/edgar/search/',
            docs: 'https://www.sec.gov/edgar/search/api.json',
            free_tier: true,
            endpoints: {
                company: 'company',
                filings: 'submissions'
            }
        },
        census: {
            name: 'US Census Bureau',
            type: 'api',
            active: false, // Temporarily disabled until API key is available
            data_types: ['Demographic Data', 'Economic Indicators', 'Business Statistics'],
            base_url: 'https://api.census.gov/data/',
            docs: 'https://www.census.gov/data/developers/guidance.html',
            free_tier: true,
            endpoints: {
                economic: 'economic',
                demographic: 'demographic'
            },
            search_params: {
                key: process.env.CENSUS_API_KEY
            }
        }
    },
    financial_data: {
        fmp: {
            name: 'Financial Modeling Prep',
            type: 'api',
            data_types: ['Financial Statements', 'Market Data', 'Company Profiles'],
            base_url: 'https://financialmodelingprep.com/api/v3/',
            docs: 'https://site.financialmodelingprep.com/developer/docs',
            free_tier: true,
            endpoints: {
                profile: 'profile/{symbol}',
                quote: 'quote/{symbol}',
                income: 'income-statement/{symbol}',
                balance: 'balance-sheet-statement/{symbol}',
                cash: 'cash-flow-statement/{symbol}'
            },
            search_params: {
                apikey: process.env.FMP_API_KEY
            }
        },
        tdameritrade: {
            name: 'TD Ameritrade',
            type: 'api',
            data_types: ['Market Data', 'Price History', 'Options Chains'],
            base_url: 'https://api.tdameritrade.com/v1/',
            docs: 'https://developer.tdameritrade.com/apis',
            free_tier: true,
            endpoints: {
                quotes: 'marketdata/quotes',
                priceHistory: 'marketdata/{symbol}/pricehistory',
                optionChain: 'marketdata/chains'
            },
            search_params: {
                apikey: process.env.TD_AMERITRADE_API_KEY
            },
            rate_limits: {
                per_second: 2,
                per_minute: 120
            }
        }
    },
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
const getVerifiedSources = (category) => {
    const sources = category ? MARKET_DATA_SOURCES[category] : MARKET_DATA_SOURCES;
    return Object.entries(sources)
        .filter(([_, source]) => source.verified)
        .reduce((acc, [key, source]) => ({...acc, [key]: source}), {});
};

const getFreeTierAPIs = () => {
    return Object.entries(DATA_PROVIDERS.market_data)
        .filter(([_, api]) => api.free_tier)
        .reduce((acc, [key, api]) => ({...acc, [key]: api}), {});
};

const searchAcrossDataSources = async (query, options = {}) => {
    const {
        categories = ['market_data', 'financial_news', 'consulting', 'vc_firms', 'research'],
        verifiedOnly = true
    } = options;

    // Category weights for ranking results
    const categoryWeights = {
        'vc_firms': 1.0,
        'consulting': 0.9,
        'market_data': 0.8,
        'financial_news': 0.7,
        'research': 0.7
    };

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
                
                // Calculate relevance score based on category weight
                const categoryWeight = categoryWeights[category] || 0.5;
                const nameMatchScore = source.name.toLowerCase() === queryLower ? 1 : 0.5;
                const relevanceScore = categoryWeight * nameMatchScore;

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

// Comprehensive VC Firms data structure
const VC_FIRMS = {
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
            {
                name: 'Ben Horowitz',
                handles: {
                    x: '@bhorowitz',
                    linkedin: '/in/benhorowitz'
                },
                focus: ['Enterprise', 'Crypto', 'Culture'],
                verified: true
            },
            {
                name: 'Chris Dixon',
                handles: {
                    x: '@cdixon',
                    linkedin: '/in/chrisdixon',
                    substack: 'cdixon.org'
                },
                focus: ['Crypto', 'Web3', 'AI'],
                verified: true
            }
        ],
        verified: true
    },
    // Add all other VC firms here...
};

// Roles and Focus Areas
const ROLES = {
    INVESTOR: 'investor',
    FOUNDER: 'founder',
    OPERATOR: 'operator',
    RESEARCHER: 'researcher',
    ANALYST: 'analyst'
};

// Comprehensive VC Firms data structure

// Utility functions for data access and search
const getVCsByTier = (tier) => {
    return Object.entries(VC_FIRMS)
        .filter(([_, firm]) => firm.tier === tier)
        .map(([key, firm]) => ({ key, ...firm }));
};

const getVCsByFocus = (focus) => {
    return Object.entries(VC_FIRMS)
        .filter(([_, firm]) => firm.focus.includes(focus))
        .map(([key, firm]) => ({ key, ...firm }));
};

const getVerifiedPartners = () => {
    const verifiedPartners = [];
    Object.entries(VC_FIRMS).forEach(([firmKey, firm]) => {
        firm.partners
            .filter(partner => partner.verified)
            .forEach(partner => {
                verifiedPartners.push({
                    ...partner,
                    firm: firmKey
                });
            });
    });
    return verifiedPartners;
};

const getSocialHandles = (platform) => {
    const handles = {};
    Object.entries(VC_FIRMS).forEach(([firmKey, firm]) => {
        if (firm.handles[platform]) {
            handles[firmKey] = firm.handles[platform];
        }
        firm.partners.forEach(partner => {
            if (partner.handles[platform]) {
                handles[`${firmKey}_${partner.name.replace(' ', '_')}`] = partner.handles[platform];
            }
        });
    });
    return handles;
};

module.exports = {
    PLATFORMS,
    PLATFORM_CONFIG,
    MARKET_DATA_SOURCES,
    DATA_PROVIDERS,
    VC_FIRMS,
    ROLES,
    getVerifiedSources,
    getFreeTierAPIs,
    searchAcrossDataSources,
    getVCsByTier,
    getVCsByFocus,
    getVerifiedPartners,
    getSocialHandles
}; 