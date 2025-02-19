// FILE: ./src/pages/_app.js
// Last Updated: 2025-02-18 20:34:06 UTC by NUbivek

import PropTypes from 'prop-types';
import { ModelProvider } from '@/contexts/ModelContext';
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

    // Add base path configuration for assets
    if (process.env.NEXT_PUBLIC_BASE_PATH) {
      document.documentElement.dataset.basePath = process.env.NEXT_PUBLIC_BASE_PATH;
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
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link 
          rel="stylesheet" 
          href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/styles/globals.css`}
        />
        <title>Founder's Research Hub</title>
      </Head>
      <ModelProvider>
        <div className="app-wrapper" data-base-path={process.env.NEXT_PUBLIC_BASE_PATH}>
          <Component {...pageProps} />
        </div>
      </ModelProvider>
    </>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

// Add static configuration to help with asset loading
MyApp.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  return { 
    pageProps,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '' 
  };
};
