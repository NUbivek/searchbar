import React from 'react';

/**
 * Debug component for showing category-related information
 * This is a development helper only and should be disabled in production
 * 
 * @param {Object} props Component props
 * @param {Array} props.categories List of categories 
 * @param {string} props.activeCategoryId Currently active category ID
 * @param {string} props.query Search query
 * @param {boolean} props.loading Whether data is loading
 * @returns {JSX.Element} Debug info component
 */
const CategoryDebug = ({ 
  categories = [], 
  activeCategoryId = null,
  query = '',
  loading = false
}) => {
  // Check if we're in development mode
  const isDev = process.env.NODE_ENV === 'development';
  
  // Skip rendering in production
  if (!isDev) return null;

  // Get active category details if available
  const activeCategory = categories.find(c => c.id === activeCategoryId);
  
  return (
    <div style={{ 
      margin: '10px 0', 
      padding: '10px',
      backgroundColor: '#f7fafc', 
      border: '1px dashed #cbd5e0',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#4a5568'
    }}>
      <h5 style={{ 
        fontSize: '14px', 
        fontWeight: 'bold', 
        margin: '0 0 8px 0',
        color: '#2d3748'
      }}>
        🛠️ Category Debug Info
      </h5>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Query:</strong> {query || 'None'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Categories Count:</strong> {categories.length}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Active Category:</strong> {activeCategory?.name || 'None'} (ID: {activeCategoryId || 'None'})
      </div>
      
      {categories.length > 0 && (
        <div>
          <strong>Available Categories:</strong>
          <ul style={{ 
            margin: '5px 0 0 0', 
            padding: '0 0 0 20px',
            listStyleType: 'circle'
          }}>
            {categories.map((cat, index) => (
              <li key={cat.id} style={{ 
                marginBottom: '3px',
                color: cat.id === activeCategoryId ? '#2b6cb0' : 'inherit',
                fontWeight: cat.id === activeCategoryId ? 'bold' : 'normal'
              }}>
                {cat.name} ({cat.content?.length || 0} items)
                {cat.id === activeCategoryId && ' ← active'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CategoryDebug;
