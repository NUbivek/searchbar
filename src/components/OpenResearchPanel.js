"use client";

import React, { useCallback, useEffect } from 'react';
import { SourceTypes, MODEL_OPTIONS } from '../utils/constants';
import { Upload, X, Plus, Link, FileText, Globe } from 'lucide-react';

const OpenResearchPanel = ({ 
  selectedSources,
  setSelectedSources,
  uploadedFiles = [],
  setUploadedFiles,
  urls = [],
  setUrls,
  newUrl = '',
  setNewUrl,
  isValidUrl,
  loading = false,
  selectedModel = MODEL_OPTIONS[0].id,
  setSelectedModel
}) => {
  // Initialize sources with web selected by default
  useEffect(() => {
    setSelectedSources({
      [SourceTypes.WEB.toLowerCase()]: true, // Default to web
      [SourceTypes.LINKEDIN.toLowerCase()]: false,
      [SourceTypes.TWITTER.toLowerCase()]: false,
      [SourceTypes.REDDIT.toLowerCase()]: false,
      [SourceTypes.SUBSTACK.toLowerCase()]: false,
      [SourceTypes.CRUNCHBASE.toLowerCase()]: false,
      [SourceTypes.PITCHBOOK.toLowerCase()]: false,
      [SourceTypes.MEDIUM.toLowerCase()]: false,
      upload: false
    });
  }, []); // Empty dependency array means this runs once on mount

  const handleSourceToggle = useCallback((sourceType, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedSources(prev => {
      const newState = { ...prev };
      newState[sourceType] = !prev[sourceType];
      return newState;
    });
  }, [setSelectedSources]);

  // Log source changes for debugging
  useEffect(() => {
    console.log('Selected sources updated:', selectedSources);
  }, [selectedSources]);

  // Add upload option to source types
  const allSourceTypes = {
    ...SourceTypes,
    'upload': 'Upload Files & URLs'
  };

  const handleAddUrl = useCallback(() => {
    if (newUrl && isValidUrl(newUrl)) {
      setUrls(prev => [...prev, newUrl]);
      setNewUrl('');
    }
  }, [newUrl, isValidUrl, setUrls, setNewUrl]);

  const handleFileUpload = useCallback((e) => {
    if (!loading) {
      setUploadedFiles(Array.from(e.target.files));
    }
  }, [loading, setUploadedFiles]);

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow">
      {/* Search input and model selection */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter your search query"
          className="flex-1 p-2 border rounded-lg"
        />
        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="p-2 border rounded-lg appearance-none pr-8 bg-white"
          >
            {MODEL_OPTIONS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.icon} {model.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          Search
        </button>
      </div>

      {/* Source Selection */}
      <div className="space-y-4">
        {/* First row: Main sources */}
        <div className="flex justify-between gap-2">
          {Object.entries(SourceTypes).map(([key, source]) => {
            // Skip Market Data and VC Startups as they're for verified sources
            if (key === 'MARKET_DATA' || key === 'VC_STARTUPS') return null;
            
            return (
              <button
                key={source}
                onClick={(e) => handleSourceToggle(source.toLowerCase(), e)}
                disabled={loading}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedSources[source.toLowerCase()]
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {source}
              </button>
            );
          })}
        </div>

        {/* Second row: Custom Sources with toggle */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium">Custom Sources</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Include Verified Sources</span>
            <button
              onClick={(e) => handleSourceToggle('verified', e)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                selectedSources.verified ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span 
                className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                  selectedSources.verified ? 'left-6' : 'left-1'
                }`} 
              />
            </button>
          </div>
        </div>

        {/* Third row: Files + URL section */}
        <div className="space-y-2">
          {/* URL input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Enter URL"
              className="flex-1 p-2 border rounded-lg"
            />
            <button
              onClick={handleAddUrl}
              disabled={!isValidUrl(newUrl)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {/* File upload */}
          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              Choose Files
            </label>
            <span className="text-sm text-gray-500">
              {uploadedFiles.length > 0
                ? `${uploadedFiles.length} file(s) selected`
                : 'No file chosen'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenResearchPanel;