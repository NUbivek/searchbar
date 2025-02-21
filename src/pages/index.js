import Head from 'next/head';
import { useState } from 'react';
import { Upload } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('verified');
  const [selectedModel, setSelectedModel] = useState('Perplexity');

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

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('verified')}
              className={`px-8 py-3 text-[18px] ${
                activeTab === 'verified' ? 'bg-white' : 'bg-gray-100'
              }`}
            >
              Verified Sources
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`px-8 py-3 text-[18px] ${
                activeTab === 'open' ? 'bg-white' : 'bg-gray-100'
              }`}
            >
              Open Research
            </button>
          </div>
        </div>

        {activeTab === 'verified' ? (
          <div className="space-y-8">
            {/* Model Selector */}
            <div className="flex justify-center mb-8">
              <div className="w-[200px]">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-2.5 text-[18px] border border-gray-300 rounded-lg 
                           bg-white text-center appearance-none cursor-pointer"
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
            {/* Search */}
            <div className="flex gap-3 mb-8">
              <input
                type="text"
                placeholder="Search across the web..."
                className="flex-1 px-4 py-2.5 text-[18px] border border-gray-300 rounded-lg"
              />
              <button className="px-8 py-2.5 bg-gray-900 text-white rounded-lg text-[18px]">
                Search
              </button>
            </div>

            {/* Source Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button className="p-3 bg-gray-900 text-white rounded-lg text-[14px]">
                Deep Web
              </button>
              <button className="p-3 border border-gray-300 rounded-lg text-[14px]">
                LinkedIn
              </button>
              <button className="p-3 border border-gray-300 rounded-lg text-[14px]">
                X
              </button>
              <button className="p-3 border border-gray-300 rounded-lg text-[14px]">
                Reddit
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button className="p-3 border border-gray-300 rounded-lg text-[14px]">
                Crunchbase
              </button>
              <button className="p-3 border border-gray-300 rounded-lg text-[14px]">
                Pitchbook
              </button>
              <button className="p-3 border border-gray-300 rounded-lg text-[14px]">
                Medium
              </button>
              <button className="p-3 border border-gray-300 rounded-lg text-[14px]">
                Substack
              </button>
            </div>

            <button className="w-full p-3 border border-gray-300 rounded-lg text-[14px] flex items-center justify-center gap-2">
              <Upload size={18} />
              Upload Files + ...
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
