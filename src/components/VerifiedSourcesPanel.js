import React from 'react';
import { Upload, X, Plus, Link, FileText } from 'lucide-react';
import { SOURCES_CONFIG } from '@/config/constants';
import styles from '@/styles/Button.module.css';

const VerifiedSourcesPanel = ({
  sourceScope,
  setSourceScope,
  uploadedFiles,
  setUploadedFiles,
  urls,
  setUrls,
  newUrl,
  setNewUrl
}) => {
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidSize = file.size <= SOURCES_CONFIG.maxFileSize;
      const isValidType = SOURCES_CONFIG.allowedFileTypes.includes(file.type);
      return isValidSize && isValidType;
    });
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const handleUrlAdd = () => {
    if (newUrl && isValidUrl(newUrl)) {
      setUrls(prev => [...prev, newUrl]);
      setNewUrl('');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Source Scope Selection */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-4">
          Select Source Scope
        </h2>
        <div className="space-y-4">
          {SOURCES_CONFIG.scopeOptions.map((scope) => (
            <label
              key={scope.id}
              className={`
                block p-4 rounded-lg cursor-pointer transition-all
                ${sourceScope === scope.id 
                  ? 'bg-blue-50 border-2 border-blue-500' 
                  : 'bg-slate-50 border border-slate-200 hover:bg-blue-50'}
              `}
            >
              <input
                type="radio"
                name="sourceScope"
                value={scope.id}
                checked={sourceScope === scope.id}
                onChange={(e) => setSourceScope(e.target.value)}
                className="hidden"
              />
              <div className="font-medium text-slate-800">{scope.label}</div>
              <div className="text-sm text-slate-600 mt-1">{scope.desc}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Sources Panel */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-4">
          Your Custom Sources
        </h2>
        
        {/* File Upload Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Upload Files
          </h3>
          <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-50 border-2 border-dashed border-blue-200">
            <Upload size={20} />
            <span>Choose Files</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              accept={SOURCES_CONFIG.allowedFileTypes.join(',')}
              className="hidden"
            />
          </label>
          
          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    <span className="text-sm text-slate-700 truncate">
                      {file.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setUploadedFiles(files => 
                      files.filter((_, i) => i !== index)
                    )}
                    className="p-1 hover:bg-slate-200 rounded-full"
                  >
                    <X size={16} className="text-slate-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* URL Addition Section */}
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3">
            Add URLs
          </h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Enter URL..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleUrlAdd}
                disabled={!newUrl || !isValidUrl(newUrl)}
                className={`${styles.button} !px-4`}
              >
                <Plus size={20} />
              </button>
            </div>
            
            {/* URLs List */}
            {urls.length > 0 && (
              <div className="space-y-2">
                {urls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Link size={16} className="text-blue-600" />
                      <span className="text-sm text-slate-700 truncate">
                        {url}
                      </span>
                    </div>
                    <button
                      onClick={() => setUrls(urls => 
                        urls.filter((_, i) => i !== index)
                      )}
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

export default VerifiedSourcesPanel; 