import axios from 'axios';
import { logger } from './logger';
import { searchWeb } from './deepWebSearch';

export async function searchOpenSources(query, sources = ['Web']) {
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

    // Log any errors that occurred
    if (errors.length > 0) {
      logger.warn(`[${searchId}] Some searches failed:`, errors);
    }

    return {
      results,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    logger.error(`[${searchId}] Open search error:`, error);
    throw error;
  }
}