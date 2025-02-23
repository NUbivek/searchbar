import { useState } from 'react';

export default function ModelSelector({ onModelSelect }) {
  const [selectedModel, setSelectedModel] = useState('Mixtral-8x7B');

  const models = [
    'Perplexity',
    'Gemma 2.0 (9B)',
    'Mixtral-8x7B',
    'DeepSeek 70B'
  ];

  const handleModelChange = (model) => {
    setSelectedModel(model);
    onModelSelect(model);
  };

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Model Selection</h3>
      <div className="flex flex-wrap gap-3">
        {models.map((model) => (
          <button
            key={model}
            onClick={() => handleModelChange(model)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedModel === model
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {model}
          </button>
        ))}
      </div>
    </div>
  );
}