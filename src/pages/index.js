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

  const handleSearch = async (query, customMode = mode) => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = customMode === SearchModes.VERIFIED ? 'verifiedSearch' : 'openSearch';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          model: selectedModel,
          customMode
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
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

        {debugMode && <DebugPanel />}
      </div>
    </div>
  );
}
