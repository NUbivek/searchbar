/**
 * Comprehensive collection of all verified sources for the search application
 * This file consolidates all verified sources in one place for easy access and management
 */

const { VERIFIED_DATA_SOURCES } = require('./verifiedDataSources');
const { TOP_COMPANY_EMPLOYEES } = require('./companyEmployeeData');
const { MARKET_DATA_SOURCES, VC_FIRMS } = require('./dataSources');

// All source types for verified search
const SOURCE_TYPES = {
  // Core verified sources
  VERIFIED_DATA: 'verified_data',
  
  // Company and employee data
  COMPANY_EMPLOYEES: 'company_employees',
  
  // Market data
  FINANCIAL_MARKET_DATA: 'financial_market_data',
  INDUSTRY_MARKET_DATA: 'industry_market_data',
  
  // VC and investment data
  VC_FIRMS_DATA: 'vc_firms_data',
  
  // Social media platforms
  SOCIAL_MEDIA: {
    X: 'x',
    LINKEDIN: 'linkedin',
    REDDIT: 'reddit',
    SUBSTACK: 'substack'
  },
  
  // Website scraping for specific domains
  WEBSITE_SCRAPING: {
    CARTA: 'carta',
    CRUNCHBASE: 'crunchbase',
    PITCHBOOK: 'pitchbook',
    CBINSIGHTS: 'cbinsights'
  },
  
  // API data sources
  API_SOURCES: {
    FMP: 'fmp',
    SEC: 'sec',
    EDGAR: 'edgar'
  }
};

// Consolidated list of all verified sources
const ALL_VERIFIED_SOURCES = [
  // Core verified data categories
  'strategy_consulting', 
  'investment_banks', 
  'market_data', 
  'vc_firms', 
  'professional_services', 
  'research_firms',
  
  // Additional data sources
  'financial_market_data', 
  'industry_market_data', 
  'vc_firms_data',
  
  // Social media platforms
  'x', 
  'linkedin', 
  'reddit', 
  'substack',
  
  // Website scraping for specific domains
  'carta', 
  'crunchbase', 
  'pitchbook', 
  'cbinsights',
  
  // Employee social media handles
  'employee_handles',
  
  // API data sources
  'fmp',
  'sec',
  'edgar'
];

// Categorized verified sources for UI display and selection
const CATEGORIZED_VERIFIED_SOURCES = {
  'Professional Sources': [
    { id: 'strategy_consulting', name: 'Strategy Consulting Firms', description: 'Top strategy consulting firms like McKinsey, BCG, and Bain' },
    { id: 'investment_banks', name: 'Investment Banks', description: 'Major investment banks and financial institutions' },
    { id: 'professional_services', name: 'Professional Services', description: 'Professional services firms like Deloitte and PwC' },
    { id: 'research_firms', name: 'Research Firms', description: 'Market research and analysis firms' }
  ],
  'Market Data': [
    { id: 'market_data', name: 'Market Data Providers', description: 'Market data and analytics providers' },
    { id: 'financial_market_data', name: 'Financial Market Data', description: 'Financial market data from Bloomberg, Reuters, etc.' },
    { id: 'industry_market_data', name: 'Industry Market Data', description: 'Industry-specific market data and research' }
  ],
  'Investment & Startups': [
    { id: 'vc_firms', name: 'VC Firms', description: 'Venture capital firms and investors' },
    { id: 'vc_firms_data', name: 'VC Investment Data', description: 'Data on venture capital investments and deals' }
  ],
  'Company Sources': [
    { id: 'employee_handles', name: 'Employee Social Handles', description: 'Social media handles of employees from top companies' },
    { id: 'carta', name: 'Carta', description: 'Equity management platform data' },
    { id: 'crunchbase', name: 'Crunchbase', description: 'Startup and funding data' },
    { id: 'pitchbook', name: 'Pitchbook', description: 'Private market financial data' },
    { id: 'cbinsights', name: 'CB Insights', description: 'Market intelligence platform' }
  ],
  'Social Media': [
    { id: 'x', name: 'X/Twitter', description: 'Data from X (formerly Twitter)' },
    { id: 'linkedin', name: 'LinkedIn', description: 'Professional network data' },
    { id: 'reddit', name: 'Reddit', description: 'Community discussion forums' },
    { id: 'substack', name: 'Substack', description: 'Newsletter platform content' }
  ],
  'Financial Data APIs': [
    { id: 'fmp', name: 'Financial Modeling Prep', description: 'Financial data API' },
    { id: 'sec', name: 'SEC', description: 'Securities and Exchange Commission filings' },
    { id: 'edgar', name: 'EDGAR', description: 'Electronic Data Gathering, Analysis, and Retrieval system' }
  ]
};

/**
 * Get all verified sources as a flat array
 * @returns {Array} Array of all verified source IDs
 */
function getAllVerifiedSourceIds() {
  return ALL_VERIFIED_SOURCES;
}

/**
 * Get categorized verified sources for UI display
 * @returns {Object} Object with categories as keys and arrays of source objects as values
 */
function getCategorizedVerifiedSources() {
  return CATEGORIZED_VERIFIED_SOURCES;
}

/**
 * Get verified sources by category
 * @param {string} category - Category name
 * @returns {Array} Array of source objects for the specified category
 */
function getVerifiedSourcesByCategory(category) {
  return CATEGORIZED_VERIFIED_SOURCES[category] || [];
}

/**
 * Get combined data from all verified sources
 * @returns {Object} Combined data from all verified sources
 */
function getCombinedVerifiedData() {
  return {
    verifiedDataSources: VERIFIED_DATA_SOURCES,
    companyEmployees: TOP_COMPANY_EMPLOYEES,
    marketDataSources: MARKET_DATA_SOURCES,
    vcFirms: VC_FIRMS
  };
}

/**
 * Search across all verified sources
 * @param {string} query - Search query
 * @param {Array} selectedSources - Array of selected source IDs (optional)
 * @returns {Array} Array of matching results
 */
function searchAcrossVerifiedSources(query, selectedSources = ALL_VERIFIED_SOURCES) {
  // Implementation would depend on how you want to search across all these sources
  // This is a placeholder for the actual implementation
  return [];
}

module.exports = {
  SOURCE_TYPES,
  ALL_VERIFIED_SOURCES,
  CATEGORIZED_VERIFIED_SOURCES,
  getAllVerifiedSourceIds,
  getCategorizedVerifiedSources,
  getVerifiedSourcesByCategory,
  getCombinedVerifiedData,
  searchAcrossVerifiedSources
};
