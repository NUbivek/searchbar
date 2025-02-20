import Head from 'next/head';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('verified');
  const [selectedModel, setSelectedModel] = useState('Perplexity');

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>AI-Powered Research Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-3xl mx-auto pt-12 px-4">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center text-[#2196F3] mb-3">
          AI-Powered Research Assistant
        </h1>
        <p className="text-lg text-slate-600 text-center mb-8">
          Search across curated, verified sources for reliable insights
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-6 py-2 rounded-lg transition-colors
              ${activeTab === 'verified'
                ? 'bg-[#2196F3] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            Verified Sources
          </button>
          <button
            onClick={() => setActiveTab('open')}
            className={`px-6 py-2 rounded-lg transition-colors
              ${activeTab === 'open'
                ? 'bg-[#2196F3] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Perplexity">Perplexity</option>
            <option value="Gemma">Gemma 2.0 (9B)</option>
            <option value="Mixtral">Mixtral 8x7B</option>
          </select>

          {/* Search Bar */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Search ${activeTab === 'verified' ? 'verified' : 'all'} sources...`}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              className="px-6 py-2.5 bg-[#2196F3] text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Search size={20} />
              Search
            </button>
          </div>

          {/* Test Letters */}
          <div className="text-2xl font-bold text-center mt-8">
            {activeTab === 'verified' ? 'V' : 'O'}
          </div>
        </div>
      </div>
    </div>
  );
}
