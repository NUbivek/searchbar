/**
 * resultDetection.js
 * 
 * Utility for detecting LLM results
 * Acts as a facade for the more detailed resultDetector functionality
 */

import { isLLMResult, addLLMFlags as addFlags, processLLMResults as processResults } from './llm/resultDetector';

/**
 * Detect if an item is an LLM result
 * @param {any} item - The item to check
 * @returns {boolean} - Whether the item is an LLM result
 */
export function detectLLMResult(item) {
  return isLLMResult(item);
}

/**
 * Add LLM flags to an object to ensure proper rendering
 * @param {Object} item - The item to add flags to
 * @returns {Object} - The item with added flags
 */
export function addLLMFlags(item) {
  return addFlags(item);
}

/**
 * Process LLM results to ensure consistency
 * @param {Array|Object} results - The results to process
 * @returns {Array|Object} - Processed results
 */
export function processLLMResults(results) {
  return processResults(results);
}

export default {
  detectLLMResult,
  addLLMFlags,
  processLLMResults
};
