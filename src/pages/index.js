import { useState, useEffect } from 'react';
import Head from 'next/head';
import { SearchModes } from '../utils/constants';
import ModelSelector from '../components/ModelSelector';
import VerifiedSearch from '../components/VerifiedSearch';
import OpenSearch from '../components/OpenSearch';
import DebugPanel from '../components/DebugPanel';

export default function Home() {
  const [mode, setMode] = useState(SearchModes.VERIFIED);
  const [selectedModel, setSelectedModel] = useState('Mixtral-8x7B');
  const [debugMode, setDebugMode] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Enable debug with Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/search/open-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setSearchResults(data.results);
      } else {
        setError(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Research Hub</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Title and Description */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 sm:text-4xl">
            Research Hub
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Search across verified sources and market data
          </p>
        </div>

        {/* Primary Mode Toggle */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => setMode(SearchModes.VERIFIED)}
            className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors
              ${mode === SearchModes.VERIFIED 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Verified Sources
          </button>
          <button
            onClick={() => setMode(SearchModes.OPEN)}
            className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors
              ${mode === SearchModes.OPEN 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Open Research
          </button>
        </div>

        {/* Model Selector */}
        <div className="flex justify-end mb-4">
          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>

        {/* Conditional Page Rendering */}
        {mode === SearchModes.VERIFIED ? (
          <VerifiedSearch 
            selectedModel={selectedModel} 
            onSearch={handleSearch}
            isLoading={isLoading}
            error={error}
            results={searchResults}
          />
        ) : (
          <OpenSearch 
            selectedModel={selectedModel}
            onSearch={handleSearch}
            isLoading={isLoading}
            error={error}
            results={searchResults}
          />
        )}

        {searchResults && (
          <div className="mt-8 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Search Results</h2>
              
              {/* Summary Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <p className="text-gray-700">{searchResults.summary}</p>
              </div>

              {/* Sources Section */}
              {searchResults.sources.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Sources</h3>
                  <div className="space-y-3">
                    {searchResults.sources.map((source, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {source.title}
                        </a>
                        <p className="text-sm text-gray-500">
                          Source: {source.source} {source.verified && '✓'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {debugMode && <DebugPanel />}
      </div>
    </div>
  );
}
