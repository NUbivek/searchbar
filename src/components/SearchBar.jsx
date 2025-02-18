// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-17 03:13:14
// Current User's Login: NUbivek

import React, { useCallback } from 'react';
import { Search } from 'lucide-react';
import { useModel } from '@/contexts/ModelContext';
import { PREDEFINED_SEARCHES } from '@/config/constants';

const SearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  handleSearch, 
  isLoading 
}) => {
  const { selectedModel, setSelectedModel, models } = useModel();

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  }, [handleSearch, isLoading]);

  const handlePredefinedSearch = useCallback((search) => {
    setSearchQuery(search);
    setTimeout(() => handleSearch(), 0);
  }, [setSearchQuery, handleSearch]);

  return (
    <div className="space-y-4 mb-8">
      {/* Model Selector */}
      <div className="flex justify-center">
        <div className="relative inline-block w-48">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search insights, strategies, opportunities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="
            w-full p-4 pl-12
            bg-white
            border border-slate-200
            rounded-xl
            text-slate-800
            placeholder-slate-400
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            disabled:opacity-50
          "
          disabled={isLoading}
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"
          size={20}
        />
        <button
          onClick={() => !isLoading && handleSearch()}
          disabled={isLoading}
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            px-6 py-2
            bg-blue-600 
            text-white
            rounded-lg
            hover:bg-blue-700
            disabled:opacity-50
            disabled:cursor-not-allowed
            flex items-center gap-2
            transition-colors
          "
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            'Search'
          )}
        </button>
      </div>

      {/* Predefined Searches */}
      <div className="mb-8">
        <h2 className="text-center text-sm text-slate-500 mb-4">
          Popular Research Topics
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {PREDEFINED_SEARCHES.map((search, idx) => (
            <button
              key={idx}
              onClick={() => handlePredefinedSearch(search)}
              className="
                px-3 py-1
                text-xs
                bg-slate-100
                text-slate-600
                rounded-lg
                hover:bg-blue-100
                hover:text-blue-700
                transition-colors
                disabled:opacity-50
              "
              disabled={isLoading}
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;