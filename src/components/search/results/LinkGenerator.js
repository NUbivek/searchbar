/**
 * LinkGenerator.js
 * Handles intelligent link generation for search results
 */

import { debug, info, error, warn } from '../../../utils/logger';

// Create a log object for consistent logging
const log = { debug, info, error, warn };

/**
 * Generate inline hyperlinks within text content based on sources and keywords
 * @param {string} content - The text content to process
 * @param {Array} sources - Array of source objects with urls
 * @param {Object} options - Configuration options
 * @returns {string} HTML formatted text with inline hyperlinks
 */
export const generateInlineLinks = (content, sources = [], options = {}) => {
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return content;
  }
  
  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    // No sources to link to
    return content;
  }
  
  log.debug('Generating inline links for content');
  
  try {
    // Extract domains from sources
    const domainInfo = extractDomainInfo(sources);
    
    // Find keywords to link based on domain information
    const linkableKeywords = findLinkableKeywords(content, domainInfo, options);
    
    // Sort linkable keywords by position (to avoid nesting issues)
    linkableKeywords.sort((a, b) => a.index - b.index);
    
    // Replace text with hyperlinks
    return insertHyperlinks(content, linkableKeywords);
  } catch (err) {
    log.error('Error generating inline links:', err);
    return content;
  }
};

/**
 * Extract domain information from sources
 * @param {Array} sources - Array of source objects
 * @returns {Array} Domain information objects
 */
const extractDomainInfo = (sources) => {
  const domains = [];
  
  sources.forEach(source => {
    if (!source || !source.url) return;
    
    try {
      // Extract domain from URL
      const url = new URL(source.url);
      const domain = url.hostname.replace('www.', '');
      
      // Check if this domain already exists
      const existingDomain = domains.find(d => d.domain === domain);
      
      if (existingDomain) {
        // Add this URL to existing domain
        existingDomain.urls.push({
          url: source.url,
          title: source.title || '',
          description: source.description || source.snippet || '',
          keywords: extractKeywordsFromSource(source)
        });
      } else {
        // Add new domain
        domains.push({
          domain,
          urls: [{
            url: source.url,
            title: source.title || '',
            description: source.description || source.snippet || '',
            keywords: extractKeywordsFromSource(source)
          }]
        });
      }
    } catch (err) {
      // Skip invalid URLs
      log.warn(`Invalid URL in sources: ${source.url}`);
    }
  });
  
  return domains;
};

/**
 * Extract keywords from a source
 * @param {Object} source - Source object
 * @returns {Array} Array of keywords
 */
const extractKeywordsFromSource = (source) => {
  const keywords = [];
  
  // Add title words as potential keywords
  if (source.title) {
    // Split title into words and filter out common words
    const titleWords = source.title
      .split(/\s+/)
      .map(word => word.replace(/[^\w\s]/g, '').trim())
      .filter(word => word.length > 3)
      .filter(word => !isCommonWord(word));
      
    keywords.push(...titleWords);
  }
  
  // Add domain name as keyword if it's a company/business
  if (source.url) {
    try {
      const url = new URL(source.url);
      const domain = url.hostname.replace('www.', '').split('.')[0];
      
      if (domain.length > 3 && !isCommonWord(domain)) {
        keywords.push(domain);
      }
    } catch (err) {
      // Skip invalid URLs
    }
  }
  
  return [...new Set(keywords)]; // Remove duplicates
};

/**
 * Common words to exclude from keywords
 */
const COMMON_WORDS = new Set([
  'about', 'after', 'again', 'also', 'another', 'back', 'because', 'before',
  'between', 'come', 'could', 'does', 'during', 'each', 'even', 'every',
  'find', 'first', 'from', 'give', 'have', 'here', 'just', 'know', 'like',
  'look', 'make', 'many', 'more', 'most', 'much', 'must', 'never', 'next',
  'only', 'other', 'over', 'same', 'some', 'such', 'take', 'than', 'that',
  'their', 'them', 'then', 'there', 'these', 'they', 'thing', 'this', 'those',
  'through', 'time', 'under', 'very', 'well', 'were', 'what', 'when', 'where',
  'which', 'while', 'will', 'with', 'would', 'your'
]);

/**
 * Check if a word is a common word
 * @param {string} word - Word to check
 * @returns {boolean} True if common word
 */
const isCommonWord = (word) => {
  return COMMON_WORDS.has(word.toLowerCase());
};

/**
 * Find keywords in content that can be linked to sources
 * @param {string} content - Text content
 * @param {Array} domainInfo - Domain information
 * @param {Object} options - Configuration options
 * @returns {Array} Linkable keywords with positions
 */
const findLinkableKeywords = (content, domainInfo, options = {}) => {
  const maxLinks = options.maxLinks || 5;
  const linkableKeywords = [];
  
  // Process each domain
  domainInfo.forEach(domain => {
    domain.urls.forEach(urlInfo => {
      // Process each keyword for this URL
      urlInfo.keywords.forEach(keyword => {
        if (keyword.length < 4) return; // Skip very short keywords
        
        // Look for keyword in content (case insensitive)
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        let match;
        
        while ((match = regex.exec(content)) !== null) {
          // Add this keyword if we haven't reached max links
          if (linkableKeywords.length < maxLinks) {
            linkableKeywords.push({
              keyword: match[0],
              url: urlInfo.url,
              index: match.index,
              length: match[0].length
            });
          }
        }
      });
    });
  });
  
  // Deduplicate and ensure no overlapping links
  return deduplicateLinks(linkableKeywords);
};

/**
 * Deduplicate links and prevent overlaps
 * @param {Array} links - Array of link objects
 * @returns {Array} Deduplicated links
 */
const deduplicateLinks = (links) => {
  if (links.length <= 1) return links;
  
  // Sort by position
  links.sort((a, b) => a.index - b.index);
  
  const result = [links[0]];
  
  for (let i = 1; i < links.length; i++) {
    const current = links[i];
    const previous = result[result.length - 1];
    
    // Check if this link overlaps with the previous one
    if (current.index > previous.index + previous.length) {
      // No overlap, add it
      result.push(current);
    }
  }
  
  return result;
};

/**
 * Insert hyperlinks into content
 * @param {string} content - Original content
 * @param {Array} links - Array of link objects
 * @returns {string} Content with hyperlinks
 */
const insertHyperlinks = (content, links) => {
  if (links.length === 0) return content;
  
  let result = '';
  let lastIndex = 0;
  
  // Insert each link
  links.forEach(link => {
    // Add text before the link
    result += content.substring(lastIndex, link.index);
    
    // Add the hyperlink
    result += `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="inline-source-link">${link.keyword}</a>`;
    
    // Update last index
    lastIndex = link.index + link.length;
  });
  
  // Add remaining text after last link
  result += content.substring(lastIndex);
  
  return result;
};

export default {
  generateInlineLinks
};
