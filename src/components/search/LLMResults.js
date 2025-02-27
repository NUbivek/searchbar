import React, { useEffect, useState } from 'react';

/**
 * Component for displaying LLM-generated search results
 * @param {Object} props Component props
 * @param {Array} props.results Array of search results
 * @param {string} props.query Search query
 * @returns {JSX.Element} Rendered LLM results
 */
const LLMResults = ({ results, query }) => {
  const [processedResults, setProcessedResults] = useState([]);
  
  // Debug log
  useEffect(() => {
    console.log("LLMResults component mounted with:", { 
      resultsCount: results?.length || 0,
      query: query || 'No query provided',
      resultsType: Array.isArray(results) ? 'array' : typeof results,
      resultsStructure: results ? JSON.stringify(results).substring(0, 200) + '...' : 'No results'
    });
    
    // Process results to ensure they're in the correct format
    if (results) {
      let processed = [];
      
      if (Array.isArray(results)) {
        // If results is already an array, use it directly
        processed = results.map(item => {
          // Ensure each item has the necessary properties for categorization
          if (typeof item === 'object' && item !== null) {
            return {
              ...item,
              // Add type if not present
              type: item.type || 'search_result',
              // Ensure title is present
              title: item.title || item.name || '',
              // Ensure description is present
              description: item.snippet || item.description || item.content || '',
              // Ensure URL is present
              url: item.link || item.url || ''
            };
          }
          return item;
        });
      } else if (typeof results === 'object') {
        // If results is an object with items/results/data property, use that
        if (results.items && Array.isArray(results.items)) {
          processed = results.items;
        } else if (results.results && Array.isArray(results.results)) {
          processed = results.results;
        } else if (results.data && Array.isArray(results.data)) {
          processed = results.data;
        } else {
          // Otherwise, wrap the object in an array
          processed = [results];
        }
      } else if (typeof results === 'string') {
        // If results is a string, create a text item
        processed = [{ text: results, type: 'text' }];
      }
      
      console.log("LLMResults: Processed results:", {
        count: processed.length,
        sample: processed.length > 0 ? JSON.stringify(processed[0]).substring(0, 100) + '...' : 'Empty array',
        properties: processed.length > 0 ? Object.keys(processed[0] || {}) : []
      });
      
      setProcessedResults(processed);
    }
  }, [results, query]);

  // Ensure query is a string
  const searchQuery = typeof query === 'string' ? query : '';

  if (!processedResults || processedResults.length === 0) {
    console.log("LLMResults: No results to display");
    return (
      <div className="no-results" style={{
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        marginBottom: '16px'
      }}>
        <p>No results found for "{searchQuery}"</p>
      </div>
    );
  }

  return (
    <div className="llm-results">
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '16px'
      }}>
        Search Results for "{searchQuery}"
      </h2>
      
      {/* Debug information */}
      <div style={{
        padding: '10px',
        margin: '10px 0',
        backgroundColor: '#fff9db',
        border: '1px solid #ffd43b',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <p>LLMResults Debug:</p>
        <p>Results Count: {processedResults.length}</p>
        <p>Query: {searchQuery}</p>
        <p>First Result Type: {processedResults.length > 0 ? (processedResults[0].type || 'unknown') : 'N/A'}</p>
        <p>First Result Properties: {processedResults.length > 0 ? Object.keys(processedResults[0]).join(', ') : 'N/A'}</p>
      </div>
      
      {/* Display categorized results */}
      <DirectCategoryDisplay 
        content={processedResults} 
        query={searchQuery} 
      />
    </div>
  );
};

/**
 * A simplified direct implementation of category display
 */
const DirectCategoryDisplay = ({ content, query }) => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Define categories
  const categories = [
    { id: 'all', name: 'All Results', filter: () => true },
    { id: 'web', name: 'Web Results', filter: (item) => item.url || item.link },
    { id: 'text', name: 'Text', filter: (item) => item.type === 'text' || typeof item.text === 'string' },
    { id: 'code', name: 'Code', filter: (item) => item.type === 'code' || item.language },
    { id: 'financial', name: 'Financial', filter: (item) => {
      const text = item.title || item.description || item.content || item.text || '';
      return /\$|stock|market|finance|investment|fund|dividend|earning|revenue|profit|loss/i.test(text);
    }},
    { id: 'research', name: 'Research', filter: (item) => {
      const text = item.title || item.description || item.content || item.text || '';
      return /research|study|paper|journal|analysis|report|finding|experiment|data|survey/i.test(text);
    }}
  ];
  
  // Count items per category
  const categoryCounts = categories.map(category => ({
    ...category,
    count: content.filter(item => category.filter(item)).length
  }));
  
  // Only show categories with content
  const visibleCategories = categoryCounts.filter(category => 
    category.id === 'all' || category.count > 0
  );
  
  // Filter content based on active tab
  const filteredContent = content.filter(item => {
    const category = visibleCategories.find(c => c.id === activeTab);
    return category ? category.filter(item) : true;
  });
  
  // Tab styles
  const tabStyles = {
    container: {
      display: 'flex',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '16px',
      overflowX: 'auto',
      flexWrap: 'wrap'
    },
    tab: (isActive) => ({
      padding: '8px 16px',
      cursor: 'pointer',
      borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
      color: isActive ? '#3b82f6' : '#6b7280',
      fontWeight: isActive ? '600' : '400',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s ease'
    }),
    count: {
      fontSize: '12px',
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      borderRadius: '9999px',
      padding: '2px 8px',
      marginLeft: '6px'
    }
  };
  
  // Content item styles
  const itemStyles = {
    item: {
      padding: '12px',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '12px'
    },
    title: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '4px'
    },
    url: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '4px'
    },
    description: {
      fontSize: '14px',
      color: '#4b5563'
    }
  };
  
  return (
    <div>
      {/* Category tabs */}
      <div style={tabStyles.container}>
        {visibleCategories.map(category => (
          <div
            key={category.id}
            style={tabStyles.tab(category.id === activeTab)}
            onClick={() => setActiveTab(category.id)}
          >
            {category.name} 
            <span style={tabStyles.count}>
              ({category.count})
            </span>
          </div>
        ))}
      </div>
      
      {/* Content items */}
      <div>
        {filteredContent.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
            No results found for this category
          </div>
        ) : (
          filteredContent.map((item, index) => (
            <div key={index} style={itemStyles.item}>
              {/* Title with link if available */}
              <div style={itemStyles.title}>
                {(item.url || item.link) ? (
                  <a 
                    href={item.url || item.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ color: '#2563eb', textDecoration: 'none' }}
                  >
                    {item.title || 'Untitled'}
                  </a>
                ) : (
                  item.title || 'Untitled'
                )}
              </div>
              
              {/* URL if available */}
              {(item.url || item.link) && (
                <div style={itemStyles.url}>{item.url || item.link}</div>
              )}
              
              {/* Description/content */}
              <div style={itemStyles.description}>
                {item.description || item.snippet || item.content || item.text || ''}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LLMResults;
