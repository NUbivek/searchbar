import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Upload, Search, ChevronDown } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('verified');
  const [selectedModel, setSelectedModel] = useState('Perplexity');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Test animation on mount
  useEffect(() => {
    console.log("Component mounted");
  }, []);

  // Test loading state
  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    // Test background gradient animation
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-blue-50 
                    animate-[gradient_8s_ease-in-out_infinite] flex flex-col items-center justify-start">
      <Head>
        <title>AI-Powered Research Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Test card elevation and border */}
      <div className="w-full max-w-[1000px] px-6 py-16 bg-white/80 backdrop-blur-sm 
                      rounded-2xl shadow-lg my-8 border border-white/50">
        {/* Test text animation */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-[64px] font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 
                         text-transparent bg-clip-text animate-pulse">
            AI-Powered Research Assistant
          </h1>
          <p className="text-[24px] text-blue-600/80">
            Search across curated, verified sources for reliable insights
          </p>
        </div>

        {/* Test interactive tabs with hover and active states */}
        <div className="inline-flex w-full justify-center mb-8">
          <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50/50 p-1">
            {['verified', 'open'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 text-[18px] rounded-lg transition-all duration-300
                  ${activeTab === tab 
                    ? 'bg-white text-blue-600 shadow-sm transform scale-[1.02]' 
                    : 'bg-transparent hover:bg-white/50 text-blue-800'}`}
              >
                {tab === 'verified' ? 'Verified Sources' : 'Open Research'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'verified' ? (
          <div className="space-y-8 animate-slideUp">
            {/* Test dropdown interaction */}
            <div className="flex justify-center mb-8">
              <div className="w-[200px] relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full px-4 py-2.5 text-[18px] border border-blue-200 rounded-lg 
                           bg-white text-center group hover:border-blue-400 
                           focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  {selectedModel}
                  <ChevronDown className={`inline ml-2 transition-transform duration-200
                    ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown menu with animation */}
                {showDropdown && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border 
                                border-blue-200 rounded-lg shadow-lg animate-fadeIn">
                    {['Perplexity', 'Model A', 'Model B'].map((model) => (
                      <button
                        key={model}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 
                                 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Test loading state and button interaction */}
            <div className="flex gap-3 mb-12">
              <input
                type="text"
                placeholder="Search verified sources"
                className="flex-1 px-4 py-2.5 text-[18px] border border-blue-200 rounded-lg
                         hover:border-blue-400 focus:border-blue-500 focus:ring-2 
                         focus:ring-blue-200 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-[18px]
                         hover:bg-blue-700 active:scale-[0.98] transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed
                         relative overflow-hidden"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white 
                                border-t-transparent rounded-full" />
                ) : (
                  'Search'
                )}
              </button>
            </div>

            {/* Test hover animations and transitions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Panels with hover effects */}
              {['Custom Sources Only', 'Custom + Verified Sources'].map((title) => (
                <div key={title}
                     className="group space-y-4 p-6 border border-blue-200 rounded-xl 
                               hover:shadow-lg transition-all duration-300
                               hover:border-blue-300 hover:bg-blue-50/30"
                >
                  <h2 className="text-[32px] font-bold text-blue-900 group-hover:text-blue-800
                                transition-colors">
                    {title}
                  </h2>
                  <p className="text-[18px] text-blue-600/80">
                    {title === 'Custom Sources Only' 
                      ? 'Upload your own files or add custom URLs'
                      : 'Combine your sources with our curated collection'}
                  </p>
                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-2.5 border border-blue-200 rounded-lg 
                                   text-[18px] flex items-center justify-center gap-2
                                   hover:bg-blue-50 hover:border-blue-400 
                                   active:scale-[0.98] transition-all">
                      <Upload size={20} className="text-blue-600" />
                      Upload Files
                    </button>
                    <button className="flex-1 px-4 py-2.5 border border-blue-200 rounded-lg 
                                   text-[18px] hover:bg-blue-50 hover:border-blue-400
                                   active:scale-[0.98] transition-all">
                      Add URLs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Open Research Content with similar test styling
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2 mb-8">
              <input
                type="text"
                placeholder="Search across the web..."
                className="flex-1 px-4 py-2 text-[18px] border border-gray-300 rounded-lg"
              />
              <button className="px-6 py-2 bg-gray-900 text-white rounded-lg text-[18px]">
                Search
              </button>
            </div>

            {/* Source Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button className="p-3 bg-gray-900 text-white rounded-lg text-[14px]">
                Deep Web
              </button>
              <button className="p-3 border border-gray-300 rounded-lg text-[14px] hover:bg-gray-50">
                LinkedIn
              </button>
              <button className="p-3 border border-gray-300 rounded-lg text-[14px] hover:bg-gray-50">
                X
              </button>
              <button className="p-3 border border-gray-300 rounded-lg text-[14px] hover:bg-gray-50">
                Reddit
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button className="p-3 border border-gray-300 rounded-lg text-[14px] hover:bg-gray-50">
                Crunchbase
              </button>
              <button className="p-3 border border-gray-300 rounded-lg text-[14px] hover:bg-gray-50">
                Pitchbook
              </button>
              <button className="p-3 border border-gray-300 rounded-lg text-[14px] hover:bg-gray-50">
                Medium
              </button>
              <button className="p-3 border border-gray-300 rounded-lg text-[14px] hover:bg-gray-50">
                Substack
              </button>
            </div>

            <button className="w-full p-3 border border-gray-300 rounded-lg text-[14px] hover:bg-gray-50 flex items-center justify-center gap-2">
              <Upload size={18} />
              Upload Files + ...
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
