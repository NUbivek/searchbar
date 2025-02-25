import React, { useState } from 'react';
import Head from 'next/head';
import VerifiedSearch from '../components/VerifiedSearch';
import OpenSearch from '../components/OpenSearch';
import { SearchModes, MODEL_OPTIONS } from '../utils/constants';

export default function Home() {
  const [mode, setMode] = useState(SearchModes.VERIFIED);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0].id);

  return (
    <>
      <Head>
        <title>Research Hub</title>
        <meta name="description" content="Search across verified sources and market data" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-bold text-[#1E3A8A] mb-2">Research Hub</h1>
          <p className="text-gray-600">
            Search across verified sources and market data
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg p-1 bg-gray-50">
            <button
              onClick={() => setMode(SearchModes.VERIFIED)}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === SearchModes.VERIFIED
                  ? 'bg-[#0066FF] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Verified Sources
            </button>
            <button
              onClick={() => setMode(SearchModes.OPEN)}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === SearchModes.OPEN
                  ? 'bg-[#0066FF] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Open Research
            </button>
          </div>
        </div>

        {mode === SearchModes.VERIFIED ? (
          <VerifiedSearch selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
        ) : (
          <OpenSearch selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
        )}
      </div>
    </>
  );
}
