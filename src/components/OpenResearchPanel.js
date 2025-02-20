import React, { useCallback } from 'react';
import { SOURCE_TYPES, SOURCES_CONFIG } from '@/config/constants';
import { Upload, X, Plus, Link, FileText } from 'lucide-react';

const OpenResearchPanel = ({ 
  selectedSources = {},
  setSelectedSources,
  uploadedFiles = [],
  setUploadedFiles,
  urls = [],
  setUrls,
  newUrl = '',
  setNewUrl,
  isValidUrl
}) => {
  const handleSourceToggle = useCallback((sourceType) => {
    console.log('Toggling source:', sourceType);
    setSelectedSources(prev => ({
      ...prev,
      [sourceType]: !prev[sourceType]
    }));
  }, [setSelectedSources]);

  const renderSourceButton = (key, label) => {
    const Icon = SOURCES_CONFIG.logoMap[key];
    return (
      <button
        key={key}
        onClick={() => handleSourceToggle(key)}
        className={`p-3 rounded-lg flex items-center justify-center gap-2
          transition-all duration-200 ${
          selectedSources[key] ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
        }`}
      >
        {Icon && <Icon size={18} />}
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Source Selection */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-4">
          Select Search Sources
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {Object.entries(SOURCE_TYPES).map(([key, label]) => renderSourceButton(key, label))}
        </div>
      </div>

      {/* File Upload and URL Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-4">
          Upload Files & URLs
        </h2>
        <div className="space-y-6">
          {/* File Upload Section */}
          <div>
            <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-50 border-2 border-dashed border-blue-200">
              <Upload size={20} />
              <span>Choose Files</span>
              <input
                type="file"
                multiple
                onChange={(e) => setUploadedFiles(Array.from(e.target.files))}
                className="hidden"
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
              <input
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
    </div>
  );
};

export default OpenResearchPanel; 