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
  
  // Compact and minimal design for follow-up chat
  return (
    <div className="follow-up-chat" style={{ padding: '8px 10px', borderTop: '1px solid #eee' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          style={{
            flexGrow: 1,
            padding: '6px 8px',
            fontSize: '13px',
            border: '1px solid #e0e0e0',
            borderRadius: '4px 0 0 4px',
            backgroundColor: '#fafafa',
            outline: 'none'
          }}
          placeholder="Ask a follow-up question..."
          value={followUpQuery}
          onChange={(e) => setFollowUpQuery(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          style={{
            backgroundColor: isLoading || !followUpQuery.trim() ? '#90CAF9' : '#2196F3',
            color: 'white',
            padding: '6px 10px',
            fontSize: '12px',
            border: 'none',
            borderRadius: '0 4px 4px 0',
            cursor: isLoading || !followUpQuery.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '50px'
          }}
          disabled={isLoading || !followUpQuery.trim()}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <svg style={{ animation: 'spin 1s linear infinite', marginRight: '4px', height: '12px', width: '12px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span style={{ fontSize: '11px' }}>Processing</span>
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