import React from 'react';

const ModelSelector = ({ selectedModel, setSelectedModel }) => {
  const models = [
    { id: 'perplexity', name: 'Perplexity' },
    { id: 'gemma-2', name: 'Gemma 2.0 (9B)' },
    { id: 'mixtral', name: 'Mixtral 8x7B' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="max-w-xl mx-auto flex items-center gap-4">
        <h2 className="text-lg font-semibold text-blue-800 whitespace-nowrap">
          Select Model:
        </h2>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ModelSelector; 