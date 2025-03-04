/**
 * Search results component exports
 * Consolidated export file for all search-related components
 */

// Core search components
import SearchResultItem from './SearchResultItem';
import IntelligentSearchResults from './IntelligentSearchResults';
import BasicSearchResults from './BasicSearchResults';
import SimpleLLMResults from './SimpleLLMResults';
import SimplifiedLLMResults from './SimplifiedLLMResults';

// Tab and category components
import TabNavigation from './TabNavigation';
import LLMCategorizedResults from './LLMCategorizedResults';
import CollapsibleResultsTab from './CollapsibleResultsTab';

// LLM result processing
import { LLMResultsProcessor, processLLMResults, extractInsightsFromLLM } from './LLMResultsProcessor';

// LLM result display components
import LLMResultsContainer from './LLMResultsContainer';
import LLMResultsBody from './LLMResultsBody';
import LLMResultsHeader from './LLMResultsHeader';
import LLMResultsFooter from './LLMResultsFooter';
import LLMResultsExpander from './LLMResultsExpander';

// Export named components
export {
  // Core search components
  SearchResultItem,
  IntelligentSearchResults,
  BasicSearchResults,
  SimpleLLMResults,
  SimplifiedLLMResults,
  
  // Tab and category components
  TabNavigation,
  LLMCategorizedResults,
  CollapsibleResultsTab,
  
  // LLM result processing
  LLMResultsProcessor,
  processLLMResults,
  extractInsightsFromLLM,
  
  // LLM result display components
  LLMResultsContainer,
  LLMResultsBody,
  LLMResultsHeader,
  LLMResultsFooter,
  LLMResultsExpander
};

// Default export
export default {
  IntelligentSearchResults,
  SearchResultItem
};