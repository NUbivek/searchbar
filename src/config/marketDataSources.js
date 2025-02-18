// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 23:02:41
// Current User's Login: NUbivek

import { FIRM_TYPES } from './marketDataTypes';

export const BOUTIQUE_AND_SPECIALIST_FIRMS = {
    [FIRM_TYPES.BOUTIQUE_BANK]: {
        'centerview': {
            name: 'Centerview Partners',
            handles: {
                x: '@CenterviewP',
                linkedin: 'company/centerview-partners'
            },
            research_portals: {
                public: 'https://www.centerviewpartners.com/insights',
                subscription: null
            },
            key_personnel: [
                {
                    name: 'Blair Effron',
                    title: 'Co-Founder',
                    handles: {
                        x: '@BlairEffron',
                        linkedin: 'in/blair-effron'
                    },
                    focus: ['M&A', 'Technology', 'Healthcare']
                },
                {
                    name: 'Robert Pruzan',
                    title: 'Co-Founder',
                    handles: {
                        x: '@RobertPruzan',
                        linkedin: 'in/robert-pruzan'
                    },
                    focus: ['Financial Services', 'Media']
                }
            ],
            specialty: ['Technology M&A', 'Healthcare', 'Media'],
            verified: true
        },
        'evercore': {
            name: 'Evercore',
            handles: {
                x: '@EVR',
                linkedin: 'company/evercore'
            },
            research_portals: {
                public: 'https://www.evercore.com/insights',
                subscription: 'https://evercore-isi.com'
            },
            key_personnel: [
                {
                    name: 'John Weinberg',
                    title: 'CEO',
                    handles: {
                        x: '@JohnWeinbergEVR',
                        linkedin: 'in/john-s-weinberg'
                    },
                    focus: ['Strategic Advisory', 'Capital Markets']
                },
                {
                    name: 'Ralph Schlosstein',
                    title: 'Executive Chairman',
                    handles: {
                        x: '@RalphSchlosstein',
                        linkedin: 'in/ralph-schlosstein'
                    },
                    focus: ['Investment Banking', 'Asset Management']
                }
            ],
            specialty: ['M&A Advisory', 'Restructuring', 'Capital Markets'],
            verified: true
        },
        'moelis': {
            name: 'Moelis & Company',
            handles: {
                x: '@Moelis',
                linkedin: 'company/moelis-and-company'
            },
            research_portals: {
                public: 'https://www.moelis.com/insights',
                subscription: null
            },
            key_personnel: [
                {
                    name: 'Ken Moelis',
                    title: 'CEO',
                    handles: {
                        x: '@KenMoelis',
                        linkedin: 'in/ken-moelis'
                    },
                    focus: ['M&A', 'Restructuring']
                }
            ],
            specialty: ['Restructuring', 'M&A', 'Private Equity Advisory'],
            verified: true
        }
    },
    // Continuing from previous part...

    [FIRM_TYPES.BOUTIQUE_CONSULTING]: {
        'alixpartners': {
            name: 'AlixPartners',
            handles: {
                x: '@AlixPartners',
                linkedin: 'company/alixpartners'
            },
            research_portals: {
                public: 'https://www.alixpartners.com/insights-impact',
                subscription: 'https://www.alixpartners.com/client-portal'
            },
            key_personnel: [
                {
                    name: 'Simon Freakley',
                    title: 'CEO',
                    handles: {
                        x: '@SimonFreakley',
                        linkedin: 'in/simon-freakley'
                    },
                    focus: ['Turnaround', 'Restructuring']
                }
            ],
            specialty: ['Turnaround & Restructuring', 'Digital Transformation'],
            verified: true
        },
        'oliverwyman': {
            name: 'Oliver Wyman',
            handles: {
                x: '@OliverWyman',
                linkedin: 'company/oliver-wyman'
            },
            research_portals: {
                public: 'https://www.oliverwyman.com/our-expertise/insights.html',
                subscription: 'https://www.oliverwyman.com/portal'
            },
            key_personnel: [
                {
                    name: 'Nick Studer',
                    title: 'CEO',
                    handles: {
                        x: '@NickStuderOW',
                        linkedin: 'in/nick-studer'
                    },
                    focus: ['Financial Services', 'Strategy']
                }
            ],
            specialty: ['Financial Services', 'Digital', 'Healthcare'],
            verified: true
        },
        'leoadvisory': {
            name: 'L.E.K. Consulting',
            handles: {
                x: '@LEK_Consulting',
                linkedin: 'company/l.e.k.-consulting'
            },
            research_portals: {
                public: 'https://www.lek.com/insights',
                subscription: 'https://www.lek.com/executive-insights'
            },
            key_personnel: [
                {
                    name: 'Stuart Jackson',
                    title: 'Global Managing Partner',
                    handles: {
                        x: '@StuartJacksonLEK',
                        linkedin: 'in/stuart-jackson-lek'
                    },
                    focus: ['Strategy', 'Life Sciences']
                }
            ],
            specialty: ['Life Sciences', 'Industrial', 'Private Equity'],
            verified: true
        }
    },

    [FIRM_TYPES.SPECIALIST_RESEARCH]: {
        'redburn': {
            name: 'Redburn (Europe)',
            handles: {
                x: '@RedburnToday',
                linkedin: 'company/redburn'
            },
            research_portals: {
                public: 'https://www.redburn.com/insights',
                subscription: 'https://www.redburn.com/research'
            },
            key_personnel: [
                {
                    name: 'Jeremy Evans',
                    title: 'Head of Research',
                    handles: {
                        x: '@JeremyEvansRB',
                        linkedin: 'in/jeremy-evans-redburn'
                    },
                    focus: ['European Equities', 'Market Analysis']
                }
            ],
            specialty: ['European Equity Research', 'Sector Analysis'],
            verified: true
        },
        'alphasense': {
            name: 'AlphaSense',
            handles: {
                x: '@AlphaSense',
                linkedin: 'company/alpha-sense'
            },
            research_portals: {
                public: 'https://www.alpha-sense.com/insights',
                subscription: 'https://platform.alpha-sense.com'
            },
            key_personnel: [
                {
                    name: 'Jack Kokko',
                    title: 'CEO',
                    handles: {
                        x: '@JackKokko',
                        linkedin: 'in/jackkokko'
                    },
                    focus: ['AI', 'Market Intelligence']
                }
            ],
            specialty: ['AI-Powered Research', 'Market Intelligence'],
            verified: true
        },
        // Continuing from previous part...

        'thirdbridge': {
            name: 'Third Bridge',
            handles: {
                x: '@ThirdBridge',
                linkedin: 'company/third-bridge'
            },
            research_portals: {
                public: 'https://www.thirdbridge.com/insights',
                subscription: 'https://forum.thirdbridge.com'
            },
            key_personnel: [
                {
                    name: 'Emmanuel Tahar',
                    title: 'CEO',
                    handles: {
                        x: '@ETahar',
                        linkedin: 'in/emmanuel-tahar'
                    },
                    focus: ['Expert Networks', 'Primary Research']
                }
            ],
            specialty: ['Expert Networks', 'Primary Research', 'Industry Insights'],
            verified: true
        }
    },

    [FIRM_TYPES.INDEPENDENT_RESEARCH]: {
        'fundstrat': {
            name: 'Fundstrat Global Advisors',
            handles: {
                x: '@fundstrat',
                linkedin: 'company/fundstrat-global-advisors'
            },
            research_portals: {
                public: 'https://fundstrat.com/insights',
                subscription: 'https://research.fundstrat.com'
            },
            key_personnel: [
                {
                    name: 'Thomas Lee',
                    title: 'Co-Founder',
                    handles: {
                        x: '@fundstrat',
                        linkedin: 'in/thomas-lee-fundstrat'
                    },
                    focus: ['Market Strategy', 'Crypto']
                }
            ],
            specialty: ['Digital Assets', 'Technical Analysis', 'Market Strategy'],
            verified: true
        },
        'hedgeye': {
            name: 'Hedgeye Risk Management',
            handles: {
                x: '@Hedgeye',
                linkedin: 'company/hedgeye-risk-management'
            },
            research_portals: {
                public: 'https://www.hedgeye.com/insights',
                subscription: 'https://app.hedgeye.com'
            },
            key_personnel: [
                {
                    name: 'Keith McCullough',
                    title: 'CEO',
                    handles: {
                        x: '@KeithMcCullough',
                        linkedin: 'in/keith-mccullough'
                    },
                    focus: ['Risk Management', 'Macro Research']
                }
            ],
            specialty: ['Risk Management', 'Macro Analysis'],
            verified: true
        }
    }
};

export const MARKET_DATA_SOURCES = {
    [FIRM_TYPES.INVESTMENT_BANK]: {
        'goldman_sachs': {
            name: 'Goldman Sachs',
            handles: {
                x: '@GoldmanSachs',
                linkedin: 'company/goldman-sachs',
                substack: 'gs.insights.com'
            },
            research_portals: {
                public: 'https://www.goldmansachs.com/insights',
                subscription: 'https://research.gs.com'
            },
            data_types: ['Market Research', 'Industry Reports', 'Economic Forecasts'],
            specialty_areas: ['Global Markets', 'Technology', 'Healthcare', 'ESG'],
            content_series: {
                'Top of Mind': 'Macro trends analysis',
                'Global Investment Research': 'Sector deep dives',
                'Global Markets Daily': 'Market updates'
            },
            verified: true
        },
        'morgan_stanley': {
            name: 'Morgan Stanley',
            handles: {
                x: '@MorganStanley',
                linkedin: 'company/morgan-stanley',
                substack: 'morganstanley.insights.com'
            },
            research_portals: {
                public: 'https://www.morganstanley.com/ideas',
                subscription: 'https://research.morganstanley.com'
            },
            data_types: ['Equity Research', 'Strategy', 'Quantitative Analysis'],
            specialty_areas: ['Technology', 'Consumer', 'Healthcare'],
            verified: true
        },
        // Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 23:05:12
// Current User's Login: NUbivek

// Continuing from previous part...

'jp_morgan': {
    name: 'JP Morgan',
    handles: {
        x: '@JPMorgan',
        linkedin: 'company/j-p-morgan',
        substack: 'jpmorgan.insights.com'
    },
    research_portals: {
        public: 'https://www.jpmorgan.com/insights',
        subscription: 'https://markets.jpmorgan.com'
    },
    data_types: ['Market Analysis', 'Economic Research', 'Asset Management'],
    specialty_areas: ['Investment Banking', 'Markets', 'Asset Management'],
    verified: true
}
},

[FIRM_TYPES.CONSULTING]: {
'mckinsey': {
    name: 'McKinsey & Company',
    handles: {
        x: '@McKinsey',
        linkedin: 'company/mckinsey',
        substack: 'mckinsey.insights.com'
    },
    research_portals: {
        public: 'https://www.mckinsey.com/insights',
        subscription: 'https://www.mckinsey.com/mgi'
    },
    data_types: ['Industry Insights', 'Digital Transformation', 'Strategy'],
    specialty_publications: {
        'McKinsey Quarterly': 'Management insights',
        'MGI Research': 'Economic research'
    },
    verified: true
},
'bcg': {
    name: 'Boston Consulting Group',
    handles: {
        x: '@BCG',
        linkedin: 'company/boston-consulting-group',
        substack: 'bcg.insights.com'
    },
    research_portals: {
        public: 'https://www.bcg.com/publications',
        subscription: 'https://www.bcgperspectives.com'
    },
    data_types: ['Digital Strategy', 'Innovation', 'Sustainability'],
    specialty_areas: ['Strategy', 'Digital', 'Operations'],
    verified: true
},
'bain': {
    name: 'Bain & Company',
    handles: {
        x: '@BainAlerts',
        linkedin: 'company/bain-and-company',
        substack: 'bain.insights.com'
    },
    research_portals: {
        public: 'https://www.bain.com/insights',
        subscription: 'https://www.bain.com/research'
    },
    data_types: ['Private Equity', 'Customer Strategy', 'Digital'],
    specialty_areas: ['Private Equity', 'Strategy', 'Customer Experience'],
    verified: true
}
},

[FIRM_TYPES.RESEARCH]: {
'gartner': {
    name: 'Gartner',
    handles: {
        x: '@Gartner_inc',
        linkedin: 'company/gartner'
    },
    research_portals: {
        public: 'https://www.gartner.com/en/insights',
        subscription: 'https://www.gartner.com/research'
    },
    data_types: ['Technology Research', 'Market Analysis', 'Industry Forecasts'],
    specialty_areas: ['Enterprise Tech', 'Digital Transformation', 'IT Leadership'],
    verified: true
},
'forrester': {
    name: 'Forrester',
    handles: {
        x: '@forrester',
        linkedin: 'company/forrester-research'
    },
    research_portals: {
        public: 'https://www.forrester.com/blogs',
        subscription: 'https://www.forrester.com/research'
    },
    data_types: ['Technology Strategy', 'Market Research', 'Customer Experience'],
    specialty_areas: ['Digital Business', 'Customer Experience', 'Technology'],
    verified: true
},
// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 23:06:14
// Current User's Login: NUbivek

// Continuing from previous part...

'cbinsights': {
    name: 'CB Insights',
    handles: {
        x: '@CBinsights',
        linkedin: 'company/cb-insights'
    },
    research_portals: {
        public: 'https://www.cbinsights.com/research',
        subscription: 'https://www.cbinsights.com/platform'
    },
    data_types: ['Startup Analysis', 'Venture Capital', 'Innovation Research'],
    specialty_areas: ['Startups', 'VC', 'Corporate Innovation'],
    verified: true
}
},

[FIRM_TYPES.DATA_PROVIDER]: {
'bloomberg': {
    name: 'Bloomberg',
    handles: {
        x: '@Bloomberg',
        linkedin: 'company/bloomberg'
    },
    research_portals: {
        public: 'https://www.bloomberg.com/markets',
        subscription: 'https://www.bloomberg.com/professional'
    },
    data_types: ['Financial Data', 'Market Analysis', 'News'],
    specialty_areas: ['Financial Markets', 'Economic Data', 'News'],
    key_products: {
        'Bloomberg Terminal': 'Professional financial data platform',
        'Bloomberg Intelligence': 'Research platform',
        'Bloomberg News': 'Financial news service'
    },
    verified: true
},
'refinitiv': {
    name: 'Refinitiv',
    handles: {
        x: '@Refinitiv',
        linkedin: 'company/refinitiv'
    },
    research_portals: {
        public: 'https://www.refinitiv.com/perspectives',
        subscription: 'https://www.refinitiv.com/en/products'
    },
    data_types: ['Financial Markets', 'Risk Analysis', 'Trading Data'],
    specialty_areas: ['Market Data', 'Trading Solutions', 'Risk'],
    key_products: {
        'Eikon': 'Financial analysis platform',
        'DataScope': 'Reference data service',
        'World-Check': 'Risk intelligence database'
    },
    verified: true
}
}
};

// Combine both data sources
export const COMBINED_DATA_SOURCES = {
...MARKET_DATA_SOURCES,
...BOUTIQUE_AND_SPECIALIST_FIRMS
};

// Export utility functions for data access
export const getFirmByType = (type) => COMBINED_DATA_SOURCES[type] || {};

export const getAllFirms = () => {
return Object.values(COMBINED_DATA_SOURCES)
.reduce((acc, categoryFirms) => ({
    ...acc,
    ...categoryFirms
}), {});
};

export const getFirmsByVerification = (verified = true) => {
const allFirms = getAllFirms();
return Object.entries(allFirms)
.filter(([_, firm]) => firm.verified === verified)
.reduce((acc, [key, firm]) => ({
    ...acc,
    [key]: firm
}), {});
};

export const searchFirmsBySpecialty = (specialty) => {
const allFirms = getAllFirms();
return Object.entries(allFirms)
.filter(([_, firm]) => 
    firm.specialty?.includes(specialty) || 
    firm.specialty_areas?.includes(specialty) ||
    firm.data_types?.includes(specialty)
)
.reduce((acc, [key, firm]) => ({
    ...acc,
    [key]: firm
}), {});
};