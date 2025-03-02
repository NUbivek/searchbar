/**
 * TabNavigation.js
 * A clean, simple tabs navigation component for search results
 */

import React, { useState } from 'react';
import styles from './TabNavigation.module.css';

/**
 * TabNavigation component provides a clean tab interface
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects {id, label, content}
 * @param {string} props.defaultTabId - ID of the default active tab
 * @param {Function} props.onTabChange - Optional callback when tab changes
 */
const TabNavigation = ({ 
  tabs = [],
  defaultTabId = null,
  onTabChange = null
}) => {
  // Initialize with first tab or specified default
  const [activeTabId, setActiveTabId] = useState(
    defaultTabId || (tabs.length > 0 ? tabs[0].id : null)
  );

  // Handle tab click
  const handleTabClick = (tabId) => {
    setActiveTabId(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  // If no tabs, return empty container
  if (!tabs || tabs.length === 0) {
    return <div className={styles.emptyContainer}>No tabs available</div>;
  }

  // Get active tab content
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  return (
    <div className={styles.tabContainer} data-testid="tab-navigation">
      {/* Tab Headers */}
      <div className={styles.tabHeaders}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTabId === tab.id ? styles.active : ''}`}
            onClick={() => handleTabClick(tab.id)}
            aria-selected={activeTabId === tab.id}
            role="tab"
            data-tab-id={tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab?.content}
      </div>
    </div>
  );
};

export default TabNavigation;
