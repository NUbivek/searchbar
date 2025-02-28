import React from 'react';

/**
 * Enhanced component to display metrics as progress bars with gradient colors
 * @param {Object} props Component props
 * @param {(Object|number)} props.metrics The metrics to display (relevance, accuracy, credibility) or a single value
 * @param {number} props.value The value for the single metric (0-100)
 * @param {number} props.maxValue The maximum value for the metric (default: 100)
 * @param {string} props.label The label for the single metric
 * @param {string} props.colorStart The start color for the gradient
 * @param {string} props.colorEnd The end color for the gradient
 * @param {number} props.height The height of the progress bar in pixels
 * @param {boolean} props.showLabels Whether to show labels for each metric
 * @param {boolean} props.compact Whether to display in compact mode
 * @returns {JSX.Element} Rendered metrics progress bar
 */
const MetricsProgressBar = ({ 
  metrics, 
  value, 
  maxValue = 100,
  label, 
  colorStart, 
  colorEnd, 
  height = 8,
  showLabels = true, 
  compact = false 
}) => {
  // Handle both legacy and new API
  let normalizedValue, displayLabel, startColor, endColor;
  
  if (typeof value === 'number') {
    // New API with direct value
    normalizedValue = Math.min(Math.max(value, 0), maxValue);
    displayLabel = label;
    startColor = colorStart;
    endColor = colorEnd;
  } else if (typeof metrics === 'number') {
    // Legacy API with metrics as a number
    normalizedValue = metrics > 1 ? metrics : metrics * 100;
    displayLabel = label; // In legacy API, value is the label
    startColor = colorStart || colorEnd || getColorForScore(normalizedValue);
    endColor = colorEnd || colorStart || getColorForScore(normalizedValue);
  } else if (metrics && typeof metrics === 'object') {
    // Legacy API with metrics object
    const relevance = typeof metrics.relevance === 'number' ? 
      (metrics.relevance > 1 ? metrics.relevance : metrics.relevance * 100) : 0;
    normalizedValue = relevance;
    displayLabel = 'Relevance';
    startColor = colorStart || colorEnd || getColorForScore(normalizedValue);
    endColor = colorEnd || colorStart || getColorForScore(normalizedValue);
  } else {
    // Invalid input
    return null;
  }
  
  // Calculate percentage for display
  const percentage = Math.min(Math.max(Math.round((normalizedValue / maxValue) * 100), 0), 100);
  
  // Helper function to get color based on score
  const getColorForScore = (score) => {
    const normalizedScore = score / maxValue * 100;
    if (normalizedScore >= 90) return '#4CAF50'; // Green
    if (normalizedScore >= 75) return '#8BC34A'; // Light Green
    if (normalizedScore >= 60) return '#CDDC39'; // Lime
    if (normalizedScore >= 40) return '#FFC107'; // Amber
    return '#F44336'; // Red
  };
  
  // Use provided colors or fallback to score-based colors
  const effectiveStartColor = startColor || getColorForScore(normalizedValue);
  const effectiveEndColor = endColor || startColor || getColorForScore(normalizedValue);
  
  // Styles for progress bars
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: 0,
    fontSize: compact ? '12px' : '14px',
  };
  
  const progressContainerStyle = {
    width: '100%',
    height: `${height}px`,
    backgroundColor: '#e9ecef',
    borderRadius: `${height / 2}px`,
    overflow: 'hidden',
  };
  
  return (
    <div className="metrics-progress-bar" style={containerStyle}>
      {showLabels && displayLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
          color: '#495057',
          fontSize: compact ? '12px' : '14px',
        }}>
          <span>{displayLabel}</span>
          <span style={{ fontWeight: '500' }}>{percentage}%</span>
        </div>
      )}
      <div style={progressContainerStyle}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${effectiveStartColor} 0%, ${effectiveEndColor} 100%)`,
          borderRadius: `${height / 2}px`,
          transition: 'width 0.5s ease-in-out',
        }}></div>
      </div>
    </div>
  );
};

export default MetricsProgressBar;
