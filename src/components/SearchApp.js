import React, { useState, useCallback, useEffect } from 'react';
import { Search, Upload, X, Plus, Link, FileText } from 'lucide-react';
import SearchBar from './SearchBar/index.jsx';
import SearchResults from './SearchResults.js';
import LinkedInResults from './LinkedInResults.js';
import { SEARCH_MODES, SOURCES_CONFIG, API_CONFIG } from '../config/constants.js';
import PRODUCTION_CONFIG from '../config/production.config.js';
import { useModel } from '../contexts/ModelContext.js';
import styles from '../styles/Button.module.css';

const SearchApp = () => {
  const { selectedModel } = useModel();
  const [searchMode, setSearchMode] = useState(SEARCH_MODES.VERIFIED);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(SOURCES_CONFIG.initialFilters);
  
  // Debug logging
  useEffect(() => {
    console.log('Current Mode:', searchMode);
  }, [searchMode]);

  // Simplified tab switching section
  return (
    <div className="min-h-screen bg-white text-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-blue-600">
            Founder&apos;s Research Hub
          </h1>
          <p className="text-xl text-slate-600">
            Strategic insights powered by curated sources
          </p>
        </header>

        {/* Isolated tab switching section */}
        <div className="relative z-50 flex justify-center mb-8" style={{ isolation: 'isolate' }}>
          <div 
            className="inline-flex bg-slate-100 rounded-full p-1"
            onClick={(e) => e.stopPropagation()}
          >
            {Object.entries(SEARCH_MODES).map(([key, mode]) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  console.log(`Clicking ${mode} button`);
                  setSearchMode(mode);
                }}
                className={`
                  relative z-50
                  px-6 py-2 rounded-full
                  transition-all duration-200
                  ${searchMode === mode 
                    ? 'bg-blue-800 text-white' 
                    : 'text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {mode === SEARCH_MODES.VERIFIED ? 'Verified Sources' : 'Open Research'}
              </button>
            ))}
          </div>
        </div>

        {/* Rest of your component */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={() => console.log('Search triggered')}
          isLoading={isLoading}
        />

        {/* Conditional content based on mode */}
        {searchMode === SEARCH_MODES.VERIFIED ? (
          <div>Verified Sources Content</div>
        ) : (
          <div>Open Research Content</div>
        )}
      </div>
    </div>
  );
};

export default SearchApp;