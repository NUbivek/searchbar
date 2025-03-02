import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function NetworkMap() {
  const [selectedSources, setSelectedSources] = useState(['linkedin', 'x', 'reddit', 'carta']);
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState('connections');
  const mapContainerRef = useRef(null);

  const handleSourceToggle = (source) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter(s => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = async () => {
    if (!selectedSources.length) return;

    setLoading(true);
    setError(null);

    try {
      // Simulate network data loading (replace with actual API call)
      setTimeout(() => {
        setNetworkData({
          nodes: 24,
          connections: 67,
          sources: selectedSources
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Network data error:', err);
      setError('An error occurred while fetching network data.');
      setLoading(false);
    }
  };

  // Load initial network data
  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="my-6">
        {/* Search interface styled like OpenSearch */}
        <div className="mb-6">
          <div className="flex w-full">
            <div className="flex-grow bg-gray-100 rounded-l-md border border-gray-300">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Filter your network..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 px-4 py-2"
              />
            </div>
            <div className="flex">
              <div className="w-[150px] bg-gray-100 border-y border-r border-gray-300">
                <select
                  value={selectedView}
                  onChange={(e) => handleViewChange(e.target.value)}
                  className="w-full h-full px-2 py-2 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 text-sm"
                >
                  <option value="connections">Connections</option>
                  <option value="companies">Companies</option>
                  <option value="topics">Topics</option>
                </select>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Filter'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Source selector styled like OpenSearch */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {['LinkedIn', 'X', 'Reddit', 'Carta'].map((source) => {
              const sourceLower = source.toLowerCase();
              const isSelected = selectedSources.includes(sourceLower);
              return (
                <button
                  key={sourceLower}
                  onClick={() => handleSourceToggle(sourceLower)}
                  className={`px-4 py-2 rounded-md border ${
                    isSelected 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {source}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Network map visualization container */}
      <div 
        ref={mapContainerRef}
        className={`w-full h-[500px] bg-gray-50 rounded-lg border border-gray-200 ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Loading network data...</p>
          </div>
        ) : networkData ? (
          <div className="p-4">
            <h2 className="text-xl font-medium mb-4">Your {selectedView} Network</h2>
            {/* This is a placeholder for the actual network visualization */}
            <div className="h-[400px] flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">
                {selectedSources.length > 0 
                  ? `Network visualization for ${selectedSources.join(', ')} would appear here` 
                  : 'Please select at least one source to view your network'}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No network data available. Try selecting different sources.</p>
          </div>
        )}
      </div>
    </div>
  );
} 