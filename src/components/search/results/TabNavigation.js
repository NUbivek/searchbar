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
  onTabChange = null,
  containerStyle = {}
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

  // If no tabs, create a default error tab
  if (!tabs || tabs.length === 0) {
    console.log('⚠️ TabNavigation: No tabs available, creating default error tab');
    
    // Create a default tab with error information
    tabs = [{
      id: 'error-tab',
      label: 'Results',
      content: (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: '#b91c1c', marginBottom: '10px' }}>Search Results Unavailable</h3>
          <p style={{ color: '#6b7280', marginBottom: '15px' }}>
            We couldn't display the search results at this time. Please try again.
          </p>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
            Debug info: tabs prop is {tabs ? `an array with length ${tabs.length}` : 'not an array or undefined'}
          </div>
        </div>
      )
    }];
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
    <div 
      className={`${styles.tabContainer} ${styles.visibilityHelper}`} 
      data-testid="tab-navigation"
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        flex: '1',
        border: 'none', 
        borderRadius: '8px', 
        marginTop: '0',
        zIndex: 10,
        minHeight: '300px',
        maxHeight: '100%',
        ...containerStyle
      }}
    >
      {/* Tab Headers - Made more prominent */}
      <div 
        className={styles.tabHeaders} 
        style={{ 
          display: 'flex',
          background: '#f9fafb', 
          borderBottom: '1px solid #e5e7eb', 
          padding: '0',
          margin: '0',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        {tabs.map(tab => {
          return (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTabId === tab.id ? styles.active : ''}`}
              onClick={() => handleTabClick(tab.id)}
              aria-selected={activeTabId === tab.id}
              role="tab"
              data-tab-id={tab.id}
              style={{ 
                padding: '14px 24px',
                fontWeight: activeTabId === tab.id ? '600' : 'normal',
                background: activeTabId === tab.id ? '#fff' : 'transparent',
                color: activeTabId === tab.id ? '#3b82f6' : '#4b5563',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: activeTabId === tab.id ? '3px solid #3b82f6' : 'none',
                fontSize: '15px',
                margin: '0',
                borderRadius: '4px 4px 0 0',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'visible'
              }}
            >
              {tab.label}
              {activeTabId === tab.id && (
                <div style={{
                  position: 'absolute',
                  bottom: '0px',
                  left: '0',
                  right: '0',
                  height: '3px',
                  background: '#3b82f6',
                  borderRadius: '4px 4px 0 0'
                }}/>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content - Full height */}
      <div 
        className={styles.tabContent} 
        style={{
          background: 'white',
          padding: '20px',
          flex: '1',
          overflow: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Find and display the active tab content */}
        {activeTab ? activeTab.content : <div>No content available</div>}
      </div>
    </div>
  );
};

export default TabNavigation;
