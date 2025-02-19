import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    // Determine if we're in production to use absolute URLs
    const isProd = process.env.NODE_ENV === 'production';
    const domain = isProd ? 'https://research.bivek.ai' : '';
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const baseHref = isProd ? `${domain}${basePath}/` : basePath || '/';
    
    return (
      <Html>
        <Head>
          {/* The base tag helps the browser resolve relative URLs */}
          <base href={baseHref} />
          
          {/* Add meta for verification */}
          <meta name="base-path" content={basePath} />
          <meta name="environment" content={process.env.NODE_ENV} />
          
          {/* Preconnect to domain to improve performance */}
          {isProd && <link rel="preconnect" href={domain} />}
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