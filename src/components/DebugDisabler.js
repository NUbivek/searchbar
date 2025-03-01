import { useEffect, useRef } from 'react';

const DebugDisabler = () => {
  const initialized = useRef(false);

  useEffect(() => {
    // Only run this once to prevent constant refreshing
    if (initialized.current) return;
    initialized.current = true;
    
    // Force debug mode to be off
    try {
      localStorage.setItem('debug_mode', 'false');
      localStorage.setItem('show_chat_history', 'false');
      localStorage.setItem('show_metrics', 'false');
      localStorage.setItem('debug_ui', 'false');
      
      // Add a style to hide only the "You" and "AI Assistant" sections at the bottom
      const style = document.createElement('style');
      style.textContent = `
        /* Only target specific elements with exact text content */
        div.complete-results ~ div:has(> div:has(> span:only-child:contains("You"))),
        div.complete-results ~ div:has(> div:has(> span:only-child:contains("AI Assistant"))),
        div.content-panel ~ div:has(> div:has(> span:only-child:contains("You"))),
        div.content-panel ~ div:has(> div:has(> span:only-child:contains("AI Assistant"))) {
          display: none !important;
        }
        
        /* Hide debug information */
        div:has(> h4:contains("Debug Information")) {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
      
      // Use a more targeted approach to hide the bottom sections
      setTimeout(() => {
        // Find all divs with exact text "You" or "AI Assistant"
        document.querySelectorAll('div').forEach(div => {
          const text = div.textContent.trim();
          
          // Skip the compact-you section
          if (div.classList.contains('compact-you') || div.classList.contains('you-section')) {
            return;
          }
          
          // Only hide divs with exact text "You" or "AI Assistant"
          if (text === 'You' || text === 'AI Assistant') {
            // Find the parent container
            let parent = div;
            for (let i = 0; i < 3; i++) {
              parent = parent.parentElement;
              if (!parent) break;
              
              // If we find a container with padding, it's likely the one we want to hide
              const style = window.getComputedStyle(parent);
              if (style.padding !== '0px') {
                parent.style.display = 'none';
                break;
              }
            }
          }
        });
      }, 1000);
      
      console.log('Debug features disabled');
    } catch (error) {
      console.error('Error disabling debug features:', error);
    }
    
    return () => {
      // No cleanup needed
    };
  }, []);
  
  return null;
};

export default DebugDisabler;