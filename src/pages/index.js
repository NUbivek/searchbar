import { useState } from 'react';
import Head from 'next/head';
import { SearchModes } from '../utils/constants';
import ModelSelector from '../components/ModelSelector';
import VerifiedSearch from '../components/VerifiedSearch';
import OpenSearch from '../components/OpenSearch';

export default function Home() {
  const [mode, setMode] = useState(SearchModes.VERIFIED);
  const [selectedModel, setSelectedModel] = useState('Perplexity');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Research Hub</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Title and Description */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Research Hub
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Search across verified sources and market data
          </p>
        </div>

        {/* Primary Mode Toggle - Moved to top */}
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
        <div className="mb-8">
          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>

        {/* Conditional Page Rendering */}
        {mode === SearchModes.VERIFIED ? (
          <VerifiedSearch selectedModel={selectedModel} />
        ) : (
          <OpenSearch selectedModel={selectedModel} />
        )}
      </div>
    </div>
  );
}
