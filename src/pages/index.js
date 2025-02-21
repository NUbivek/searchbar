import Head from 'next/head';
import { useState } from 'react';
import { Search, ChevronDown, Upload } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('verified');
  const [selectedModel, setSelectedModel] = useState('Perplexity');

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>AI-Powered Research Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-[800px] mx-auto pt-20 px-8">
        {/* Header */}
        <h1 className="text-[48px] font-bold text-center mb-4">
          AI-Powered Research Assistant
        </h1>
        <p className="text-[20px] text-gray-600 text-center mb-12">
          Search across curated, verified sources for reliable insights
        </p>

        {/* Tab Navigation */}
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 mx-auto mb-8">
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-8 py-2 rounded-md text-[16px] font-medium transition-colors
              ${activeTab === 'verified'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Verified Sources
          </button>
          <button
            onClick={() => setActiveTab('open')}
            className={`px-8 py-2 rounded-md text-[16px] font-medium transition-colors
              ${activeTab === 'open'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Open Research
          </button>
        </div>

        {/* Model Selector */}
        <div className="relative mb-4">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[16px] appearance-none cursor-pointer"
          >
            <option value="Perplexity">Perplexity</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-12">
          <input
            type="text"
            placeholder="Search verified sources..."
            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-[16px]"
          />
          <button className="px-8 py-3 bg-gray-900 text-white rounded-lg text-[16px] font-medium">
            Search
          </button>
        </div>

        {/* Verified Sources Content */}
        {activeTab === 'verified' && (
          <div className="space-y-8">
            {/* Custom Sources Only */}
            <div>
              <h2 className="text-[24px] font-bold mb-2">Custom Sources Only</h2>
              <p className="text-[16px] text-gray-600 mb-4">Upload your own files or add custom URLs</p>
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-[16px] text-gray-700 hover:bg-gray-50">
                  <Upload className="inline mr-2" size={20} />
                  Upload Files
                </button>
                <button className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-[16px] text-gray-700 hover:bg-gray-50">
                  Add URLs
                </button>
              </div>
            </div>

            {/* Custom + Verified Sources */}
            <div>
              <h2 className="text-[24px] font-bold mb-2">Custom + Verified Sources</h2>
              <p className="text-[16px] text-gray-600 mb-4">Combine your sources with our curated collection</p>
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-[16px] text-gray-700 hover:bg-gray-50">
                  <Upload className="inline mr-2" size={20} />
                  Upload Files
                </button>
                <button className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-[16px] text-gray-700 hover:bg-gray-50">
                  Add URLs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Open Research Content */}
        {activeTab === 'open' && (
          <div className="space-y-6">
            {/* Search Bar for Open Research */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search across the web..."
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-[16px]"
              />
              <button className="px-8 py-3 bg-[#2196F3] text-white rounded-lg text-[16px] font-medium hover:bg-[#1E88E5]">
                Search
              </button>
            </div>

            {/* Source Buttons - First Row */}
            <div className="grid grid-cols-4 gap-3">
              <button className="p-4 bg-[#2196F3] text-white rounded-lg text-[14px] font-medium hover:bg-[#1E88E5] flex items-center justify-center">
                Deep Web
              </button>
              <button className="p-4 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                LinkedIn
              </button>
              <button className="p-4 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                X
              </button>
              <button className="p-4 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                Reddit
              </button>
            </div>

            {/* Source Buttons - Second Row */}
            <div className="grid grid-cols-4 gap-3">
              <button className="p-4 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                Crunchbase
              </button>
              <button className="p-4 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                Pitchbook
              </button>
              <button className="p-4 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                Medium
              </button>
              <button className="p-4 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                Substack
              </button>
            </div>

            {/* Upload Files Button */}
            <div className="mt-4">
              <button className="w-full p-4 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                <Upload size={18} />
                Upload Files + ...
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
