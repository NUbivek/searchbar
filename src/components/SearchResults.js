import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function SearchResults({ results, onFollowUpSearch, loading, query }) {
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [processedResults, setProcessedResults] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results]);

  // Process results when they change
  useEffect(() => {
    console.log("Processing results in SearchResults:", JSON.stringify(results, null, 2));
    if (results && results.length > 0) {
      try {
        // Extract actual content items from the results
        const extractedContent = [];
        results.forEach(item => {
          console.log("Processing item:", JSON.stringify(item, null, 2));
          
          if (item.type === 'assistant') {
            console.log("Found assistant item, content type:", typeof item.content, Array.isArray(item.content));
            
            // Handle different content structures
            if (Array.isArray(item.content)) {
              console.log("Content is array with length:", item.content.length);
              item.content.forEach(contentItem => {
                if (contentItem && typeof contentItem === 'object') {
                  // Ensure content is a string to avoid ReactMarkdown issues
                  if (contentItem.content && typeof contentItem.content !== 'string') {
                    contentItem.content = JSON.stringify(contentItem.content);
                  }
                  extractedContent.push(contentItem);
                }
              });
            } else if (item.content && typeof item.content === 'object') {
              console.log("Content is object with keys:", Object.keys(item.content));
              
              // Handle LLM-processed results with sources
              if (item.content.sources && Array.isArray(item.content.sources)) {
                console.log("Found sources array with length:", item.content.sources.length);
                item.content.sources.forEach(source => {
                  if (source && typeof source === 'object') {
                    extractedContent.push(source);
                  }
                });
              } else if (item.content.summary) {
                // Create a summary item
                extractedContent.push({
                  title: "Summary",
                  content: item.content.summary,
                  type: "summary"
                });
                
                // If there are follow-up questions, add them as a special item
                if (item.content.followUpQuestions && Array.isArray(item.content.followUpQuestions)) {
                  extractedContent.push({
                    title: "Follow-up Questions",
                    content: item.content.followUpQuestions.join("\n\n"),
                    type: "questions"
                  });
                }
              }
            }
          }
        });
        
        console.log("Final extracted content:", JSON.stringify(extractedContent, null, 2));
        setProcessedResults(extractedContent);
      } catch (error) {
        console.error("Error processing results:", error);
      }
    }
  }, [results]);

  const handleFollowUpSubmit = (e) => {
    e.preventDefault();
    if (followUpQuery.trim()) {
      onFollowUpSearch(followUpQuery);
      setFollowUpQuery('');
    }
  };

  if (!results || results.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        Start your search to see results here
      </div>
    );
  }

  // Category filtering functions
  const categoryFilters = {
    all: () => true,
    web: (item) => item && item.url,
    text: (item) => item && !item.code && !item.url && item.type !== 'summary' && item.type !== 'questions',
    code: (item) => item && (item.code || (typeof item.content === 'string' && item.content.includes('```'))),
    summary: (item) => item && item.type === 'summary',
    questions: (item) => item && item.type === 'questions',
    financial: (item) => {
      if (!item || typeof item.content !== 'string') return false;
      const financialKeywords = ['stock', 'market', 'finance', 'investment', 'price', 'earnings', 'revenue'];
      const content = item.content.toLowerCase();
      return financialKeywords.some(keyword => content.includes(keyword));
    },
    research: (item) => {
      if (!item || typeof item.content !== 'string') return false;
      const researchKeywords = ['study', 'research', 'paper', 'journal', 'publication', 'findings'];
      const content = item.content.toLowerCase();
      return researchKeywords.some(keyword => content.includes(keyword));
    }
  };

  // Get filtered content based on active category
  const getFilteredContent = () => {
    return processedResults.filter(categoryFilters[activeCategory] || categoryFilters.all);
  };

  // Count items in each category
  const getCategoryCounts = () => {
    return Object.keys(categoryFilters).reduce((counts, category) => {
      counts[category] = processedResults.filter(categoryFilters[category]).length;
      return counts;
    }, {});
  };

  const categoryCounts = getCategoryCounts();
  const filteredContent = getFilteredContent();

  return (
    <div className="search-results flex flex-col h-[calc(100vh-200px)]">
      <div className="flex-1 overflow-y-auto px-6 space-y-6 min-h-0">
        {loading && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="h-4 w-4 bg-blue-200 rounded-full animate-bounce"></div>
              <p className="text-blue-600">Processing your query...</p>
            </div>
          </div>
        )}
        
        {/* Category Tabs */}
        {processedResults.length > 0 && Object.values(categoryCounts).some(count => count > 0) && (
          <div className="category-tabs overflow-x-auto">
            <div className="flex space-x-1 border-b border-gray-200 pb-2">
              {Object.keys(categoryFilters).map(category => {
                // Only show categories that have content
                if (categoryCounts[category] === 0) return null;
                
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                      {categoryCounts[category]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Debug info */}
        <div className="bg-gray-50 p-3 mb-4 rounded-lg text-xs border border-gray-200" style={{ fontSize: '10px' }}>
          <details>
            <summary className="cursor-pointer font-medium">Debug Information (click to expand)</summary>
            <div className="mt-2 space-y-1">
              <p>Processed results: {processedResults.length}</p>
              <p>Active category: {activeCategory}</p>
              <p>Filtered results: {filteredContent.length}</p>
              <p>Category counts: {JSON.stringify(categoryCounts)}</p>
            </div>
          </details>
        </div>
        
        {results.map((item, index) => {
          // Handle user messages
          if (item.type === 'user') {
            return (
              <div key={`user-${index}`} className="bg-gray-100 rounded-lg p-4">
                <p className="font-medium text-gray-700">{item.content}</p>
              </div>
            );
          }
          
          // Handle assistant messages with results
          if (item.type === 'assistant') {
            const content = item.content;
            
            if (Array.isArray(content)) {
              return (
                <div key={`assistant-${index}`} className="space-y-4">
                  {content.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500">No results found</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-medium text-gray-800">Search Results</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        {/* Show filtered content based on active category */}
                        {filteredContent.length > 0 ? (
                          filteredContent.map((result, resultIndex) => (
                            <div key={resultIndex} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                              <h4 className="font-medium text-blue-600">
                                {result.title || 'Result'}
                                {result.source && <span className="ml-2 text-xs text-gray-500">({result.source})</span>}
                                {result.type === 'summary' && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Summary</span>}
                                {result.type === 'questions' && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Questions</span>}
                              </h4>
                              
                              {result.type === 'questions' ? (
                                <ul className="mt-2 space-y-2 list-disc list-inside text-sm text-gray-700">
                                  {result.content.split('\n\n').map((question, qIndex) => (
                                    <li key={qIndex} className="cursor-pointer hover:text-blue-600" onClick={() => onFollowUpSearch(question)}>
                                      {question}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-700 mt-1">{result.content}</p>
                              )}
                              
                              {result.url && (
                                <a 
                                  href={result.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                                >
                                  {result.url}
                                </a>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-4 text-gray-500">
                            No results in this category
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <div key={`assistant-${index}`} className="bg-blue-50 rounded-lg p-4">
                  <ReactMarkdown className="prose prose-blue max-w-none">
                    {typeof content === 'string' ? content : JSON.stringify(content)}
                  </ReactMarkdown>
                </div>
              );
            }
          }
          
          return null;
        })}
        
        <div ref={chatEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleFollowUpSubmit} className="flex">
          <input
            type="text"
            value={followUpQuery}
            onChange={(e) => setFollowUpQuery(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading || !followUpQuery.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}