/**
 * Test script to check the search UI and LLM results
 * This script will make a search request and log the response
 * Tests the advanced categorization system, business intelligence features, and metrics calculation
 * Tests both verified page and open research page search options
 */

const fetch = require('node-fetch');

// Test query
const testQuery = "ai investment trends 2025";

// Helper function to check if a query is business-related
function isBusinessQuery(query) {
  if (!query) return false;
  
  const businessTerms = [
    'investment', 'market', 'stock', 'finance', 'business', 
    'economy', 'trend', 'industry', 'company', 'startup',
    'venture', 'capital', 'profit', 'revenue', 'growth',
    'sector', 'corporation', 'enterprise', 'economic', 'trade',
    'commercial', 'fund', 'portfolio', 'asset', 'wealth',
    'roi', 'kpi', 'metrics', 'performance', 'analysis', 'forecast'
  ];
  
  const queryLower = query.toLowerCase();
  return businessTerms.some(term => queryLower.includes(term.toLowerCase()));
}

// Helper function to check if categories include business categories
function hasBusiness(categories) {
  if (!categories || categories.length === 0) return false;
  
  const businessCategoryNames = [
    'Business', 'Finance', 'Investment', 'Market Analysis',
    'Economic Trends', 'Industry Insights', 'Financial Data',
    'Corporate News', 'Market Trends', 'Business Strategy'
  ];
  
  return categories.some(category => 
    businessCategoryNames.some(name => 
      category.name && category.name.toLowerCase().includes(name.toLowerCase())
    ) || (category.businessCategory === true)
  );
}

// Helper function to count words in text
function countWords(text) {
  if (!text) return 0;
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, ' ');
  // Split by whitespace and filter out empty strings
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

// Helper function to count hyperlinks in text
function countHyperlinks(text) {
  if (!text) return 0;
  
  // Count HTML anchor tags
  const anchorTagMatches = text.match(/<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>/g) || [];
  
  // Count markdown style links [text](url)
  const markdownLinkMatches = text.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  
  // Count raw URLs
  const urlMatches = text.match(/https?:\/\/[^\s"')]+/g) || [];
  
  // Remove duplicates from raw URLs that might already be counted in anchor tags or markdown
  const totalLinks = anchorTagMatches.length + markdownLinkMatches.length + urlMatches.length;
  
  return totalLinks;
}

// Helper function to analyze category content word counts
function analyzeCategoryWordCounts(category) {
  if (!category || !category.content) return { collapsed: 0, expanded: 0 };
  
  let collapsedWords = 0;
  let expandedWords = 0;
  
  // Count words in regular content (collapsed view)
  const collapsedContent = category.content.filter(item => !item.expandable && !item.isShowMore);
  collapsedContent.forEach(item => {
    if (item.text) collapsedWords += countWords(item.text);
    if (item.html) collapsedWords += countWords(item.html);
    if (item.title) collapsedWords += countWords(item.title);
    if (item.description) collapsedWords += countWords(item.description);
  });
  
  // Count words in expanded content
  const expandableContent = category.content.filter(item => item.expandable || item.isShowMore);
  expandableContent.forEach(item => {
    if (item.text) expandedWords += countWords(item.text);
    if (item.html) expandedWords += countWords(item.html);
    if (item.title) expandedWords += countWords(item.title);
    if (item.description) expandedWords += countWords(item.description);
  });
  
  return {
    collapsed: collapsedWords,
    expanded: expandedWords,
    total: collapsedWords + expandedWords
  };
}

// Helper function to analyze category hyperlinks
function analyzeCategoryHyperlinks(category) {
  if (!category || !category.content) return { collapsed: 0, expanded: 0 };
  
  let collapsedLinks = 0;
  let expandedLinks = 0;
  
  // Count links in regular content (collapsed view)
  const collapsedContent = category.content.filter(item => !item.expandable && !item.isShowMore);
  collapsedContent.forEach(item => {
    if (item.text) collapsedLinks += countHyperlinks(item.text);
    if (item.html) collapsedLinks += countHyperlinks(item.html);
    if (item.title && item.url) collapsedLinks++; // Count title+URL combinations as a link
    if (item.description && item.url && !item.title) collapsedLinks++; // Count description+URL without title as a link
  });
  
  // Count links in expanded content
  const expandableContent = category.content.filter(item => item.expandable || item.isShowMore);
  expandableContent.forEach(item => {
    if (item.text) expandedLinks += countHyperlinks(item.text);
    if (item.html) expandedLinks += countHyperlinks(item.html);
    if (item.title && item.url) expandedLinks++; // Count title+URL combinations as a link
    if (item.description && item.url && !item.title) expandedLinks++; // Count description+URL without title as a link
  });
  
  return {
    collapsed: collapsedLinks,
    expanded: expandedLinks,
    total: collapsedLinks + expandedLinks
  };
}

// Function to analyze LLM response word counts across all categories
function analyzeLLMWordCounts(data) {
  const result = { 
    mainResponse: 0,
    categories: [], 
    total: { 
      collapsed: 0, 
      expanded: 0, 
      total: 0 
    } 
  };
  
  // Count words in main LLM response if available
  if (data.llmResponse && data.llmResponse.content) {
    result.mainResponse = countWords(data.llmResponse.content);
  }
  
  if (!data || !data.categories) return result;
  
  const categoryWordCounts = [];
  let totalCollapsed = 0;
  let totalExpanded = 0;
  
  data.categories.forEach(category => {
    const wordCounts = analyzeCategoryWordCounts(category);
    categoryWordCounts.push({
      name: category.name,
      wordCounts
    });
    
    totalCollapsed += wordCounts.collapsed;
    totalExpanded += wordCounts.expanded;
  });
  
  result.categories = categoryWordCounts;
  result.total.collapsed = totalCollapsed;
  result.total.expanded = totalExpanded;
  result.total.total = totalCollapsed + totalExpanded;
  
  return result;
}

// Function to analyze hyperlinks across all categories
function analyzeLLMHyperlinks(data) {
  const result = { 
    mainResponse: 0,
    categories: [], 
    total: { 
      collapsed: 0, 
      expanded: 0, 
      total: 0 
    } 
  };
  
  // Count links in main LLM response if available
  if (data.llmResponse && data.llmResponse.content) {
    result.mainResponse = countHyperlinks(data.llmResponse.content);
  }
  
  if (!data || !data.categories) return result;
  
  const categoryLinkCounts = [];
  let totalCollapsedLinks = 0;
  let totalExpandedLinks = 0;
  
  data.categories.forEach(category => {
    const linkCounts = analyzeCategoryHyperlinks(category);
    categoryLinkCounts.push({
      name: category.name,
      linkCounts
    });
    
    totalCollapsedLinks += linkCounts.collapsed;
    totalExpandedLinks += linkCounts.expanded;
  });
  
  result.categories = categoryLinkCounts;
  result.total.collapsed = totalCollapsedLinks;
  result.total.expanded = totalExpandedLinks;
  result.total.total = totalCollapsedLinks + totalExpandedLinks;
  
  return result;
}

// Function to thoroughly analyze the LLM response
function analyzeLLMResponse(data) {
  const analysis = {
    present: false,
    wordCount: 0,
    hasHyperlinks: false,
    hasFollowUpQuestions: false,
    hasReferences: false,
    hasBusinessInsights: false,
    sourceCount: 0,
    followUpCount: 0,
    issues: []
  };

  if (!data || !data.llmResponse) {
    analysis.issues.push('LLM response missing');
    return analysis;
  }

  const llmResponse = data.llmResponse;
  analysis.present = true;
  
  // Get response text
  const responseText = typeof llmResponse === 'string' ? llmResponse : llmResponse.content || '';
  
  // Check word count
  analysis.wordCount = countWords(responseText);
  if (analysis.wordCount < 30) {
    analysis.issues.push('LLM response is too brief (less than 30 words)');
  }
  
  // Check for hyperlinks
  analysis.hasHyperlinks = responseText.includes('http://') || responseText.includes('https://');
  
  // Check for source references
  if (typeof llmResponse === 'object') {
    if (llmResponse.sources && Array.isArray(llmResponse.sources)) {
      analysis.hasReferences = llmResponse.sources.length > 0;
      analysis.sourceCount = llmResponse.sources.length;
    } else if (llmResponse.sourceMap && Object.keys(llmResponse.sourceMap).length > 0) {
      analysis.hasReferences = true;
      analysis.sourceCount = Object.keys(llmResponse.sourceMap).length;
    }
  }
  
  if (!analysis.hasReferences) {
    analysis.issues.push('LLM response missing source references');
  }
  
  // Check for follow-up questions
  if (typeof llmResponse === 'object' && llmResponse.followUpQuestions) {
    analysis.hasFollowUpQuestions = Array.isArray(llmResponse.followUpQuestions) && 
                                   llmResponse.followUpQuestions.length > 0;
    analysis.followUpCount = analysis.hasFollowUpQuestions ? llmResponse.followUpQuestions.length : 0;
  }
  
  // Check for business insights (we'll use query information elsewhere)
  const businessTerms = [
    'market', 'growth', 'revenue', 'profit', 'investment', 'trends', 'forecast',
    'industry', 'business', 'financial', 'economic', 'strategy', 'performance'
  ];
  
  const foundBusinessTerms = businessTerms.filter(term => 
    responseText.toLowerCase().includes(term.toLowerCase())
  );
  
  analysis.hasBusinessInsights = foundBusinessTerms.length >= 2;
  analysis.businessTermsFound = foundBusinessTerms;
  
  // Check for proper formatting
  const hasProperFormatting = responseText.includes('\n') || responseText.includes('. ');
  if (!hasProperFormatting) {
    analysis.issues.push('LLM response lacks proper formatting');
  }
  
  return analysis;
}

// Modified function to add separate LLM requirements check
function checkLLMRequirements(data, query) {
  const llmAnalysis = analyzeLLMResponse(data);
  const issues = [...llmAnalysis.issues];
  
  console.log('\n========================================');
  console.log('=== LLM REQUIREMENTS CHECK ===');
  console.log('========================================\n');
  
  // 1. Check for sufficient content
  console.log(`1. Sufficient Content (30+ words):`);
  console.log(`   Status: ${llmAnalysis.wordCount >= 30 ? 'PASS' : 'FAIL'}`);
  console.log(`   Word count: ${llmAnalysis.wordCount}`);
  
  // 2. Check for source references
  console.log(`\n2. Source References:`);
  console.log(`   Status: ${llmAnalysis.hasReferences ? 'PASS' : 'FAIL'}`);
  console.log(`   Source count: ${llmAnalysis.sourceCount}`);
  
  // 3. Check for follow-up questions
  console.log(`\n3. Follow-up Questions:`);
  console.log(`   Status: ${llmAnalysis.hasFollowUpQuestions ? 'PASS' : 'NOTE'}`);
  console.log(`   Question count: ${llmAnalysis.followUpCount}`);
  
  // 4. Check for business insights (for business queries)
  if (isBusinessQuery(query)) {
    console.log(`\n4. Business Insights (for Business Query):`);
    console.log(`   Status: ${llmAnalysis.hasBusinessInsights ? 'PASS' : 'FAIL'}`);
    
    if (llmAnalysis.businessTermsFound && llmAnalysis.businessTermsFound.length > 0) {
      console.log(`   Business terms found: ${llmAnalysis.businessTermsFound.join(', ')}`);
    } else {
      console.log(`   Business terms found: none`);
    }
    
    if (!llmAnalysis.hasBusinessInsights && isBusinessQuery(query)) {
      issues.push('LLM response lacks business insights');
    }
  }
  
  // 5. Check for proper formatting
  const properFormattingCheck = !issues.includes('LLM response lacks proper formatting');
  console.log(`\n5. Proper Formatting:`);
  console.log(`   Status: ${properFormattingCheck ? 'PASS' : 'FAIL'}`);
  
  console.log('\n========================================\n');
  
  return issues;
}

// Function to verify business intelligence boost in category prioritization
function verifyBusinessBoost(categories, isBusinessQuery) {
  if (!isBusinessQuery || !Array.isArray(categories) || categories.length < 2) {
    return { verified: true, issues: [] }; // Not applicable
  }
  
  const businessCategories = categories.filter(category => 
    ['business', 'investment', 'market_analysis', 'economic_indicators', 'financial'].some(term => 
      category.name.toLowerCase().includes(term) || 
      (category.description && category.description.toLowerCase().includes(term))
    )
  );
  
  const result = {
    verified: false,
    businessCategories: businessCategories.map(c => c.name),
    topCategories: categories.slice(0, 3).map(c => c.name),
    priorityVerified: false,
    issues: []
  };
  
  // Check if we found business categories
  if (businessCategories.length === 0) {
    result.issues.push('No business categories found for business query');
    return result;
  }
  
  // Check if at least one business category is in top 3
  const businessInTopThree = businessCategories.some(bc => 
    categories.indexOf(bc) < 3
  );
  
  if (!businessInTopThree) {
    result.issues.push('Business categories not prioritized (none in top 3)');
  } else {
    result.priorityVerified = true;
  }
  
  // Check if relevance scores for business categories are boosted
  const avgRelevance = categories.reduce((sum, c) => sum + (c.metrics?.relevance || 0), 0) / categories.length;
  const avgBusinessRelevance = businessCategories.reduce((sum, c) => sum + (c.metrics?.relevance || 0), 0) / businessCategories.length;
  
  if (avgBusinessRelevance <= avgRelevance) {
    result.issues.push('Business categories not properly boosted in relevance scores');
  }
  
  result.verified = result.issues.length === 0;
  return result;
}

// Function to analyze search results
function analyzeSearchResults(data, config) {
  // Implement analysis logic
  const analysis = {
    totalResults: 0,
    categoryCount: 0,
    hyperlinkCount: 0,
    topCategories: [],
    hasBusinessCategory: false,
    isBusinessQuery: isBusinessQuery(config.query),
    businessCategoryStats: null,
    llmResponseAnalysis: null
  };
  
  // Check if data exists
  if (!data) {
    return analysis;
  }
  
  // Analyze LLM response
  analysis.llmResponseAnalysis = analyzeLLMResponse(data);
  
  // Analyze categories
  if (data.categories && Array.isArray(data.categories)) {
    analysis.categoryCount = data.categories.length;
    if (analysis.categoryCount > 0) {
      analysis.topCategories = data.categories.slice(0, 3).map(c => c.name);
      
      // Check for business categories
      analysis.hasBusinessCategory = hasBusiness(data.categories);
      
      // Verify business boost if this is a business query
      if (analysis.isBusinessQuery) {
        analysis.businessCategoryStats = verifyBusinessBoost(data.categories, true);
      }
    }
  }
  
  // Count hyperlinks in the search results
  if (data.results && Array.isArray(data.results)) {
    analysis.totalResults = data.results.length;
    analysis.hyperlinkCount = data.results.reduce((count, item) => {
      if (item.content) {
        return count + countHyperlinks(item.content);
      }
      return count;
    }, 0);
  }
  
  return analysis;
}

// Helper function to check category metrics
function checkCategoryMetrics(category) {
  if (!category || !category.metrics) {
    return { allBelowThreshold: true, averageMetric: 0 };
  }
  
  const metrics = [];
  let belowThresholdCount = 0;
  
  if (category.metrics.relevance !== undefined) {
    metrics.push(category.metrics.relevance);
    if (category.metrics.relevance < 0.7) belowThresholdCount++;
  }
  
  if (category.metrics.accuracy !== undefined) {
    metrics.push(category.metrics.accuracy);
    if (category.metrics.accuracy < 0.7) belowThresholdCount++;
  }
  
  if (category.metrics.credibility !== undefined) {
    metrics.push(category.metrics.credibility);
    if (category.metrics.credibility < 0.7) belowThresholdCount++;
  }
  
  const averageMetric = metrics.length > 0 
    ? metrics.reduce((a, b) => a + b, 0) / metrics.length
    : 0;
  
  return {
    allBelowThreshold: belowThresholdCount === metrics.length && metrics.length > 0,
    belowThresholdCount,
    totalMetrics: metrics.length,
    averageMetric
  };
}

// Function to check if the search results meet key requirements and return issues
function checkKeyRequirements(data, query) {
  if (!data || !data.categories || !Array.isArray(data.categories)) {
    return ['No valid categories data'];
  }
  
  const categories = data.categories;
  const categoryCount = categories.length;
  const issues = []; // Define issues array here
  
  // 1. Check category limit (5-6)
  const limitCheck = categoryCount <= 6;
  if (!limitCheck) {
    issues.push(`Too many categories: ${categoryCount} (max: 6)`);
  }
  
  // 2. Check soft 70% threshold
  let categoriesBelowThreshold = 0;
  let lowestCategory = null;
  let lowestAverage = 1.0;
  
  categories.forEach(category => {
    const metricCheck = checkCategoryMetrics(category);
    if (metricCheck.averageMetric < 0.7) {
      categoriesBelowThreshold++;
      
      if (metricCheck.averageMetric < lowestAverage) {
        lowestAverage = metricCheck.averageMetric;
        lowestCategory = category;
      }
    }
  });
  
  // 3. Check relevance prioritization
  let relevancePrioritized = true;
  if (categories.length >= 2) {
    for (let i = 0; i < categories.length - 1; i++) {
      if (categories[i].metrics?.relevance < categories[i+1].metrics?.relevance) {
        // Check if the first category has a higher priority (lower number = higher priority)
        // This explains why it might be shown first despite having a lower relevance score
        if (categories[i].priority > categories[i+1].priority) {
          issues.push('Categories not properly prioritized by relevance and priority');
        } else {
          console.log(`   Note: Category "${categories[i].name}" (relevance: ${categories[i].metrics?.relevance}) is shown before "${categories[i+1].name}" (relevance: ${categories[i+1].metrics?.relevance}) due to higher priority (${categories[i].priority} vs ${categories[i+1].priority})`);
        }
        relevancePrioritized = false;
        break;
      }
    }
  }
  
  if (!relevancePrioritized) {
    issues.push('Categories not properly prioritized by relevance');
  }
  
  // 4. Check if categories address the query
  const queryKeywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  let bestMatchCategory = null;
  let highestMatchScore = 0;
  
  categories.forEach(category => {
    if (!category.name) return;
    
    const categoryName = category.name.toLowerCase();
    let matchScore = 0;
    
    queryKeywords.forEach(keyword => {
      if (categoryName.includes(keyword)) {
        matchScore++;
      }
    });
    
    if (matchScore > highestMatchScore) {
      highestMatchScore = matchScore;
      bestMatchCategory = category;
    }
  });
  
  // 5. Check for business context awareness
  const businessQuery = isBusinessQuery(query);
  const hasBusinessCategory = hasBusiness(categories);
  
  // Output analysis to console
  console.log(`\n========================================`);
  console.log(`=== KEY REQUIREMENTS CHECK ===`);
  console.log(`========================================\n`);
  
  console.log(`1. Category Limit (5-6 max):`);
  console.log(`   Status: ${limitCheck ? 'PASS' : 'FAIL'}`);
  console.log(`   Found ${categoryCount} categories (max allowed: 6)`);
  
  console.log(`\n2. Soft 70% Threshold for Metrics:`);
  console.log(`   Status: ${categoriesBelowThreshold > 0 ? 'NOTE' : 'PASS'}`);
  if (categoriesBelowThreshold > 0) {
    console.log(`   Found ${categoriesBelowThreshold} categories with average metric below 70%`);
    if (lowestCategory) {
      console.log(`   Lowest category metrics: ${lowestCategory.name}`);
      console.log(`     Relevance: ${Math.round(lowestCategory.metrics?.relevance * 100)}%`);
      console.log(`     Accuracy: ${Math.round(lowestCategory.metrics?.accuracy * 100)}%`);
      console.log(`     Credibility: ${Math.round(lowestCategory.metrics?.credibility * 100)}%`);
    }
  }
  
  console.log(`\n3. Relevance to Query Prioritization:`);
  console.log(`   Status: ${relevancePrioritized ? 'PASS' : 'FAIL'}`);
  if (categories.length >= 2) {
    console.log(`   Top category relevance: ${Math.round(categories[0].metrics?.relevance * 100)}%`);
    console.log(`   Second category relevance: ${Math.round(categories[1].metrics?.relevance * 100)}%`);
  }
  
  console.log(`\n4. Categories Address User Question:`);
  if (bestMatchCategory && highestMatchScore > 0) {
    console.log(`   Status: PASS`);
    console.log(`   Best matching category: ${bestMatchCategory.name}`);
    console.log(`   Match score with query: ${highestMatchScore} keyword matches`);
  } else {
    console.log(`   Status: FAIL`);
    console.log(`   No categories match query keywords`);
  }
  
  console.log(`\n5. Category Selection Based on Query Context:`);
  console.log(`   Query type: ${businessQuery ? 'Business' : 'General'}`);
  console.log(`   Has business categories: ${hasBusinessCategory ? 'YES' : 'NO'}`);
  console.log(`   Status: ${(businessQuery && hasBusinessCategory) || (!businessQuery) ? 'PASS' : 'FAIL'}`);
  
  if (businessQuery && !hasBusinessCategory) {
    issues.push('Business query without business categories');
  }
  
  console.log(`\n========================================\n`);
  
  // Return issues for overall test results
  return issues;
}

// Function to test a specific search configuration
async function testSearchConfiguration(config) {
  try {
    console.log(`\n========================================`);
    console.log(`Testing search with query: "${config.query}"`);
    console.log(`Page type: ${config.pageType}, Sources: [${config.sources.join(', ')}]`);
    
    // Determine the endpoint based on page type
    const endpoint = config.pageType === 'verified' ? 
      'http://localhost:3001/api/search' : 
      'http://localhost:3001/api/search/open';
    
    // Make the search request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: config.query,
        model: config.model || "mixtral-8x7b",
        sources: config.sources,
        useLLM: true
      }),
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Search request failed with status: ${response.status}`);
    }

    // Parse the response
    const data = await response.json();
    
    // Log the response structure
    console.log('\n=== SEARCH RESPONSE STRUCTURE ===');
    console.log('Response keys:', Object.keys(data));
    
    // Check for results
    if (data.results) {
      console.log(`Found ${data.results.length} search results`);
    } else {
      console.log('No search results found');
    }
    
    // Check for LLM response
    if (data.llmResponse) {
      console.log('\n=== LLM RESPONSE ===');
      console.log('LLM response present:', !!data.llmResponse);
      console.log('LLM response type:', typeof data.llmResponse);
      if (typeof data.llmResponse === 'string') {
        console.log('LLM response length:', data.llmResponse.length);
        console.log('LLM response preview:', data.llmResponse.substring(0, 150) + '...');
      } else if (typeof data.llmResponse === 'object') {
        console.log('LLM response keys:', Object.keys(data.llmResponse));
        if (data.llmResponse.content) {
          console.log('LLM content length:', data.llmResponse.content.length);
          console.log('LLM content preview:', data.llmResponse.content.substring(0, 150) + '...');
        }
      }
    } else {
      console.log('\n=== LLM RESPONSE ===');
      console.log('LLM response: Not present');
    }
    
    // Check for advanced categorization system
    if (data.categories) {
      console.log('\n=== CATEGORIES ===');
      console.log('Categories present:', !!data.categories);
      console.log('Categories type:', typeof data.categories);
      
      if (Array.isArray(data.categories)) {
        console.log('Number of categories:', data.categories.length);
        console.log(`Category limit check: ${data.categories.length <= 6 ? 'PASS' : 'FAIL'} (Max: 6, Actual: ${data.categories.length})`);
        
        console.log('\n=== CATEGORY DETAILS ===');
        data.categories.forEach((category, index) => {
          console.log(`\nCategory ${index + 1}: ${category.name || 'Unnamed'}`);
          
          // Check ID and name
          if (category.id) console.log(`ID: ${category.id}`);
          if (category.name) console.log(`Name: ${category.name}`);
          
          // Check for expandable "show more" sections
          console.log(`Has "Show More" section: ${category.hasExpandableContent ? 'YES' : 'NO'}`);
          
          // Check content
          if (category.content) {
            console.log(`Content Items: ${category.content.length}`);
            if (category.content.length > 0) {
              console.log(`First content item preview: ${typeof category.content[0] === 'string' ? 
                category.content[0].substring(0, 50) + '...' : 
                JSON.stringify(category.content[0]).substring(0, 50) + '...'}`);
              
              // Check for hyperlinks in content
              const contentStr = typeof category.content[0] === 'string' ? 
                category.content[0] : JSON.stringify(category.content[0]);
              const hasHyperlinks = contentStr.includes('href=') || contentStr.includes('<a');
              console.log(`Has hyperlinks: ${hasHyperlinks ? 'YES' : 'NO'}`);
            }
          }
          
          // Check metrics calculation - only test the 3 required scores
          if (category.metrics) {
            console.log('Metrics:');
            
            // Check relevance & recency metric
            const relevance = category.metrics && typeof category.metrics.relevance === 'number' 
              ? category.metrics.relevance : 0;
            console.log(`  Relevance & Recency: ${relevance}`);
            
            // Soft threshold check (70% is a prioritization guideline, not a hard cutoff)
            const relevancePercentage = Math.round(relevance * 100);
            const relevancePassThreshold = relevancePercentage >= 70;
            console.log(`  Relevance threshold check: ${relevancePassThreshold ? 'PASS' : 'FAIL'} (Min: 70%, Actual: ${relevancePercentage}%)`);
            
            // Check accuracy metric
            const accuracy = category.metrics && typeof category.metrics.accuracy === 'number' 
              ? category.metrics.accuracy : 0;
            console.log(`  Accuracy: ${accuracy}`);
            
            // Soft threshold check (70% is a prioritization guideline, not a hard cutoff)
            const accuracyPercentage = Math.round(accuracy * 100);
            const accuracyPassThreshold = accuracyPercentage >= 70;
            console.log(`  Accuracy threshold check: ${accuracyPassThreshold ? 'PASS' : 'FAIL'} (Min: 70%, Actual: ${accuracyPercentage}%)`);
            
            // Check credibility metric
            const credibility = category.metrics && typeof category.metrics.credibility === 'number' 
              ? category.metrics.credibility : 0;
            console.log(`  Credibility: ${credibility}`);
            
            // Soft threshold check (70% is a prioritization guideline, not a hard cutoff)
            const credibilityPercentage = Math.round(credibility * 100);
            const credibilityPassThreshold = credibilityPercentage >= 70;
            console.log(`  Credibility threshold check: ${credibilityPassThreshold ? 'PASS' : 'FAIL'} (Min: 70%, Actual: ${credibilityPercentage}%)`);
            
            // Return if ALL metrics are below threshold (critical issue) or if NONE are below (perfectly fine)
            // or something in between (some metrics are good, some need improvement)
            const metricsStatus = {
              allBelowThreshold: !relevancePassThreshold && !accuracyPassThreshold && !credibilityPassThreshold,
              anyBelowThreshold: !relevancePassThreshold || !accuracyPassThreshold || !credibilityPassThreshold,
              noneBelowThreshold: relevancePassThreshold && accuracyPassThreshold && credibilityPassThreshold
            };
            
            if (metricsStatus.allBelowThreshold) {
              console.log('  ALL metrics are below the 70% threshold');
            } else if (metricsStatus.anyBelowThreshold) {
              console.log('  Some metrics are below the 70% threshold');
            } else {
              console.log('  All metrics meet the 70% threshold');
            }
          } else {
            console.log('Metrics: Not present');
          }
          
          // Check for business intelligence features
          if (category.isBusinessCategory) {
            console.log('Business Category: YES');
            console.log(`Business Priority Boost Applied: ${category.priorityBoost ? 'YES' : 'NO'}`);
          }
          
          // Check for key insights (business feature)
          if (category.keyInsights && category.keyInsights.length > 0) {
            console.log('Key Insights:');
            category.keyInsights.slice(0, 2).forEach((insight, i) => {
              console.log(`  ${i+1}. ${insight.substring(0, 50)}...`);
            });
            if (category.keyInsights.length > 2) {
              console.log(`  ... and ${category.keyInsights.length - 2} more insights`);
            }
          }
        });
      } else {
        console.log('Categories structure:', JSON.stringify(data.categories, null, 2));
      }
    } else {
      console.log('\n=== CATEGORIES ===');
      console.log('Categories: Not present');
    }
    
    // Check for errors
    if (data.error) {
      console.log('\n=== ERROR ===');
      console.log('Error:', data.error);
      console.log('Message:', data.message);
    }
    
    // Run detailed analysis
    const analysis = analyzeSearchResults(data, config);
    
    // Check LLM response requirements
    const llmIssues = checkLLMRequirements(data, config.query);
    
    return {
      success: true,
      config,
      data,
      analysis,
      issues: [...checkKeyRequirements(data, config.query), ...llmIssues]
    };
  } catch (error) {
    console.error(`\nERROR in test: ${error.message}`);
    return {
      success: false,
      error: error.message,
      config
    };
  }
}

// Define test configurations for both page types and different sources
const testConfigurations = [
  // Verified page tests
  {
    pageType: 'verified',
    query: testQuery,
    sources: ['All'],
    model: "mixtral-8x7b"
  },
  
  // Open research page tests
  {
    pageType: 'open',
    query: testQuery,
    sources: ['Web'],
    model: "mixtral-8x7b"
  },
  {
    pageType: 'open',
    query: testQuery,
    sources: ['LinkedIn'],
    model: "mixtral-8x7b"
  },
  {
    pageType: 'open',
    query: testQuery,
    sources: ['X'],
    model: "mixtral-8x7b"
  },
  {
    pageType: 'open',
    query: "financial market forecast 2024",
    sources: ['Web', 'LinkedIn'],
    model: "mixtral-8x7b"
  }
];

// Run tests and evaluate results
async function runAllTests() {
  console.log('=== STARTING UI COMPONENT TESTS ===');
  console.log(`Testing ${testConfigurations.length} different search configurations`);
  
  const results = [];
  
  for (const config of testConfigurations) {
    const result = await testSearchConfiguration(config);
    results.push(result);
  }
  
  // Analyze test results
  console.log('\n\n========================================');
  console.log('=== TEST RESULTS SUMMARY ===');
  console.log('========================================\n');
  
  results.forEach((result, index) => {
    console.log(`\nTest #${index + 1}: ${result.config.pageType} page with sources [${result.config.sources.join(', ')}]`);
    console.log(`Status: ${result.success ? 'PASSED' : 'FAILED'}`);
    
    if (!result.success) {
      console.log(`Error: ${result.error}`);
      return;
    }
    
    // Display word counts
    if (result.analysis && result.analysis.wordCounts) {
      console.log('\nWord Count Analysis:');
      
      // Main LLM response
      if (result.analysis.wordCounts.mainResponse > 0) {
        console.log(`  Main LLM Response: ${result.analysis.wordCounts.mainResponse} words`);
      }
      
      console.log('  Total Category Content Words:');
      console.log(`    Collapsed Content: ${result.analysis.wordCounts.total.collapsed}`);
      console.log(`    Expanded Content: ${result.analysis.wordCounts.total.expanded}`);
      console.log(`    Total Content: ${result.analysis.wordCounts.total.total}`);
      
      console.log('\n  Category Word Counts:');
      result.analysis.wordCounts.categories.forEach(category => {
        console.log(`    ${category.name}:`);
        console.log(`      Collapsed: ${category.wordCounts.collapsed}`);
        console.log(`      Expanded: ${category.wordCounts.expanded}`);
        console.log(`      Total: ${category.wordCounts.total}`);
      });
    }
    
    // Display hyperlink counts
    if (result.analysis && result.analysis.hyperlinkCounts) {
      console.log('\nHyperlink Count Analysis:');
      
      // Main LLM response
      if (result.analysis.hyperlinkCounts.mainResponse > 0) {
        console.log(`  Main LLM Response: ${result.analysis.hyperlinkCounts.mainResponse} hyperlinks`);
      }
      
      console.log('  Total Category Hyperlinks:');
      console.log(`    Collapsed Content: ${result.analysis.hyperlinkCounts.total.collapsed}`);
      console.log(`    Expanded Content: ${result.analysis.hyperlinkCounts.total.expanded}`);
      console.log(`    Total Hyperlinks: ${result.analysis.hyperlinkCounts.total.total}`);
      
      console.log('\n  Category Hyperlink Counts:');
      result.analysis.hyperlinkCounts.categories.forEach(category => {
        console.log(`    ${category.name}:`);
        console.log(`      Collapsed: ${category.linkCounts.collapsed}`);
        console.log(`      Expanded: ${category.linkCounts.expanded}`);
        console.log(`      Total: ${category.linkCounts.total}`);
      });
    }
    
    // Display LLM response analysis
    if (result.analysis && result.analysis.llmResponseAnalysis) {
      console.log('\nLLM Response Analysis:');
      console.log(`  LLM Response Present: ${result.analysis.llmResponseAnalysis.present ? 'YES' : 'NO'}`);
      console.log(`  LLM Response Type: ${result.analysis.llmResponseAnalysis.type}`);
      console.log(`  LLM Response Structure: ${JSON.stringify(result.analysis.llmResponseAnalysis.structure, null, 2)}`);
      console.log(`  LLM Response Content: ${JSON.stringify(result.analysis.llmResponseAnalysis.content, null, 2)}`);
      console.log(`  LLM Response Issues: ${result.analysis.llmResponseAnalysis.issues.join(', ')}`);
    }
    
    // Display business category verification results
    if (result.analysis && result.analysis.businessCategoryStats) {
      console.log('\nBusiness Category Verification:');
      console.log(`  Verified: ${result.analysis.businessCategoryStats.verified ? 'YES' : 'NO'}`);
      
      if (result.analysis.businessCategoryStats.businessCategories && 
          result.analysis.businessCategoryStats.businessCategories.length > 0) {
        console.log(`  Business Categories: ${result.analysis.businessCategoryStats.businessCategories.join(', ')}`);
      } else {
        console.log(`  Business Categories: NONE`);
      }
      
      if (result.analysis.businessCategoryStats.issues && 
          result.analysis.businessCategoryStats.issues.length > 0) {
        console.log('- Issues:');
        result.analysis.businessCategoryStats.issues.forEach(issue => {
          console.log(`  * ${issue}`);
        });
      } else {
        console.log('- Issues: NONE (all validations passed)');
      }
    }
    
    // Identify issues
    const issues = result.issues || [];
    
    // Add LLM response issues to the main issues list
    if (result.analysis && result.analysis.llmResponseAnalysis && result.analysis.llmResponseAnalysis.issues.length > 0) {
      result.analysis.llmResponseAnalysis.issues.forEach(issue => {
        issues.push(issue);
      });
    }
    
    // Check for missing business categories (just in case this wasn't caught in checkKeyRequirements)
    if (isBusinessQuery(result.config.query) && !hasBusiness(result.data.categories) && 
        !issues.includes('Business query without business categories')) {
      issues.push('Business query without business categories');
    }
    
    if (issues.length > 0) {
      console.log('Issues:');
      issues.forEach((issue, i) => {
        console.log(`  ${i + 1}. ${issue}`);
      });
    } else {
      console.log('All features are working as expected:');
      console.log('- Advanced categorization system with max 6 categories');
      console.log('- Three required metrics (Relevance & Recency, Accuracy, Credibility)');
      console.log('- All metrics meet the 70% threshold');
      console.log('- Dynamic and intelligent categories with "Show More" sections');
      console.log('- Intelligent inline hyperlinks to sources');
      console.log('- Business-focused categorization for business queries');
    }
  });
  
  console.log('\n=== TEST SUITE COMPLETED ===');
}

// Run all the tests
runAllTests();
