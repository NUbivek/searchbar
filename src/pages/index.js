import Head from 'next/head';
import { useState } from 'react';
import { Upload } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('verified');
  const [selectedModel, setSelectedModel] = useState('Perplexity');

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <Head>
        <title>AI-Powered Research Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="w-full max-w-[800px] px-8 py-20">
        {/* Centered Header */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-5xl font-bold">
            AI-Powered Research Assistant
          </h1>
          <p className="text-xl text-gray-600">
            Search across curated, verified sources for reliable insights
          </p>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-gray-50 p-1.5 rounded-xl shadow-sm mb-8 max-w-[500px] mx-auto">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab('verified')}
              className={`py-3 px-6 rounded-lg font-medium transition-all ${
                activeTab === 'verified'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Verified Sources
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`py-3 px-6 rounded-lg font-medium transition-all ${
                activeTab === 'open'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Open Research
            </button>
          </div>
        </div>

        {activeTab === 'verified' ? (
          <div className="animate-slide-up">
            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-4 py-3 mb-4 border border-gray-200 rounded-lg"
            >
              <option>Perplexity</option>
            </select>

            {/* Search */}
            <div className="flex gap-2 mb-8">
              <input
                type="text"
                placeholder="Search verified sources"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg"
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">
                Search
              </button>
            </div>

            {/* Custom Sources */}
            <div className="space-y-8">
              <div>
                <h2 className="text-[24px] font-bold mb-2">Custom Sources Only</h2>
                <p className="text-[16px] text-[--text-light] mb-4">
                  Upload your own files or add custom URLs
                </p>
                <div className="flex gap-2">
                  <button className="upload-button">
                    <Upload size={18} />
                    Upload Files
                  </button>
                  <button className="upload-button">
                    Add URLs
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-[24px] font-bold mb-2">Custom + Verified Sources</h2>
                <p className="text-[16px] text-[--text-light] mb-4">
                  Combine your sources with our curated collection
                </p>
                <div className="flex gap-2">
                  <button className="upload-button">
                    <Upload size={18} />
                    Upload Files
                  </button>
                  <button className="upload-button">
                    Add URLs
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-slide-up">
            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search across the web..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg"
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">
                Search
              </button>
            </div>

            {/* Source Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button className="p-3 bg-blue-600 text-white rounded-lg">
                Deep Web
              </button>
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                LinkedIn
              </button>
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                X
              </button>
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                Reddit
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                Crunchbase
              </button>
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                Pitchbook
              </button>
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                Medium
              </button>
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                Substack
              </button>
            </div>

            <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <Upload size={18} />
              Upload Files + ...
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
