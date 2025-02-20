import React from 'react';

const ModelSelector = ({ selectedModel, setSelectedModel }) => {
  const models = [
    { id: 'gemma-2', name: 'Gemma 2.0 (9B)' },
    { id: 'perplexity', name: 'Perplexity' },
    { id: 'mixtral', name: 'Mixtral 8x7B' }
  ];

  return (
    <div className="flex items-center gap-3 max-w-xl mx-auto py-2">
      <label className="text-sm font-medium text-slate-600 whitespace-nowrap">
        Select Model:
      </label>
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 text-slate-700"
      >
        {models.map(model => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector; 