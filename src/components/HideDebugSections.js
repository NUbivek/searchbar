import { useEffect } from 'react';

const HideDebugSections = () => {
  useEffect(() => {
    // Function to hide the "You" and "AI Assistant" sections
    const hideDebugSections = () => {
      // Find all divs with text content "You" or "AI Assistant"
      document.querySelectorAll('div').forEach(div => {
        const text = div.textContent.trim();
        
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
    };
    
    // Run the function after a short delay to ensure the DOM is fully loaded
    const timeoutId = setTimeout(hideDebugSections, 1000);
    
    // Also run the function when the DOM changes
    const observer = new MutationObserver(hideDebugSections);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);
  
  return null;
};

export default HideDebugSections; 