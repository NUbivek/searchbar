/**
 * ResultTabs.js
 * Unified component for result tab navigation and management
 * Works with all search result components
 */

import React, { useState, useEffect } from 'react';
import TabNavigation from '../TabNavigation';
import { debug, info, warn, error } from '../../../../utils/logger';

const log = { debug, info, warn, error };

/**
 * Result Tabs Component
 * Provides unified tab management for search results
 * 
 * @param {Object} props Component props
 * @param {Array} props.tabs Tab definitions
 * @param {string} props.defaultTab Default tab to show
 * @param {boolean} props.showTabs Whether to show tabs
 * @param {boolean} props.forceShowTabs Force showing tabs even with only one tab
 * @param {Function} props.onTabChange Callback when tab changes
 */
const ResultTabs = ({
  tabs = [],
  defaultTab = null,
  showTabs = true,
  forceShowTabs = false,
  onTabChange = null,
  children
}) => {
  const [activeTab, setActiveTab] = useState(null);
  const [activeTabContent, setActiveTabContent] = useState(null);
  
  // Determine if we should show tabs
  const hasMultipleTabs = tabs.length > 1;
  const shouldShowTabs = showTabs && (hasMultipleTabs || forceShowTabs);
  
  // Set the initial active tab
  useEffect(() => {
    if (tabs.length === 0) {
      setActiveTab(null);
      setActiveTabContent(null);
      return;
    }
    
    // Find the default tab if specified
    let initialTab = null;
    
    if (defaultTab) {
      // Try to find by ID first
      initialTab = tabs.find(tab => tab.id === defaultTab);
      
      // If not found by ID, try by label
      if (!initialTab) {
        initialTab = tabs.find(tab => tab.label === defaultTab);
      }
    }
    
    // If no default tab specified or not found, use the first tab
    if (!initialTab) {
      initialTab = tabs[0];
    }
    
    setActiveTab(initialTab.id);
    setActiveTabContent(initialTab.content);
    
    log.debug('Set initial tab', { 
      tabId: initialTab.id, 
      label: initialTab.label
    });
    
    // Notify parent if callback provided
    if (typeof onTabChange === 'function') {
      onTabChange(initialTab.id, initialTab.label);
    }
  }, [tabs, defaultTab, onTabChange]);
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    const selectedTab = tabs.find(tab => tab.id === tabId);
    
    if (selectedTab) {
      setActiveTab(tabId);
      setActiveTabContent(selectedTab.content);
      
      log.debug('Changed active tab', { 
        tabId: selectedTab.id, 
        label: selectedTab.label
      });
      
      // Notify parent if callback provided
      if (typeof onTabChange === 'function') {
        onTabChange(tabId, selectedTab.label);
      }
    }
  };
  
  // If no active tab content, render children directly
  if (!shouldShowTabs || !activeTabContent) {
    if (children) {
      return children;
    }
    
    // Fall back to first tab's content if available
    if (tabs.length > 0) {
      return tabs[0].content;
    }
    
    return null;
  }
  
  // Render with tab navigation
  return (
    <div className="result-tabs-container">
      {shouldShowTabs && (
        <TabNavigation 
          tabs={tabs.map(tab => ({
            id: tab.id,
            label: tab.label,
            count: tab.count,
            icon: tab.icon
          }))} 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
      <div className="result-tabs-content">
        {activeTabContent}
      </div>
    </div>
  );
};

export default ResultTabs;
