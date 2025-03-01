import React from 'react';

/**
 * A simple debugging component for categories
 */
const CategoryDebug = ({ categories = [], activeCategoryId = null }) => {
  return (
    <div style={{
      margin: '20px 0',
      padding: '15px',
      backgroundColor: '#f0f9ff',
      border: '1px solid #bae6fd',
      borderRadius: '6px',
      fontSize: '14px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
        Category Debug
      </h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Total Categories:</strong> {categories.length}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Active Category:</strong> {activeCategoryId || 'None'}
      </div>
      
      <div>
        <strong>Categories List:</strong>
        <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
          {categories.map(cat => (
            <li key={cat.id} style={{ 
              marginBottom: '5px',
              backgroundColor: cat.id === activeCategoryId ? '#dbeafe' : 'transparent',
              padding: '3px 5px',
              borderRadius: '4px'
            }}>
              {cat.name} (ID: {cat.id})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryDebug;
