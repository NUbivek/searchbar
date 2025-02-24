// Comprehensive VC Firms Data Structure
export const VC_FIRMS = {
    'Andreessen Horowitz': {
        name: 'Andreessen Horowitz',
        alias: 'a16z',
        focus: ['Software', 'Fintech', 'Crypto', 'Healthcare', 'Consumer'],
        aum: '$35B+',
        founded: 2009,
        handles: {
            x: '@a16z',
            linkedin: 'company/andreessen-horowitz',
            substack: 'future.a16z.com'
        },
        description: 'Leading Silicon Valley venture capital firm focused on backing bold entrepreneurs building the future through technology.',
        research_portal: 'https://a16z.com/research/',
        verified: true
    },
    'Sequoia Capital': {
        name: 'Sequoia Capital',
        focus: ['Technology', 'Healthcare', 'Consumer', 'Financial Services'],
        aum: '$85B+',
        founded: 1972,
        handles: {
            x: '@sequoia',
            linkedin: 'company/sequoia-capital'
        },
        description: 'Legendary venture firm known for early investments in Apple, Google, and many other tech giants.',
        research_portal: 'https://www.sequoiacap.com/our-perspective/',
        verified: true
    },
    'Accel': {
        name: 'Accel',
        focus: ['Software', 'Infrastructure', 'Security', 'Consumer'],
        aum: '$50B+',
        founded: 1983,
        handles: {
            x: '@Accel',
            linkedin: 'company/accel-partners'
        },
        description: 'Global venture capital firm that partners with exceptional founders from seed through all phases of growth.',
        research_portal: 'https://www.accel.com/insights',
        verified: true
    },
    'Benchmark': {
        name: 'Benchmark',
        focus: ['Consumer', 'Enterprise', 'Infrastructure'],
        aum: '$30B+',
        founded: 1995,
        handles: {
            x: '@benchmark',
            linkedin: 'company/benchmark'
        },
        description: 'Early-stage venture firm focused on being the first institutional investor in visionary founders.',
        research_portal: 'https://www.benchmark.com/companies',
        verified: true
    },
    'Greylock': {
        name: 'Greylock',
        focus: ['Enterprise', 'Consumer', 'Crypto', 'AI'],
        aum: '$20B+',
        founded: 1965,
        handles: {
            x: '@greylock',
            linkedin: 'company/greylock-partners'
        },
        partners: [
            { name: 'Reid Hoffman', handle: '@reidhoffman' },
            { name: 'David Sze', handle: '@davidsze' }
        ],
        description: 'Legendary venture firm known for early investments in Facebook, LinkedIn, and many other tech giants.',
        research_portal: 'https://greylock.com/greymatter/',
        verified: true
    },
    'Lightspeed Venture Partners': {
        name: 'Lightspeed Venture Partners',
        focus: ['Enterprise', 'Consumer', 'Healthcare', 'Fintech'],
        aum: '$25B+',
        founded: 2000,
        handles: {
            x: '@lightspeedvp',
            linkedin: 'company/lightspeed-venture-partners'
        },
        description: 'Global venture capital firm that partners with exceptional founders from seed through all phases of growth.',
        research_portal: 'https://lsvp.com/category/perspectives/',
        verified: true
    },
    'Tiger Global': {
        name: 'Tiger Global',
        focus: ['Software', 'Internet', 'Financial Services', 'Consumer'],
        aum: '$95B+',
        founded: 2001,
        handles: {
            linkedin: 'company/tiger-global-management'
        },
        description: 'Global investment firm that deploys capital in private and public markets.',
        verified: true
    },
    'Coatue Management': {
        name: 'Coatue Management',
        focus: ['Technology', 'Consumer', 'Healthcare'],
        aum: '$75B+',
        founded: 1999,
        handles: {
            x: '@Coatue',
            linkedin: 'company/coatue-management'
        },
        description: 'Global investment firm that deploys capital in private and public markets.',
        verified: true
    }
};

// Utility functions for VC data
export const getVCPartners = (firmName) => {
    const firm = VC_FIRMS[firmName];
    return firm?.partners || [];
};

export const getVCSocialHandles = (firmName) => {
    const firm = VC_FIRMS[firmName];
    return firm?.handles || {};
};

export const getVerifiedVCFirms = () => {
    return Object.values(VC_FIRMS).filter(firm => firm.verified);
};

export default {
    VC_FIRMS,
    getVCPartners,
    getVCSocialHandles,
    getVerifiedVCFirms
};
