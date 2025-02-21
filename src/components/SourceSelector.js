export default function SourceSelector({ mode, selectedSources, onSourceToggle }) {
  const sources = mode === SearchModes.VERIFIED ? 
    ['Market Data', 'VC Firms', 'Custom'] :
    ['Web', 'LinkedIn', 'X', 'Reddit', 'Substack', 'Crunchbase', 'Pitchbook', 'Medium'];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {sources.map(source => (
        <button
          key={source}
          onClick={() => onSourceToggle(source)}
          className={`px-4 py-2 rounded-lg ${
            selectedSources.includes(source) 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100'
          }`}
        >
          {source}
        </button>
      ))}
    </div>
  );
} 