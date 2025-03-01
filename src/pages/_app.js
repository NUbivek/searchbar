import React, { useEffect } from 'react';
import '../styles/globals.css';
// CSS modules are imported in their respective components
import { ErrorBoundary } from '../components/ErrorBoundary';
// Import diagnostics for category debugging
import Script from 'next/script';

export default function MyApp({ Component, pageProps }) {
  // Effect to load diagnostic tools
  useEffect(() => {
    // Dynamically import the diagnostic utils
    import('../utils/debug/forceCategoryDisplay')
      .then((module) => {
        console.log('📊 Category diagnostic tools loaded');
      })
      .catch((err) => {
        console.error('Error loading diagnostic tools:', err);
      });
  }, []);

  return (
    <ErrorBoundary>
      {/* Inline diagnostic script */}
      <Script
        id="category-diagnostic-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Create diagnostic namespace if it doesn't exist
            window.diagnostics = window.diagnostics || {};
            
            // Simple diagnostic function
            window.diagnostics.checkCategories = function() {
              console.log('🔍 Checking for categories...');
              const categories = 
                window.__globalCategoryStorage?.categories || 
                window.__intelligentSearchCategories ||
                window.__allCategories || [];
              
              console.log(categories.length + ' categories found:', 
                categories.map(c => c.name || 'Unnamed').join(', '));
            };
            
            // Auto-run after 3 seconds
            setTimeout(() => {
              try {
                window.diagnostics.checkCategories();
                console.log('👉 Run window.forceCategoryDisplay() to force category display');
              } catch (e) { console.error('Error in diagnostic script:', e); }
            }, 3000);
          `
        }}
      />
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}