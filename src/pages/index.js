import Head from 'next/head';
import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('verified');
  const [selectedModel, setSelectedModel] = useState('Perplexity');

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>AI-Powered Research Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-[600px] mx-auto pt-16 px-4">
        {/* Header */}
        <h1 className="text-[40px] font-bold text-center text-[#2196F3] mb-2">
          AI-Powered Research Assistant
        </h1>
        <p className="text-[18px] text-slate-600 text-center mb-10">
          Search across curated, verified sources for reliable insights
        </p>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-1 mb-8">
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-8 py-2.5 rounded-lg transition-colors font-medium
              ${activeTab === 'verified'
                ? 'bg-[#2196F3] text-white'
                : 'bg-[#F8F9FA] text-slate-600 hover:bg-slate-100'
              }`}
          >
            Verified Sources
          </button>
          <button
            onClick={() => setActiveTab('open')}
            className={`px-8 py-2.5 rounded-lg transition-colors font-medium
              ${activeTab === 'open'
                ? 'bg-[#2196F3] text-white'
                : 'bg-[#F8F9FA] text-slate-600 hover:bg-slate-100'
              }`}
          >
            Open Research
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {/* Model Selector */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[15px] appearance-none cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Perplexity">Perplexity</option>
              <option value="Gemma">Gemma 2.0 (9B)</option>
              <option value="Mixtral">Mixtral 8x7B</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={`Search ${activeTab === 'verified' ? 'verified' : 'all'} sources...`}
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-lg text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              className="px-6 py-3 bg-[#2196F3] text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2 font-medium"
            >
              <Search size={20} />
              Search
            </button>
          </div>

          {/* Test Letters */}
          <div className="text-2xl font-bold text-center mt-8">
            {activeTab === 'verified' ? 'V' : 'O'}
          </div>

          {/* Source Panels - Only show in Verified tab */}
          {activeTab === 'verified' && (
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {/* Custom Sources Only Panel */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold mb-3">Custom Sources Only</h3>
                <p className="text-slate-600 mb-4">Upload your own files or add custom URLs</p>
                
                <button className="w-full py-2 mb-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                  Choose Files
                </button>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter URL"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                  />
                  <button className="px-4 py-2 bg-[#2196F3] text-white rounded-lg">
                    Add
                  </button>
                </div>
              </div>

              {/* Custom + Verified Sources Panel */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold mb-3">Custom + Verified Sources</h3>
                <p className="text-slate-600 mb-4">Combine your sources with our curated collection</p>
                
                <button className="w-full py-2 mb-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                  Choose Files
                </button>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter URL"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                  />
                  <button className="px-4 py-2 bg-[#2196F3] text-white rounded-lg">
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
