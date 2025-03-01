/**
 * LLM module exports
 */
import { 
  processLLMResponse, 
  extractStructuredData,
  extractCategoriesFromText,
  calculateContentMetrics
} from './LLMResponseProcessor';

import {
  mapLLMResponseToCategories,
  enhanceCategoriesWithLLM,
  createBusinessCategoryFromLLM
} from './LLMCategoryMapper';

import {
  processLLMResults,
  createCategory,
  processContent,
  DEFAULT_CATEGORIES
} from './LLMResultsCore';

export {
  // LLM Response Processor
  processLLMResponse,
  extractStructuredData,
  extractCategoriesFromText,
  calculateContentMetrics,
  
  // LLM Category Mapper
  mapLLMResponseToCategories,
  enhanceCategoriesWithLLM,
  createBusinessCategoryFromLLM,
  
  // LLM Results Core
  processLLMResults,
  createCategory,
  processContent,
  DEFAULT_CATEGORIES
};

export default {
  processLLMResponse,
  extractStructuredData,
  extractCategoriesFromText,
  calculateContentMetrics,
  mapLLMResponseToCategories,
  enhanceCategoriesWithLLM,
  createBusinessCategoryFromLLM
};
