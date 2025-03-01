import React, { useEffect, useState } from 'react';

/**
 * CSSDebugger component inspects styles of elements to help debug display issues
 */
const CSSDebugger = () => {
  const [targetElements, setTargetElements] = useState([]);
  const [cssProperties, setCssProperties] = useState({});
  
  useEffect(() => {
    // Find the target elements to debug
    const findElements = () => {
      // Define selectors to inspect
      const selectors = [
        '#category-ribbon-main-container', 
        '.category-ribbon-container',
        '[class*="category-ribbon"]',
        '.ribbon-category-card',
        '[data-category-name]'
      ];

      try {
        const foundElements = selectors.map(selector => {
          const elements = document.querySelectorAll(selector);
          return {
            selector,
            count: elements.length,
            elements: Array.from(elements).slice(0, 3) // Limit to first 3 for each selector
          };
        });
        
        setTargetElements(foundElements);
        
        // Analyze CSS properties of the first found element for each selector
        const cssInfo = {};
        foundElements.forEach(({ selector, elements }) => {
          if (elements.length > 0) {
            const element = elements[0];
            const styles = window.getComputedStyle(element);
            cssInfo[selector] = {
              display: styles.getPropertyValue('display'),
              visibility: styles.getPropertyValue('visibility'),
              opacity: styles.getPropertyValue('opacity'),
              position: styles.getPropertyValue('position'),
              zIndex: styles.getPropertyValue('z-index'),
              width: styles.getPropertyValue('width'),
              height: styles.getPropertyValue('height'),
              overflow: styles.getPropertyValue('overflow')
            };
          }
        });
        
        setCssProperties(cssInfo);
      } catch (error) {
        console.error('Error in CSSDebugger:', error);
      }
    };
    
    // Run immediately and then periodically
    findElements();
    const intervalId = setInterval(findElements, 2000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '320px',
      right: '10px',
      width: '400px',
      maxHeight: '300px',
      overflowY: 'auto',
      backgroundColor: '#282c34',
      color: '#e6e6e6',
      border: '1px solid #555',
      borderRadius: '6px',
      padding: '10px',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      <h3 style={{ color: '#61dafb', margin: '0 0 10px 0' }}>CSS Inspection</h3>
      
      {targetElements.length > 0 ? (
        <div>
          {targetElements.map(({ selector, count, elements }) => (
            <div key={selector} style={{ marginBottom: '15px' }}>
              <h4 style={{ color: '#98c379', margin: '0 0 5px 0' }}>
                {selector} <span style={{ color: count ? '#61afef' : '#e06c75' }}>({count} found)</span>
              </h4>
              
              {count > 0 && (
                <div style={{ marginLeft: '10px' }}>
                  <div style={{ 
                    backgroundColor: '#3b3f4b', 
                    padding: '5px', 
                    borderRadius: '4px',
                    marginBottom: '5px'
                  }}>
                    {Object.entries(cssProperties[selector] || {}).map(([prop, value]) => (
                      <div key={prop} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #4b5263',
                        padding: '2px 0'
                      }}>
                        <span style={{ color: '#c678dd' }}>{prop}:</span>
                        <span style={{ 
                          color: value === 'none' || value === '0' ? '#e06c75' : '#98c379' 
                        }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    {elements.map((el, i) => (
                      <div key={i} style={{ 
                        fontSize: '11px', 
                        color: '#61afef',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        #{i + 1}: {el.getAttribute('id') || 'no-id'} {el.getAttribute('class') || 'no-class'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No category elements found. Check your selectors.</p>
      )}
    </div>
  );
};

export default CSSDebugger;
