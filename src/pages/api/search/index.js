import unifiedSearch from '../../../utils/search-legacy';
import { processWithLLM } from '../../../utils/llmProcessing';
import { synthesizeFromResults } from '../../../utils/fallbackSynthesizer';
import { isLLMResult } from '../../../utils/llm/resultDetector';
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
    let { query, mode = 'verified', model = 'mistral-7b', sources = ['Web'], customUrls = [], files = [], useLLM = true } = req.body;
    
    // Normalize model ID in case older format is passed
    const modelMap = {
      'mistral': 'mistral-7b',
      'llama': 'llama-13b',
      'gemma': 'gemma-27b',
      'mixtral-8x7b': 'mistral-7b' // Legacy model ID mapping
    };
    
    // Convert old model ID to new standardized format if needed
    if (modelMap[model]) {
      console.log(`Converting legacy model ID '${model}' to standardized ID '${modelMap[model]}'`);
      model = modelMap[model];
    }

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
    // Record the start time for performance tracking
    const startTime = Date.now();
    
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

    // Perform search using the unified search function
    console.log('DEBUG: Starting unified search');
    try {
      const searchResults = await unifiedSearch({
        query,
        mode,
        model,
        sources,
        customUrls,
        uploadedFiles: files
      });
      
      // Extract results from the search result object
      results = searchResults.results || [];
      
      console.log(`DEBUG: Unified search returned results:`, {
        resultCount: results.length,
        mode,
        sources
      });
    } catch (error) {
      console.error('ERROR: Search failed:', error.message);
      
      // If search fails, return a helpful error
      if (!results || results.length === 0) {
        return res.status(500).json({ 
          error: 'Search failed',
          message: 'No results found. Error: ' + error.message
        });
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

    // Process search results through LLM if requested or by default
    let llmResponse = null;
    // Explicitly check if LLM processing should be enabled
    // Only consider it disabled if useLLM is explicitly set to false
    const shouldUseLLM = useLLM === true || 
                        req.body.shouldUseLLM === true ||
                        req.body.forceLLM === true || 
                        (useLLM !== false && (req.body.useLLM !== false));
    
    console.log(`LLM Processing: ${shouldUseLLM ? 'ENABLED' : 'DISABLED'} (useLLM=${useLLM})`, {
      useLLM: useLLM,
      bodyUseLLM: req.body.useLLM,
      bodyShouldUseLLM: req.body.shouldUseLLM,
      bodyForceLLM: req.body.forceLLM,
      model: model
    });
    
    // Track if we need to use the fallback synthesizer
    let useFallbackSynthesizer = false;
    
    if (results.length > 0 && shouldUseLLM) {
      // Use the model from the request or default to mixtral-8x7b
      const llmModel = model || 'mixtral-8x7b';
      
      try {
        console.log(`Processing ${results.length} results with LLM model: ${llmModel}`);
        console.log(`API key check - Together API: ${process.env.TOGETHER_API_KEY ? 'Valid key (starts with ' + process.env.TOGETHER_API_KEY.substring(0, 5) + '...)' : 'MISSING'}`);
        console.log(`API key length check: ${process.env.TOGETHER_API_KEY ? process.env.TOGETHER_API_KEY.length + ' characters' : 'No key'}`);
        
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
          // Force a properly formatted API key for Together API
          const apiKey = process.env.TOGETHER_API_KEY;
          
          if (!apiKey || apiKey.length < 64) {
            throw new Error(`Invalid Together API key: Key is too short (${apiKey?.length || 0} chars). Together API keys should be at least 64 characters long.`);
          }
          
          // Process with LLM with detailed logging
          console.log('Calling processWithLLM with query:', query.substring(0, 30) + '...');
          llmResponse = await processWithLLM(
            query,
            validSources,
            llmModel,
            apiKey
          );
          
          // Add necessary flags to ensure proper detection & display
          llmResponse = {
            ...llmResponse,
            __isImmutableLLMResult: true,
            llmProcessed: true,
            isLLMResults: true,
            query: query
          };
          
          console.log('DEBUG: LLM Response:', {
            hasResponse: !!llmResponse,
            contentLength: typeof llmResponse?.content === 'string' ? llmResponse.content.length : 
                         Array.isArray(llmResponse?.content) ? llmResponse.content.length : 'unknown',
            hasCategories: !!llmResponse?.categories,
            hasFollowUp: Array.isArray(llmResponse?.followUpQuestions)
          });
        }
        
        console.log('LLM processing completed successfully');
      } catch (error) {
        console.error("Error processing with LLM:", error);
        useFallbackSynthesizer = true;
      }
    }
    
    // Use fallback synthesizer if LLM processing failed or didn't produce proper results
    if (shouldUseLLM && (useFallbackSynthesizer || !llmResponse || !isLLMResult(llmResponse))) {
      console.log('Using fallback synthesizer to create LLM-like response from search results');
      llmResponse = synthesizeFromResults(query, results);
      console.log('Generated synthetic LLM response with fallback synthesizer');
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
      
      // Log the categories status
      if (categories.length === 0) {
        console.log('DEBUG: No categories were generated. Attempting to add categories using search context detector');
        
        // Use the CategoryFinder to generate categories based on search context
        try {
          const detector = new (require('../../../components/search/utils/contextDetector').ContextDetector)();
          const searchContext = detector.detectQueryContext(query);
          console.log('DEBUG: Detected search context:', searchContext);
          
          const CategoryFinder = require('../../../components/search/categories/CategoryFinder').default;
          const finder = new CategoryFinder();
          
          // Generate at least one default category
          categories = [
            {
              id: 'key_insights',
              name: 'Key Insights',
              description: 'Key insights from your search',
              content: results.slice(0, 2), // Use the first few results if available
              scores: {
                relevance: 0.9 
              }
            }
          ];
          
          // Add additional categories based on the query context
          if (searchContext && searchContext.includes('business')) {
            console.log('DEBUG: Adding business-related categories based on context');
            categories.push({
              id: 'business_impact',
              name: 'Business Impact',
              description: 'Impact on business operations and strategy',
              content: results.slice(0, 2), // Use the first few results if available
              scores: {
                relevance: 0.85
              }
            });
          }
          
          console.log(`DEBUG: Generated ${categories.length} categories based on context`);
        } catch (categoryError) {
          console.error('Error generating categories from context:', categoryError);
        }
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
    
    // Make LLM the primary response - not just a property within the response
    if (llmResponse) {
      // Comprehensive LLM-first response format that will be properly detected
      
      // Get categories from existing sources, prioritizing LLM response categories
      let responseCategories = llmResponse.categories || (Array.isArray(prioritizedCategories) ? prioritizedCategories : []);
      
      if (!responseCategories || responseCategories.length === 0) {
        console.log('DEBUG: No categories available for LLM response, using client-side categorization');
        // Let the client-side handle the categorization
        responseCategories = [];
      } else {
        console.log(`DEBUG: Using ${responseCategories.length} categories for LLM response`);
      }
      
      const synthesizedResponse = {
        // Core LLM result fields
        content: llmResponse.content || '',
        query: query,
        categories: responseCategories,
        followUpQuestions: llmResponse.followUpQuestions || [],
        sourceMap: llmResponse.sourceMap || {},
        
        // Required detection flags
        type: 'llm_summary',
        isLLMResults: true,
        __isImmutableLLMResult: true,
        llmProcessed: true,
        
        // Include raw results for display as needed
        results: results,
        
        // Metadata for tracking
        metadata: {
          model: model,
          timestamp: new Date().toISOString(),
          totalResults: results.length,
          queriedSources: sources,
          executionTime: Date.now() - startTime
        }
      };
      
      console.log('Returning synthesized LLM response with proper formatting');
      return res.status(200).json(synthesizedResponse);
    } else {
      // Traditional response without LLM processing
      console.log('Returning traditional search results without LLM synthesis');
      return res.status(200).json({
        results,
        query,
        timestamp: new Date().toISOString(),
        categories: Array.isArray(prioritizedCategories) ? prioritizedCategories : [],
        // Explicitly mark this as NOT an LLM result to prevent misinterpreting as LLM content
        isLLMResults: false,
        __isImmutableLLMResult: false,
        llmProcessed: false,
        type: 'search_results'
      });
    }
  } catch (error) {
    logger.error('Search error:', error);
    
    // Check if this is an LLM error that already has proper formatting
    if (error.isLLMResults || error.llmProcessed || error.__isImmutableLLMResult || 
        (error.content && typeof error.content === 'string' && error.content.includes('error-message'))) {
      // Return properly formatted LLM error with status 200 so it can be displayed in the UI
      console.log('DEBUG: Returning LLM error with proper formatting');
      return res.status(200).json(error);
    }
    
    // For other errors, create a properly formatted error response that will be recognized as an LLM result
    console.log('DEBUG: Creating formatted error message for', error.message);
    return res.status(200).json({
      content: `<div class="error-message">
        <h3>Search Failed</h3>
        <p>${error.message}</p>
        <p>This could be due to an issue with the API key, network connectivity, or an internal server error.</p>
      </div>`,
      error: true,
      errorType: 'search',
      errorMessage: error.message,
      isLLMResults: true,
      __isImmutableLLMResult: true,
      llmProcessed: true
    });
  }
}
