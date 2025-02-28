/**
 * Search module exports
 */

// Import categories module
import * as categories from './categories';

// Import LLM module
import * as llm from './llm';

// Import results module
import * as results from './results';

// Import utils
import * as utils from './utils';

// Export modules
export {
  categories,
  llm,
  results,
  utils
};

// Export specific components
export { default as EnhancedCategoryDisplay } from './categories/EnhancedCategoryDisplay';
export { IntelligentSearchResults, LLMResultsProcessor, processLLMResults } from './results';
export { isBusinessQuery, detectQueryContext } from './utils/contextDetector';

// Default export
export default {
  categories,
  llm,
  results,
  utils
};
