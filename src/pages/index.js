import Head from 'next/head';
import { useState } from 'react';
import { Globe, Linkedin, Twitter, FileText, Upload, Search } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('open');

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top Navigation Bar */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <span className="font-medium">Research AI</span>
          </div>
        </div>
      </nav>

      <main className="max-w-screen-xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI-Powered Research Assistant
          </h1>
          <p className="text-lg text-gray-600">
            Explore the entire web with advanced AI assistance
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 p-1 rounded-xl mb-8 max-w-xl mx-auto">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab('verified')}
              className={`py-3 px-4 rounded-lg transition-all duration-200 ${
                activeTab === 'verified'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Verified Sources
            </button>
            <button
              onClick={() => setActiveTab('open')}
              className={`py-3 px-4 rounded-lg transition-all duration-200 ${
                activeTab === 'open'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Open Research
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search across the web..."
                className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 
                         focus:border-blue-500 transition-all"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <button className="px-6 py-3 bg-[#111827] text-white rounded-lg 
                           hover:bg-[#1f2937] transition-colors font-medium">
              Search
            </button>
          </div>
        </div>

        {/* Source Buttons */}
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-3">
            <button className="p-4 bg-[#111827] text-white rounded-lg hover:bg-[#1f2937] 
                           transition-all flex items-center justify-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Deep Web</span>
            </button>
            <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 
                           transition-all flex items-center justify-center gap-2">
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </button>
            <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 
                           transition-all flex items-center justify-center gap-2">
              <Twitter className="w-4 h-4" />
              <span>X</span>
            </button>
            <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 
                           transition-all flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Reddit</span>
            </button>
            <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 
                           transition-all flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Substack</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
            <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 
                           transition-all flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Crunchbase</span>
            </button>
            <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 
                           transition-all flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Pitchbook</span>
            </button>
            <button className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 
                           transition-all flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Medium</span>
            </button>
          </div>

          <button className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 
                         transition-all flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Upload Files + ...</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>Built by Bivek. The source code is available on GitHub</div>
            <div>© 2025 Research AI. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
