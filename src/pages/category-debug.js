import React, { useState } from 'react';
import SimpleModernCategories from '../components/search/categories/SimpleModernCategories';

/**
 * Standalone debug page to test the SimpleModernCategories component
 */
export default function CategoryDebugPage() {
  // Sample categories for testing
  const [categories, setCategories] = useState([
    {
      id: 'all',
      name: 'All Results',
      content: [
        { title: 'Sample Result 1', content: 'This is a sample result for testing', url: 'https://example.com/1' },
        { title: 'Sample Result 2', content: 'Another sample result for the testing page', url: 'https://example.com/2' }
      ],
      color: '#4285F4' // Google Blue
    },
    {
      id: 'relevant',
      name: 'Most Relevant',
      content: [
        { title: 'Relevant Result', content: 'This is a highly relevant result', url: 'https://example.com/relevant' }
      ],
      color: '#34A853' // Google Green
    },
    {
      id: 'technical',
      name: 'Technical',
      content: [
        { title: 'Technical Result', content: 'This is a technical result for developers', url: 'https://example.com/tech' }
      ],
      color: '#EA4335' // Google Red
    }
  ]);

  // Debug query
  const [query, setQuery] = useState('test query');

  // Toggle for empty categories test
  const [showEmpty, setShowEmpty] = useState(false);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Category Display Debug Page</h1>
      <p>This page allows testing of the SimpleModernCategories component in isolation.</p>
      
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f9fafb', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Test Controls</h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Test Query:</label>
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #d1d5db'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="checkbox" 
              checked={showEmpty} 
              onChange={() => setShowEmpty(!showEmpty)}
              style={{ marginRight: '8px' }}
            />
            Test with empty categories
          </label>
        </div>
      </div>
      
      <h2>Category Display</h2>
      {showEmpty ? (
        <SimpleModernCategories categories={[]} query={query} results={[]} />
      ) : (
        <SimpleModernCategories categories={categories} query={query} results={categories.flatMap(cat => cat.content || [])} />
      )}
      
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#fff7ed', 
        borderRadius: '8px',
        border: '1px solid #ffedd5'
      }}>
        <h3>Debug Information</h3>
        <p><strong>Current Query:</strong> {query}</p>
        <p><strong>Categories Count:</strong> {showEmpty ? 0 : categories.length}</p>
        <p><strong>Empty Test:</strong> {showEmpty ? 'Yes' : 'No'}</p>
        <pre style={{ 
          backgroundColor: '#f8fafc', 
          padding: '10px', 
          borderRadius: '4px',
          overflowX: 'auto'
        }}>
          {JSON.stringify(showEmpty ? [] : categories, null, 2)}
        </pre>
      </div>
    </div>
  );
}
