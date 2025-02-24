import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function SearchResults({ results, onFollowUpSearch, loading }) {
  const [followUpQuery, setFollowUpQuery] = useState('');
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

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
      <div 
        className="flex-1 overflow-y-auto px-6 space-y-6 min-h-0" 
        ref={messagesContainerRef}
      >
        {loading && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="h-4 w-4 bg-blue-200 rounded-full animate-bounce"></div>
              <p className="text-blue-600">Processing your query...</p>
            </div>
          </div>
        )}
        
        {results.map((item, index) => (
          <div key={index} className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="font-medium text-gray-700">{item.query}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="px-2 py-1 bg-gray-200 rounded text-sm text-gray-600">
                    {item.response.model}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <ReactMarkdown 
                className="prose max-w-none"
                components={{
                  h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-700 mb-4" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                  li: ({node, ...props}) => <li className="text-gray-700 mb-2" {...props} />
                }}
              >
                {item.response.summary.content}
              </ReactMarkdown>
              {item.response.summary.sourceMap && Object.keys(item.response.summary.sourceMap).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Sources:</h3>
                  <ul className="text-sm space-y-1">
                    {Object.entries(item.response.summary.sourceMap).map(([key, source]) => (
                      <li key={key}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleFollowUpSubmit} className="mt-4 bg-white border-t pt-4 px-6">
        <div className="relative flex items-center">
          <input
            type="text"
            value={followUpQuery}
            onChange={(e) => setFollowUpQuery(e.target.value)}
            placeholder="Ask a follow-up question..."
            disabled={loading}
            className={`flex-1 px-4 py-2 border rounded-lg pr-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              loading ? 'bg-gray-50 text-gray-500' : 'bg-white'
            }`}
          />
          <div className="absolute right-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors ${
                loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}