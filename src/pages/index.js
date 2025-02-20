import Head from 'next/head';
import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('verified');

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>Founder's Research Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header with Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-4xl font-bold text-blue-900 text-center pt-8 mb-8">
            Founder's Research Hub
          </h1>
          
          {/* Tab Navigation */}
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('verified')}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors
                ${activeTab === 'verified'
                  ? 'bg-slate-50 text-blue-600 border-t-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              Verified Source
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors
                ${activeTab === 'open'
                  ? 'bg-slate-50 text-blue-600 border-t-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              Open Research
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-8">
        {activeTab === 'verified' ? (
          <div>Verified Source Content</div>
        ) : (
          <div>Open Research Content</div>
        )}
      </div>
    </div>
  );
}
