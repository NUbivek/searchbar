import React from 'react';
import Head from 'next/head';
import { IntelligentSearchDemo } from '../components/demo';

/**
 * Demo page for showcasing the intelligent search results
 * @returns {JSX.Element} Rendered demo page
 */
const DemoPage = () => {
  return (
    <div className="demo-page">
      <Head>
        <title>Intelligent Search Demo</title>
        <meta name="description" content="Demo of intelligent search results with context-aware presentation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <IntelligentSearchDemo />
      </main>

      <footer className="footer">
        <p>Intelligent Search Results Platform - Demo</p>
      </footer>

      <style jsx>{`
        .demo-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        main {
          flex: 1;
        }
        
        .footer {
          text-align: center;
          padding: 1.5rem;
          border-top: 1px solid #eaeaea;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default DemoPage;
