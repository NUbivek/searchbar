// FILE: ./src/pages/_app.js

import PropTypes from 'prop-types';
import { ModelProvider } from '@/contexts/ModelContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/styles/animations.css';
import '@/styles/globals.css';
import { useEffect } from 'react';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Performance optimization: Remove server-side injected CSS
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles?.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  // Enhanced error boundary for better error handling
  if (typeof window !== 'undefined') {
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      console.error('Client-side error:', { msg, url, lineNo, columnNo, error });
      // Log to your preferred error tracking service here
      return false;
    };
  }

  return (
    <ErrorBoundary>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Founder's Research Hub</title>
      </Head>
      <ModelProvider>
        <div className="app-wrapper">
          <Component {...pageProps} />
        </div>
      </ModelProvider>
    </ErrorBoundary>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};