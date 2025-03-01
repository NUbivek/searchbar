import { searchVerifiedSources } from '../../../utils/verifiedSearch';
import { searchOpenSources } from '../../../utils/openSearch';
import { processWithLLM } from '../../../utils/llmProcessing';
import { deepWebSearch } from '../../../utils/deepWebSearch';
import { logger } from '../../../utils/logger';
import CategoryFinder from '../../../components/search/categories/CategoryFinder';
import { findBestCategories } from '../../../components/search/categories/processors/CategoryFinder';
import MetricsCalculator from '../../../components/search/metrics/MetricsCalculator';
import { processCategories } from '../../../components/search/categories/processors/CategoryProcessor';
import searchResultScorer from '../../../utils/scoring/SearchResultScorer';
import { detectQueryContext } from '../../../components/search/utils/contextDetector';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, mode = 'verified', model = 'mixtral-8x7b', sources = ['Web'], customUrls = [], files = [], useLLM = true } = req.body;

    if (!query) {
      console.log('DEBUG: Search API - Missing query in request body');
      return res.status(400).json({ error: 'Query is required' });
    }

    // Log incoming search request
    console.log('DEBUG: Search API - Received request:', {
      query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      mode,
      model,
      sources,
      useLLM
    });

    // Verify API keys and configuration
    console.log('DEBUG: Environment variables check:', {
      TOGETHER_API_KEY: process.env.TOGETHER_API_KEY ? 'Set (starts with: ' + process.env.TOGETHER_API_KEY.substring(0, 5) + '...)' : 'Not set',
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY ? 'Set (starts with: ' + process.env.PERPLEXITY_API_KEY.substring(0, 5) + '...)' : 'Not set',
      SERPER_API_KEY: process.env.SERPER_API_KEY ? 'Set (starts with: ' + process.env.SERPER_API_KEY.substring(0, 5) + '...)' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set',
      BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'Not set'
    });

    // Verify that the SERPER_API_KEY is valid (has correct format)
    if (!process.env.SERPER_API_KEY || process.env.SERPER_API_KEY.length < 20) {
      console.error('ERROR: SERPER_API_KEY is missing or appears to be invalid');
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'The search API key is missing or invalid. Please check your environment configuration.'
      });
    }

    // Verify Serper API connectivity directly
    try {
      console.log('DEBUG: Verifying Serper API connectivity...');
      const axios = require('axios');
      const testResponse = await axios.post('https://google.serper.dev/search', 
        { 
          q: 'test connectivity',
          num: 1,
          gl: 'us',
          hl: 'en'
        },
        { 
          headers: { 
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (testResponse.status === 200) {
        console.log('DEBUG: Serper API connectivity verified successfully');
      } else {
        console.warn('WARNING: Serper API returned non-200 status:', testResponse.status);
      }
    } catch (apiError) {
      console.error('ERROR: Failed to verify Serper API connectivity:', apiError.message);
      // Continue anyway, as this is just a connectivity test
    }

    logger.info('Search request', { query, mode, model, sources });
    console.log('DEBUG: Search request details:', { 
      query, 
      mode, 
      model, 
      sources, 
      customUrlsCount: customUrls.length,
      filesCount: files.length,
      useLLM
    });

    let results = [];

    // Try multiple search modes if the primary one fails
    if (mode === 'verified') {
      console.log('DEBUG: Using verified search mode');
      try {
        results = await deepWebSearch(query, { numResults: 20 });
        console.log(`DEBUG: Web search returned ${results.length} results`);
      } catch (error) {
        console.error('ERROR: Web search failed:', error.message);
        
        // If all searches fail, return a helpful error
        if (results.length === 0) {
          return res.status(500).json({ 
            error: 'Search failed',
            message: 'No results found from any verified sources. Errors: ' + error.message
          });
        }
      }
    } else if (sources.includes('Web')) {
      console.log('DEBUG: Using web search mode');
      try {
        results = await deepWebSearch(query, { numResults: 30 });
        console.log(`DEBUG: Web search returned ${results.length} results`);
      } catch (error) {
        console.error('ERROR: Web search failed:', error.message);
        
        // If web search fails, return a helpful error
        if (results.length === 0) {
          return res.status(500).json({ 
            error: 'Search failed',
            message: 'No results found from any verified sources. Errors: ' + error.message
          });
        }
      }
    } else {
      console.log('DEBUG: Using open sources search mode');
      try {
        results = await deepWebSearch(query, { numResults: 20 });
        console.log(`DEBUG: Web search returned ${results.length} results`);
      } catch (error) {
        console.error('ERROR: Web search failed:', error.message);
        
        // If open sources search fails, return a helpful error
        if (results.length === 0) {
          return res.status(500).json({ 
            error: 'Search failed',
            message: 'No results found from any verified sources. Errors: ' + error.message
          });
        }
      }
    }

    // Log initial results structure
    if (results.length > 0) {
      console.log('DEBUG: Initial results structure sample:', {
        firstResultKeys: Object.keys(results[0]),
        hasTitle: !!results[0].title,
        hasContent: !!results[0].content,
        hasUrl: !!results[0].url,
        hasSource: !!results[0].source
      });
    } else {
      console.log('DEBUG: No results returned from search');
    }

    // After fetching results, calculate metrics for all results using the SearchResultScorer
    if (results && results.length > 0) {
      console.log(`DEBUG: Calculating metrics for ${results.length} results`);
      
      // Detect query context for more accurate scoring
      const queryContext = detectQueryContext(query);
      console.log('DEBUG: Detected query context:', queryContext);
      
      // Score results using the dedicated scorer
      results = searchResultScorer.scoreResults(results, query, {
        context: queryContext,
        recalculateMetrics: true, // Force recalculation
        sourceType: mode // Pass the search mode for context
      });
      
      // Filter results based on metrics
      results = searchResultScorer.filterByMetrics(results, {
        // Customize thresholds based on search mode
        relevanceThreshold: mode === 'verified' ? 0.6 : 0.5,
        overallThreshold: mode === 'verified' ? 0.65 : 0.55
      });
      
      // Sort results by overall score
      results = searchResultScorer.sortByMetric(results, 'overall');
      
      console.log('DEBUG: Results after metrics calculation:', {
        count: results.length,
        hasMetrics: results.length > 0 ? !!results[0].metrics : false,
        topResultScore: results.length > 0 ? results[0].metrics?.overall : 'N/A'
      });
    }

    // If LLM processing is enabled, try to get a response
    let llmResponse = null;
    if (useLLM && model && results.length > 0) {
      const model = 'mixtral-8x7b'; // Default to mixtral
      
      try {
        console.log(`Processing ${results.length} results with LLM model: ${model}`);
        console.log(`API key check - Together API: ${process.env.TOGETHER_API_KEY ? process.env.TOGETHER_API_KEY.substring(0, 5) + '...' : 'MISSING'}`);
        console.log(`API key check - Perplexity API: ${process.env.PERPLEXITY_API_KEY ? process.env.PERPLEXITY_API_KEY.substring(0, 5) + '...' : 'MISSING'}`);
        
        // Validate and prepare sources before sending to LLM
        const validSources = results.filter(result => {
          // Ensure each result has at least title or content
          const hasContent = result && (result.content || result.snippet || result.description);
          const hasTitle = result && result.title;
          return hasContent || hasTitle;
        }).map(result => {
          // Normalize source format
          return {
            title: result.title || 'Untitled',
            content: result.content || result.snippet || result.description || 'No content available',
            url: result.url || result.link || '',
            source: result.source || result.domain || ''
          };
        });
        
        // Log source validation results
        console.log('DEBUG: Sources validation for LLM:', {
          originalCount: results.length,
          validCount: validSources.length,
          firstSourceSample: validSources.length > 0 ? {
            hasTitle: !!validSources[0].title,
            hasContent: !!validSources[0].content,
            contentLength: validSources[0].content?.length || 0
          } : 'No valid sources'
        });
        
        // Only proceed if we have valid sources
        if (validSources.length === 0) {
          console.warn('No valid sources for LLM processing');
          llmResponse = {
            content: "I couldn't find any valid content to analyze for your query. Please try a different search query.",
            error: "No valid sources",
            followUpQuestions: [
              "Would you like to try a different search query?",
              "Can I help you refine your search?"
            ]
          };
        } else {
          // Call processWithLLM with individual parameters
          llmResponse = await processWithLLM(
            query,
            validSources,
            model,
            process.env.TOGETHER_API_KEY
          );
          
          console.log('DEBUG: LLM Response:', {
            hasResponse: !!llmResponse,
            contentLength: llmResponse?.content?.length || 0,
            hasCategories: !!llmResponse?.categories,
            hasFollowUp: Array.isArray(llmResponse?.followUpQuestions)
          });
        }
        
        console.log('LLM processing completed successfully');
      } catch (error) {
        console.error("Error processing with LLM:", error);
      }
    }

    // Process categories using CategoryFinder
    const categoryFinder = new CategoryFinder();
    let categories = [];
    
    try {
      console.log(`Processing ${results.length} items into categories with query: "${query}"`);
      
      // Detect query context if not already done
      const queryContext = detectQueryContext(query);
      console.log('Query context detected:', queryContext);
      
      // Force a wider range of categories by setting debug mode
      categories = await processCategories(results, query, { 
        categoryFinder,
        includeBusinessMetrics: true,
        llmResponse,
        debug: true,  // Enable debug mode for more verbose output
        showDebug: true, // Show debug info
        forceMultipleCategories: true, // Force creation of multiple categories
        context: queryContext, // Pass context to category processor
        maxCategories: 6, // Limit to max 6 categories for UI display
        prioritizeKeyInsights: true, // Always prioritize Key Insights category
        enrichContent: true, // Enable content enrichment for better categorization
        useLLMCategories: !!llmResponse?.categories // Use categories from LLM if available
      });
      
      // Ensure categories is always an array
      if (!Array.isArray(categories)) {
        console.warn('Categories is not an array, converting to array:', categories);
        categories = categories ? [categories] : [];
      }
      
      // Score and prioritize categories based on query context
      if (categories.length > 0) {
        // Apply scoring to categories
        categories = searchResultScorer.scoreCategories(categories, query, {
          context: queryContext,
          recalculateMetrics: true
        });
        
        // Prioritize categories based on query context
        categories = searchResultScorer.prioritizeCategories(categories, queryContext);
      }
      
      console.log(`Generated ${categories.length} initial categories with details:`, categories.map(c => ({
        id: c.id,
        name: c.name, 
        itemCount: c.content?.length || 0,
        score: c.metrics?.overall || 'N/A'
      })));
    } catch (categoryError) {
      console.error('Error processing categories:', categoryError);
      categories = [];
    }
    
    // If no categories were found but we have results, create a default category
    if ((!categories || categories.length === 0) && results.length > 0) {
      console.log('Creating default category since no categories were found');
      
      // Create a generic "Search Results" category
      categories = [{
        id: 'searchResults',
        name: 'Search Results',
        description: 'General search results for your query',
        icon: 'search',
        color: '#4285F4',
        content: results,
        metrics: {
          relevance: 0.7,
          accuracy: 0.6,
          credibility: 0.6,
          overall: 0.65
        }
      }];
    }

    // Prioritize Key Insights category if it exists
    const prioritizeKeyInsights = (categoriesArray) => {
      if (!Array.isArray(categoriesArray) || categoriesArray.length <= 1) {
        return categoriesArray;
      }
      
      // Find Key Insights category
      const keyInsightsIndex = categoriesArray.findIndex(cat => 
        cat.id === 'key-insights' || cat.id === 'key_insights' || cat.name === 'Key Insights'
      );
      
      // If Key Insights exists but isn't first, move it to the beginning
      if (keyInsightsIndex > 0) {
        console.log('API: Moving Key Insights category to first position');
        const keyInsightsCat = categoriesArray[keyInsightsIndex];
        const newCategoriesArray = [keyInsightsCat];
        
        // Add the rest of the categories
        categoriesArray.forEach((cat, index) => {
          if (index !== keyInsightsIndex) {
            newCategoriesArray.push(cat);
          }
        });
        
        return newCategoriesArray;
      }
      
      return categoriesArray;
    };
    
    // Apply prioritization
    const prioritizedCategories = prioritizeKeyInsights(categories);
    
    console.log(`Returning ${prioritizedCategories.length} final categories with details:`, prioritizedCategories.map(c => ({
      id: c.id,
      name: c.name, 
      itemCount: c.content?.length || 0
    })));
    
    // Return the response with categories
    return res.status(200).json({
      results,
      query,
      timestamp: new Date().toISOString(),
      llmResponse: llmResponse?.content || null,
      categories: Array.isArray(prioritizedCategories) ? prioritizedCategories : []
    });
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message
    });
  }
}
