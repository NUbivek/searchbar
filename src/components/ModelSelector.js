import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Zap, Rocket, Crystal } from 'lucide-react';
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

  const getModelIcon = (modelId) => {
    switch (modelId) {
      case 'mixtral-8x7b':
        return <Rocket className="w-4 h-4" />;
      case 'deepseek-70b':
        return <Crystal className="w-4 h-4" />;
      case 'gemma-7b':
        return <Zap className="w-4 h-4" />;
      default:
        return <Rocket className="w-4 h-4" />;
    }
  };

  const selectedModelOption = MODEL_OPTIONS.find(model => model.id === selectedModel) || MODEL_OPTIONS[0];

  return (
    <div className="relative h-full">
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 h-full hover:bg-gray-50 transition-all duration-200 border-l border-gray-200"
      >
        <div className="flex items-center gap-1.5">
          {getModelIcon(selectedModelOption.id)}
          <span className="text-sm font-medium text-gray-700">{selectedModelOption.name}</span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${
            showDropdown ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
        >
          {MODEL_OPTIONS.map((model) => (
            <button
              key={model.id}
              onClick={() => handleModelSelect(model.id)}
              className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                model.id === selectedModel ? 'bg-blue-50/80' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {getModelIcon(model.id)}
                <div>
                  <div className="text-sm font-medium text-gray-700">{model.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{model.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}