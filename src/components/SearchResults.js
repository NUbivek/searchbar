import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function SearchResults({ results, onFollowUpSearch, loading }) {
  const [followUpQuery, setFollowUpQuery] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
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
                        {content.map((result, resultIndex) => (
                          <div key={resultIndex} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                            <h4 className="font-medium text-blue-600">
                              {result.title || 'Result'}
                              {result.source && <span className="ml-2 text-xs text-gray-500">({result.source})</span>}
                            </h4>
                            <p className="text-sm text-gray-700 mt-1">{result.content}</p>
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
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            
            // Handle other content types
            return (
              <div key={`assistant-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <ReactMarkdown>{typeof content === 'string' ? content : JSON.stringify(content)}</ReactMarkdown>
              </div>
            );
          }
          
          // Fallback for any other message types
          return null;
        })}
        <div ref={chatEndRef} />
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleFollowUpSubmit} className="flex gap-2">
          <input
            type="text"
            value={followUpQuery}
            onChange={(e) => setFollowUpQuery(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!followUpQuery.trim() || loading}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              !followUpQuery.trim() || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}