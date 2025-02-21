import axios from 'axios';
import { VC_FIRMS, MARKET_DATA_SOURCES } from './dataSources';

export async function customSearch(query, options = {}) {
    const {
        sources = ['vc', 'market'],
        verifiedOnly = true
    } = options;

    const results = [];

    if (sources.includes('vc')) {
        const vcResults = await searchVCFirms(query, verifiedOnly);
        results.push(...vcResults);
    }

    if (sources.includes('market')) {
        const marketResults = await searchMarketData(query, verifiedOnly);
        results.push(...marketResults);
    }

    return results;
}

async function searchVCFirms(query, verifiedOnly) {
    return Object.entries(VC_FIRMS)
        .filter(([_, firm]) => {
            if (verifiedOnly && !firm.verified) return false;
            const searchText = JSON.stringify(firm).toLowerCase();
            return searchText.includes(query.toLowerCase());
        })
        .map(([key, firm]) => ({
            type: 'VC',
            source: firm.name,
            content: firm,
            url: firm.handles?.linkedin || firm.handles?.x || '',
            verified: firm.verified || false
        }));
}

async function searchMarketData(query, verifiedOnly) {
    return Object.values(MARKET_DATA_SOURCES)
        .flat()
        .filter(source => !verifiedOnly || source.verified)
        .map(source => ({
            type: 'Market Data',
            source: source.name,
            content: {
                specialty: source.specialty,
                dataTypes: source.data_types
            },
            url: source.research_portals?.public || '',
            verified: source.verified || false
        }));
}

export default customSearch; 