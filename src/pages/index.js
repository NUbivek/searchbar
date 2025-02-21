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

      <div className="max-w-[800px] mx-auto animate-fade-in">
        {/* Header */}
        <h1 className="text-[48px] font-bold mb-3">
          AI-Powered Research Assistant
        </h1>
        <p className="text-[20px] text-gray-text mb-8">
          Search across curated, verified sources for reliable insights
        </p>

        {/* Tabs */}
        <div className="tab-container mb-4">
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
          <div className="animate-slide-up">
            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="select-field mb-3"
            >
              <option>Perplexity</option>
            </select>

            {/* Search */}
            <div className="flex gap-2 mb-8">
              <input
                type="text"
                placeholder="Search verified sources"
                className="input-field"
              />
              <button className="search-button">
                Search
              </button>
            </div>

            {/* Custom Sources */}
            <div className="space-y-8">
              <div>
                <h2 className="text-[24px] font-bold mb-2">Custom Sources Only</h2>
                <p className="text-[16px] text-gray-text mb-4">
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
                <p className="text-[16px] text-gray-text mb-4">
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
                className="input-field"
              />
              <button className="search-button">
                Search
              </button>
            </div>

            {/* Source Buttons */}
            <div className="source-button-container">
              <button className="source-button source-button-active">
                Deep Web
              </button>
              <button className="source-button">
                LinkedIn
              </button>
              <button className="source-button">
                X
              </button>
              <button className="source-button">
                Reddit
              </button>
            </div>

            <div className="source-button-container">
              <button className="source-button">
                Crunchbase
              </button>
              <button className="source-button">
                Pitchbook
              </button>
              <button className="source-button">
                Medium
              </button>
              <button className="source-button">
                Substack
              </button>
            </div>

            <button className="upload-button mt-2">
              <Upload size={16} />
              Upload Files + ...
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
