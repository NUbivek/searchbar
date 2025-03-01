import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import CategoryDisplay from './search/categories/CategoryDisplay';
import { safeStringify } from '../utils/reactUtils';

// Helper function to get a consistent color for a category based on its ID or name
const getColorForCategory = (identifier) => {
  if (!identifier) return '#4285F4'; // Default blue
  
  // Predefined colors for common categories
  const categoryColors = {
    'key_insights': '#4285F4',      // Blue
    'market_analysis': '#34A853',   // Green
    'financial_data': '#4C6EF5',    // Indigo
    'definition': '#9C27B0',        // Purple
    'industry_trends': '#00BCD4',   // Cyan
    'challenges': '#F44336',        // Red
    'overview': '#FF9800',          // Orange
    'statistics': '#795548',        // Brown
    'research': '#607D8B',          // Blue Grey
    'comparison': '#673AB7',        // Deep Purple
    'forecast': '#009688',          // Teal
    'searchResults': '#757575'      // Grey
  };
  
  // Check if we have a predefined color
  const normalizedId = identifier.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  
  // Try exact match first
  if (categoryColors[normalizedId]) {
    return categoryColors[normalizedId];
  }
  
  // Look for partial matches
  for (const [key, color] of Object.entries(categoryColors)) {
    if (normalizedId.includes(key)) {
      return color;
    }
  }
  
  // Calculate a consistent color based on string hash
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to hex color
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
};

/**
 * Normalize a result item to a standard format
 * @param {Object} item The result item to normalize
 * @param {number} index The index of the item
 * @returns {Object} Normalized result item
 */
const normalizeResultItem = (item, index) => {
  // If item is already normalized, return it
  if (item && item.id && item.title && item.content) {
    return item;
  }
  
  // Create a new normalized item
  const normalizedItem = {
    id: item.id || `result-${index}`,
    title: item.title || item.name || 'Untitled Result',
    content: item.content || item.text || item.summary || '',
    url: item.url || item.link || '',
    source: item.source || item.provider || '',
    type: item.type || 'web',
    metrics: {
      relevance: item.relevance || item.relevanceScore || 0,
      accuracy: item.accuracy || item.accuracyScore || 0,
      credibility: item.credibility || item.credibilityScore || 0
    }
  };
  
  return normalizedItem;
};

export default function SearchResults({ results, onFollowUpSearch, loading: initialLoading, query, error: initialError }) {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(initialError);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const resultsEndRef = useRef(null);

  useEffect(() => {
    setLoading(initialLoading);
  }, [initialLoading]);

  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  useEffect(() => {
    if (resultsEndRef.current) {
      resultsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results, loading]);

  const handleFollowUpSubmit = (e) => {
    e.preventDefault();
    if (followUpQuery.trim()) {
      onFollowUpSearch(followUpQuery);
      setFollowUpQuery('');
    }
  };

  // Safely render message content
  const renderMessageContent = (content) => {
    // If content is null or undefined, return empty string
    if (content === null || content === undefined) {
      return '';
    }
    
    // If content is already a string, return it
    if (typeof content === 'string') {
      return content;
    }
    
    // If content is an object with summary property, use that
    if (typeof content === 'object') {
      if (content.summary) {
        return typeof content.summary === 'string' ? content.summary : JSON.stringify(content.summary);
      }
      
      if (content.content) {
        return typeof content.content === 'string' ? content.content : JSON.stringify(content.content);
      }
      
      // Otherwise stringify the whole object
      return JSON.stringify(content);
    }
    
    // For any other type, convert to string
    return String(content);
  };

  return (
    <div className="search-results-container">
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Display chat history if available */}
          {Array.isArray(results) && results.length > 0 && (
            <div className="chat-history">
              {results.map((message, index) => (
                <div key={index} className={`chat-message ${message.type}`} style={{
                  padding: '15px',
                  margin: '10px 0',
                  borderRadius: '5px',
                  backgroundColor: message.type === 'user' ? '#e2f0fd' : '#f8f9fa',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div className="message-header" style={{ 
                    marginBottom: '5px', 
                    fontWeight: 'bold', 
                    color: message.type === 'user' ? '#2a6496' : '#333'
                  }}>
                    {message.type === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  
                  <div className="message-content">
                    {message.type === 'user' ? (
                      <p>{renderMessageContent(message.content)}</p>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: renderMessageContent(message.content) }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Display follow-up question form */}
          {Array.isArray(results) && results.length > 0 && onFollowUpSearch && (
            <div className="follow-up-container" style={{ marginTop: '20px' }}>
              <form onSubmit={handleFollowUpSubmit} className="follow-up-form">
                <input
                  type="text"
                  value={followUpQuery}
                  onChange={(e) => setFollowUpQuery(e.target.value)}
                  placeholder="Ask a follow-up question..."
                  className="follow-up-input"
                  style={{
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    width: '100%',
                    marginBottom: '10px'
                  }}
                />
                <button 
                  type="submit" 
                  className="follow-up-button"
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#4285F4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Ask Follow-up
                </button>
              </form>
            </div>
          )}
          
          <div ref={resultsEndRef} />
        </>
      )}
    </div>
  );
}