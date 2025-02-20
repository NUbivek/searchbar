import React, { useState, useCallback } from 'react';
import { Search, Upload, X, Plus, Link, FileText } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import VerifiedSourcesPanel from '@/components/VerifiedSourcesPanel';
import OpenResearchPanel from '@/components/OpenResearchPanel';
import SearchResults from '@/components/SearchResults';
import LinkedInResults from '@/components/LinkedInResults';
import { SEARCH_MODES, SOURCE_TYPES, SOURCES_CONFIG, API_CONFIG } from '@/config/constants';
import PRODUCTION_CONFIG from '@/config/production.config';
import { useModel } from '@/contexts/ModelContext';
import styles from '@/styles/Button.module.css';

// Simplified version with only Open Research mode
const SearchApp = () => {
  const { selectedModel } = useModel();
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSources, setSelectedSources] = useState({
    [SOURCE_TYPES.WEB]: true
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Founder's Research Hub
          </h1>
          <p className="text-xl text-slate-600">
            Strategic insights powered by curated sources
          </p>
        </header>

        <OpenResearchPanel
          selectedSources={selectedSources}
          setSelectedSources={setSelectedSources}
        />

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {searchResults && <SearchResults results={searchResults} />}
      </div>
    </div>
  );
};

export default SearchApp;