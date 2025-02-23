"use client";

import React, { useCallback, useEffect } from 'react';
import { SOURCE_TYPES, SOURCES_CONFIG } from '@/config/constants';
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
  isValidUrl
}) => {
  // Initialize sources with web selected by default
  useEffect(() => {
    setSelectedSources({
      web: true,
      linkedin: false,
      x: false,
      reddit: false,
      substack: false,
      crunchbase: false,
      pitchbook: false,
      medium: false,
      upload: false
    });
  }, []); // Empty dependency array means this runs once on mount

  const handleSourceToggle = useCallback((sourceType, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedSources(prev => {
      // Create a copy of the current state
      const newState = { ...prev };
      // Toggle the clicked source
      newState[sourceType] = !prev[sourceType];
      console.log('Toggling source:', sourceType, 'New state:', newState);
      return newState;
    });
  }, [setSelectedSources]);

  // Log source changes for debugging
  useEffect(() => {
    console.log('Selected sources updated:', selectedSources);
  }, [selectedSources]);

  // Add upload option to source types
  const allSourceTypes = {
    ...SOURCE_TYPES,
    'upload': 'Upload Files & URLs'
  };

  return (
    <div className="space-y-6">
      {/* Source Selection */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-4">
          Select Search Source
        </h2>
        <button
          onClick={() => setSelectedSources({ ...selectedSources, web: true })}
          className={`p-3 rounded-lg flex items-center gap-2
            ${selectedSources['web'] 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
        >
          <Globe size={18} />
          <span className="font-medium">Web Search</span>
        </button>
      </div>

      {/* Upload Panel - Only show when upload source is selected */}
      {selectedSources['upload'] && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-4">
            Upload Files & URLs
          </h2>
          <div className="space-y-6">
            {/* File Upload Section */}
            <div>
              <label 
                htmlFor="fileUpload" 
                className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-50 border-2 border-dashed border-blue-200"
              >
                <Upload size={20} />
                <span>Choose Files</span>
                <input
                  id="fileUpload"
                  name="files"
                  type="file"
                  multiple
                  onChange={(e) => setUploadedFiles(Array.from(e.target.files))}
                  className="hidden"
                  accept=".txt,.pdf,.xlsx,.csv,.json"
                />
              </label>
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-600" />
                        <span className="text-sm text-slate-700 truncate">{file.name}</span>
                      </div>
                      <button
                        onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                        className="p-1 hover:bg-slate-200 rounded-full"
                      >
                        <X size={16} className="text-slate-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* URL Input Section */}
            <div>
              <div className="flex gap-2">
                <label htmlFor="urlInput" className="sr-only">
                  Enter URL
                </label>
                <input
                  id="urlInput"
                  name="url"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="Enter URL..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    if (newUrl && isValidUrl(newUrl)) {
                      setUrls(prev => [...prev, newUrl]);
                      setNewUrl('');
                    }
                  }}
                  disabled={!newUrl || !isValidUrl(newUrl)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Plus size={20} />
                </button>
              </div>
              {urls.length > 0 && (
                <div className="mt-4 space-y-2">
                  {urls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Link size={16} className="text-blue-600" />
                        <span className="text-sm text-slate-700 truncate">{url}</span>
                      </div>
                      <button
                        onClick={() => setUrls(urls => urls.filter((_, i) => i !== index))}
                        className="p-1 hover:bg-slate-200 rounded-full"
                      >
                        <X size={16} className="text-slate-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenResearchPanel; 