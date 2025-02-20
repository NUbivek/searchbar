import React from 'react';

const ModelSelector = ({ selectedModel, setSelectedModel }) => {
  const models = [
    { id: 'perplexity', name: 'Perplexity' },
    { id: 'gemma-2', name: 'Gemma 2.0 (9B)' },
    { id: 'mixtral', name: 'Mixtral 8x7B' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-blue-800 mb-4">Select Model</h2>
      <div className="flex gap-4">
        {models.map(model => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            className={`
              px-4 py-2 rounded-lg transition-all duration-200
              ${selectedModel === model.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }
            `}
          >
            {model.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector; 