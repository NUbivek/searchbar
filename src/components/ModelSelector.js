import { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

export default function ModelSelector({ selectedModel, setSelectedModel }) {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const models = [
    { id: 'Gemma-7B', name: 'Gemma 7B', description: 'Efficient Google model', icon: '🧠' },
    { id: 'Mixtral-8x7B', name: 'Mixtral 8x7B', description: 'Powerful multi-expert model', icon: '⚡' },
    { id: 'Perplexity', name: 'Perplexity-Online', description: 'Real-time web analysis', icon: '🌐' },
    { id: 'DeepSeek-70B', name: 'DeepSeek 70B', description: 'Advanced reasoning model', icon: '🔍' }
  ];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center gap-2 px-4 py-2 
          bg-white/80 backdrop-blur-sm border border-gray-200 
          rounded-xl hover:bg-white/90 hover:border-gray-300 
          transition-all duration-200 ease-out shadow-sm 
          hover:shadow group"
      >
        <Sparkles 
          size={16} 
          className="text-blue-500 group-hover:text-blue-600 
            transition-colors duration-200"
        />
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
          {models.find(m => m.id === selectedModel)?.name || selectedModel}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 
            ${showDropdown ? 'rotate-180' : ''} group-hover:text-gray-700`}
        />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-sm
          border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50
          animate-fadeIn"
        >
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model.id);
                setShowDropdown(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50/80
                transition-colors border-b border-gray-100 last:border-0
                group/item"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{model.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900 group-hover/item:text-blue-600">
                    {model.name}
                  </div>
                  <div className="text-xs text-gray-500 group-hover/item:text-gray-600">
                    {model.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 