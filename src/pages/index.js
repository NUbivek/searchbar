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

      <main className="container mx-auto max-w-[800px] px-4 pt-12">
        {/* Header */}
        <h1 className="text-[64px] font-bold text-center mb-4">
          AI-Powered Research Assistant
        </h1>
        <p className="text-[24px] text-gray-600 text-center mb-12">
          Search across curated, verified sources for reliable insights
        </p>

        {/* Tabs - Matching screenshot exactly */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-6 py-2 text-[18px] border rounded-l-lg ${
              activeTab === 'verified'
                ? 'bg-white border-gray-300'
                : 'bg-gray-100 border-gray-300'
            }`}
          >
            Verified Sources
          </button>
          <button
            onClick={() => setActiveTab('open')}
            className={`px-6 py-2 text-[18px] border-t border-b border-r rounded-r-lg ${
              activeTab === 'open'
                ? 'bg-white border-gray-300'
                : 'bg-gray-100 border-gray-300'
            }`}
          >
            Open Research
          </button>
        </div>

        {activeTab === 'verified' && (
          <>
            {/* Model Selector - Matching screenshot */}
            <div className="mb-4">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 text-[18px] border border-gray-300 rounded-lg bg-white"
              >
                <option>Perplexity ▼</option>
              </select>
            </div>

            {/* Search Bar - Matching screenshot */}
            <div className="flex gap-2 mb-8">
              <input
                type="text"
                placeholder="Search verified sources"
                className="flex-1 px-4 py-2 text-[18px] border border-gray-300 rounded-lg"
              />
              <button className="px-6 py-2 bg-gray-900 text-white rounded-lg text-[18px]">
                Search
              </button>
            </div>

            {/* Side by Side Panels */}
            <div className="grid grid-cols-2 gap-8">
              {/* Custom Sources Only */}
              <div>
                <h2 className="text-[32px] font-bold mb-2">Custom Sources Only</h2>
                <p className="text-[18px] text-gray-600 mb-4">
                  Upload your own files or add custom URLs
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-[18px] flex items-center justify-center gap-2">
                    <Upload size={20} />
                    Upload Files
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-[18px]">
                    Add URLs
                  </button>
                </div>
              </div>

              {/* Custom + Verified Sources */}
              <div>
                <h2 className="text-[32px] font-bold mb-2">Custom + Verified Sources</h2>
                <p className="text-[18px] text-gray-600 mb-4">
                  Combine your sources with our curated collection
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-[18px] flex items-center justify-center gap-2">
                    <Upload size={20} />
                    Upload Files
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-[18px]">
                    Add URLs
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
