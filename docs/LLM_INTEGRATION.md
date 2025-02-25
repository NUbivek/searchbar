# LLM Integration Documentation

This document provides details on the LLM (Large Language Model) integration in the Research Hub Search Application.

## Supported Models

The application supports multiple LLM models through the Together API:

1. **Mixtral-8x7b** (Primary Model)
   - Provider: Together AI
   - Model ID: `mistralai/Mixtral-8x7B-Instruct-v0.1`
   - Use case: General-purpose search result processing
   - Default model when no specific model is selected

2. **Llama-2-70b** (High-Performance Model)
   - Provider: Together AI
   - Model ID: `meta-llama/Llama-2-70b-chat-hf`
   - Use case: When higher quality or more detailed responses are needed
   - Used as a replacement for DeepSeek-70b

3. **Gemma-2-9b** (Lightweight Model)
   - Provider: Together AI
   - Model ID: `google/gemma-2-9b-it`
   - Use case: When faster processing is needed with acceptable quality

## Automatic Fallback Mechanism

The application implements an automatic fallback mechanism to ensure reliability:

1. When a user selects a specific model (e.g., Llama-2 or Gemma), the system attempts to use that model first.
2. If the selected model fails for any reason (API error, model unavailability, etc.), the system automatically falls back to Mixtral-8x7b.
3. The response includes a note indicating that a fallback model was used.
4. Detailed error information is logged to help diagnose issues.

## Implementation Details

### Model Configuration

Each model is configured with specific parameters:

```javascript
const SUPPORTED_MODELS = {
  'mixtral-8x7b': {
    provider: 'together',
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.7,
    top_k: 50,
    repetition_penalty: 1,
    stop: ['</s>', '[/INST]']
  },
  // Other models...
};
```

### API Integration

The application uses the Together API for all LLM processing:

```javascript
const response = await fetch('https://api.together.xyz/inference', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  body: JSON.stringify({
    model: config.model,
    prompt: prompt,
    // Other parameters...
  })
});
```

### Error Handling

The application implements robust error handling:

1. **API Error Detection**: Checks for non-200 responses from the Together API
2. **Detailed Error Logging**: Captures and logs the full error response
3. **Automatic Fallback**: Switches to Mixtral if the requested model fails
4. **Empty Results Handling**: Provides helpful messages when no results are found

## Usage in the Application

LLM processing is used in two main components:

1. **OpenSearch**: Processes open research results to provide summaries and follow-up questions
2. **VerifiedSearch**: Processes verified source results to provide insights and recommendations

## Environment Configuration

The application requires the following environment variables:

```
TOGETHER_API_KEY=your_together_api_key
```

## Troubleshooting

Common issues and solutions:

1. **400/422 Errors**: Usually indicate an issue with the model ID or parameters. Check that the model ID is current and valid.
2. **Authentication Errors**: Verify that the TOGETHER_API_KEY is correctly set in the .env.local file.
3. **Rate Limiting**: The Together API has rate limits. If you're hitting these limits, consider implementing caching or reducing the frequency of requests.
