import axios from 'axios';
import cheerio from 'cheerio';
import { logger } from './logger';
import { VC_FIRMS, MARKET_DATA_SOURCES } from './dataSources';

export async function customSearch(query, options = {}) {
    const {
        sources = ['vc', 'market', 'custom'],
        verifiedOnly = true,
        customUrls = []
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

    if (sources.includes('custom')) {
        const customResults = await searchCustomUrls(customUrls, query);
        results.push(...customResults);
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

export async function searchCustomUrls(urls, query) {
    const results = [];

    for (const url of urls) {
        try {
            const content = await scrapeUrl(url);
            if (!content) continue;

            // Simple text search for now - can be enhanced with more sophisticated matching
            if (content.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    source: new URL(url).hostname,
                    type: 'CustomURL',
                    content: content.substring(0, 500) + '...', // Truncate for response
                    url: url,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            logger.error(`Error processing URL ${url}:`, error);
        }
    }

    return results;
}

async function scrapeUrl(url) {
    try {
        const response = await axios.get(url, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        // Remove script and style elements
        $('script').remove();
        $('style').remove();

        // Extract text from main content areas
        const mainContent = $('article, main, .content, #content, .post-content, .entry-content')
            .first()
            .text()
            .trim();

        // If no main content found, get body text
        return mainContent || $('body').text().trim();
    } catch (error) {
        logger.error(`Error scraping URL ${url}:`, error);
        return null;
    }
}

export { customSearch as default };