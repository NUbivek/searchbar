// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 19:52:54
// Current User's Login: NUbivek

import { createContext, useContext, useState } from 'react';
import { MODELS, ModelUtils } from '@/config/models.config';

export const ModelContext = createContext();

export function ModelProvider({ children }) {
  const [selectedModel, setSelectedModel] = useState(MODELS.default);

  const value = {
    selectedModel,
    setSelectedModel,
    models: process.env.NEXT_PUBLIC_STATIC_BUILD === 'true' ? MODELS.default : MODELS.active,
    getModelConfig: () => ModelUtils.getModelConfig(selectedModel),
    getCurrentModel: () => ModelUtils.getModelById(selectedModel),
    formatPrompt: (prompt) => ModelUtils.formatPrompt(selectedModel, prompt),
    modelOptions: ModelUtils.getModelOptions(),
    config: MODELS.config,
    // Add these methods to fully utilize your ModelUtils
    formatRequestBody: (prompt) => ModelUtils.formatRequestBody(selectedModel, prompt),
    extractResponseText: (data) => ModelUtils.extractResponseText(data, selectedModel),
    isValidModel: (id) => ModelUtils.isValidModel(id),
    getApiModel: () => ModelUtils.getApiModel(selectedModel)
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}