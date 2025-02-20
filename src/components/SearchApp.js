import React, { useState, useCallback } from 'react';
import { Search, Upload, X, Plus, Link, FileText } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import OpenResearchPanel from '@/components/OpenResearchPanel';
import SearchResults from '@/components/SearchResults';
import ModelSelector from '@/components/ModelSelector';
import FollowUpQuestion from '@/components/FollowUpQuestion';
import { SOURCE_TYPES, API_CONFIG } from '@/config/constants';
import { useModel } from '@/contexts/ModelContext';
import styles from '@/styles/Button.module.css';

const SearchApp = () => {
  const { selectedModel, setSelectedModel } = useModel();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSources, setSelectedSources] = useState({
    [SOURCE_TYPES.WEB]: true,
    [SOURCE_TYPES.LINKEDIN]: false,
    [SOURCE_TYPES.X]: false,
    [SOURCE_TYPES.REDDIT]: false,
    [SOURCE_TYPES.SUBSTACK]: false,
    [SOURCE_TYPES.CRUNCHBASE]: false,
    [SOURCE_TYPES.PITCHBOOK]: false,
    [SOURCE_TYPES.MEDIUM]: false
  });
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    
    try {
      const searchConfig = {
        query: searchQuery,
        model: selectedModel,
        sources: selectedSources
      };

      const response = await fetch(API_CONFIG.endpoints.search.web, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchConfig)
      });

      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedModel, selectedSources]);

  const handleFollowUp = useCallback(async (question) => {
    if (!question.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch(API_CONFIG.endpoints.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: searchResults,
          model: selectedModel
        })
      });

      if (!response.ok) throw new Error('Failed to process follow-up question');
      
      const data = await response.json();
      setSearchResults(prev => ({
        ...prev,
        followUp: data.response
      }));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchResults, selectedModel]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Founder's Research Hub
          </h1>
          <p className="text-xl text-slate-600">
            Strategic insights powered by curated sources
          </p>
        </header>

        <ModelSelector
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />

        <div className="space-y-8">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            isLoading={isLoading}
          />

          <OpenResearchPanel
            selectedSources={selectedSources}
            setSelectedSources={setSelectedSources}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {searchResults && (
          <div className="space-y-8">
            <SearchResults results={searchResults} />
            
            <FollowUpQuestion
              onAsk={handleFollowUp}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchApp;