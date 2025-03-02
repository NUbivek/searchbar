/**
 * CollapsibleResultsTab.js
 * 
 * A simple collapsible tab that contains all search results
 * Clicking the tab header expands/collapses the content
 */

import React, { useState, useEffect } from 'react';

/**
 * CollapsibleResultsTab Component
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Content to display inside the tab
 * @param {string} props.title Tab title/label
 * @param {boolean} props.defaultExpanded Whether tab should be expanded by default
 * @returns {JSX.Element} Collapsible tab component
 */
const CollapsibleResultsTab = ({ 
  children,
  title = 'Categories & Results', 
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Toggle expand/collapse state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Style objects for consistent appearance
  const styles = {
    container: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      margin: '10px 0 20px 0',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      backgroundColor: '#ffffff',
      transition: 'all 0.2s ease'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: '#f3f4f6',
      borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none',
      cursor: 'pointer',
      userSelect: 'none',
      fontWeight: 'bold',
      fontSize: '16px',
      color: '#111827'
    },
    icon: {
      marginRight: '8px',
      transition: 'transform 0.2s ease',
      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
    },
    contentWrapper: {
      height: isExpanded ? 'auto' : '0',
      overflow: 'hidden',
      transition: 'height 0.3s ease'
    },
    content: {
      padding: isExpanded ? '16px' : '0 16px',
      opacity: isExpanded ? 1 : 0,
      transition: 'all 0.3s ease'
    }
  };

  return (
    <div 
      className="collapsible-results-tab"
      data-expanded={isExpanded}
      style={styles.container}
    >
      {/* Tab Header - Clickable */}
      <div 
        className="collapsible-tab-header"
        onClick={toggleExpand}
        style={styles.header}
      >
        <span style={styles.icon}>▶</span>
        {title}
      </div>
      
      {/* Tab Content - Collapsible */}
      <div 
        className="collapsible-tab-content-wrapper"
        style={styles.contentWrapper}
      >
        <div 
          className="collapsible-tab-content"
          style={styles.content}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleResultsTab;
