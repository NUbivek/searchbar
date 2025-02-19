// FILE: ./src/pages/_document.js

import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    // Determine if we're in production
    const isProd = process.env.NODE_ENV === 'production';
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    
    return (
      <Html>
        <Head>
          {/* Add meta for verification */}
          <meta name="base-path" content={basePath} />
          <meta name="environment" content={process.env.NODE_ENV} />
          
          {/* Preconnect to domain to improve performance */}
          {isProd && <link rel="preconnect" href="https://research.bivek.ai" />}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;