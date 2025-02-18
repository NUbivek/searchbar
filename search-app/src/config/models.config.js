// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 03:08:24
// Current User's Login: NUbivek

const MODELS = {
  // Active models - Add or remove models here
  active: [
    { 
      id: 'deepseek', 
      name: 'DeepSeek', 
      description: 'Accuracy',
      apiModel: 'deepseek-ai/deepseek-llm-67b-chat',
      stopTokens: ['<end_of_turn>'],
      promptFormat: (prompt) => `<start_of_turn>user\n${prompt}\n<end_of_turn>\n<start_of_turn>assistant\n`
    },
    { 
      id: 'gemma', 
      name: 'Gemma 2.0', 
      description: 'Efficiency',
      apiModel: 'google/gemma-2-9b-it',
      stopTokens: ['<end_of_turn>'],
      promptFormat: (prompt) => `<start_of_turn>user\n${prompt}\n<end_of_turn>\n<start_of_turn>assistant\n`
    },
    { 
      id: 'mixtral', 
      name: 'Mixtral 8x7B', 
      description: 'Balanced',
      apiModel: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      stopTokens: ['<end_of_turn>'],
      promptFormat: (prompt) => `<start_of_turn>user\n${prompt}\n<end_of_turn>\n<start_of_turn>assistant\n`
    }
  ],

  // Default model ID
  default: 'gemma',

  // Global model configurations
  config: {
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 1024,
    api: {
      endpoint: 'https://api.together.xyz/v1/completions',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
};

// Helper functions
const ModelUtils = {
  getModelById: (id) => {
    return MODELS.active.find(m => m.id === id) || MODELS.active.find(m => m.id === MODELS.default);
  },

  isValidModel: (id) => {
    return MODELS.active.some(m => m.id === id);
  },

  getApiModel: (id) => {
    const model = ModelUtils.getModelById(id);
    return model ? model.apiModel : ModelUtils.getModelById(MODELS.default).apiModel;
  },

  getModelConfig: (id) => {
    const model = ModelUtils.getModelById(id);
    return {
      ...MODELS.config,
      model: model.apiModel,
      stop: model.stopTokens
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
  promptFormat: (prompt) => `<start_of_turn>user\n${prompt}\n<end_of_turn>\n<start_of_turn>assistant\n`
}
*/