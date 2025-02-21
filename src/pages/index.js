import Head from 'next/head';

export default function Home() {
  return (
    <div style={{ backgroundColor: 'red', minHeight: '100vh', padding: '20px' }}>
      <Head>
        <title>Test Page</title>
      </Head>

      <h1 style={{ 
        color: 'white', 
        fontSize: '48px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        Test Page
      </h1>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <p style={{ color: 'blue', fontSize: '20px' }}>
          If you can see this text in blue with a white background card on a red page,
          styles are working.
        </p>
      </div>
    </div>
  );
}
