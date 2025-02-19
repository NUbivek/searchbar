import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* The base tag helps the browser resolve relative URLs */}
          <base href={process.env.NEXT_PUBLIC_BASE_PATH || '/'} />
          {/* Add any additional meta tags, fonts, etc. here */}
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