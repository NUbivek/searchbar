import Head from 'next/head';
import { useState } from 'react';
import { Upload, ChevronDown } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('verified');
  const [selectedModel, setSelectedModel] = useState('Perplexity');
  const [selectedSources, setSelectedSources] = useState(['Deep Web']);
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  const toggleSource = (source) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter(s => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>AI-Powered Research Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="container mx-auto max-w-[800px] px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-[64px] font-bold mb-4">
            AI-Powered Research Assistant
          </h1>
          <p className="text-[24px] text-gray-600">
            Search across curated, verified sources for reliable insights
          </p>
        </div>

        {/* Enhanced Tabs with Hover */}
        <div className="flex justify-center mb-8">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('verified')}
              className={`px-8 py-3 text-[18px] transition-colors hover:bg-gray-50
                ${activeTab === 'verified' 
                  ? 'bg-white shadow-sm' 
                  : 'bg-gray-100'
                }`}
            >
              Verified Sources
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`px-8 py-3 text-[18px] transition-colors hover:bg-gray-50
                ${activeTab === 'open' 
                  ? 'bg-white shadow-sm' 
                  : 'bg-gray-100'
                }`}
            >
              Open Research
            </button>
          </div>
        </div>

        {activeTab === 'verified' ? (
          <div className="space-y-8">
            {/* Enhanced Model Selector with Hover */}
            <div className="flex justify-center mb-8">
              <div className="w-[200px]">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-2.5 text-[18px] border border-gray-300 rounded-lg 
                           bg-white text-center appearance-none cursor-pointer
                           hover:border-gray-400 focus:border-gray-500 focus:ring-2 
                           focus:ring-gray-200 transition-all"
                >
                  <option>Perplexity ▼</option>
                  <option>Model A ▼</option>
                  <option>Model B ▼</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="flex gap-3 mb-12">
              <input
                type="text"
                placeholder="Search verified sources"
                className="flex-1 px-4 py-2.5 text-[18px] border border-gray-300 rounded-lg"
              />
              <button className="px-8 py-2.5 bg-gray-900 text-white rounded-lg text-[18px]">
                Search
              </button>
            </div>

            {/* Two Panels Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left Panel */}
              <div className="space-y-4">
                <h2 className="text-[32px] font-bold">Custom Sources Only</h2>
                <p className="text-[18px] text-gray-600">
                  Upload your own files or add custom URLs
                </p>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg 
                                 text-[18px] flex items-center justify-center gap-2">
                    <Upload size={20} />
                    Upload Files
                  </button>
                  <button className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-[18px]">
                    Add URLs
                  </button>
                </div>
              </div>

              {/* Right Panel */}
              <div className="space-y-4">
                <h2 className="text-[32px] font-bold">Custom + Verified Sources</h2>
                <p className="text-[18px] text-gray-600">
                  Combine your sources with our curated collection
                </p>
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg 
                                 text-[18px] flex items-center justify-center gap-2">
                    <Upload size={20} />
                    Upload Files
                  </button>
                  <button className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-[18px]">
                    Add URLs
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Enhanced Search with Hover */}
            <div className="flex gap-3 mb-8">
              <input
                type="text"
                placeholder="Search across the web..."
                className="flex-1 px-4 py-2.5 text-[18px] border border-gray-300 rounded-lg
                         hover:border-gray-400 focus:border-gray-500 
                         focus:ring-2 focus:ring-gray-200 transition-all"
              />
              <button className="px-8 py-2.5 bg-gray-900 text-white rounded-lg text-[18px]
                              hover:bg-gray-800 active:bg-gray-950 
                              transform active:scale-[0.98] transition-all">
                Search
              </button>
            </div>

            {/* Source Buttons with Enhanced Animation */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {['Deep Web', 'LinkedIn', 'X', 'Reddit', 'Crunchbase'].map((source) => (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  className={`p-3 rounded-lg text-[14px] transform transition-all duration-200 ${
                    selectedSources.includes(source)
                      ? 'bg-gray-900 text-white scale-[1.02] shadow-md'
                      : 'border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98]'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {['Pitchbook', 'Medium', 'Substack', 'Verified Sources'].map((source) => (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  className={`p-3 rounded-lg text-[14px] transform transition-all duration-200 ${
                    selectedSources.includes(source)
                      ? 'bg-gray-900 text-white scale-[1.02] shadow-md'
                      : 'border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98]'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>

            {/* Upload Section */}
            <div className="space-y-4">
              <button 
                onClick={() => setShowUploadPanel(!showUploadPanel)}
                className="w-full p-3 border border-gray-300 rounded-lg text-[14px] 
                         hover:bg-gray-50 hover:border-gray-400 transition-all
                         flex items-center justify-center gap-2 group"
              >
                <Upload size={18} className="group-hover:scale-110 transition-transform" />
                Upload Files + URLs
                <ChevronDown 
                  className={`transition-transform duration-200 
                    ${showUploadPanel ? 'rotate-180' : ''}`} 
                  size={18} 
                />
              </button>

              {/* Expandable Upload Panel */}
              {showUploadPanel && (
                <div className="animate-slideDown border border-gray-300 rounded-lg p-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="font-medium text-[16px]">Upload Files</h3>
                      <button className="w-full px-4 py-2.5 border border-gray-300 rounded-lg 
                                     hover:bg-gray-50 hover:border-gray-400 transition-all
                                     flex items-center justify-center gap-2">
                        <Upload size={18} />
                        Choose Files
                      </button>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-medium text-[16px]">Add URLs</h3>
                      <input
                        type="text"
                        placeholder="Enter URL"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                                 hover:border-gray-400 focus:border-gray-500 
                                 focus:ring-2 focus:ring-gray-200 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
