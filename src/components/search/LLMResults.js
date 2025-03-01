import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { safeStringify } from '../../utils/reactUtils';

// Define categories with their properties
const CATEGORIES = [
  {
    id: 'key_insights',
    title: 'Key Insights',
    keywords: ['key', 'insight', 'highlight', 'important', 'significant', 'notable', 'critical'],
    priority: 0,
    color: '#4CAF50' // Green
  },
  {
    id: 'market_overview',
    title: 'Market Analysis',
    keywords: ['market', 'industry', 'sector', 'landscape', 'overview', 'trends', 'analysis'],
    priority: 1,
    color: '#4285F4' // Blue
  },
  {
    id: 'financial_overview',
    title: 'Financial Data',
    keywords: ['financial', 'finance', 'money', 'capital', 'funding', 'investment'],
    priority: 1,
    color: '#3F51B5' // Indigo
  },
  {
    id: 'definition',
    title: 'Definition',
    keywords: ['definition', 'meaning', 'describe', 'explanation', 'what is'],
    priority: 2,
    color: '#9C27B0' // Purple
  },
  {
    id: 'industry_trends',
    title: 'Industry Trends',
    keywords: ['trend', 'development', 'emerging', 'future', 'growth'],
    priority: 2,
    color: '#00BCD4' // Cyan
  },
  {
    id: 'challenges',
    title: 'Challenges',
    keywords: ['challenge', 'problem', 'issue', 'difficulty', 'obstacle', 'barrier'],
    priority: 3,
    color: '#F44336' // Red
  }
];

/**
 * Component for displaying LLM-generated search results
 * @param {Object} props Component props
 * @param {Array} props.results Array of search results
 * @param {string} props.query Search query
 * @param {boolean} props.showTabs Whether to show category tabs
 * @param {string} props.activeCategory Active category ID (controlled from parent)
 * @param {Function} props.setActiveCategory Function to set active category in parent
 * @returns {JSX.Element} Rendered LLM results
 */
const LLMResults = ({ 
  results, 
  query, 
  showTabs = true, 
  activeCategory: externalActiveCategory, 
  setActiveCategory: setExternalActiveCategory 
}) => {
  const [processedResults, setProcessedResults] = useState([]);
  const [isLLMProcessing, setIsLLMProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  const [internalActiveCategory, setInternalActiveCategory] = useState('key_insights');
  const containerRef = useRef(null);
  const [resultsPortalTarget, setResultsPortalTarget] = useState(null);
  
  // Use either external or internal active category
  const activeCategory = externalActiveCategory || internalActiveCategory;
  
  // Set active category function
  const setActiveCategory = (categoryId) => {
    if (setExternalActiveCategory) {
      setExternalActiveCategory(categoryId);
    } else {
      setInternalActiveCategory(categoryId);
    }
  };
  
  // Find or create the portal target
  useEffect(() => {
    // Look for an existing results container
    let resultsContainer = document.getElementById('llm-results-container');
    
    if (!resultsContainer) {
      // If it doesn't exist, create it
      resultsContainer = document.createElement('div');
      resultsContainer.id = 'llm-results-container';
      resultsContainer.style.padding = '10px';
      
      // Find the search results container
      const searchResultsContainer = document.querySelector('.overflow-y-auto');
      
      if (searchResultsContainer) {
        // Insert at the beginning
        searchResultsContainer.insertBefore(resultsContainer, searchResultsContainer.firstChild);
      }
    }
    
    setResultsPortalTarget(resultsContainer);
    
    // Cleanup
    return () => {
      if (resultsContainer && resultsContainer.parentNode) {
        resultsContainer.parentNode.removeChild(resultsContainer);
      }
    };
  }, []);
  
  // Process the results from the LLM API
  useEffect(() => {
    const processResultsThroughLLM = async () => {
      // Only process if we have valid results and a query
      if (!results || !query) {
        setProcessedResults([]);
        return;
      }
      
      setIsLLMProcessing(true);
      setProcessingError(null);
      
      try {
        // Parse the results if they're a string
        let parsedResults = results;
        
        if (typeof results === 'string') {
          try {
            // Check if the string starts with "Error:"
            if (results.startsWith('Error:')) {
              throw new Error(results);
            }
            
            parsedResults = JSON.parse(results);
          } catch (e) {
            console.error('Failed to parse results JSON:', e);
            
            // Create a fallback structure for non-JSON responses
            parsedResults = { 
              categories: {
                key_insights: typeof results === 'string' ? results : 'No results available'
              }
            };
          }
        }
        
        // Extract categories from the results
        let categories = [];
        
        // Check if we have categories in the response
        if (parsedResults.categories) {
          // Map the categories to our format
          Object.entries(parsedResults.categories).forEach(([key, content]) => {
            // Find the matching category from our predefined list
            const categoryDef = CATEGORIES.find(cat => cat.id === key) || {
              id: key,
              title: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              color: '#607D8B' // Default color
            };
            
            categories.push({
              id: key,
              title: categoryDef.title,
              content: content || 'No content available',
              color: categoryDef.color
            });
          });
        } else if (parsedResults.content) {
          // If we just have content, put it in the key insights category
          categories.push({
            id: 'key_insights',
            title: 'Key Insights',
            content: parsedResults.content,
            color: '#4CAF50'
          });
        } else if (typeof parsedResults === 'string') {
          // If we just have a string, put it in the key insights category
          categories.push({
            id: 'key_insights',
            title: 'Key Insights',
            content: parsedResults,
            color: '#4CAF50'
          });
        } else if (Array.isArray(parsedResults)) {
          // If we have an array, try to extract content from it
          const content = parsedResults.map(item => {
            if (typeof item === 'string') return item;
            if (item.content) return item.content;
            if (item.snippet) return item.snippet;
            return safeStringify(item);
          }).join('\n\n');
          
          categories.push({
            id: 'key_insights',
            title: 'Key Insights',
            content,
            color: '#4CAF50'
          });
        } else {
          // Fallback for other formats
          categories.push({
            id: 'key_insights',
            title: 'Key Insights',
            content: safeStringify(parsedResults),
            color: '#4CAF50'
          });
        }
        
        // Sort categories by priority
        categories.sort((a, b) => {
          const catA = CATEGORIES.find(cat => cat.id === a.id);
          const catB = CATEGORIES.find(cat => cat.id === b.id);
          return (catA?.priority || 99) - (catB?.priority || 99);
        });
        
        setProcessedResults(categories);
        
        // Set the active category to the first one if we have results
        if (categories.length > 0 && !activeCategory) {
          setActiveCategory(categories[0].id);
        }
        
        // Dispatch an event with the processed results
        const event = new CustomEvent('llmResultsProcessed', {
          detail: {
            processedResults: categories,
            activeCategory: categories.length > 0 ? (activeCategory || categories[0].id) : null
          }
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('Error processing LLM results:', error);
        setProcessingError(error.message || 'Error processing results');
        
        // Create a fallback category for errors
        const errorCategory = {
          id: 'key_insights',
          title: 'Key Insights',
          content: `Error processing results: ${error.message || 'Unknown error'}`,
          color: '#F44336'
        };
        
        setProcessedResults([errorCategory]);
        setActiveCategory('key_insights');
      } finally {
        setIsLLMProcessing(false);
      }
    };
    
    processResultsThroughLLM();
  }, [results, query, activeCategory, setExternalActiveCategory]);
  
  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };
  
  // Render the complete results (categories + content)
  const renderCompleteResults = () => {
    if (isLLMProcessing) {
      return (
        <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading-spinner" style={{ 
            width: '40px', 
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Processing search results...</p>
        </div>
      );
    }
    
    if (processingError && processedResults.length === 0) {
      return (
        <div className="error-container" style={{ padding: '20px', color: '#e74c3c' }}>
          <h3>Error Processing Results</h3>
          <p>{processingError}</p>
        </div>
      );
    }
    
    if (processedResults.length === 0) {
      return (
        <div className="no-categories" style={{ padding: '20px', textAlign: 'center' }}>
          <p>No relevant categories found for your search.</p>
        </div>
      );
    }
    
    // Compact "You" section
    const youSection = (
      <div className="you-section compact-you" style={{ 
        borderBottom: '1px solid #eee',
        marginBottom: '10px',
        paddingBottom: '8px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          fontSize: '13px',
          color: '#555'
        }}>
          <span style={{ 
            fontWeight: 'bold', 
            marginRight: '6px',
            color: '#333'
          }}>You:</span>
          <span style={{ 
            fontStyle: 'italic',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {query}
          </span>
        </div>
      </div>
    );
    
    // Categories section - removed the "Categories" label
    const categoriesSection = (
      <div className="categories-section" style={{ 
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        zIndex: 100,
        padding: '10px 0',
        marginBottom: '15px',
        borderBottom: '1px solid #eee'
      }}>
        {/* Removed the Categories label */}
        <div className="flex flex-wrap gap-2 mb-2">
          {processedResults.map(category => (
            <button
              key={category.id}
              className={`px-3 py-1 rounded-full text-sm`}
              style={{
                backgroundColor: activeCategory === category.id ? category.color : '#f1f5f9',
                color: activeCategory === category.id ? 'white' : '#333'
              }}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>
    );
    
    // Content section
    const category = processedResults.find(cat => cat.id === activeCategory) || processedResults[0];
    
    // Convert newlines to <br> tags and handle markdown-like formatting
    const contentHtml = (category.content || 'No content available')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    const contentSection = (
      <div className="content-panel" style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: `1px solid #f0f0f0`,
        borderLeft: `4px solid ${category.color}`
      }}>
        <h2 style={{ 
          color: category.color,
          marginBottom: '15px',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          {category.title}
        </h2>
        
        <div 
          className="content-text"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
          style={{ lineHeight: '1.6' }}
        />
        
        {/* Sources section */}
        <div className="sources-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Sources:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            <a href={`https://www.google.com/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4285F4', textDecoration: 'underline' }}>
              Search results for {query}
            </a>
          </div>
        </div>
      </div>
    );
    
    return (
      <div className="complete-results">
        {results && results.length > 0 && (
          <>
            {youSection}
            {categoriesSection}
            {contentSection}
          </>
        )}
      </div>
    );
  };
  
  return (
    <>
      {/* Render everything in the portal */}
      {resultsPortalTarget && createPortal(
        renderCompleteResults(),
        resultsPortalTarget
      )}
      
      {/* This div is just a placeholder and won't be visible */}
      <div style={{ display: 'none' }}></div>
    </>
  );
};

export default LLMResults;
