/**
 * Base components index
 * Exports all reusable base components for search results
 */

import SearchResultsBase from './SearchResultsBase';
import ResultItem from './ResultItem';
import ResultTabs from './ResultTabs';
import { 
  detectLLMResult, 
  formatLLMResult, 
  createLLMResultRenderer 
} from './LLMResultHandler';

// Export all components and utilities
export {
  SearchResultsBase,
  ResultItem,
  ResultTabs,
  detectLLMResult,
  formatLLMResult,
  createLLMResultRenderer
};

// Default export
export default {
  SearchResultsBase,
  ResultItem,
  ResultTabs,
  detectLLMResult,
  formatLLMResult,
  createLLMResultRenderer
};
