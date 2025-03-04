# LLM Architecture and Standardization Guide

## Overview

This document describes the standardized LLM implementation in the searchbar application after consolidating duplicate implementations.

## Key Components

1. **src/utils/llmProcessing.js**: The primary implementation of all LLM-related functionality.
2. **src/utils/llm-exports.js**: A re-export file that ensures consistent imports across the codebase.

## Model Configuration

The application uses standardized model IDs across the codebase:

| Model ID | Model Name | Provider | Fallback |
|----------|------------|----------|----------|
| mistral-7b | Mistral-7B-v0.1 | Together | llama-13b |
| llama-13b | Llama-2-13b-chat-hf | Together | gemma-27b |
| gemma-27b | gemma-2-27b-it | Together | None |

## Enhanced Features

1. **Model Fallback System**: When a model request fails, the system automatically tries the next model in the fallback chain.
2. **Robust Error Handling**: All errors are properly formatted as LLM results for consistent UI rendering.
3. **Flexible Model Detection**: The system can handle variations in model names through a fuzzy matching system.

## Implementation Changes

1. Deprecated `server/llmProcessor.js` in favor of the unified implementation.
2. Updated model references in UI components to match the standardized model IDs.
3. Enhanced error handling in `search-legacy.js` to ensure proper LLM formatting.
4. Added fallback model chains to improve reliability.

## Guidelines for Future Development

1. Always import LLM functions from `src/utils/llm-exports.js`.
2. When adding new models, update both the UI and the model definitions in `llmProcessing.js`.
3. Use consistent model IDs throughout the codebase.
4. Ensure errors are properly formatted with LLM flags.
