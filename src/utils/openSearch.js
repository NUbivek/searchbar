import axios from 'axios';
import { logger } from './logger';
import { searchWeb } from './deepWebSearch';
import { searchLinkedIn, searchTwitter, searchReddit } from './searchHandlers';
import { searchSubstack, searchCrunchbase, searchPitchbook, searchMedium } from './scrapers/vcScraper';
import { processWithLLM } from './llmProcessing';

export async function searchOpenSources({ query, model, sources = ['Web'], customUrls = [], uploadedFiles = [] }) {
  const searchId = Math.random().toString(36).substring(7);
  logger.debug(`[${searchId}] Starting open search`, { query, sources });

  try {
    if (!query) {
      throw new Error('Query is required');
    }

    const results = [];
    const errors = [];

    // Web search (DuckDuckGo) is default for Open Research
    if (sources.includes('Web')) {
      try {
        const webResults = await searchWeb(query);
        results.push(...webResults);
      } catch (error) {
        errors.push({ source: 'Web', error: error.message });
      }
    }

    // Platform-specific searches
    const platformSearches = {
      LinkedIn: searchLinkedIn,
      X: searchTwitter,
      Reddit: searchReddit,
      Substack: searchSubstack,
      Crunchbase: searchCrunchbase,
      Pitchbook: searchPitchbook,
      Medium: searchMedium
    };

    // Execute searches for selected platforms
    await Promise.all(
      sources.map(async (source) => {
        if (platformSearches[source]) {
          try {
            const platformResults = await platformSearches[source](query);
            results.push(...platformResults);
          } catch (error) {
            errors.push({ source, error: error.message });
          }
        }
      })
    );

    // Process results with LLM
    const processedResults = await processWithLLM(results, model);

    return {
      results: processedResults.results.map(result => ({
        ...result,
        sourceUrl: result.url,
        sourceName: result.source,
        contributors: result.contributors || [],
        timestamp: result.timestamp,
        category: result.category || source
      })),
      summary: processedResults.summary,
      metadata: {
        totalSources: results.length,
        searchId,
        sources,
        errors: errors.length > 0 ? errors : undefined
      },
      followupQuestions: processedResults.followupQuestions
    };

  } catch (error) {
    logger.error(`[${searchId}] Open search failed:`, error);
    throw error;
  }
}