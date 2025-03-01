import React, { useState } from 'react';

const FollowUpChat = ({ onSearch, isLoading }) => {
  const [followUpQuery, setFollowUpQuery] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (followUpQuery.trim() && onSearch) {
      onSearch(followUpQuery);
      setFollowUpQuery('');
    }
  };
  
  // Remove the redundant chat history display
  return (
    <div className="follow-up-chat p-4">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          className="flex-grow p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask a follow-up question..."
          value={followUpQuery}
          onChange={(e) => setFollowUpQuery(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          disabled={isLoading || !followUpQuery.trim()}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing
            </span>
          ) : (
            'Ask'
          )}
        </button>
      </form>
    </div>
  );
};

export default FollowUpChat; 