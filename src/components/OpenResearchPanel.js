import React from 'react';
import { SOURCE_TYPES, SOURCES_CONFIG } from '@/config/constants';

const OpenResearchPanel = ({ selectedSources, setSelectedSources }) => {
  const handleSourceToggle = (sourceType) => {
    setSelectedSources(prev => ({
      ...prev,
      [sourceType]: !prev[sourceType]
    }));
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-blue-800 mb-4">
        Select Search Sources
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Object.values(SOURCE_TYPES).map((sourceType) => {
          const Icon = SOURCES_CONFIG.logoMap[sourceType];
          return (
            <button
              key={sourceType}
              onClick={() => handleSourceToggle(sourceType)}
              className={`
                p-4 rounded-lg flex items-center justify-center gap-2
                transition-all duration-200
                ${selectedSources[sourceType]
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              {Icon && <Icon size={20} />}
              <span className="font-medium">
                {sourceType.charAt(0).toUpperCase() + sourceType.slice(1)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OpenResearchPanel; 