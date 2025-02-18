// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-02-18 20:34:06
// Current User's Login: NUbivek
// Repository: NUbivek/searchbar
// Language: JavaScript (97.7%)

import PropTypes from 'prop-types';
import { ModelProvider } from '@/contexts/ModelContext';
import '@/styles/globals.css';
import { useEffect } from 'react';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Performance optimization: Remove server-side injected CSS
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles);
    }
  }, []);

  // Add error boundary for better error handling
  if (typeof window !== 'undefined') {
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      console.error('Client-side error:', { msg, url, lineNo, columnNo, error });
      return false;
    };
  }

  return (
    <ModelProvider>
      <Component {...pageProps} />
    </ModelProvider>
  );
}

// Add type checking for props even in JavaScript
MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};