import Head from 'next/head';
import { useState, useRef, useEffect } from 'react';
import { Upload, ChevronDown, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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
  const [activeTab, setActiveTab] = useState('verified');
  const [selectedModel, setSelectedModel] = useState('Mixtral-8x7B');
  const [selectedSources, setSelectedSources] = useState(['Web']);
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

  // Enhanced search handler
  const handleOpenSearch = async (query) => {
    if (query.trim() === '') return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // Save to search history
      setSearchHistory(prev => [
        { query, timestamp: new Date(), sources: [...selectedSources] },
        ...prev.slice(0, 9) // Keep last 10 searches
      ]);

      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      setSearchError('Failed to perform search. Please try again.');
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

        {/* Enhanced Tabs with Better Shadow */}
        <div className="flex justify-center mb-16">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('verified')}
              className={`px-8 py-3 text-[18px] transition-all
                ${activeTab === 'verified' 
                  ? 'bg-[#4BA3F5] text-white shadow-[0_4px_12px_rgba(75,163,245,0.25)] relative z-10 font-medium' 
                  : 'bg-gray-50 text-gray-600 hover:text-gray-800'
                }`}
            >
              Verified Sources
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`px-8 py-3 text-[18px] transition-all
                ${activeTab === 'open' 
                  ? 'bg-[#4BA3F5] text-white shadow-[0_4px_12px_rgba(75,163,245,0.25)] relative z-10 font-medium' 
                  : 'bg-gray-50 text-gray-600 hover:text-gray-800'
                }`}
            >
              Open Research
            </button>
          </div>
        </div>

        {activeTab === 'verified' ? (
          <div className="space-y-8">
            {/* Search - Enhanced and Centered */}
            <div className="flex flex-col items-center mb-12">
              {/* Model Selector - Made wider and shorter */}
              <div className="w-[240px] mb-6">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="w-full px-4 py-1.5 text-[16px] border border-gray-300 rounded-lg
                            bg-white text-center group hover:border-[#4BA3F5] 
                            focus:ring-2 focus:ring-[#4BA3F5]/20 transition-all
                            flex items-center justify-between"
                >
                  <span className="flex-1 text-center">{selectedModel}</span>
                  <ChevronDown 
                    className={`transition-transform duration-200 text-gray-900 mr-1
                      ${showModelDropdown ? 'rotate-180' : ''}`}
                    size={16}
                  />
                </button>

                {/* Dropdown Menu - Match parent width */}
                {showModelDropdown && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border 
                                border-gray-300 rounded-lg shadow-lg overflow-hidden
                                animate-slideDown z-10">
                    {MODEL_OPTIONS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowModelDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50
                                 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="text-[16px]">{model.displayName}</div>
                        <div className="text-[13px] text-gray-500">{model.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Bar - Made larger and centered */}
              <div className="w-full max-w-2xl flex gap-3">
                <input
                  type="text"
                  placeholder="Search verified sources"
                  className="flex-1 px-6 py-3.5 text-[18px] border border-gray-300 rounded-lg
                           hover:border-[#4BA3F5] focus:border-[#4BA3F5] 
                           focus:ring-2 focus:ring-[#4BA3F5]/20 transition-all
                           placeholder:text-gray-400"
                />
                <button className="px-8 py-3.5 bg-[#4BA3F5] text-white rounded-lg text-[18px]
                                hover:bg-[#3994e8] active:bg-[#2d87db] 
                                transform active:scale-[0.98] transition-all
                                shadow-sm hover:shadow-md">
                  Search
                </button>
              </div>
            </div>

            {/* Two Panel Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left Panel Option */}
              <div className="space-y-4">
                <button 
                  onClick={() => setActivePanel(activePanel === 'left' ? null : 'left')}
                  className={`w-full p-6 rounded-lg text-left transition-all border-2
                    ${activePanel === 'left'
                      ? 'border-[#4BA3F5] bg-[#4BA3F5]/5'
                      : 'border-gray-200 hover:border-[#4BA3F5]/50'
                    }`}
                >
                  <h2 className="text-[20px] md:text-[24px] font-bold whitespace-nowrap mb-0.5">
                    Custom Sources Only
                  </h2>
                  <p className="text-[14px] text-gray-600 whitespace-nowrap">
                    Upload files or add URLs
                  </p>
                </button>
              </div>

              {/* Right Panel Option */}
              <div className="space-y-4">
                <button 
                  onClick={() => setActivePanel(activePanel === 'right' ? null : 'right')}
                  className={`w-full p-6 rounded-lg text-left transition-all border-2
                    ${activePanel === 'right'
                      ? 'border-[#4BA3F5] bg-[#4BA3F5]/5'
                      : 'border-gray-200 hover:border-[#4BA3F5]/50'
                    }`}
                >
                  <h2 className="text-[20px] md:text-[24px] font-bold whitespace-nowrap mb-0.5">
                    Custom + Verified Sources
                  </h2>
                  <p className="text-[14px] text-gray-600 whitespace-nowrap">
                    Combine with curated sources
                  </p>
                </button>
              </div>
            </div>

            {/* Full Width Upload Panel */}
            {activePanel && (
              <div className="animate-slideDown mt-6">
                <div className="border border-gray-300 rounded-lg p-6 bg-white">
                  {activePanel === 'right' && (
                    <p className="text-[13px] text-gray-500 mb-4 italic">
                      Leave blank to only use verified sources
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Upload Files Section */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-[16px]">Upload Files</h3>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        className="hidden"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                 hover:bg-gray-50 hover:border-[#4BA3F5] transition-all
                                 flex items-center justify-center gap-2"
                      >
                        <Upload size={18} />
                        Choose Files
                      </button>
                      {uploadedFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="text-sm text-gray-600 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="truncate max-w-[200px]">{file.name}</span>
                                <span className="text-xs text-gray-400">
                                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                                  fetch('/api/cleanup', {
                                    method: 'POST',
                                    body: JSON.stringify({ filePath: file.path }),
                                  });
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Add URLs Section */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-[16px]">Add URLs</h3>
                      {(activePanel === 'left' ? leftUrls : rightUrls).map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => {
                              const newUrls = [...(activePanel === 'left' ? leftUrls : rightUrls)];
                              newUrls[index] = e.target.value;
                              activePanel === 'left' ? setLeftUrls(newUrls) : setRightUrls(newUrls);
                            }}
                            placeholder="Enter URL"
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg
                                     hover:border-gray-400 focus:border-[#4BA3F5] 
                                     focus:ring-2 focus:ring-[#4BA3F5]/20 transition-all"
                          />
                          {(activePanel === 'left' ? leftUrls : rightUrls).length > 1 && (
                            <button
                              onClick={() => {
                                const newUrls = (activePanel === 'left' ? leftUrls : rightUrls)
                                  .filter((_, i) => i !== index);
                                activePanel === 'left' ? setLeftUrls(newUrls) : setRightUrls(newUrls);
                              }}
                              className="text-gray-400 hover:text-gray-600 px-2"
                            >
                              ×
                            </button>
                          )}
                          {index === (activePanel === 'left' ? leftUrls : rightUrls).length - 1 && (
                            <button
                              onClick={() => {
                                const newUrls = [...(activePanel === 'left' ? leftUrls : rightUrls), ''];
                                activePanel === 'left' ? setLeftUrls(newUrls) : setRightUrls(newUrls);
                              }}
                              className="text-[#4BA3F5] hover:text-[#3994e8] px-2 
                                       transition-transform hover:scale-110"
                            >
                              +
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add Model Selector at the top */}
            <div className="flex justify-center mb-6">
              <div className="w-[240px] relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="w-full px-4 py-1.5 text-[16px] border border-gray-300 rounded-lg
                            bg-white text-center group hover:border-[#4BA3F5] 
                            focus:ring-2 focus:ring-[#4BA3F5]/20 transition-all
                            flex items-center justify-between"
                >
                  <span className="flex-1 text-center">{selectedModel}</span>
                  <ChevronDown 
                    className={`transition-transform duration-200 text-gray-900 mr-1
                      ${showModelDropdown ? 'rotate-180' : ''}`}
                    size={16}
                  />
                </button>

                {showModelDropdown && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border 
                                border-gray-300 rounded-lg shadow-lg overflow-hidden
                                animate-slideDown z-10">
                    {MODEL_OPTIONS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowModelDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50
                                 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="text-[16px]">{model.displayName}</div>
                        <div className="text-[13px] text-gray-500">{model.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Existing Search Section */}
            <div className="space-y-6">
              {/* Search Input with History */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across the web..."
                  className="w-full px-4 py-2.5 text-[18px] border border-gray-300 rounded-lg
                           hover:border-[#4BA3F5] focus:border-[#4BA3F5] 
                           focus:ring-2 focus:ring-[#4BA3F5]/20 transition-all
                           pr-24" // Space for clear button
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleOpenSearch(searchQuery);
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 
                             text-gray-400 hover:text-gray-600 p-2"
                  >
                    Clear
                  </button>
                )}
                
                {/* Search History Dropdown */}
                {searchQuery && searchHistory.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border 
                                border-gray-300 rounded-lg shadow-lg overflow-hidden z-10">
                    {searchHistory
                      .filter(h => h.query.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((history, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(history.query);
                            handleOpenSearch(history.query);
                          }}
                          className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3"
                        >
                          <span className="text-gray-400">↑</span>
                          <div className="flex-1">
                            <div className="font-medium">{history.query}</div>
                            <div className="text-sm text-gray-500">
                              {history.sources.join(', ')}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(history.timestamp).toLocaleTimeString()}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {searchError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                  {searchError}
                </div>
              )}

              {/* Loading State */}
              {isSearching && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4BA3F5] mx-auto" />
                  <p className="mt-4 text-gray-500">Searching across selected sources...</p>
                </div>
              )}

              {/* Source Buttons - All in one grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { name: 'Web', icon: <Search size={14} /> },
                  'LinkedIn',
                  'X',
                  'Reddit',
                  'Crunchbase'
                ].map((source) => (
                  <button
                    key={typeof source === 'string' ? source : source.name}
                    onClick={() => toggleSource(typeof source === 'string' ? source : source.name)}
                    className={`p-3 rounded-lg text-[14px] transform transition-all duration-200 ${
                      selectedSources.includes(typeof source === 'string' ? source : source.name)
                        ? 'bg-[#4BA3F5] text-white scale-[1.02] shadow-[0_4px_12px_rgba(75,163,245,0.25)]'
                        : 'border border-gray-300 hover:bg-gray-50 hover:border-[#4BA3F5] active:scale-[0.98]'
                    }`}
                  >
                    {typeof source === 'string' ? (
                      source
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        {source.icon}
                        {source.name}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {['Pitchbook', 'Medium', 'Substack', 'Verified Sources'].map((source) => (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  className={`p-3 rounded-lg text-[14px] transform transition-all duration-200 ${
                    selectedSources.includes(source)
                      ? 'bg-[#4BA3F5] text-white scale-[1.02] shadow-[0_4px_12px_rgba(75,163,245,0.25)]'
                      : 'border border-gray-300 hover:bg-gray-50 hover:border-[#4BA3F5] active:scale-[0.98]'
                  }`}
                >
                  {source}
                </button>
              ))}
              
              {/* Upload button in the same row */}
              <button 
                onClick={() => setShowUploadPanel(!showUploadPanel)}
                className="p-3 border border-gray-300 rounded-lg text-[13px] 
                         hover:bg-gray-50 hover:border-[#4BA3F5] transition-all
                         flex items-center justify-center gap-1.5 group whitespace-nowrap"
              >
                <Upload size={15} className="group-hover:scale-110 transition-transform" />
                Upload + URL
              </button>
            </div>

            {/* Modified Upload Panel with Multiple URLs */}
            {showUploadPanel && (
              <div className="animate-slideDown border border-gray-300 rounded-lg p-6 bg-white mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-medium text-[16px]">Upload Files</h3>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      className="hidden"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                               hover:bg-gray-50 hover:border-gray-400 transition-all
                               flex items-center justify-center gap-2"
                    >
                      <Upload size={18} />
                      Choose Files
                    </button>
                    {uploadedFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="text-sm text-gray-600 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[200px]">{file.name}</span>
                              <span className="text-xs text-gray-400">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                                fetch('/api/cleanup', {
                                  method: 'POST',
                                  body: JSON.stringify({ filePath: file.path }),
                                });
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-[16px]">Add URLs</h3>
                    </div>
                    {urls.map((url, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...urls];
                            newUrls[index] = e.target.value;
                            setUrls(newUrls);
                          }}
                          placeholder="Enter URL"
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg
                                   hover:border-gray-400 focus:border-gray-500 
                                   focus:ring-2 focus:ring-gray-200 transition-all"
                        />
                        {urls.length > 1 && (
                          <button
                            onClick={() => {
                              const newUrls = urls.filter((_, i) => i !== index);
                              setUrls(newUrls);
                            }}
                            className="text-gray-400 hover:text-gray-600 px-2"
                          >
                            ×
                          </button>
                        )}
                        {index === urls.length - 1 && (
                          <button
                            onClick={() => setUrls([...urls, ''])}
                            className="text-[#4BA3F5] hover:text-[#3994e8] px-2 
                                     transition-transform hover:scale-110"
                          >
                            +
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="mt-2 space-y-2">
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span className="truncate">{fileName}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#4BA3F5] transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
