// Additional verified data sources focused on startups, growth companies, and market insights
const { TOP_COMPANY_EMPLOYEES } = require('./companyEmployeeData');

const VERIFIED_DATA_SOURCES = {
    'Strategy Consulting': [
        {
            name: 'McKinsey & Company',
            specialty: ['Strategy', 'Digital', 'Startups', 'Growth'],
            handles: {
                x: '@McKinsey',
                linkedin: 'company/mckinsey',
                substack: 'mckinsey.substack.com'
            },
            research_portals: {
                public: 'https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights',
                startup: 'https://www.mckinsey.com/featured-insights/startups-and-growth'
            },
            focus: ['Digital Transformation', 'Startup Strategy', 'Growth Advisory'],
            verified: true
        },
        {
            name: 'BCG',
            specialty: ['Strategy', 'Innovation', 'Tech'],
            handles: {
                x: '@BCG',
                linkedin: 'company/boston-consulting-group'
            },
            research_portals: {
                public: 'https://www.bcg.com/industries/technology-digital-data/emerging-technology',
                startup: 'https://www.bcgdigitalventures.com/insights'
            },
            focus: ['Digital Ventures', 'Tech Strategy', 'Innovation'],
            verified: true
        },
        {
            name: 'Bain & Company',
            specialty: ['Strategy', 'Private Equity', 'Tech'],
            handles: {
                x: '@BainAlerts',
                linkedin: 'company/bain-and-company'
            },
            research_portals: {
                public: 'https://www.bain.com/insights/topics/technology/',
                startup: 'https://www.bain.com/consulting-services/private-equity/'
            },
            focus: ['Tech Strategy', 'PE Due Diligence', 'Growth Strategy'],
            verified: true
        }
    ],

    'Investment Banks': [
        {
            name: 'Goldman Sachs',
            specialty: ['Tech Banking', 'Growth Equity', 'Market Analysis'],
            handles: {
                x: '@GoldmanSachs',
                linkedin: 'company/goldman-sachs'
            },
            research_portals: {
                public: 'https://www.goldmansachs.com/insights/',
                tech: 'https://www.goldmansachs.com/insights/topics/technology-driving-innovation/'
            },
            focus: ['Tech IPOs', 'Growth Financing', 'Market Analysis'],
            verified: true
        },
        {
            name: 'Morgan Stanley',
            specialty: ['Tech Investment Banking', 'Equity Research'],
            handles: {
                x: '@MorganStanley',
                linkedin: 'company/morgan-stanley'
            },
            research_portals: {
                public: 'https://www.morganstanley.com/ideas',
                tech: 'https://www.morganstanley.com/ideas/technology'
            },
            focus: ['Tech Research', 'Growth Companies', 'Market Trends'],
            verified: true
        }
    ],

    'Market Research & Data': [
        {
            name: 'CB Insights',
            specialty: ['Startup Data', 'Market Intelligence', 'Tech Trends'],
            handles: {
                x: '@CBinsights',
                linkedin: 'company/cb-insights'
            },
            research_portals: {
                public: 'https://www.cbinsights.com/research/',
                startup: 'https://www.cbinsights.com/research/startup-failure-post-mortem/'
            },
            focus: ['Startup Analysis', 'Market Maps', 'Industry Research'],
            verified: true
        },
        {
            name: 'PitchBook',
            specialty: ['Private Market Data', 'VC Analytics'],
            handles: {
                x: '@PitchBook',
                linkedin: 'company/pitchbook-data'
            },
            research_portals: {
                public: 'https://pitchbook.com/news/reports',
                startup: 'https://pitchbook.com/analysis'
            },
            focus: ['VC Data', 'Private Markets', 'Deal Analytics'],
            verified: true
        },
        {
            name: 'Dealroom',
            specialty: ['European Startup Data', 'Global VC Trends'],
            handles: {
                x: '@dealroomco',
                linkedin: 'company/dealroom-co'
            },
            research_portals: {
                public: 'https://dealroom.co/reports',
                startup: 'https://dealroom.co/blog'
            },
            focus: ['European Tech', 'Global Startups', 'VC Ecosystems'],
            verified: true
        }
    ],

    'Professional Services': [
        {
            name: 'Deloitte',
            specialty: ['Tech Consulting', 'Startup Advisory', 'Industry Research'],
            handles: {
                x: '@Deloitte',
                linkedin: 'company/deloitte'
            },
            research_portals: {
                public: 'https://www2.deloitte.com/insights/technology',
                startup: 'https://www2.deloitte.com/fast500'
            },
            focus: ['Tech Fast 500', 'Industry Analysis', 'Growth Companies'],
            verified: true
        },
        {
            name: 'PwC',
            specialty: ['Deals Advisory', 'Tech Consulting', 'Market Research'],
            handles: {
                x: '@PwC',
                linkedin: 'company/pwc'
            },
            research_portals: {
                public: 'https://www.pwc.com/gx/en/industries/technology.html',
                startup: 'https://www.pwc.com/moneytreetm'
            },
            focus: ['MoneyTree Report', 'Tech Deals', 'Market Analysis'],
            verified: true
        }
    ],

    'Tech Research': [
        {
            name: 'Gartner',
            specialty: ['Tech Research', 'Market Analysis', 'Industry Trends'],
            handles: {
                x: '@Gartner_inc',
                linkedin: 'company/gartner'
            },
            research_portals: {
                public: 'https://www.gartner.com/en/research',
                tech: 'https://www.gartner.com/en/industries/high-tech'
            },
            focus: ['Tech Trends', 'Market Analysis', 'Industry Research'],
            verified: true
        },
        {
            name: 'Forrester',
            specialty: ['Tech Research', 'Digital Strategy', 'Market Analysis'],
            handles: {
                x: '@forrester',
                linkedin: 'company/forrester-research'
            },
            research_portals: {
                public: 'https://www.forrester.com/research',
                tech: 'https://www.forrester.com/technology-research'
            },
            focus: ['Digital Strategy', 'Tech Markets', 'Innovation'],
            verified: true
        }
    ],

    'Startup Research': [
        {
            name: 'a16z Research',
            specialty: ['Tech Trends', 'Startup Insights', 'Market Analysis'],
            handles: {
                x: '@a16z',
                linkedin: 'company/andreessen-horowitz'
            },
            research_portals: {
                public: 'https://a16z.com/research/',
                tech: 'https://a16z.com/tech-topics/'
            },
            focus: ['Future Trends', 'Startup Insights', 'Tech Analysis'],
            verified: true
        },
        {
            name: 'NFX',
            specialty: ['Network Effects', 'Startup Playbooks', 'Founder Content'],
            handles: {
                x: '@NFX',
                linkedin: 'company/nfx-guild'
            },
            research_portals: {
                public: 'https://www.nfx.com/essays',
                startup: 'https://www.nfx.com/manual'
            },
            focus: ['Startup Playbooks', 'Network Effects', 'Growth'],
            verified: true
        }
    ],
    'Company Employee Social Media Handles': [
        {
            name: 'Company Employee Social Media Handles',
            specialty: ['Company Employee Data'],
            handles: TOP_COMPANY_EMPLOYEES,
            research_portals: {},
            focus: ['Company Employee Data'],
            verified: true
        }
    ]
};

// Utility functions for accessing verified data
const getVerifiedSourcesByCategory = (category) => {
    return VERIFIED_DATA_SOURCES[category] || [];
};

const getAllVerifiedSources = () => {
    return Object.values(VERIFIED_DATA_SOURCES).flat();
};

const searchVerifiedSources = (query) => {
    const allSources = getAllVerifiedSources();
    
    return allSources.filter(source => {
        const searchString = `${source.name} ${source.specialty?.join(' ')} ${source.focus?.join(' ')}`.toLowerCase();
        return query.toLowerCase().split(' ').every(term => searchString.includes(term));
    });
};

module.exports = {
    VERIFIED_DATA_SOURCES,
    getVerifiedSourcesByCategory,
    getAllVerifiedSources,
    searchVerifiedSources
};
