import React from 'react';

/**
 * Component for displaying a list of bullet points
 * @param {Object} props Component props
 * @param {Array<string>} props.points List of bullet points to display
 * @param {string} props.color Color for the bullet points
 * @param {boolean} props.expanded Whether to show all points or a limited number
 * @param {number} props.maxPoints Maximum number of points to display
 * @param {Object} props.style Additional styles for the container
 * @returns {JSX.Element} Rendered bullet point list
 */
const BulletPointDisplay = ({ 
  points = [], 
  color = '#0066cc', 
  expanded = false,
  maxPoints = 3,
  style = {}
}) => {
  // Ensure points is an array
  if (!Array.isArray(points)) {
    return null;
  }
  
  // Limit points based on expanded state
  const displayPoints = points.slice(0, maxPoints);
  
  return (
    <div className="bullet-point-display" style={{
      ...style
    }}>
      <ul style={{
        margin: 0,
        padding: 0,
        paddingLeft: '20px',
        listStyleType: 'none',
      }}>
        {displayPoints.map((point, index) => (
          <li 
            key={`bullet-${index}`}
            style={{
              position: 'relative',
              paddingLeft: '16px',
              marginBottom: '8px',
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#333'
            }}
          >
            <span style={{
              position: 'absolute',
              left: 0,
              top: '8px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: color,
              display: 'block'
            }}></span>
            {point}
          </li>
        ))}
      </ul>
      
      {/* Show indicator for more points */}
      {!expanded && points.length > maxPoints && (
        <div style={{ 
          fontSize: '13px', 
          color: '#666', 
          marginTop: '4px',
          paddingLeft: '20px'
        }}>
          +{points.length - maxPoints} more points
        </div>
      )}
    </div>
  );
};

export default BulletPointDisplay;