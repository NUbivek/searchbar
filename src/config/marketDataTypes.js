// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 23:01:18
// Current User's Login: NUbivek

/**
 * @typedef {Object} SocialHandles
 * @property {string} x - X (Twitter) handle
 * @property {string} linkedin - LinkedIn profile/company URL
 * @property {string} [substack] - Optional Substack URL
 */

/**
 * @typedef {Object} ResearchPortals
 * @property {string} public - Public research portal URL
 * @property {string} subscription - Subscription/Premium research portal URL
 */

/**
 * @typedef {Object} Personnel
 * @property {string} name - Full name
 * @property {string} title - Job title
 * @property {SocialHandles} handles - Social media handles
 * @property {string[]} focus - Areas of focus/expertise
 */

/**
 * @typedef {Object} Firm
 * @property {string} name - Company name
 * @property {SocialHandles} handles - Company social media handles
 * @property {ResearchPortals} [research_portals] - Research portals if available
 * @property {string[]} [specialty] - Specialty areas
 * @property {string[]} [data_types] - Types of data/research provided
 * @property {Personnel[]} [key_personnel] - Key team members
 */

export const PLATFORMS = {
    X: 'x',
    LINKEDIN: 'linkedin',
    SUBSTACK: 'substack'
};

export const FIRM_TYPES = {
    BOUTIQUE_BANK: 'boutique_banks',
    BOUTIQUE_CONSULTING: 'boutique_consulting',
    SPECIALIST_RESEARCH: 'specialist_research',
    INDEPENDENT_RESEARCH: 'independent_research',
    INVESTMENT_BANK: 'investment_banks',
    CONSULTING: 'consulting_firms',
    RESEARCH: 'research_firms',
    DATA_PROVIDER: 'data_providers'
};