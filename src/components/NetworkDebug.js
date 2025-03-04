import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Network Debug Component
 * Displays troubleshooting information for OAuth integration
 */
const NetworkDebug = ({ provider = 'linkedin' }) => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [activeProvider, setActiveProvider] = useState(provider);

  const fetchDebugInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/auth/${activeProvider}/debug`);
      setDebugInfo(response.data);
    } catch (err) {
      console.error('Failed to fetch debug info:', err);
      setError(err.message || 'Failed to fetch debug information');
    } finally {
      setLoading(false);
    }
  };
  
  // Change active provider
  const switchProvider = (newProvider) => {
    setActiveProvider(newProvider);
    setDebugInfo(null);
    setError(null);
  };

  return (
    <div className="mt-4 mb-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold text-gray-800">OAuth Configuration Debug</h3>
        <div className="space-x-2">
          <div className="flex space-x-2 mb-2">
            <button
              onClick={() => switchProvider('linkedin')}
              className={`px-3 py-1 text-sm rounded ${activeProvider === 'linkedin' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              LinkedIn
            </button>
            <button
              onClick={() => switchProvider('twitter')}
              className={`px-3 py-1 text-sm rounded ${activeProvider === 'twitter' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Twitter
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <p className="text-sm text-gray-600">Debugging {activeProvider} integration</p>
        <div className="space-x-2">
          <button
            onClick={fetchDebugInfo}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Check Configuration'}
          </button>
          {debugInfo && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
            >
              {expanded ? 'Hide Details' : 'Show Details'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {debugInfo && (
        <div className="mt-4">
          <div className="bg-green-100 border border-green-200 rounded p-3 mb-3">
            <h4 className="font-medium text-green-800">Configuration Status</h4>
            <ul className="mt-2 list-disc list-inside">
              <li>
                Client ID: {debugInfo.environment.hasClientId ? '✅ Configured' : '❌ Missing'}
              </li>
              <li>
                Client Secret: {debugInfo.environment.hasClientSecret ? '✅ Configured' : '❌ Missing'}
              </li>
              <li>
                Redirect URI: {debugInfo.oauthConfig.configuredRedirectUri}
              </li>
              <li>
                Authentication Status: {debugInfo.authState?.hasLinkedInToken ? '✅ Logged in' : '❌ Not logged in'}
              </li>
            </ul>
          </div>

          {debugInfo.troubleshooting.suggestions.length > 0 && (
            <div className="bg-yellow-100 border border-yellow-200 rounded p-3 mb-3">
              <h4 className="font-medium text-yellow-800">Suggestions</h4>
              <ul className="mt-2 list-disc list-inside">
                {debugInfo.troubleshooting.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-yellow-700">{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {expanded && (
            <div className="mt-3">
              <h4 className="font-medium text-gray-700 mb-2">Technical Details</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkDebug;
