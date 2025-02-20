import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('verified');

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
        <div className="space-y-6">
          {activeTab === 'verified' ? (
            <div className="text-2xl font-bold text-center">V</div>
          ) : (
            <div className="text-2xl font-bold text-center">O</div>
          )}
        </div>
      </div>
    </div>
  );
}
