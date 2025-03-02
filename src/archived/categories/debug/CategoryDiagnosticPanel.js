/**
 * CategoryDiagnosticPanel
 * 
 * A hidden component that can be activated via console for diagnosis
 * Only visible when troubleshooting category display issues
 */

import React, { useEffect, useState } from 'react';

// Diagnostic styles
const diagnosticStyles = {
  panel: {
    position: 'fixed',
    bottom: '0',
    right: '0',
    width: '500px',
    maxHeight: '400px',
    overflowY: 'auto',
    background: 'rgba(0, 0, 0, 0.85)',
    color: '#fff',
    padding: '10px',
    border: '2px solid #ff5722',
    zIndex: 9999,
    fontFamily: 'monospace',
    fontSize: '12px',
    borderRadius: '5px 0 0 0',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
  },
  heading: {
    margin: '0 0 10px 0',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#ff5722',
    display: 'flex',
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: '15px',
    padding: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
  },
  subheading: {
    margin: '5px 0',
    color: '#4caf50',
    fontWeight: 'bold',
  },
  statusGood: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  statusWarning: {
    color: '#ff9800',
    fontWeight: 'bold',
  },
  statusError: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  button: {
    background: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    padding: '3px 8px',
    marginRight: '5px',
    cursor: 'pointer',
    fontSize: '11px',
  },
  close: {
    background: 'transparent',
    color: '#ff5722',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    marginLeft: '10px',
  }
};

const CategoryDiagnosticPanel = () => {
  const [visible, setVisible] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState({
    categoryStatus: 'checking',
    categoryCount: 0,
    emergencyActivations: [],
    displayComponents: {},
    cssIssues: [],
    apiResponses: []
  });
  
  // Gather diagnostic data
  useEffect(() => {
    const gatherDiagnostics = () => {
      // Get data from window global diagnostics
      const data = window.__categoryDiagnosticData || {};
      
      // Check DOM for category components
      const categoryComponents = {
        llmCategoryTabs: !!document.querySelector('[data-testid="llm-category-tabs"]'),
        categoryRibbon: !!document.querySelector('.category-ribbon-visual'),
        modernCategoryDisplay: !!document.querySelector('.modern-category-display')
      };
      
      // Determine category status
      let status = 'error';
      if (categoryComponents.llmCategoryTabs || categoryComponents.categoryRibbon) {
        status = 'good';
      } else if (categoryComponents.modernCategoryDisplay) {
        status = 'warning'; // Container exists but no category components
      }
      
      // Get category counts from various sources
      const categoryCount = (window.__lastCategoriesReceived?.length || 0) + 
                           (window.__allCategories?.length || 0) + 
                           (window.__emergencyCategories?.length || 0);
      
      // Update state with gathered data
      setDiagnosticData({
        ...data,
        categoryStatus: status,
        categoryCount,
        displayComponents: categoryComponents,
      });
    };
    
    // Update diagnostics when panel becomes visible
    if (visible) {
      gatherDiagnostics();
      const interval = setInterval(gatherDiagnostics, 1000);
      return () => clearInterval(interval);
    }
  }, [visible]);
  
  // Register global function to show panel
  useEffect(() => {
    window.showCategoryDiagnostics = () => setVisible(true);
    return () => {
      delete window.showCategoryDiagnostics;
    };
  }, []);
  
  // Force category display
  const forceDisplay = () => {
    if (window.emergencyCategorySystem) {
      window.emergencyCategorySystem.forceDisplay();
      setTimeout(() => {
        // Re-check after forcing display
        const data = { ...diagnosticData };
        data.categoryStatus = 'checking';
        setDiagnosticData(data);
      }, 500);
    }
  };
  
  // Run full diagnostics
  const runDiagnostics = () => {
    if (window.diagnoseCategoryDisplay) {
      window.diagnoseCategoryDisplay();
    }
  };
  
  if (!visible) return null;
  
  return (
    <div style={diagnosticStyles.panel} data-testid="category-diagnostic-panel">
      <div style={diagnosticStyles.heading}>
        <span>Category Diagnostic Panel</span>
        <button 
          style={diagnosticStyles.close} 
          onClick={() => setVisible(false)}
          aria-label="Close diagnostic panel"
        >
          ×
        </button>
      </div>
      
      <div style={diagnosticStyles.section}>
        <div style={diagnosticStyles.subheading}>Category Status</div>
        <div>
          Status: {' '}
          {diagnosticData.categoryStatus === 'good' && <span style={diagnosticStyles.statusGood}>GOOD</span>}
          {diagnosticData.categoryStatus === 'warning' && <span style={diagnosticStyles.statusWarning}>WARNING</span>}
          {diagnosticData.categoryStatus === 'error' && <span style={diagnosticStyles.statusError}>ERROR</span>}
          {diagnosticData.categoryStatus === 'checking' && <span>Checking...</span>}
        </div>
        <div>Total Categories: {diagnosticData.categoryCount}</div>
        <div>
          <button style={diagnosticStyles.button} onClick={forceDisplay}>
            Force Display
          </button>
          <button style={diagnosticStyles.button} onClick={runDiagnostics}>
            Run Diagnostics
          </button>
        </div>
      </div>
      
      <div style={diagnosticStyles.section}>
        <div style={diagnosticStyles.subheading}>Component Status</div>
        <div>
          ModernCategoryDisplay: {' '}
          {diagnosticData.displayComponents.modernCategoryDisplay ? 
            <span style={diagnosticStyles.statusGood}>Found</span> : 
            <span style={diagnosticStyles.statusError}>Missing</span>
          }
        </div>
        <div>
          LLM Category Tabs: {' '}
          {diagnosticData.displayComponents.llmCategoryTabs ? 
            <span style={diagnosticStyles.statusGood}>Found</span> : 
            <span style={diagnosticStyles.statusError}>Missing</span>
          }
        </div>
        <div>
          Category Ribbon: {' '}
          {diagnosticData.displayComponents.categoryRibbon ? 
            <span style={diagnosticStyles.statusGood}>Found</span> : 
            <span style={diagnosticStyles.statusError}>Missing</span>
          }
        </div>
      </div>
      
      {diagnosticData.emergencyActivations && diagnosticData.emergencyActivations.length > 0 && (
        <div style={diagnosticStyles.section}>
          <div style={diagnosticStyles.subheading}>Emergency Activations</div>
          <div>
            Count: {diagnosticData.emergencyActivations.length}
          </div>
          <div>
            Latest: {diagnosticData.emergencyActivations[diagnosticData.emergencyActivations.length - 1]?.method}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDiagnosticPanel;
