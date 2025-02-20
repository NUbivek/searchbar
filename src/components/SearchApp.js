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
    [SOURCE_TYPES.MEDIUM]: false,
    [SOURCE_TYPES.VERIFIED]: false
  });
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    const hasSelectedSource = Object.values(selectedSources).some(isSelected => isSelected);
    if (!hasSelectedSource) {
      setError('Please select at least one search source');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting search with:', {
        query: searchQuery,
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
        throw new Error('Search failed');
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

          <div className="grid gap-6 md:grid-cols-2">
            <OpenResearchPanel
              selectedSources={selectedSources}
              setSelectedSources={setSelectedSources}
            />

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-blue-800 mb-4">
                Upload Files & URLs
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-50 border-2 border-dashed border-blue-200">
                    <Upload size={20} />
                    <span>Choose Files</span>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setUploadedFiles(Array.from(e.target.files))}
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
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="Enter URL..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (newUrl && isValidUrl(newUrl)) {
                          setUrls(prev => [...prev, newUrl]);
                          setNewUrl('');
                        }
                      }}
                      disabled={!newUrl || !isValidUrl(newUrl)}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50`}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  {urls.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {urls.map((url, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
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
          </div>
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