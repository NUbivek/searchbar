import React, { useState, useEffect } from 'react';
import { SearchModes, SourceTypes } from '../utils/constants';
import { ChevronDown, ChevronUp, Upload, Link, X } from 'lucide-react';

export default function SourceSelector({ mode, selectedSources, onSourceToggle, onCustomSourceAdd, onFileUpload, isLoading = false }) {
  const [isCustomSourcesOpen, setIsCustomSourcesOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [addedUrls, setAddedUrls] = useState([]);
  const [addedFiles, setAddedFiles] = useState([]);

  // Initialize with web and verified sources selected
  useEffect(() => {
    if (mode === SearchModes.OPEN && !selectedSources.includes('web')) {
      onSourceToggle('web');
    }
    if (!selectedSources.includes('verified')) {
      onSourceToggle('verified');
    }
  }, [mode]); // Only run when mode changes

  const mainSources = [
    SourceTypes.WEB,
    SourceTypes.LINKEDIN,
    SourceTypes.TWITTER,
    SourceTypes.REDDIT,
    SourceTypes.SUBSTACK,
    SourceTypes.MEDIUM,
    SourceTypes.CRUNCHBASE,
    SourceTypes.PITCHBOOK,
    'Verified',
    'Custom'
  ];

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (customUrl) {
      const newUrl = customUrl.trim();
      if (!addedUrls.includes(newUrl)) {
        setAddedUrls([...addedUrls, newUrl]);
        onCustomSourceAdd(newUrl);
      }
      setCustomUrl('');
    }
  };

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files);
    const uniqueFiles = newFiles.filter(file => 
      !addedFiles.some(existingFile => existingFile.name === file.name)
    );
    
    if (uniqueFiles.length > 0) {
      setAddedFiles([...addedFiles, ...uniqueFiles]);
      onFileUpload(uniqueFiles);
    }
  };

  const removeUrl = (urlToRemove) => {
    setAddedUrls(addedUrls.filter(url => url !== urlToRemove));
  };

  const removeFile = (fileToRemove) => {
    setAddedFiles(addedFiles.filter(file => file.name !== fileToRemove));
  };

  const CustomSourcesSection = () => (
    <div className="absolute left-0 right-0 mt-2 max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-4 space-y-3">
        {/* URL Input Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Enter URL to add source"
              className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUrlSubmit(e);
                }
              }}
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!customUrl || isLoading}
              className="px-3 py-1.5 text-sm bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 border border-gray-200 flex items-center gap-2"
            >
              <Link className="w-4 h-4" />
              <span>Add URL</span>
            </button>
          </div>

          {/* Added URLs List */}
          {addedUrls.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Added URLs:</div>
              <div className="flex flex-wrap gap-2">
                {addedUrls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg text-sm group hover:bg-gray-200 transition-colors"
                  >
                    <span className="truncate max-w-[200px]">{url}</span>
                    <button
                      onClick={() => removeUrl(url)}
                      className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="space-y-2">
          <label className="cursor-pointer px-3 py-1.5 text-sm bg-white text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-200">
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              disabled={isLoading}
            />
          </label>

          {/* Added Files List */}
          {addedFiles.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Added Files:</div>
              <div className="flex flex-wrap gap-2">
                {addedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-lg text-sm group hover:bg-gray-200 transition-colors"
                  >
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <button
                      onClick={() => removeFile(file.name)}
                      className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-2 py-1.5 max-w-4xl mx-auto">
      {mode === SearchModes.VERIFIED ? (
        <div className="space-y-2">
          {/* Custom sources header with verified toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsCustomSourcesOpen(!isCustomSourcesOpen)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="font-medium">Custom</span>
              {isCustomSourcesOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Include Verified</span>
              <button
                onClick={() => onSourceToggle('verified')}
                className={`px-2.5 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedSources.includes('verified')
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                disabled={isLoading}
              >
                {selectedSources.includes('verified') ? 'On' : 'Off'}
              </button>
            </div>
          </div>

          {/* Collapsible custom sources section */}
          {isCustomSourcesOpen && (
            <div className="relative pt-2 space-y-2 border-t border-gray-200">
              <CustomSourcesSection />
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Main sources row */}
          <div className="flex flex-nowrap items-center justify-center gap-1.5" role="group" aria-label="Search sources">
            {mainSources.map((source) => (
              <button
                key={source}
                onClick={() => source === 'Custom' ? setIsCustomSourcesOpen(!isCustomSourcesOpen) : onSourceToggle(source.toLowerCase())}
                className={`px-2.5 py-1 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-1 
                  ${source === 'Custom' 
                    ? isCustomSourcesOpen 
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-sm ring-1 ring-gray-200 hover:ring-gray-300'
                    : selectedSources.includes(source.toLowerCase())
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600 ring-offset-1'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-sm ring-1 ring-gray-200 hover:ring-gray-300'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
                `}
                disabled={isLoading}
              >
                {source}
                {source === 'Custom' && (
                  <ChevronDown 
                    className={`w-3.5 h-3.5 transform transition-transform duration-200 ${
                      isCustomSourcesOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Custom sources dropdown */}
          {isCustomSourcesOpen && <CustomSourcesSection />}
        </div>
      )}
    </div>
  );
}