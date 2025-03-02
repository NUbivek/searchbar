import React from 'react';

// Model options with display names
const MODEL_OPTIONS = [
  { id: 'mixtral-8x7b', name: 'Mixtral-8x7B' },
  { id: 'mistral-7b', name: 'Mistral-7B' },
  { id: 'gemma-7b', name: 'Gemma-7B' },
  { id: 'llama-7b', name: 'Llama 2 7B' }
];

const ModelSelector = ({ selectedModel, onChange }) => {
  return (
    <select
      id="model-selector"
      value={selectedModel}
      onChange={e => onChange(e.target.value)}
      className="w-full h-full px-2 py-2 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 text-sm"
      aria-label="Select AI model"
    >
      {MODEL_OPTIONS.map(model => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  );
};

export default ModelSelector;