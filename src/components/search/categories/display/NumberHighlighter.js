import React from 'react';

/**
 * Component for displaying highlighted numbers with context
 * @param {Object} props Component props
 * @param {Array<Object>} props.numbers List of number objects with value and context
 * @param {string} props.color Highlight color for numbers
 * @param {number} props.maxNumbers Maximum number of numbers to display
 * @param {Object} props.style Additional styles for the container
 * @returns {JSX.Element} Rendered number highlights
 */
const NumberHighlighter = ({ 
  numbers = [], 
  color = '#0066cc', 
  maxNumbers = 5,
  style = {}
}) => {
  // Ensure numbers is an array
  if (!Array.isArray(numbers) || numbers.length === 0) {
    return null;
  }
  
  // Limit numbers to display
  const displayNumbers = numbers.slice(0, maxNumbers);
  
  // Highlight the number in the context
  const highlightNumber = (context, value) => {
    if (!context || !value) return context;
    
    try {
      const parts = context.split(value);
      if (parts.length === 1) return context;
      
      return (
        <>
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <span style={{ 
                  fontWeight: 'bold', 
                  color: color,
                  backgroundColor: `${color}15`,
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}>
                  {value}
                </span>
              )}
              {part}
            </React.Fragment>
          ))}
        </>
      );
    } catch (error) {
      console.error('Error highlighting number:', error);
      return context;
    }
  };
  
  return (
    <div className="number-highlighter" style={{
      ...style
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px'
      }}>
        {displayNumbers.map((item, index) => (
          <div 
            key={`number-${index}`}
            className="number-item"
            style={{
              padding: '8px 12px',
              backgroundColor: 'white',
              borderRadius: '4px',
              border: `1px solid ${color}30`,
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#444'
            }}
          >
            {highlightNumber(item.context, item.value)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NumberHighlighter;