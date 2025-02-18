// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 23:06:52
// Current User's Login: NUbivek

import { PLATFORMS, FIRM_TYPES } from './marketDataTypes';
import { COMBINED_DATA_SOURCES, getAllFirms } from './marketDataSources';

/**
 * Comprehensive personnel management and social handle integration
 */
export class MarketDataIntegration {
    constructor() {
        this.allFirms = getAllFirms();
        this.cachedPersonnel = null;
        this.cachedHandles = {};
    }

    /**
     * Get all personnel across all firms with their social handles
     * @param {string} platform - Social media platform to filter by
     * @returns {Object} Categorized personnel data
     */
    getAllKeyPersonnel(platform = null) {
        if (this.cachedPersonnel && !platform) {
            return this.cachedPersonnel;
        }

        const personnel = {
            vc_personnel: [],
            banking_personnel: [],
            consulting_personnel: [],
            research_personnel: [],
            market_personnel: []
        };

        Object.entries(this.allFirms).forEach(([firmKey, firm]) => {
            const personnelList = firm.key_personnel || [];
            personnelList.forEach(person => {
                if (!platform || person.handles[platform]) {
                    const personData = {
                        name: person.name,
                        firm: firm.name,
                        firmKey: firmKey,
                        title: person.title,
                        focus: person.focus,
                        handles: platform ? person.handles[platform] : person.handles,
                        verified: person.verified || false,
                        type: this.determinePersonnelType(firmKey)
                    };

                    switch (this.determinePersonnelCategory(firmKey)) {
                        case 'banking':
                            personnel.banking_personnel.push(personData);
                            break;
                        case 'consulting':
                            personnel.consulting_personnel.push(personData);
                            break;
                        case 'research':
                            personnel.research_personnel.push(personData);
                            break;
                        case 'market':
                            personnel.market_personnel.push(personData);
                            break;
                        default:
                            personnel.vc_personnel.push(personData);
                    }
                }
            });
        });

        if (!platform) {
            this.cachedPersonnel = personnel;
        }

        return personnel;
    }
    // Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 23:07:43
// Current User's Login: NUbivek

    /**
     * Get all social handles filtered by topic/focus area
     * @param {string} topic - Topic or focus area to filter by
     * @param {string} platform - Social media platform
     * @returns {Object} Categorized handles for firms and individuals
     */
    getHandlesByTopic(topic, platform) {
        const cacheKey = `${topic}-${platform}`;
        if (this.cachedHandles[cacheKey]) {
            return this.cachedHandles[cacheKey];
        }

        const handles = {
            firms: [],
            individuals: [],
            metadata: {
                topic,
                platform,
                timestamp: new Date().toISOString()
            }
        };

        Object.entries(this.allFirms).forEach(([firmKey, firm]) => {
            // Check firm specialty and handles
            const hasRelevantSpecialty = 
                firm.specialty?.includes(topic) || 
                firm.specialty_areas?.includes(topic) ||
                firm.data_types?.includes(topic);

            if (hasRelevantSpecialty && firm.handles[platform]) {
                handles.firms.push({
                    name: firm.name,
                    handle: firm.handles[platform],
                    type: this.determinePersonnelType(firmKey),
                    category: this.determinePersonnelCategory(firmKey),
                    verified: firm.verified || false
                });
            }

            // Check personnel focus and handles
            (firm.key_personnel || []).forEach(person => {
                if (person.focus?.includes(topic) && person.handles[platform]) {
                    handles.individuals.push({
                        name: person.name,
                        handle: person.handles[platform],
                        firm: firm.name,
                        title: person.title,
                        type: this.determinePersonnelType(firmKey),
                        category: this.determinePersonnelCategory(firmKey),
                        verified: person.verified || false
                    });
                }
            });
        });

        this.cachedHandles[cacheKey] = handles;
        return handles;
    }

    /**
     * Get trending voices in a specific area
     * @param {string} area - Focus area or specialty
     * @param {string} platform - Social media platform
     * @param {Object} options - Additional options for filtering
     * @returns {Array} Sorted list of trending voices
     */
    getTrendingVoices(area, platform, options = {}) {
        const {
            limit = 10,
            verifiedOnly = true,
            includeTypes = ['all']
        } = options;

        const voices = [];
        const personnel = this.getAllKeyPersonnel(platform);

        Object.values(personnel).forEach(category => {
            category
                .filter(person => {
                    const typeMatch = includeTypes.includes('all') || 
                                    includeTypes.includes(person.type);
                    const verificationMatch = !verifiedOnly || person.verified;
                    const areaMatch = person.focus?.includes(area);
                    
                    return typeMatch && verificationMatch && areaMatch;
                })
                .forEach(person => {
                    voices.push({
                        name: person.name,
                        handle: person.handles,
                        firm: person.firm,
                        title: person.title,
                        type: person.type,
                        category: person.category,
                        focus: person.focus,
                        verified: person.verified
                    });
                });
        });

        // Sort by verification status and then alphabetically
        return voices
            .sort((a, b) => {
                if (a.verified !== b.verified) return a.verified ? -1 : 1;
                return a.name.localeCompare(b.name);
            })
            .slice(0, limit);
    }
    // Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 23:09:00
// Current User's Login: NUbivek

    /**
     * Determine personnel type based on firm key
     * @private
     * @param {string} firmKey - Key identifier for the firm
     * @returns {string} Personnel type classification
     */
    determinePersonnelType(firmKey) {
        const firmCategories = {
            [FIRM_TYPES.BOUTIQUE_BANK]: 'Boutique Banking',
            [FIRM_TYPES.BOUTIQUE_CONSULTING]: 'Boutique Consulting',
            [FIRM_TYPES.SPECIALIST_RESEARCH]: 'Specialist Research',
            [FIRM_TYPES.INDEPENDENT_RESEARCH]: 'Independent Research',
            [FIRM_TYPES.INVESTMENT_BANK]: 'Investment Banking',
            [FIRM_TYPES.CONSULTING]: 'Management Consulting',
            [FIRM_TYPES.RESEARCH]: 'Market Research',
            [FIRM_TYPES.DATA_PROVIDER]: 'Data Provider'
        };

        return Object.entries(firmCategories)
            .find(([category, _]) => 
                COMBINED_DATA_SOURCES[category]?.[firmKey]
            )?.[1] || 'Other';
    }

    /**
     * Determine personnel category for grouping
     * @private
     * @param {string} firmKey - Key identifier for the firm
     * @returns {string} Category classification
     */
    determinePersonnelCategory(firmKey) {
        const bankingTypes = [FIRM_TYPES.BOUTIQUE_BANK, FIRM_TYPES.INVESTMENT_BANK];
        const consultingTypes = [FIRM_TYPES.BOUTIQUE_CONSULTING, FIRM_TYPES.CONSULTING];
        const researchTypes = [FIRM_TYPES.SPECIALIST_RESEARCH, FIRM_TYPES.INDEPENDENT_RESEARCH, FIRM_TYPES.RESEARCH];
        const marketTypes = [FIRM_TYPES.DATA_PROVIDER];

        for (const [types, category] of [
            [bankingTypes, 'banking'],
            [consultingTypes, 'consulting'],
            [researchTypes, 'research'],
            [marketTypes, 'market']
        ]) {
            if (types.some(type => COMBINED_DATA_SOURCES[type]?.[firmKey])) {
                return category;
            }
        }

        return 'other';
    }

    /**
     * Get firm details with enhanced metadata
     * @param {string} firmKey - Firm identifier
     * @returns {Object|null} Enhanced firm details
     */
    getFirmDetails(firmKey) {
        const firm = this.allFirms[firmKey];
        if (!firm) return null;

        return {
            ...firm,
            type: this.determinePersonnelType(firmKey),
            category: this.determinePersonnelCategory(firmKey),
            personnel_count: firm.key_personnel?.length || 0,
            has_research_portal: Boolean(firm.research_portals?.public || firm.research_portals?.subscription),
            social_presence: Object.keys(firm.handles || {})
        };
    }

    /**
     * Search across all firms and personnel
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Object} Search results
     */
    searchMarketData(query, options = {}) {
        const {
            searchInFirms = true,
            searchInPersonnel = true,
            filterByType = [],
            platform = null
        } = options;

        const results = {
            firms: [],
            personnel: [],
            metadata: {
                query,
                timestamp: new Date().toISOString(),
                options
            }
        };

        const searchTerm = query.toLowerCase();

        if (searchInFirms) {
            results.firms = Object.entries(this.allFirms)
                .filter(([key, firm]) => {
                    const typeMatch = !filterByType.length || 
                                    filterByType.includes(this.determinePersonnelType(key));
                    const searchMatch = firm.name.toLowerCase().includes(searchTerm) ||
                                     firm.specialty?.some(s => s.toLowerCase().includes(searchTerm)) ||
                                     firm.specialty_areas?.some(s => s.toLowerCase().includes(searchTerm));
                    return typeMatch && searchMatch;
                })
                .map(([key, firm]) => ({
                    ...this.getFirmDetails(key),
                    relevance: 'firm_match'
                }));
        }

        if (searchInPersonnel) {
            const personnel = this.getAllKeyPersonnel(platform);
            results.personnel = Object.values(personnel)
                .flat()
                .filter(person => {
                    const typeMatch = !filterByType.length || 
                                    filterByType.includes(person.type);
                    const searchMatch = person.name.toLowerCase().includes(searchTerm) ||
                                     person.focus?.some(f => f.toLowerCase().includes(searchTerm));
                    return typeMatch && searchMatch;
                })
                .map(person => ({
                    ...person,
                    relevance: 'personnel_match'
                }));
        }

        return results;
    }
}

// Export a singleton instance
export const marketDataIntegration = new MarketDataIntegration();

// Export convenience methods
export const getAllKeyPersonnel = (platform) => 
    marketDataIntegration.getAllKeyPersonnel(platform);

export const getHandlesByTopic = (topic, platform) => 
    marketDataIntegration.getHandlesByTopic(topic, platform);

export const getTrendingVoices = (area, platform, options) => 
    marketDataIntegration.getTrendingVoices(area, platform, options);

export const searchMarketData = (query, options) => 
    marketDataIntegration.searchMarketData(query, options);