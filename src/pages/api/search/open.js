import axios from 'axios';
import { performSimpleSearch, performSimpleVerifiedSearch } from '../../../utils/searchUtils';
import { logger } from '../../../utils/logger';
import { processWithLLM } from '../../../utils/llmProcessing';
import { processCategories } from '../../../components/search/categories/processors/CategoryProcessor';
import { deepWebSearch } from '../../../utils/deepWebSearch';

// Define valid sources
const VALID_SOURCES = ['web', 'linkedin', 'twitter', 'reddit', 'substack', 'medium', 'crunchbase', 'pitchbook', 'verified'];

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract query and other parameters from request body
    const { query, sources = ['web'], model, customUrls, uploadedFiles, useLLM = false } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Log search request
    logger.info('Open search request:', { query, model, sources });

    let results = [];
    let llmResponse = null;
    let categories = [];

    // Check if verified sources is selected
    if (sources.includes('verified')) {
      // Use all verified sources (fmp, sec, edgar)
      const verifiedResults = await performSimpleVerifiedSearch(query, ['fmp', 'sec', 'edgar'], {
        model,
        customUrls,
        uploadedFiles
      });
      results = [...results, ...verifiedResults];
      
      // Filter out 'verified' from sources for regular search
      const otherSources = sources.filter(source => source !== 'verified');
      
      // Only perform regular search if there are other sources selected
      if (otherSources.length > 0) {
        // Perform regular search with selected sources
        if (otherSources.includes('web')) {
          try {
            console.log(`DEBUG: Executing web search for: "${query}"`);
            const webResults = await deepWebSearch(query, { numResults: 10 });
            console.log(`DEBUG: Web search returned ${webResults.length} results`);
            results = [...results, ...webResults];
          } catch (error) {
            console.error('ERROR: Web search failed:', error.message);
            logger.error('Web search failed', { error: error.message });
            
            return res.status(500).json({ 
              error: 'Search failed',
              message: 'Web search failed. Please try again later.'
            });
          }
        } else {
          const otherResults = await performSimpleSearch(query, otherSources, {
            model,
            customUrls,
            uploadedFiles
          });
          results = [...results, ...otherResults];
        }
      }
    } else {
      // Perform regular search with selected sources
      if (sources.includes('web')) {
        try {
          console.log(`DEBUG: Executing web search for: "${query}"`);
          const webResults = await deepWebSearch(query, { numResults: 10 });
          console.log(`DEBUG: Web search returned ${webResults.length} results`);
          results = [...results, ...webResults];
        } catch (error) {
          console.error('ERROR: Web search failed:', error.message);
          logger.error('Web search failed', { error: error.message });
          
          return res.status(500).json({ 
            error: 'Search failed',
            message: 'Web search failed. Please try again later.'
          });
        }
      } else {
        results = await performSimpleSearch(query, sources, {
          model,
          customUrls,
          uploadedFiles
        });
      }
    }

    // Generate LLM response if requested
    if (useLLM && model) {
      try {
        llmResponse = await processWithLLM({
          query,
          sources: results,
          model,
          maxTokens: 1024,
          temperature: 0.7
        });
      } catch (llmError) {
        logger.error('Error generating LLM response:', llmError);
      }
    }

    // Generate categories
    try {
      // Process categories based on query and search results
      categories = await processCategories(results, query, {
        includeBusinessMetrics: true,
        llmResponse
      });
    } catch (categoryError) {
      logger.error('Error generating categories:', categoryError);
      categories = [];
    }

    return res.status(200).json({
      results,
      query,
      timestamp: new Date().toISOString(),
      llmResponse: llmResponse?.content || null,
      categories
    });
  } catch (error) {
    logger.error('Error in open search API:', error);
    return res.status(500).json({ 
      error: 'An error occurred during search',
      message: error.message
    });
  }
}
