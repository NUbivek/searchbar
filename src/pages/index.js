import Head from 'next/head';
import { useState } from 'react';
import { Upload } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('verified');
  const [selectedModel, setSelectedModel] = useState('Perplexity');

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <Head>
        <title>AI-Powered Research Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Main Content */}
      <div className="max-w-[720px] mx-auto">
        {/* Header */}
        <h1 className="text-[64px] leading-tight font-bold mb-4">
          AI-Powered Research Assistant
        </h1>
        <p className="text-[24px] text-[#666666] mb-8">
          Search across curated, verified sources for reliable insights
        </p>

        {/* Tab Navigation */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-6 py-2 text-[18px] border border-[#DDDDDD] rounded-l-lg
              ${activeTab === 'verified' ? 'bg-white' : 'bg-[#F5F5F5]'}`}
          >
            Verified Sources
          </button>
          <button
            onClick={() => setActiveTab('open')}
            className={`px-6 py-2 text-[18px] border border-[#DDDDDD] rounded-r-lg border-l-0
              ${activeTab === 'open' ? 'bg-white' : 'bg-[#F5F5F5]'}`}
          >
            Open Research
          </button>
        </div>

        {/* Verified Sources Content */}
        {activeTab === 'verified' && (
          <>
            {/* Model Selector */}
            <div className="mb-4">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 text-[18px] border border-[#DDDDDD] rounded-lg bg-white appearance-none"
              >
                <option>Perplexity</option>
              </select>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2 mb-8">
              <input
                type="text"
                placeholder="Search verified sources"
                className="flex-1 px-4 py-2 text-[18px] border border-[#DDDDDD] rounded-lg"
              />
              <button className="px-6 py-2 bg-[#2196F3] text-white text-[18px] rounded-lg">
                Search
              </button>
            </div>

            {/* Custom Sources */}
            <div className="space-y-12">
              {/* Custom Sources Only */}
              <div>
                <h2 className="text-[32px] font-bold mb-2">Custom Sources Only</h2>
                <p className="text-[18px] text-[#666666] mb-4">
                  Upload your own files or add custom URLs
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 border border-[#DDDDDD] rounded-lg text-[18px] flex items-center justify-center gap-2">
                    <Upload size={20} />
                    Upload Files
                  </button>
                  <button className="flex-1 px-4 py-2 border border-[#DDDDDD] rounded-lg text-[18px]">
                    Add URLs
                  </button>
                </div>
              </div>

              {/* Custom + Verified Sources */}
              <div>
                <h2 className="text-[32px] font-bold mb-2">Custom + Verified Sources</h2>
                <p className="text-[18px] text-[#666666] mb-4">
                  Combine your sources with our curated collection
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 border border-[#DDDDDD] rounded-lg text-[18px] flex items-center justify-center gap-2">
                    <Upload size={20} />
                    Upload Files
                  </button>
                  <button className="flex-1 px-4 py-2 border border-[#DDDDDD] rounded-lg text-[18px]">
                    Add URLs
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Open Research Content */}
        {activeTab === 'open' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search across the web..."
                className="flex-1 px-4 py-2 text-[18px] border border-[#DDDDDD] rounded-lg"
              />
              <button className="px-6 py-2 bg-[#2196F3] text-white text-[18px] rounded-lg">
                Search
              </button>
            </div>

            {/* Source Buttons - First Row */}
            <div className="grid grid-cols-4 gap-3">
              <button className="p-4 bg-[#2196F3] text-white rounded-lg text-[14px] font-medium">
                Deep Web
              </button>
              <button className="p-4 bg-white border border-[#DDDDDD] rounded-lg text-[14px]">
                LinkedIn
              </button>
              <button className="p-4 bg-white border border-[#DDDDDD] rounded-lg text-[14px]">
                X
              </button>
              <button className="p-4 bg-white border border-[#DDDDDD] rounded-lg text-[14px]">
                Reddit
              </button>
            </div>

            {/* Source Buttons - Second Row */}
            <div className="grid grid-cols-4 gap-3">
              <button className="p-4 bg-white border border-[#DDDDDD] rounded-lg text-[14px]">
                Crunchbase
              </button>
              <button className="p-4 bg-white border border-[#DDDDDD] rounded-lg text-[14px]">
                Pitchbook
              </button>
              <button className="p-4 bg-white border border-[#DDDDDD] rounded-lg text-[14px]">
                Medium
              </button>
              <button className="p-4 bg-white border border-[#DDDDDD] rounded-lg text-[14px]">
                Substack
              </button>
            </div>

            {/* Upload Files Button */}
            <div className="mt-4">
              <button className="w-full p-4 bg-white border border-[#DDDDDD] rounded-lg text-[14px] flex items-center justify-center gap-2">
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
