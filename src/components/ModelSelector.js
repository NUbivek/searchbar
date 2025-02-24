import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { MODEL_OPTIONS } from '../utils/constants';

export default function ModelSelector({ selectedModel, setSelectedModel }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!selectedModel) {
      setSelectedModel(MODEL_OPTIONS[0].id);
    }
  }, [selectedModel, setSelectedModel]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelSelect = (modelId) => {
    setSelectedModel(modelId);
    setShowDropdown(false);
  };

  const selectedModelOption = MODEL_OPTIONS.find(model => model.id === selectedModel) || MODEL_OPTIONS[0];

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
      >
        <span className="text-lg">{selectedModelOption.icon}</span>
        <span className="text-sm font-medium">{selectedModelOption.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-10"
        >
          <div className="p-2">
            {MODEL_OPTIONS.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${
                  selectedModel === model.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{model.icon}</span>
                <div>
                  <div className="font-medium">{model.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}