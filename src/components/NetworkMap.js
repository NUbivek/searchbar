import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { initiateLinkedInAuth, initiateTwitterAuth, initiateFacebookAuth } from '../utils/socialAuthHelpers';

export default function NetworkMap() {
  // Changed to only include the social networks we want to integrate with
  const [activeTab, setActiveTab] = useState('linkedin');
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState('connections');
  const [isAuthenticated, setIsAuthenticated] = useState({
    linkedin: false,
    twitter: false,
    facebook: false
  });
  const mapContainerRef = useRef(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAuth = async (source) => {
    setLoading(true);
    setError(null);

    try {
      // Actual OAuth flow
      let authUrl;
      
      switch(source) {
        case 'linkedin':
          authUrl = initiateLinkedInAuth();
          break;
        case 'twitter':
          authUrl = initiateTwitterAuth();
          break;
        case 'facebook':
          authUrl = initiateFacebookAuth();
          break;
        default:
          throw new Error(`Unsupported source: ${source}`);
      }
      
      // In a real implementation, we would redirect to the authentication URL
      console.log(`Authenticating with ${source}...`);
      console.log(`Auth URL: ${authUrl}`);
      
      // For demo purposes, we'll simulate the auth process completion
      // In production, you would redirect to authUrl and handle the callback
      setTimeout(() => {
        setIsAuthenticated(prev => ({
          ...prev,
          [source]: true
        }));
        
        // Simulate getting network data after authentication
        setNetworkData({
          nodes: source === 'linkedin' ? 48 : source === 'twitter' ? 120 : 85,
          connections: source === 'linkedin' ? 67 : source === 'twitter' ? 250 : 120,
          source: source
        });
        
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error(`${source} authentication error:`, err);
      setError(`An error occurred while authenticating with ${source}: ${err.message}`);
      setLoading(false);
    }
  };
  
  const handleLogout = (source) => {
    setIsAuthenticated(prev => ({
      ...prev,
      [source]: false
    }));
    
    if (activeTab === source) {
      setNetworkData(null);
    }
  };

  // Check for authentication code in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    if (error) {
      setError(decodeURIComponent(error));
    }
    
    if (code) {
      // Handle the authorization code
      // In a real implementation, you would exchange this code for a token
      console.log('Authorization code received:', code);
      
      // Remove code from URL without refreshing the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Simulate successful authentication
      setLoading(true);
      
      setTimeout(() => {
        setIsAuthenticated(prev => ({
          ...prev,
          'linkedin': true // Assuming the code is for LinkedIn
        }));
        
        setActiveTab('linkedin');
        
        setNetworkData({
          nodes: 48,
          connections: 67,
          source: 'linkedin'
        });
        
        setLoading(false);
      }, 1000);
    }
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Network Sources Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {['LinkedIn', 'Twitter', 'Facebook'].map((source) => {
            const sourceLower = source.toLowerCase();
            const isActive = activeTab === sourceLower;
            return (
              <button
                key={sourceLower}
                onClick={() => handleTabChange(sourceLower)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {source}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Filter tools */}
      {isAuthenticated[activeTab] && (
        <div className="my-6">
          <div className="mb-6">
            <div className="flex w-full">
              <div className="flex-grow bg-gray-100 rounded-l-md border border-gray-300">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={`Search your ${activeTab} network...`}
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
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Social network connection & visualization container */}
      <div 
        ref={mapContainerRef}
        className={`w-full min-h-[500px] bg-gray-50 rounded-lg border border-gray-200 ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? (
          <div className="h-[500px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Connecting to {activeTab}...</p>
            </div>
          </div>
        ) : isAuthenticated[activeTab] ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Your {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Network</h2>
              <button 
                onClick={() => handleLogout(activeTab)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Disconnect
              </button>
            </div>

            {networkData && (
              <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{networkData.nodes}</div>
                    <div className="text-gray-500 text-sm mt-1">Total Connections</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{networkData.connections}</div>
                    <div className="text-gray-500 text-sm mt-1">Total Interactions</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* This is a placeholder for the actual network visualization */}
            <div className="h-[400px] flex items-center justify-center border border-dashed border-gray-300 rounded-lg bg-white">
              <div className="text-center max-w-md px-4">
                <p className="text-gray-600 mb-2">
                  {activeTab === 'linkedin' ? 'LinkedIn' : activeTab === 'twitter' ? 'Twitter' : 'Facebook'} network visualization will appear here
                </p>
                <p className="text-gray-500 text-sm">
                  Connected as <span className="font-semibold">example_user@gmail.com</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[500px] flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <h3 className="text-xl font-semibold mb-3">
                Connect to {activeTab === 'linkedin' ? 'LinkedIn' : activeTab === 'twitter' ? 'Twitter' : 'Facebook'}
              </h3>
              <p className="text-gray-600 mb-6">
                Connect your {activeTab === 'linkedin' ? 'LinkedIn' : activeTab === 'twitter' ? 'Twitter' : 'Facebook'} account to visualize your professional network, 
                analyze connections, and discover new opportunities.
              </p>
              <button 
                onClick={() => handleAuth(activeTab)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                {activeTab === 'linkedin' ? 'Connect LinkedIn Account' : 
                  activeTab === 'twitter' ? 'Connect Twitter Account' : 'Connect Facebook Account'}
              </button>
              <p className="text-xs text-gray-500 mt-4">
                We'll only access your public profile information and connections list.
                We don't store your credentials or post on your behalf.  
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 