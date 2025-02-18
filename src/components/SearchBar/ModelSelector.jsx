// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 17:37:49
// Current User's Login: NUbivek

import React from 'react';
import { useModel } from '@/contexts/ModelContext';

const ModelSelector = ({ disabled }) => {
  const { selectedModel, setSelectedModel, models } = useModel();

  return (
    <div className="relative inline-block w-48">
      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} - {model.description}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default ModelSelector;