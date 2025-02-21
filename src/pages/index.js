import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { Upload, ChevronDown, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ModelSelector from '../components/ModelSelector';
import SearchInterface from '../components/SearchInterface';
import SearchResults from '../components/SearchResults';
import { SearchModes, SourceTypes } from '../utils/constants';

// First, let's define our blue theme colors at the top
const theme = {
  primary: '#4BA3F5', // The bright blue from the screenshot
  primaryHover: '#3994e8',
  primaryActive: '#2d87db',
  background: '#F8FAFC',
  text: '#334155',
  textLight: '#64748B',
};

// Add this near the top of the file with other constants
const MODEL_OPTIONS = [
  {
    id: 'Perplexity',
    displayName: 'Perplexity-Online',
    description: 'Real-time web analysis'
  },
  {
    id: 'Mixtral-8x7B',
    displayName: 'Mixtral 8x7B',
    description: 'Powerful multi-expert model'
  },
  {
    id: 'Gemma-7B',
    displayName: 'Gemma 7B',
    description: 'Efficient Google model'
  },
  {
    id: 'DeepSeek-70B',
    displayName: 'DeepSeek 70B',
    description: 'Advanced reasoning model'
  }
];

export default function Home() {
  const [searchMode, setSearchMode] = useState(SearchModes.VERIFIED);
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedModel, setSelectedModel] = useState('Mixtral-8x7B');
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [urls, setUrls] = useState(['']);
  const [sessionId] = useState(uuidv4());
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  const [showLeftUploadPanel, setShowLeftUploadPanel] = useState(false);
  const [showRightUploadPanel, setShowRightUploadPanel] = useState(false);
  const [leftUrls, setLeftUrls] = useState(['']);
  const [rightUrls, setRightUrls] = useState(['']);
  const [activePanel, setActivePanel] = useState(null); // 'left' or 'right' or null
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchType, setSearchType] = useState({
    verified: 'default', // 'default', 'custom', 'combined'
    open: 'web' // 'web', 'linkedin', 'x', 'reddit', etc.
  });

  const toggleSource = (source) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter(s => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        fetch('/api/cleanup', {
          method: 'POST',
          body: JSON.stringify({ filePath: file.path }),
        }).catch(console.error);
      });
    };
  }, [uploadedFiles]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const formData = new FormData();
    formData.append('sessionId', sessionId);
    
    // Initialize progress for each file
    const newProgress = {};
    Array.from(files).forEach(file => {
      formData.append('files', file);
      newProgress[file.name] = 0;
    });
    setUploadProgress(newProgress);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          
          // Update progress for all files
          const updatedProgress = {};
          Object.keys(newProgress).forEach(fileName => {
            updatedProgress[fileName] = percentCompleted;
          });
          setUploadProgress(updatedProgress);
        },
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setUploadedFiles(prev => [...prev, ...data.files]);
      setUploadProgress({}); // Clear progress
    } catch (error) {
      console.error('Upload error:', error);
      // Add error UI feedback here
    }
  };

  const handleSearch = async (query) => {
    if (query.trim() === '') return;
    setIsSearching(true);
    setSearchError(null);

    try {
      // Step 1: Source-specific search
      let sourceResults;
      if (searchMode === SearchModes.VERIFIED) {
        if (searchType.verified === 'default') {
          sourceResults = await searchVerifiedSources(query);
        } else if (searchType.verified === 'custom') {
          sourceResults = await searchCustomSources(query, uploadedFiles, urls);
        } else {
          // combined search
          const [verifiedResults, customResults] = await Promise.all([
            searchVerifiedSources(query),
            searchCustomSources(query, uploadedFiles, urls)
          ]);
          sourceResults = [...verifiedResults, ...customResults];
        }
      } else {
        // Open research tab
        sourceResults = await searchSpecificSource(searchType.open, query);
      }

      // Step 2: Process with selected LLM
      const llmResults = await fetch('/api/processResults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results: sourceResults,
          model: selectedModel
        })
      }).then(res => res.json());

      // Update search history
      setSearchHistory(prev => [
        { 
          query, 
          timestamp: new Date(),
          tab: searchMode,
          searchType: searchType[searchMode],
          model: selectedModel
        },
        ...prev.slice(0, 9)
      ]);

      setSearchResults(llmResults);
    } catch (error) {
      setSearchError('Search failed. Please try again.');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>AI-Powered Research Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="container mx-auto max-w-[800px] px-6 py-16">
        {/* Header - Updated styling */}
        <div className="text-center mb-8">
          <h1 className="text-[56px] font-bold mb-2 text-[#1E3A8A]">
            Research Hub
          </h1>
          <p className="text-[20px] text-gray-500">
            Search across curated, verified sources for reliable insights
          </p>
        </div>

        {/* Search Mode Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setSearchMode(SearchModes.VERIFIED)}
            className={`px-6 py-2 rounded-lg transition-all ${
              searchMode === SearchModes.VERIFIED 
                ? 'bg-[#4BA3F5] text-white' 
                : 'border border-gray-300'
            }`}
          >
            Verified Sources
          </button>
          <button
            onClick={() => setSearchMode(SearchModes.OPEN)}
            className={`px-6 py-2 rounded-lg transition-all ${
              searchMode === SearchModes.OPEN 
                ? 'bg-[#4BA3F5] text-white' 
                : 'border border-gray-300'
            }`}
          >
            Open Research
          </button>
        </div>

        {/* Model Selection */}
        <ModelSelector 
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />

        {/* Search Interface */}
        <SearchInterface 
          mode={searchMode}
          selectedSources={selectedSources}
          setSelectedSources={setSelectedSources}
          selectedModel={selectedModel}
        />

        {/* Search Results */}
        {searchResults && (
          <div className="mt-8 space-y-8">
            {/* Results display with follow-up capability */}
            <SearchResults 
              results={searchResults}
              onFollowUp={handleSearch}
              isLoading={isSearching}
              error={searchError}
            />
          </div>
        )}
      </main>
    </div>
  );
}
