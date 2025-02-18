// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 17:00:30
// Current User's Login: NUbivek

/**
 * @typedef {Object} Model
 * @property {string} id - Unique identifier for the model
 * @property {string} name - Display name of the model
 * @property {string} description - Short description of the model's strengths
 * @property {string} apiModel - The model identifier used in API calls
 * @property {string[]} stopTokens - Tokens that indicate the end of model output
 * @property {function(string): string} promptFormat - Function to format the prompt
 * @property {string} apiEndpoint - The API endpoint for this specific model
 * @property {Object} apiHeaders - Headers specific to this model's API
 */

const MODELS = {
  // Active models - Add or remove models here
  active: [
    { 
      id: 'perplexity', 
      name: 'Perplexity', 
      description: 'Advanced',
      apiModel: 'mistral-7b-instruct',
      stopTokens: ['</s>'],
      promptFormat: (prompt) => `<|system|>You are a helpful AI assistant.\n<|user|>${prompt}<|assistant|>`,
      apiEndpoint: 'https://api.perplexity.ai/chat/completions',
      apiHeaders: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      }
    },
    { 
      id: 'gemma', 
      name: 'Gemma 2.0', 
      description: 'Efficiency',
      apiModel: 'google/gemma-2-9b-it',
      stopTokens: ['<end_of_turn>'],
      promptFormat: (prompt) => `<start_of_turn>user\n${prompt}\n<end_of_turn>\n<start_of_turn>assistant\n`,
      apiEndpoint: 'https://api.together.xyz/v1/completions',
      apiHeaders: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
      }
    },
    { 
      id: 'mixtral', 
      name: 'Mixtral 8x7B', 
      description: 'Balanced',
      apiModel: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      stopTokens: ['<end_of_turn>'],
      promptFormat: (prompt) => `<start_of_turn>user\n${prompt}\n<end_of_turn>\n<start_of_turn>assistant\n`,
      apiEndpoint: 'https://api.together.xyz/v1/completions',
      apiHeaders: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
      }
    }
  ],

  // Default model ID
  default: 'gemma',

  // Global model configurations
  config: {
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 1024
  }
};

// Helper functions with improved error handling
const ModelUtils = {
  getModelById: (id) => {
    const model = MODELS.active.find(m => m.id === id);
    if (!model) {
      console.warn(`Model ${id} not found, falling back to default model`);
      return MODELS.active.find(m => m.id === MODELS.default);
    }
    return model;
  },

  isValidModel: (id) => {
    return MODELS.active.some(m => m.id === id);
  },

  getApiModel: (id) => {
    const model = ModelUtils.getModelById(id);
    return model.apiModel;
  },

  getModelConfig: (id) => {
    const model = ModelUtils.getModelById(id);
    return {
      ...MODELS.config,
      model: model.apiModel,
      stop: model.stopTokens,
      endpoint: model.apiEndpoint,
      headers: model.apiHeaders
    };
  },

  formatPrompt: (id, prompt) => {
    const model = ModelUtils.getModelById(id);
    return model.promptFormat(prompt);
  },

  getModelOptions: () => {
    return MODELS.active.map(({ id, name, description }) => ({
      id,
      name,
      description
    }));
  },

  /**
   * Formats the request body based on the API requirements
   * @param {string} id - The model ID
   * @param {string} prompt - The user's prompt
   * @returns {Object} - Formatted request body
   */
  formatRequestBody: (id, prompt) => {
    const config = ModelUtils.getModelConfig(id);
    return id === 'perplexity' ? {
      model: config.model,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      top_p: config.top_p
    } : {
      model: config.model,
      prompt: ModelUtils.formatPrompt(id, prompt),
      temperature: config.temperature,
      max_tokens: config.max_tokens,
      top_p: config.top_p,
      stop: config.stop
    };
  },

  /**
   * Extracts the response text from API response
   * @param {Object} data - The API response data
   * @param {string} modelId - The model ID
   * @returns {string} - The extracted response text
   */
  extractResponseText: (data, modelId) => {
    return modelId === 'perplexity' 
      ? data.choices[0].message.content
      : data.choices[0].text;
  }
};

// Freeze the configuration
Object.freeze(MODELS);
Object.freeze(ModelUtils);

export { MODELS, ModelUtils };

// Example usage of adding a new model:
/*
To add a new model, copy this template and add to the active array above:

{
  id: 'new-model-id',
  name: 'New Model Name',
  description: 'Model Description',
  apiModel: 'provider/model-name',
  stopTokens: ['<end_of_turn>'],
  promptFormat: (prompt) => `<start_of_turn>user\n${prompt}\n<end_of_turn>\n<start_of_turn>assistant\n`,
  apiEndpoint: 'https://api.example.com/v1/completions',
  apiHeaders: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.API_KEY}`
  }
}
*/