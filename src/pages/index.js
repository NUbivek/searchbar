import Head from 'next/head';
import { useState } from 'react';
import { Search, ChevronDown, Upload } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('verified');
  const [selectedModel, setSelectedModel] = useState('Perplexity');

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Head>
        <title>AI-Powered Research Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-[720px] mx-auto pt-12 px-6">
        {/* Header */}
        <h1 className="text-[32px] font-bold text-center text-[#2196F3] mb-2">
          AI-Powered Research Assistant
        </h1>
        <p className="text-[16px] text-[#666666] text-center mb-8">
          Search across curated, verified sources for reliable insights
        </p>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-[#F0F0F0] p-1 rounded-lg w-fit mx-auto">
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-5 py-2 rounded-md transition-colors text-[14px] font-medium
              ${activeTab === 'verified'
                ? 'bg-white text-[#2196F3] shadow-sm'
                : 'text-[#666666]'
              }`}
          >
            Verified Sources
          </button>
          <button
            onClick={() => setActiveTab('open')}
            className={`px-5 py-2 rounded-md transition-colors text-[14px] font-medium
              ${activeTab === 'open'
                ? 'bg-white text-[#2196F3] shadow-sm'
                : 'text-[#666666]'
              }`}
          >
            Open Research
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {/* Model Selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[14px] appearance-none cursor-pointer focus:outline-none focus:border-[#2196F3]"
          >
            <option value="Perplexity">Perplexity</option>
          </select>

          {/* Search Bar */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search verified sources..."
              className="flex-1 px-4 py-2.5 bg-white border border-[#E5E5E5] rounded-lg text-[14px] placeholder:text-[#999999] focus:outline-none focus:border-[#2196F3]"
            />
            <button className="px-5 py-2.5 bg-[#2196F3] text-white rounded-lg text-[14px] font-medium hover:bg-[#1E88E5] transition-colors">
              Search
            </button>
          </div>

          {/* Verified Sources Content */}
          {activeTab === 'verified' && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Custom Sources Only */}
              <div className="bg-white rounded-lg p-5 border border-[#E5E5E5]">
                <h3 className="text-[16px] font-semibold mb-1">Custom Sources Only</h3>
                <p className="text-[14px] text-[#666666] mb-4">Upload your own files or add custom URLs</p>
                
                <button className="w-full py-2.5 border border-[#E5E5E5] rounded-lg text-[14px] text-[#666666] hover:bg-[#F8F8F8] mb-3 flex items-center justify-center gap-2">
                  <Upload size={16} />
                  Upload Files
                </button>

                <button className="w-full py-2.5 border border-[#E5E5E5] rounded-lg text-[14px] text-[#666666] hover:bg-[#F8F8F8]">
                  Add URLs
                </button>
              </div>

              {/* Custom + Verified Sources */}
              <div className="bg-white rounded-lg p-5 border border-[#E5E5E5]">
                <h3 className="text-[16px] font-semibold mb-1">Custom + Verified Sources</h3>
                <p className="text-[14px] text-[#666666] mb-4">Combine your sources with our curated collection</p>
                
                <button className="w-full py-2.5 border border-[#E5E5E5] rounded-lg text-[14px] text-[#666666] hover:bg-[#F8F8F8] mb-3 flex items-center justify-center gap-2">
                  <Upload size={16} />
                  Upload Files
                </button>

                <button className="w-full py-2.5 border border-[#E5E5E5] rounded-lg text-[14px] text-[#666666] hover:bg-[#F8F8F8]">
                  Add URLs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
