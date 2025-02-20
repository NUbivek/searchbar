'use client';
import { useState } from 'react';

export default function SearchApp() {
  const [activeTab, setActiveTab] = useState('verified');

  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setActiveTab('verified')}
          className={`px-6 py-2 rounded-full cursor-pointer ${
            activeTab === 'verified' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
          }`}
        >
          Verified Sources
        </button>
        <button
          onClick={() => setActiveTab('open')}
          className={`px-6 py-2 rounded-full cursor-pointer ${
            activeTab === 'open' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
          }`}
        >
          Open Research
        </button>
      </div>
    </div>
  );
}
