import React, { useState, useCallback, useEffect } from 'react';
import { Search, Upload, X, Plus, Link, FileText } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';
import LinkedInResults from '@/components/LinkedInResults';
import { SEARCH_MODES, SOURCES_CONFIG, API_CONFIG } from '@/config/constants';
import PRODUCTION_CONFIG from '@/config/production.config';
import { useModel } from '@/contexts/ModelContext';
import styles from '@/styles/Button.module.css';

const SearchApp = () => {
  const { selectedModel } = useModel();
  const isStaticBuild = PRODUCTION_CONFIG.isStaticBuild;
  
  // State declarations
  const [searchMode, setSearchMode] = useState(SEARCH_MODES.VERIFIED);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(SOURCES_CONFIG.initialFilters);
  const [sourceScope, setSourceScope] = useState('only-user');
  const [isSearching, setIsSearching] = useState(false);
  const [webSearchResults, setWebSearchResults] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('Current Mode:', searchMode);
  }, [searchMode]);

  // Handle mode switching with proper state reset
  const handleModeSwitch = (mode) => {
    console.log('Current mode:', searchMode, 'Switching to:', mode);
    setSearchMode(mode);
    setSearchResults(null);
    setWebSearchResults(null);
    setError(null);
    
    // Reset filters based on mode
    if (mode === SEARCH_MODES.VERIFIED) {
      setFilters(SOURCES_CONFIG.initialFilters);
      setSourceScope('only-user');
    } else {
      setFilters({
        web: true,
        linkedin: false,
        x: false,
        crunchbase: false,
        pitchbook: false,
        reddit: false,
        ycombinator: false,
        substack: false,
        medium: false,
        upload: false
      });
    }
  };

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

        {/* Tab switching section with explicit buttons */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-100 rounded-full p-1">
            <button
              type="button"
              onClick={() => handleModeSwitch(SEARCH_MODES.VERIFIED)}
              className={`
                px-6 py-2 rounded-full transition-all duration-200
                ${searchMode === SEARCH_MODES.VERIFIED 
                  ? 'bg-blue-800 text-white' 
                  : 'text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              Verified Sources
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch(SEARCH_MODES.OPEN)}
              className={`
                px-6 py-2 rounded-full transition-all duration-200
                ${searchMode === SEARCH_MODES.OPEN 
                  ? 'bg-blue-800 text-white' 
                  : 'text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              Open Research
            </button>
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