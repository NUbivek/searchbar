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

// Direct exports for backward compatibility
export { IntelligentSearchResults } from './results';
export { processLLMResults, extractInsightsFromLLM } from './results';

// Export specific components
export { default as EnhancedCategoryDisplay } from './categories/EnhancedCategoryDisplay';
export { IntelligentSearchResults, LLMResultsProcessor, processLLMResults } from './results';
export { isBusinessQuery, detectQueryContext } from './utils/contextDetector';

// Export new display components
export { CategoryProgressBars, LLMResultsDisplay, CardView } from './display';

// Export category integration
export { integrateCategoriesWithLLM } from './llm/CategoryIntegration';

// Export metrics
export { calculateMetrics, DEFAULT_METRICS } from './metrics/calculators';

// Export source components
export { 
  scoreSourceReputation, 
  getSourceBadge, 
  EnhancedSourceDisplay 
} from './sources';

// Export analytics
export {
  trackSearch,
  trackInteraction,
  recordFeedback,
  SearchAnalytics
} from './analytics';

// Default export
export default {
  categories,
  llm,
  results,
  utils,
  display: require('./display'),
  metrics: require('./metrics'),
  sources: require('./sources'),
  analytics: require('./analytics')
};
