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
    setError(null);
    
    try {
      console.log('Searching with:', {
        query: searchQuery,
        model: selectedModel,
        sources: selectedSources
      });

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          model: selectedModel,
          sources: selectedSources
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Search failed');
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
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
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Founder's Research Hub
          </h1>
          <p className="text-xl text-slate-600">
            Strategic insights powered by curated sources
          </p>
        </header>

        <div className="sticky top-0 bg-slate-50 pt-4 pb-6 z-10 space-y-6">
          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />

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

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {searchResults && (
            <div className="space-y-6">
              <SearchResults results={searchResults} />
              
              <div className="sticky bottom-0 bg-slate-50 pt-4">
                <FollowUpQuestion
                  onAsk={handleFollowUp}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchApp;