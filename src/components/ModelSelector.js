import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ModelSelector({ selectedModel, setSelectedModel }) {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const models = [
    { id: 'Perplexity', name: 'Perplexity-Online', description: 'Real-time web analysis' },
    { id: 'Mixtral-8x7B', name: 'Mixtral 8x7B', description: 'Powerful multi-expert model' },
    { id: 'Gemma-7B', name: 'Gemma 7B', description: 'Efficient Google model' },
    { id: 'DeepSeek-70B', name: 'DeepSeek 70B', description: 'Advanced reasoning model' }
  ];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600
          border border-gray-200 rounded-md hover:border-gray-300 
          bg-white/50 hover:bg-white transition-colors"
      >
        <span>{models.find(m => m.id === selectedModel)?.name || selectedModel}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 
            ${showDropdown ? 'rotate-180' : ''}`}
        />
      </button>

      {showDropdown && (
        <div className="absolute left-0 mt-1 w-64 bg-white border border-gray-200 
          rounded-md shadow-lg overflow-hidden z-50">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model.id);
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">{model.name}</div>
              <div className="text-xs text-gray-500">{model.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 