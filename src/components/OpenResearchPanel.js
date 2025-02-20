import React, { useCallback } from 'react';
import { SOURCE_TYPES, SOURCES_CONFIG } from '@/config/constants';

const OpenResearchPanel = ({ selectedSources, setSelectedSources }) => {
  const handleSourceToggle = useCallback((sourceType) => {
    setSelectedSources(prev => {
      const newSources = {
        ...prev,
        [sourceType]: !prev[sourceType]
      };
      console.log('Updated sources:', newSources);  // For debugging
      return newSources;
    });
  }, [setSelectedSources]);

  // Include VERIFIED in source types
  const availableSourceTypes = Object.values(SOURCE_TYPES);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-blue-800 mb-4">
        Select Search Sources
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {availableSourceTypes.map((sourceType) => {
          const Icon = SOURCES_CONFIG.logoMap[sourceType];
          const isSelected = selectedSources[sourceType];
          
          return (
            <button
              key={sourceType}
              type="button"
              onClick={() => handleSourceToggle(sourceType)}
              className={`
                p-3 rounded-lg flex items-center justify-center gap-2
                transition-all duration-200 cursor-pointer text-sm
                ${isSelected 
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }
              `}
            >
              {Icon && <Icon size={18} />}
              <span className="font-medium">
                {sourceType === 'verified' ? 'Verified' : 
                  sourceType.charAt(0).toUpperCase() + sourceType.slice(1)}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Debug info */}
      <div className="mt-4 text-xs text-slate-500">
        Selected sources: {Object.entries(selectedSources)
          .filter(([_, isSelected]) => isSelected)
          .map(([type]) => type)
          .join(', ')}
      </div>
    </div>
  );
};

export default OpenResearchPanel; 