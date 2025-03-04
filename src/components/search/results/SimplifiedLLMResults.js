/**
 * SimplifiedLLMResults.js
 * A simplified version of the LLM results display with just two empty tabs
 * and a follow-up chat interface
 */

import React, { useState } from 'react';
import styles from './SimplifiedLLMResults.module.css';

/**
 * SimplifiedLLMResults Component
 * Displays a simplified tab UI with two tabs: "All Results" and "Key Insights"
 * Both tabs are initially empty to provide a clean slate
 */
const SimplifiedLLMResults = ({ query = '', onFollowUpQuery = () => {} }) => {
  const [activeTab, setActiveTab] = useState('all-results');
  const [followUpQueries, setFollowUpQueries] = useState([]);
  const [followUpInput, setFollowUpInput] = useState('');

  // Define our two tabs
  const tabs = [
    {
      id: 'all-results',
      label: 'All Results',
    },
    {
      id: 'key-insights',
      label: 'Key Insights',
    }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleFollowUpSubmit = () => {
    if (!followUpInput.trim()) return;
    
    // Add to the list of follow-up queries
    const newFollowUpQueries = [...followUpQueries, followUpInput];
    setFollowUpQueries(newFollowUpQueries);
    
    // Call the parent handler
    onFollowUpQuery(followUpInput);
    
    // Clear the input
    setFollowUpInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFollowUpSubmit();
    }
  };

  return (
    <div className={styles.simplifiedContainer}>
      {/* Tab navigation */}
      
      {/* Tab Headers */}
      <div className={styles.tabHeaders}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => handleTabClick(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Original query displayed minimally */}
        {query && <p className={styles.queryText}>Query: {query}</p>}
        
        {/* Follow-up queries, if any */}
        {followUpQueries.map((fq, index) => (
          <p key={`followup-${index}`} className={styles.queryText}>Follow-up: {fq}</p>
        ))}
        
        {activeTab === 'all-results' && (
          <div className={styles.emptyTabContent}>
            <p>All Results tab content will be displayed here.</p>
          </div>
        )}
        
        {activeTab === 'key-insights' && (
          <div className={styles.emptyTabContent}>
            <p>Key Insights tab content will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Follow-up chat UI component
export const FollowUpChat = ({ onSubmit }) => {
  const [input, setInput] = useState('');
  
  const handleSubmit = () => {
    if (!input.trim()) return;
    onSubmit(input);
    setInput('');
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  return (
    <div className={styles.followupContainer}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        className={styles.followupInput}
        placeholder="Ask a follow-up question..."
      />
      <button 
        onClick={handleSubmit} 
        className={styles.followupButton}
      >
        Chat
      </button>
    </div>
  );
};

export default SimplifiedLLMResults;
