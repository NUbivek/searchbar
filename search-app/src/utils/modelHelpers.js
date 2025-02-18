// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 06:38:25
// Current User's Login: NUbivek

import { MODELS, ModelUtils } from '@/config/models.config';

export const formatPromptForModel = (prompt, selectedModel) => {
  const model = typeof selectedModel === 'string' 
    ? ModelUtils.getModelById(selectedModel)
    : selectedModel;

  if (!model) {
    console.warn('No valid model found, using default prompt format');
    return prompt;
  }

  return model.promptFormat(prompt);
};

export const getModelStopTokens = (modelId) => {
  const model = ModelUtils.getModelById(modelId);
  return model ? model.stopTokens : [];
};

export const getModelConfig = (modelId) => {
  return ModelUtils.getModelConfig(modelId);
};

export const getModelById = (modelId) => {
  return ModelUtils.getModelById(modelId);
};

export const getApiModel = (modelId) => {
  return ModelUtils.getApiModel(modelId);
};

export const DEFAULT_MODEL = MODELS.default;