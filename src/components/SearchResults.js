import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import CategoryDisplay from './search/categories/CategoryDisplay';

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
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [processedResults, setProcessedResults] = useState([]);
  const [sources, setSources] = useState([]); // New state to store sources
  const [llmSummary, setLlmSummary] = useState(null);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(initialError);
  const [loadingType, setLoadingType] = useState('results');
  const [llmError, setLlmError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results]);

  // Process search results
  useEffect(() => {
    if (!results || loading) return;
    
    try {
      // Extract sources if available
      let extractedSources = [];
      
      // Check if results has a sources property
      if (results.sources && Array.isArray(results.sources)) {
        extractedSources = results.sources;
      } 
      // Check if results has a sourceMap property (new format)
      else if (results.sourceMap && typeof results.sourceMap === 'object') {
        // Convert sourceMap to array of sources
        extractedSources = Object.values(results.sourceMap).filter(Boolean);
      }
      
      // Set sources state
      setSources(extractedSources);
      
      // Extract and process regular results
      let processedItems = [];
      
      // Handle different result formats
      if (Array.isArray(results)) {
        // Results is an array of items
        processedItems = results.map(normalizeResultItem);
      } else if (results.results && Array.isArray(results.results)) {
        // Results is an object with a results array
        processedItems = results.results.map(normalizeResultItem);
      } else if (results.items && Array.isArray(results.items)) {
        // Results is an object with an items array
        processedItems = results.items.map(normalizeResultItem);
      }
      
      // Set processed results
      setProcessedResults(processedItems);
      
      // Extract LLM summary if available
      if (results.summary && typeof results.summary === 'string') {
        setLlmSummary(results.summary);
      } else if (results.llmSummary && typeof results.llmSummary === 'string') {
        setLlmSummary(results.llmSummary);
      } else if (results.content && typeof results.content === 'string') {
        setLlmSummary(results.content);
      }
      
      // Check if we have categories in the results
      if (results.categories && Array.isArray(results.categories)) {
        // Use categories from results
        setSources(results.categories);
      }
      
      // Set loading to false
      setLoading(false);
    } catch (err) {
      console.error('Error processing search results:', err);
      setError('Failed to process search results');
      setLoading(false);
    }
  }, [results, loading]);

  const handleFollowUpSubmit = (e) => {
    e.preventDefault();
    if (followUpQuery.trim()) {
      onFollowUpSearch(followUpQuery);
      setFollowUpQuery('');
    }
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
                  
                  <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
                    {/* Handle different message content types with improved stringification */}
                    {typeof message.content === 'string' ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : Array.isArray(message.content) ? (
                      <div>
                        {message.content.map((item, i) => (
                          <div key={i}>
                            {typeof item === 'string' 
                              ? item 
                              : typeof item === 'object' && item !== null
                                ? JSON.stringify(item)
                                : String(item || '')}
                          </div>
                        ))}
                      </div>
                    ) : message.content && typeof message.content === 'object' ? (
                      <div>
                        {message.content.summary && 
                          <div className="llm-summary">
                            <ReactMarkdown>{typeof message.content.summary === 'string' 
                              ? message.content.summary 
                              : String(message.content.summary || '')}
                            </ReactMarkdown>
                          </div>
                        }
                        
                        {message.content.sources && Array.isArray(message.content.sources) && (
                          <div className="sources-container">
                            <h4>Sources:</h4>
                            <ul>
                              {message.content.sources.map((source, i) => (
                                <li key={i}>
                                  {typeof source === 'string' ? source : 
                                   typeof source === 'object' && source !== null ? (
                                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                                      {source.title || `Source ${i + 1}`}
                                    </a>
                                   ) : String(source || '')}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {message.content.followUpQuestions && Array.isArray(message.content.followUpQuestions) && message.content.followUpQuestions.length > 0 && (
                          <div className="follow-up-questions">
                            <h4>Follow-up Questions:</h4>
                            <ul>
                              {message.content.followUpQuestions.map((question, i) => (
                                <li key={i} 
                                    className="follow-up-question"
                                    onClick={() => onFollowUpSearch(String(question || ''))}
                                    style={{cursor: 'pointer', color: '#2a6496', textDecoration: 'underline'}}>
                                  {String(question || '')}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>Content not available in text format. {String(message.content || '')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Display LLM summary if available and not showing chat history */}
          {!Array.isArray(results) && llmSummary && (
            <div className="llm-summary" style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              backgroundColor: '#f0f7ff', 
              borderRadius: '5px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#2c5282' }}>AI Summary</h3>
              <div 
                style={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.5',
                  fontSize: '1rem'
                }}
              >
                {typeof llmSummary === 'string' ? (
                  <ReactMarkdown>{llmSummary}</ReactMarkdown>
                ) : typeof llmSummary === 'object' && llmSummary !== null ? (
                  <ReactMarkdown>{JSON.stringify(llmSummary, null, 2)}</ReactMarkdown>
                ) : (
                  <p>Error displaying summary. Please try your search again.</p>
                )}
              </div>
            </div>
          )}
      
          {/* Display SearchResults */}
          {processedResults && processedResults.length > 0 ? (
            <div className="search-results">
              {sources && sources.length > 0 ? (
                <div className="categorized-results">
                  <CategoryDisplay 
                    categories={sources.map(category => {
                      // Make sure all categories have the required fields for the tab display
                      return {
                        ...category,
                        metrics: category.metrics || {
                          relevance: category.relevanceScore || 70,
                          accuracy: category.accuracyScore || 70,
                          credibility: category.credibilityScore || 70,
                          overall: category.overallScore || 70
                        },
                        color: category.color || getColorForCategory(category.id || category.name),
                        content: Array.isArray(category.content) ? category.content : []
                      };
                    })} 
                    query={query} 
                    loading={loading}
                    options={{
                      showMetrics: true,
                      useCardView: false,
                      showTabs: true // Explicitly enable tabs
                    }}
                  />
                </div>
              ) : (
                <div className="uncategorized-results">
                  {processedResults.map((result, index) => (
                    <div key={index} className="search-result-item">
                      <h3>
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {result.title}
                        </a>
                      </h3>
                      <div className="search-result-url">{result.url}</div>
                      <div className="search-result-snippet">
                        {result.contentWithLinks ? (
                          <div dangerouslySetInnerHTML={{ __html: result.contentWithLinks }} />
                        ) : (
                          <div>{result.snippet || result.content || result.description}</div>
                        )}
                      </div>
                      
                      {/* Display metrics if available */}
                      {(result.metrics || result.relevance) && (
                        <div className="result-metrics">
                          <span className="metric relevance">
                            Relevance: {Math.round((result.metrics?.relevance || result.relevance || 0) * 100)}%
                          </span>
                          <span className="metric accuracy">
                            Accuracy: {Math.round((result.metrics?.accuracy || result.accuracy || 0) * 100)}%
                          </span>
                          <span className="metric credibility">
                            Credibility: {Math.round((result.metrics?.credibility || result.credibility || 0) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            !loading && (
              <div className="no-results">
                <p>No results found for your search.</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}