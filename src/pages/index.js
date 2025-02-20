"use client";

import React, { useState } from 'react';
import Head from 'next/head';
import SearchBar from '@/components/SearchBar';
import OpenResearchPanel from '@/components/OpenResearchPanel';
import SearchResults from '@/components/SearchResults';
import ModelSelector from '@/components/ModelSelector';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSources, setSelectedSources] = useState({});
  const [selectedModel, setSelectedModel] = useState('gemma-2');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    const activeSourceTypes = Object.entries(selectedSources)
      .filter(([_, isSelected]) => isSelected)
      .map(([sourceType]) => sourceType);

    console.log('Active sources:', activeSourceTypes);

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          selectedSources: activeSourceTypes,
          model: selectedModel
        }),
      });

      const data = await response.json();
      console.log('Search response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setError(error.message || 'Failed to perform search');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>Founder's Research Hub</title>
        <meta name="description" content="Strategic insights powered by curated sources" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto py-12 px-8">
          <h1 className="text-4xl font-bold text-blue-900 text-center mb-3">
            Founder's Research Hub
          </h1>
          <p className="text-lg text-slate-600 text-center">
            Strategic insights powered by curated sources
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8 space-y-6">
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
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          urls={urls}
          setUrls={setUrls}
          newUrl={newUrl}
          setNewUrl={setNewUrl}
          isValidUrl={isValidUrl}
        />

        <SearchResults 
          results={searchResults} 
          error={error}
        />
      </div>
    </div>
  );
}
