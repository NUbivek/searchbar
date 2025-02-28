/**
 * accuracyData.js
 * Contains constants and configuration data for accuracy calculations
 */

// Display threshold for accuracy score (70%)
export const DISPLAY_THRESHOLD = 70;

// Source categories for reliability assessment
export const SOURCE_CATEGORIES = {
  HIGH_RELIABILITY: [
    '.gov', '.edu', 'reuters.com', 'bloomberg.com', 'ft.com',
    'wsj.com', 'economist.com', 'hbr.org', 'mckinsey.com',
    'nature.com', 'science.org', 'nejm.org', 'ieee.org',
    'acm.org', 'census.gov', 'bls.gov', 'nih.gov', 'cdc.gov'
  ],
  MEDIUM_RELIABILITY: [
    'news.', 'nytimes.com', 'washingtonpost.com', 'bbc.', 
    'cnn.com', 'forbes.com', 'harvard.edu', 'mit.edu',
    'stanford.edu', 'berkeley.edu', 'research.', 'data.',
    'statistics.', 'report.', 'analysis.'
  ],
  LOW_RELIABILITY: [
    'blog.', 'forum.', 'community.', 'answers.',
    'opinion.', 'personal.', 'user.', 'comment.'
  ]
};

// Fact-checking sources
export const FACT_CHECKING_SOURCES = [
  'factcheck.org',
  'politifact.com',
  'snopes.com',
  'apnews.com/hub/fact-check',
  'reuters.com/fact-check',
  'fullfact.org',
  'factcheckni.org',
  'africacheck.org',
  'checkyourfact.com',
  'thefactual.com'
];

// Citation quality indicators
export const CITATION_QUALITY = {
  HIGH_QUALITY: [
    /\[\d+\]/,                     // Academic citation format [1]
    /\(.*\d{4}.*\)/,               // Academic citation format (Author, 2023)
    /doi\.org\/[^\s]+/,            // DOI reference
    /pmid:\s*\d+/i,                // PubMed ID
    /isbn:\s*[\d-]+/i              // ISBN reference
  ],
  MEDIUM_QUALITY: [
    /according to [^,\.]+/i,       // Attribution to a source
    /cited by [^,\.]+/i,           // Reference to being cited
    /source: [^,\.]+/i,            // Source attribution
    /reported by [^,\.]+/i,        // Reporting attribution
    /published (in|by) [^,\.]+/i   // Publication attribution
  ],
  LOW_QUALITY: [
    /some say/i,                   // Vague attribution
    /people believe/i,             // Vague attribution
    /it is said/i,                 // Vague attribution
    /many think/i,                 // Vague attribution
    /experts suggest/i             // Vague expert attribution
  ]
};

// Statistical significance indicators
export const STATISTICAL_SIGNIFICANCE = {
  INDICATORS: [
    /p\s*<\s*0\.0\d+/,             // p-value notation
    /statistically significant/i,   // Explicit mention
    /confidence interval/i,         // CI mention
    /margin of error/i,             // MOE mention
    /standard deviation/i,          // SD mention
    /standard error/i,              // SE mention
    /t-test/i,                      // Statistical test mention
    /chi-square/i,                  // Statistical test mention
    /anova/i,                       // Statistical test mention
    /regression analysis/i          // Statistical method mention
  ]
};

// Data precision indicators
export const DATA_PRECISION = {
  HIGH_PRECISION: [
    /\d+\.\d{2,}%/,                // Percentage with 2+ decimal places
    /\$\d+\.\d{2,}/,               // Dollar amount with 2+ decimal places
    /\d+\.\d{3,}/                  // Number with 3+ decimal places
  ],
  MEDIUM_PRECISION: [
    /\d+\.\d{1,2}%/,               // Percentage with 1-2 decimal places
    /\$\d+\.\d{1,2}/,              // Dollar amount with 1-2 decimal places
    /\d+\.\d{1,2}/                 // Number with 1-2 decimal places
  ],
  LOW_PRECISION: [
    /approximately \d+/i,          // Approximate number
    /about \d+/i,                  // Approximate number
    /around \d+/i,                 // Approximate number
    /estimated \d+/i,              // Estimated number
    /roughly \d+/i                 // Rough number
  ]
};
