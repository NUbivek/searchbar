const axios = require('axios');
const { DATA_PROVIDERS } = require('./dataSources');
const { logger } = require('./logger');

class EdgarAPI {
    constructor() {
        this.lastRequestTime = 0;
        this.minRequestInterval = 500; // 500ms between requests (2 requests per second to be very safe)
        this.baseRetryDelay = 1000; // Start with 1s retry delay
        this.maxRetryDelay = 30000; // Max 30s delay
        this.maxRetries = 5;
    }

    async makeRequest(config) {
        const edgar = DATA_PROVIDERS.government_data.edgar;
        const headers = {
            ...edgar.headers,
            'Accept-Encoding': 'gzip, deflate',
            'Host': 'data.sec.gov'
        };

        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(r => setTimeout(r, this.minRequestInterval - timeSinceLastRequest));
        }

        let retryCount = 0;
        let retryDelay = this.baseRetryDelay;

        while (retryCount <= this.maxRetries) {
            try {
                const response = await axios({
                    ...config,
                    headers: { ...headers, ...config.headers }
                });
                this.lastRequestTime = Date.now();
                return response;
            } catch (error) {
                if (error.response?.status === 429 || error.response?.status === 403) {
                    if (retryCount === this.maxRetries) throw error;
                    
                    logger.warn(`SEC EDGAR rate limit exceeded (attempt ${retryCount + 1}), retrying after ${retryDelay}ms...`);
                    await new Promise(r => setTimeout(r, retryDelay));
                    retryCount++;
                    retryDelay = Math.min(retryDelay * 2, this.maxRetryDelay);
                    continue;
                }
                throw error;
            }
        }
    }

    async fetchData(endpoint, params = {}) {
        const edgar = DATA_PROVIDERS.government_data.edgar;
        const url = `${edgar.base_url}${endpoint}`;

        try {
            const response = await this.makeRequest({
                method: 'GET',
                url,
                params
            });
            return response.data;
        } catch (error) {
            logger.error('Error fetching EDGAR data:', error);
            throw error;
        }
    }

    async searchCompany(query) {
        try {
            const response = await this.fetchData('cgi-bin/browse-edgar', {
                CIK: query,
                owner: 'include',
                action: 'getcompany',
                type: '10-K,10-Q',
                count: 10,
                output: 'json'
            });
            return response;
        } catch (error) {
            logger.error('Error searching company:', error);
            return null;
        }
    }

    async getFilings(cik) {
        // Pad CIK with leading zeros to 10 digits
        const paddedCik = cik.padStart(10, '0');
        try {
            const response = await this.fetchData(`submissions/CIK${paddedCik}.json`);
            return response;
        } catch (error) {
            logger.error('Error getting filings:', error);
            return null;
        }
    }

    async getXBRLData(accessionNumber) {
        try {
            const response = await this.fetchData(`data/xbrl/companyfacts/CIK${accessionNumber}.json`);
            return response;
        } catch (error) {
            logger.error('Error getting XBRL data:', error);
            return null;
        }
    }
}

// Create a singleton instance
const edgarAPI = new EdgarAPI();

// Export the instance methods directly
const fetchEdgarData = (endpoint, params = {}) => edgarAPI.fetchData(endpoint, params);
const searchCompany = (query) => edgarAPI.searchCompany(query);
const getFilings = (cik) => edgarAPI.getFilings(cik);
const getXBRLData = (accessionNumber) => edgarAPI.getXBRLData(accessionNumber);

module.exports = {
    fetchEdgarData,
    searchCompany,
    getFilings,
    getXBRLData
};
