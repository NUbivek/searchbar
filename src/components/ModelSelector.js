import { ChevronDown } from 'lucide-react';

export default function ModelSelector({ selectedModel, setSelectedModel, showDropdown, setShowDropdown }) {
  return (
    <div className="w-[240px] relative z-30">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-4 py-1.5 text-[16px] border border-gray-300 rounded-lg
                  bg-white text-center group hover:border-[#4BA3F5] 
                  focus:ring-2 focus:ring-[#4BA3F5]/20 transition-all
                  flex items-center justify-between"
      >
        <span className="flex-1 text-center">{selectedModel}</span>
        <ChevronDown 
          className={`transition-transform duration-200 text-gray-900 mr-1
            ${showDropdown ? 'rotate-180' : ''}`}
          size={16}
        />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border 
                      border-gray-300 rounded-lg shadow-lg overflow-hidden
                      animate-slideDown z-10">
          {MODEL_OPTIONS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model.id);
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50
                       transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="text-[16px]">{model.displayName}</div>
              <div className="text-[13px] text-gray-500">{model.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 