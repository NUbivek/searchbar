/**
 * CategoryProgressBars.js
 * 
 * Implements the three progress bars for category metrics:
 * - Relevance & Recency
 * - Accuracy
 * - Credibility
 */

import React from 'react';

/**
 * Renders progress bars for category metrics
 * @param {Object} props Component props
 * @param {Object} props.metrics Metrics object with relevance, accuracy, and credibility
 * @param {Object} props.options Display options
 * @returns {JSX.Element} Rendered progress bars
 */
const CategoryProgressBars = ({ 
  metrics = { relevance: 0, accuracy: 0, credibility: 0 },
  options = {}
}) => {
  // Extract metrics with defaults
  const { 
    relevance = 0, 
    accuracy = 0, 
    credibility = 0,
    recency = 0
  } = metrics;
  
  // Calculate combined relevance & recency score
  const relevanceRecency = Math.round((relevance * 0.7) + (recency * 0.3));
  
  // Extract options with defaults
  const {
    showLabels = true,
    height = 6,
    minWidth = 150,
    barColors = {
      relevance: '#4285F4', // Blue
      accuracy: '#0F9D58',  // Green
      credibility: '#F4B400' // Yellow
    }
  } = options;
  
  // Base styles
  const containerStyle = {
    marginTop: '15px',
    marginBottom: '15px'
  };
  
  const metricsGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '5px'
  };
  
  const metricItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };
  
  const labelStyle = {
    fontSize: '12px',
    color: '#666',
    minWidth: '120px',
    flexShrink: 0
  };
  
  const progressBarContainerStyle = {
    height: `${height}px`,
    background: '#eee',
    borderRadius: `${height / 2}px`,
    overflow: 'hidden',
    flexGrow: 1,
    minWidth: `${minWidth}px`
  };
  
  const progressBarStyle = (value, color) => ({
    height: '100%',
    width: `${value}%`,
    backgroundColor: color,
    borderRadius: `${height / 2}px`,
    transition: 'width 0.5s ease'
  });
  
  const valueStyle = {
    fontSize: '12px',
    color: '#666',
    minWidth: '40px',
    textAlign: 'right'
  };
  
  return (
    <div className="category-metrics" style={containerStyle}>
      <div className="metrics-group" style={metricsGroupStyle}>
        {/* Relevance & Recency */}
        <div className="metric-item" style={metricItemStyle}>
          {showLabels && (
            <div className="metric-label" style={labelStyle}>Relevance & Recency</div>
          )}
          <div className="progress-bar-container" style={progressBarContainerStyle}>
            <div 
              className="progress-bar" 
              style={progressBarStyle(relevanceRecency, barColors.relevance)}
            ></div>
          </div>
          <div className="metric-value" style={valueStyle}>{relevanceRecency}%</div>
        </div>
        
        {/* Accuracy */}
        <div className="metric-item" style={metricItemStyle}>
          {showLabels && (
            <div className="metric-label" style={labelStyle}>Accuracy</div>
          )}
          <div className="progress-bar-container" style={progressBarContainerStyle}>
            <div 
              className="progress-bar" 
              style={progressBarStyle(accuracy, barColors.accuracy)}
            ></div>
          </div>
          <div className="metric-value" style={valueStyle}>{accuracy}%</div>
        </div>
        
        {/* Credibility */}
        <div className="metric-item" style={metricItemStyle}>
          {showLabels && (
            <div className="metric-label" style={labelStyle}>Credibility</div>
          )}
          <div className="progress-bar-container" style={progressBarContainerStyle}>
            <div 
              className="progress-bar" 
              style={progressBarStyle(credibility, barColors.credibility)}
            ></div>
          </div>
          <div className="metric-value" style={valueStyle}>{credibility}%</div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProgressBars;
