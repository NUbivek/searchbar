# LLM Processor Implementation - DEPRECATED

This file has been deprecated in favor of the unified LLM implementation in `src/utils/llmProcessing.js`.

## Migration Notice

As part of the LLM processing standardization effort, the implementation from this file has been merged with `src/utils/llmProcessing.js` to create a single source of truth for LLM-related functionality.

### Key Features Migrated:

1. Model fallback mechanism: When a model fails, automatically trying the fallback model
2. Rate limiting integration: Honoring rate limits for API calls
3. Enhanced error handling: Better error recovery options

### How to Update References

If you were importing from this file, please update your imports to use the unified implementation:

```javascript
// OLD (deprecated)
import { processWithLLM } from '../../server/llmProcessor';

// NEW (recommended)
import { processWithLLM } from '../utils/llmProcessing';
// OR
import { processWithLLM } from '../utils/llm-exports';
```

## Legacy Code

The original implementation has been preserved in this file for reference, but should not be used in new code.
This file will be removed in a future version.
