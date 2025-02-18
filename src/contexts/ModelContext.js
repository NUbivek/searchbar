// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 16:49:55
// Current User's Login: NUbivek

import { createContext, useContext, useState } from 'react';
// Change the import path to use relative paths instead of alias
import { MODELS, ModelUtils } from '../config/models.config';

// Export the context so it can be imported elsewhere if needed
export const ModelContext = createContext();

export function ModelProvider({ children }) {
  const [selectedModel, setSelectedModel] = useState(MODELS.default);

  const value = {
    selectedModel,
    setSelectedModel,
    models: MODELS.active,
    getModelConfig: () => ModelUtils.getModelConfig(selectedModel),
    getCurrentModel: () => ModelUtils.getModelById(selectedModel),
    formatPrompt: (prompt) => ModelUtils.formatPrompt(selectedModel, prompt),
    modelOptions: ModelUtils.getModelOptions(),
    config: MODELS.config
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