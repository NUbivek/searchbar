import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import FileUpload from './FileUpload';
import UrlInput from './UrlInput';
import SearchErrorBoundary from './SearchErrorBoundary';
import SearchResults from './SearchResults';
import { performSearch, SearchModes, SourceTypes, VERIFIED_SOURCES } from '../utils/searchUtils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SourceSelector from './SourceSelector';

export default function VerifiedSearch() {
  const [query, setQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('mixtral-8x7b');
  const [customMode, setCustomMode] = useState('combined'); // Initialize with combined mode
  const [isCustomSourcesExpanded, setIsCustomSourcesExpanded] = useState(false);
  const [customUrls, setCustomUrls] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedSources, setSelectedSources] = useState(['verified']); // Initialize with verified selected
  const chatEndRef = useRef(null);

  // Ensure verified sources are always included in combined mode
  useEffect(() => {
    if (customMode === 'combined' && !selectedSources.includes('verified')) {
      setSelectedSources(prev => [...prev, 'verified']);
    }
  }, [customMode, selectedSources]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Helper function to get current sources
  const getCurrentSources = () => {
    const sources = [];
    if (customMode === 'verified') {
      sources.push({
        type: 'Market Data Analytics',
        sources: VERIFIED_SOURCES['Market Data Analytics']
      });
      sources.push({
        type: 'VC & Startups',
        sources: [...VERIFIED_SOURCES['VC & Startups'], ...VERIFIED_SOURCES['VC Firms']]
      });
    }
    return sources;
  };

  // Helper function to perform search with current settings
  const performSearchWithCurrentSettings = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const searchResults = await performSearch(searchQuery, {
        mode: SearchModes.VERIFIED,
        model: selectedModel,
        customUrls,
        files: uploadedFiles,
        sources: getCurrentSources(),
        context: chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].response.content : ''
      });

      // Add new result to chat history
      setChatHistory(prev => [{
        query: searchQuery,
        response: {
          summary: searchResults.summary || {
            content: 'No results found',
            sourceMap: {}
          },
          model: selectedModel
        },
        timestamp: new Date().toISOString()
      }, ...prev]);

      setQuery('');
    } catch (error) {
      setError(error.message || 'Failed to perform search');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await performSearchWithCurrentSettings();
  };

  const handleFollowUpSearch = async (followUpQuery) => {
    await performSearchWithCurrentSettings(followUpQuery);
  };

  const handleSourceToggle = (source) => {
    setSelectedSources(prev => {
      if (prev.includes(source)) {
        return prev.filter(s => s !== source);
      } else {
        return [...prev, source];
      }
    });
  };

  const handleCustomSourceAdd = (url) => {
    setCustomUrls(prev => [...prev, url]);
  };

  const handleFileUpload = (files) => {
    setUploadedFiles(files);
  };

  return (
    <div className="space-y-4">
      {/* Main search section with source selector */}
      <div className="space-y-2">
        {/* Search bar with prominent styling */}
        <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
          <div className="flex items-stretch">
            <div className="flex-1 flex items-center px-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search verified sources..."
                className="flex-1 px-3 py-4 text-lg bg-transparent outline-none placeholder-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    performSearchWithCurrentSettings();
                  }
                }}
              />
            </div>

            {/* Model selector */}
            <div className="relative bg-gray-50 border-l border-gray-100">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="h-full px-4 py-4 bg-transparent border-none outline-none text-gray-600"
              >
                <option value="gemma-7b">Gemma-7B</option>
                <option value="mixtral-8x7b">Mixtral-8x7B</option>
                <option value="deepseek-70b">DeepSeek-70B</option>
              </select>
            </div>

            {/* Search button */}
            <button
              onClick={() => performSearchWithCurrentSettings()}
              disabled={loading}
              className="px-6 py-4 bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Source selector with subdued styling */}
        <div className="w-full max-w-4xl mx-auto bg-gray-50/80 rounded-lg">
          <SourceSelector
            mode={SearchModes.VERIFIED}
            selectedSources={selectedSources}
            onSourceToggle={handleSourceToggle}
            onCustomSourceAdd={handleCustomSourceAdd}
            onFileUpload={handleFileUpload}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Search Results and Chat History */}
      <div className="w-full max-w-4xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <SearchResults results={chatHistory} />
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}