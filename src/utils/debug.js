// This file might contain debug-related utilities
import { useState, useEffect } from 'react';

// Check if debug mode is enabled
export const isDebugMode = () => {
  return false; // Always return false to disable debug mode
};

// Debug logger
export const debugLog = (...args) => {
  if (isDebugMode()) {
    console.log('[DEBUG]', ...args);
  }
};

// Hook to use debug mode
export const useDebugMode = () => {
  const [debugMode, setDebugMode] = useState(false);
  
  useEffect(() => {
    setDebugMode(isDebugMode());
    
    // Listen for changes to localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'debug_mode') {
        setDebugMode(e.newValue === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return debugMode;
};

// Toggle debug mode
export const toggleDebugMode = () => {
  if (typeof window === 'undefined') return;
  
  const currentValue = localStorage.getItem('debug_mode') === 'true';
  localStorage.setItem('debug_mode', (!currentValue).toString());
  
  // Reload the page to apply changes
  window.location.reload();
}; 