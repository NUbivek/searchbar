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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          selectedSources,
          model: selectedModel,
          uploadedFiles,
          urls
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
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
    <>
      <Head>
        <title>Founder's Research Hub</title>
        <meta name="description" content="Strategic insights powered by curated sources" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
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

          {searchResults && (
            <SearchResults results={searchResults} />
          )}
        </div>
      </div>
    </>
  );
}
