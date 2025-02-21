import Head from 'next/head';
import { useState } from 'react';
import { Upload } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('verified');
  const [selectedModel, setSelectedModel] = useState('Perplexity');

  return (
    <div className="min-h-screen bg-white p-8">
      <Head>
        <title>AI-Powered Research Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <h1 className="text-[48px] font-bold mb-3">
          AI-Powered Research Assistant
        </h1>
        <p className="text-[20px] text-[#666666] mb-8">
          Search across curated, verified sources for reliable insights
        </p>

        {/* Tabs */}
        <div className="inline-flex border border-[--border-color] rounded-lg mb-4">
          <button
            onClick={() => setActiveTab('verified')}
            className={`tab-button ${activeTab === 'verified' ? 'tab-button-active' : 'tab-button-inactive'}`}
          >
            Verified Sources
          </button>
          <button
            onClick={() => setActiveTab('open')}
            className={`tab-button ${activeTab === 'open' ? 'tab-button-active' : 'tab-button-inactive'}`}
          >
            Open Research
          </button>
        </div>

        {activeTab === 'verified' ? (
          <>
            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full mb-3 px-4 py-2.5 text-[16px] border border-[#DDDDDD] rounded-lg appearance-none"
            >
              <option>Perplexity</option>
            </select>

            {/* Search */}
            <div className="flex gap-2 mb-8">
              <input
                type="text"
                placeholder="Search verified sources"
                className="flex-1 px-4 py-2.5 text-[16px] border border-[#DDDDDD] rounded-lg"
              />
              <button className="px-6 py-2.5 bg-[#111827] text-white text-[16px] rounded-lg">
                Search
              </button>
            </div>

            {/* Custom Sources */}
            <div className="space-y-8">
              <div>
                <h2 className="text-[24px] font-bold mb-2">Custom Sources Only</h2>
                <p className="text-[16px] text-[#666666] mb-4">
                  Upload your own files or add custom URLs
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2.5 border border-[#DDDDDD] rounded-lg text-[16px] flex items-center justify-center gap-2">
                    <Upload size={18} />
                    Upload Files
                  </button>
                  <button className="flex-1 px-4 py-2.5 border border-[#DDDDDD] rounded-lg text-[16px]">
                    Add URLs
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-[24px] font-bold mb-2">Custom + Verified Sources</h2>
                <p className="text-[16px] text-[#666666] mb-4">
                  Combine your sources with our curated collection
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2.5 border border-[#DDDDDD] rounded-lg text-[16px] flex items-center justify-center gap-2">
                    <Upload size={18} />
                    Upload Files
                  </button>
                  <button className="flex-1 px-4 py-2.5 border border-[#DDDDDD] rounded-lg text-[16px]">
                    Add URLs
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search across the web..."
                className="flex-1 px-4 py-2.5 text-[16px] border border-[#DDDDDD] rounded-lg"
              />
              <button className="px-6 py-2.5 bg-[#111827] text-white text-[16px] rounded-lg">
                Search
              </button>
            </div>

            {/* Source Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <button className="p-3 bg-[#111827] text-white text-[14px] rounded-lg">
                Deep Web
              </button>
              <button className="p-3 bg-[#F5F5F5] border border-[#DDDDDD] text-[14px] rounded-lg">
                LinkedIn
              </button>
              <button className="p-3 bg-[#F5F5F5] border border-[#DDDDDD] text-[14px] rounded-lg">
                X
              </button>
              <button className="p-3 bg-[#F5F5F5] border border-[#DDDDDD] text-[14px] rounded-lg">
                Reddit
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button className="p-3 bg-[#F5F5F5] border border-[#DDDDDD] text-[14px] rounded-lg">
                Crunchbase
              </button>
              <button className="p-3 bg-[#F5F5F5] border border-[#DDDDDD] text-[14px] rounded-lg">
                Pitchbook
              </button>
              <button className="p-3 bg-[#F5F5F5] border border-[#DDDDDD] text-[14px] rounded-lg">
                Medium
              </button>
              <button className="p-3 bg-[#F5F5F5] border border-[#DDDDDD] text-[14px] rounded-lg">
                Substack
              </button>
            </div>

            <button className="w-full mt-2 p-3 bg-[#F5F5F5] border border-[#DDDDDD] text-[14px] rounded-lg flex items-center justify-center gap-2">
              <Upload size={16} />
              Upload Files + ...
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
