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

  // Updated handleModeSwitch with proper state management
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

  // Define CustomSourcesPanel component inside SearchApp
  const CustomSourcesPanel = () => (
    <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-slate-100">
      <h2 className="text-lg font-semibold text-blue-800 mb-4">Your Custom Sources</h2>
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 text-slate-700">Upload Files & URLs</h3>
        <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-50 border-2 border-dashed border-blue-200">
          <Upload size={20} />
          <span>Choose Files</span>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            accept={API_CONFIG.allowedFileTypes.join(',')}
            className="hidden"
          />
        </label>
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="text-sm text-slate-700 truncate">{file.name}</span>
                </div>
                <button
                  onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                  className="p-1 hover:bg-slate-200 rounded-full"
                >
                  <X size={16} className="text-slate-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium mb-3 text-slate-700">Add URLs</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Enter URL..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleUrlAdd}
              disabled={!newUrl || !isValidUrl(newUrl)}
              className="button-primary"
            >
              <Plus size={20} />
            </button>
          </div>
          {urls.length > 0 && (
            <div className="space-y-2">
              {urls.map((url, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Link size={16} className="text-blue-600" />
                    <span className="text-sm text-slate-700 truncate">{url}</span>
                  </div>
                  <button
                    onClick={() => setUrls(urls => urls.filter((_, i) => i !== index))}
                    className="p-1 hover:bg-slate-200 rounded-full"
                  >
                    <X size={16} className="text-slate-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

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

        {/* Updated tab switching section */}
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

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={async () => {
            if (filters.web) {
              await handleWebSearch();
            } else if (filters.linkedin) {
              await handleLinkedInSearch();
            } else {
              await processSearch(searchQuery);
            }
          }}
          isLoading={isLoading || isSearching}
        />

        {/* Verified Sources Mode Content */}
        {searchMode === SEARCH_MODES.VERIFIED && (
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-slate-100">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">Select Source Scope</h2>
              <div className="space-y-4">
                {SOURCES_CONFIG.scopeOptions.map((scope) => (
                  <label
                    key={scope.id}
                    className={`
                      block p-4 rounded-lg cursor-pointer
                      ${sourceScope === scope.id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-slate-50 border border-slate-200'}
                      hover:bg-blue-50 transition-colors
                    `}
                  >
                    <input
                      type="radio"
                      name="sourceScope"
                      value={scope.id}
                      checked={sourceScope === scope.id}
                      onChange={(e) => setSourceScope(e.target.value)}
                      className="hidden"
                    />
                    <div className="font-medium text-slate-800">{scope.label}</div>
                    <div className="text-sm text-slate-600 mt-1">{scope.desc}</div>
                  </label>
                ))}
              </div>
            </div>
            <CustomSourcesPanel />
          </div>
        )}

        {/* Open Research Mode Content */}
        {searchMode === SEARCH_MODES.OPEN && (
          <div className="mb-8">
            <h2 className="text-center text-sm mb-4 font-medium text-slate-900">
              Select Sources
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(filters).map(([source, isActive]) => {
                const LogoIcon = SOURCES_CONFIG.logoMap[source];
                return (
                  <button
                    key={source}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        [source]: !prev[source]
                      }));
                    }}
                    className={`
                      p-3 rounded-lg flex items-center justify-center gap-2
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-800 text-white' 
                        : 'bg-white text-slate-600 border border-slate-200'
                      }
                    `}
                  >
                    {LogoIcon && <LogoIcon size={16} />}
                    <span className="whitespace-nowrap">
                      {source.charAt(0).toUpperCase() + source.slice(1)}
                    </span>
                  </button>
                );
              })}
            </div>
            {filters.upload && <div className="mt-8"><CustomSourcesPanel /></div>}
          </div>
        )}

        {/* Results Section */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {filters.web && (
          <SearchResults 
            results={webSearchResults} 
            isSearching={isSearching} 
          />
        )}
        
        {filters.linkedin && (
          <LinkedInResults 
            results={webSearchResults} 
            isSearching={isSearching} 
          />
        )}
        
        {!filters.web && !filters.linkedin && searchResults && (
          <div className="mt-6 overflow-y-auto max-h-[60vh] rounded-xl bg-white border border-slate-200 shadow-lg animate-fadeIn">
            <div className="p-6">
              <div className="prose max-w-none">
                {searchResults.content.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && (
                    <p
                      key={idx}
                      className="text-slate-800 mb-4 last:mb-0 animate-slideUp"
                      style={{
                        animationDelay: `${idx * 100}ms`
                      }}
                    >
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchApp;