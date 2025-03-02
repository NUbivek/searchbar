/**
 * TabNavigation.js
 * A clean, simple tabs navigation component for search results
 */

import React, { useState, useEffect } from 'react';
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
  // ENHANCED: More aggressive debugging logs for tab rendering
  console.log('🔄 TabNavigation RENDERING with:', {
    tabsLength: tabs?.length || 0,
    defaultTabId: defaultTabId || 'none',
    hasTabs: Array.isArray(tabs) && tabs.length > 0,
    firstTabId: Array.isArray(tabs) && tabs.length > 0 ? tabs[0].id : 'none',
    tabIds: Array.isArray(tabs) ? tabs.map(tab => tab.id) : [],
    tabLabels: Array.isArray(tabs) ? tabs.map(tab => tab.label) : [],
  });

  // Initialize with first tab or specified default
  const [activeTabId, setActiveTabId] = useState(
    defaultTabId || (tabs && tabs.length > 0 ? tabs[0].id : null)
  );

  // ENHANCED: Add effect to update active tab ID if needed
  useEffect(() => {
    console.log('🔍 TabNavigation useEffect checking active tab ID:', {
      currentActiveTabId: activeTabId,
      defaultTabId: defaultTabId,
      firstTabId: tabs && tabs.length > 0 ? tabs[0].id : null,
      tabsCount: tabs?.length || 0
    });
    
    if (!activeTabId && tabs && tabs.length > 0) {
      console.log('⚠️ Active tab ID was null, setting to default or first tab');
      setActiveTabId(defaultTabId || tabs[0].id);
    } else if (activeTabId && tabs && !tabs.find(tab => tab.id === activeTabId)) {
      console.log('⚠️ Active tab ID not found in tabs, resetting to first tab');
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, defaultTabId, activeTabId]);

  // Handle tab click
  const handleTabClick = (tabId) => {
    console.log('👆 Tab clicked:', tabId);
    setActiveTabId(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  // If no tabs, return empty container
  if (!tabs || tabs.length === 0) {
    console.log('⚠️ TabNavigation: No tabs available, rendering empty container');
    return (
      <div className={styles.emptyContainer} data-testid="tab-navigation-empty"
           style={{ border: '2px solid red', padding: '10px', margin: '10px 0' }}>
        <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          No tabs available - this should not happen!
        </p>
        <div style={{ fontSize: '0.8rem', color: '#999', padding: '10px', background: '#f5f5f5' }}>
          Debug info: tabs prop is {tabs ? `an array with length ${tabs.length}` : 'not an array or undefined'}
        </div>
      </div>
    );
  }

  // Get active tab content
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
  console.log('🎯 Active tab selected:', activeTab ? activeTab.label : 'none found');

  // MODIFIED: Now we always show the tab header, even with a single tab
  // Check if we only have one tab and log it
  if (tabs.length === 1) {
    console.log('🔍 TabNavigation: Single tab detected, but ALWAYS showing tab header for:', tabs[0].label);
  }
  
  // Multiple tabs, show the tab headers and content
  console.log('🔢 TabNavigation: Multiple tabs detected, rendering tab navigation with', tabs.length, 'tabs');
  console.log('🎯 Active tab ID:', activeTabId);
  
  // Add mandatory debug info for UI visibility issues
  console.log('🔍 Tab render data:', {
    activeTabId,
    tabsAvailable: tabs.length,
    tabIds: tabs.map(t => t.id),
    tabLabels: tabs.map(t => t.label),
  });
  
  return (
    <div className={`${styles.tabContainer} ${styles.visibilityHelper}`} data-testid="tab-navigation"
         style={{ 
           border: '1px solid #e5e7eb', 
           borderRadius: '8px', 
           marginTop: '20px',
           overflow: 'visible', 
           zIndex: 10,
           boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
           minHeight: '150px'
         }}>
      {/* Tab Headers */}
      <div className={styles.tabHeaders} style={{ 
        display: 'flex',
        background: '#f9fafb', 
        borderBottom: '1px solid #e5e7eb', 
        padding: '0',
        margin: '0'
      }}>
        {tabs.map(tab => {
          console.log('🔘 Rendering tab button:', tab.id, tab.label);
          return (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTabId === tab.id ? styles.active : ''}`}
              onClick={() => handleTabClick(tab.id)}
              aria-selected={activeTabId === tab.id}
              role="tab"
              data-tab-id={tab.id}
              style={{ 
                padding: '10px 16px', 
                fontWeight: activeTabId === tab.id ? 'bold' : 'normal',
                background: activeTabId === tab.id ? '#fff' : 'transparent',
                color: activeTabId === tab.id ? '#3b82f6' : '#6b7280',
                borderBottom: activeTabId === tab.id ? '2px solid #3b82f6' : 'none',
                fontSize: '14px',
                margin: '0',
                border: 'none',
                borderRadius: '4px 4px 0 0',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content - Enhanced with styling */}
      <div className={styles.tabContent} style={{
        border: '1px solid #e2e8f0',
        borderRadius: '0 0 8px 8px',
        background: 'white',
        padding: '16px',
        minHeight: '150px'
      }}>

        
        {/* Find and display the active tab content */}
        {activeTab ? activeTab.content : <div>No content available</div>}
      </div>
    </div>
  );
};

export default TabNavigation;
