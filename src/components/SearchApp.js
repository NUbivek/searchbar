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

const SearchApp = () => {
  const { selectedModel } = useModel();
  const isStaticBuild = PRODUCTION_CONFIG.isStaticBuild;
  
  // State declarations
  const [searchMode, setSearchMode] = useState(SEARCH_MODES.VERIFIED);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sourceScope, setSourceScope] = useState('only-user');
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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');

  // Utility functions
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Fixed handleUrlAdd function
  const handleUrlAdd = useCallback(() => {
    console.log('Adding URL:', newUrl); // Debug log
    if (newUrl && isValidUrl(newUrl)) {
      setUrls(prevUrls => [...prevUrls, newUrl]);
      setNewUrl('');
    }
  }, [newUrl]);

  // Fixed handleFileUpload function
  const handleFileUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidSize = file.size <= API_CONFIG.maxFileSize;
      const isValidType = API_CONFIG.allowedFileTypes.includes(file.type);
      return isValidSize && isValidType;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  }, []);

  // Fixed handleModeSwitch function
  const handleModeSwitch = useCallback((mode) => {
    console.log('Switching mode to:', mode); // Debug log
    setSearchMode(mode);
    setSearchResults(null);
    setError(null);
    setSelectedSources(mode === SEARCH_MODES.VERIFIED ? 
      { [SOURCE_TYPES.VERIFIED]: true } : 
      { [SOURCE_TYPES.WEB]: true }
    );
  }, []);

  // Search handling functions
  const processSearch = useCallback(async (query) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isStaticBuild) {
        setSearchResults(PRODUCTION_CONFIG.mockData.webSearch);
        return;
      }

      const searchConfig = {
        query,
        mode: searchMode,
        model: selectedModel,
        sources: selectedSources,
        sourceScope: sourceScope,
        customSources: {
          files: uploadedFiles,
          urls: urls
        }
      };

      const response = await fetch(API_CONFIG.endpoints.search.verified, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchConfig)
      });

      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      setError(error.message);
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchMode, selectedModel, selectedSources, sourceScope, uploadedFiles, urls, isStaticBuild]);

  // Fixed handleSearch function
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const searchConfig = {
        query: searchQuery,
        mode: searchMode,
        model: selectedModel,
        sources: selectedSources,
        sourceScope: sourceScope,
        customSources: {
          files: uploadedFiles,
          urls: urls
        }
      };

      const response = await fetch(API_CONFIG.endpoints.search.verified, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchConfig)
      });

      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      setError(error.message);
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, searchMode, selectedModel, selectedSources, sourceScope, uploadedFiles, urls]);

  const handleFollowUpQuestion = useCallback(async () => {
    if (!followUpQuestion.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(API_CONFIG.endpoints.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: followUpQuestion,
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
  }, [followUpQuestion, searchResults, selectedModel]);

  // Define CustomSourcesPanel component
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
              className={`${styles.button} !px-4`}
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            Founder's Research Hub
          </h1>
          <p className="text-xl text-slate-600">
            Strategic insights powered by curated sources
          </p>
        </header>

        {/* Search Mode Selector */}
        <div className="flex justify-center">
          <div className="inline-flex bg-white rounded-full p-1 shadow-lg">
            <button
              onClick={() => handleModeSwitch(SEARCH_MODES.VERIFIED)}
              className={`
                px-6 py-2 rounded-full transition-all duration-200
                ${searchMode === SEARCH_MODES.VERIFIED 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'}
              `}
            >
              Verified Sources
            </button>
            <button
              onClick={() => handleModeSwitch(SEARCH_MODES.OPEN)}
              className={`
                px-6 py-2 rounded-full transition-all duration-200
                ${searchMode === SEARCH_MODES.OPEN 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-600 hover:bg-slate-100'}
              `}
            >
              Open Research
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          isLoading={isLoading}
        />

        {/* Source Selection */}
        {searchMode === SEARCH_MODES.VERIFIED ? (
          <VerifiedSourcesPanel
            sourceScope={sourceScope}
            setSourceScope={setSourceScope}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            urls={urls}
            setUrls={setUrls}
            newUrl={newUrl}
            setNewUrl={setNewUrl}
          />
        ) : (
          <OpenResearchPanel
            selectedSources={selectedSources}
            setSelectedSources={setSelectedSources}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Search Results */}
        {searchResults && (
          <div className="space-y-6">
            <SearchResults results={searchResults} />
            
            {/* Follow-up Question Section */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Ask a follow-up question
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={followUpQuestion}
                  onChange={(e) => setFollowUpQuestion(e.target.value)}
                  placeholder="Ask for more details or clarification..."
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleFollowUpQuestion}
                  disabled={isLoading || !followUpQuestion.trim()}
                  className={`${styles.button} !px-6`}
                >
                  Ask
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchApp;