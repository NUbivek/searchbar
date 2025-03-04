import React from 'react';

/**
 * MetricsDisplay component for showing category metrics
 * @param {Object} props
 * @param {number} props.relevance - Relevance score (0-100)
 * @param {number} props.accuracy - Accuracy score (0-100)
 * @param {number} props.credibility - Credibility score (0-100)
 * @param {boolean} props.showThresholdLine - Whether to show the 70% threshold line
 * @param {string} props.thresholdLabel - Label for the threshold line
 */
const MetricsDisplay = ({ 
  relevance = 75, 
  accuracy = 70, 
  credibility = 65,
  showThresholdLine = false,
  thresholdLabel = 'Minimum Threshold (70%)'
}) => {
  // Format the scores to ensure they're valid numbers
  const formatScore = (score) => {
    if (typeof score !== 'number' || isNaN(score)) return 70;
    return Math.round(Math.max(0, Math.min(100, score)));
  };

  const relevanceScore = formatScore(relevance);
  const accuracyScore = formatScore(accuracy);
  const credibilityScore = formatScore(credibility);

  // Determine colors based on score
  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#8BC34A'; // Light Green
    if (score >= 50) return '#FFC107'; // Amber
    return '#FF5722'; // Red
  };

  const progressBarStyle = (score) => ({
    height: '4px',
    width: `${score}%`,
    backgroundColor: getScoreColor(score),
    borderRadius: '2px'
  });

  const progressTrackStyle = {
    height: '4px',
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '2px',
    marginBottom: '20px',
    position: 'relative' // Added for threshold line positioning
  };

  // Define threshold line style
  const ThresholdLine = () => {
    const thresholdValue = 70; // 70% is our threshold
    
    return (
      <div style={{
        position: 'absolute',
        left: `${thresholdValue}%`,
        top: '-8px',
        bottom: '-8px',
        width: '2px',
        backgroundColor: '#888',
        zIndex: 2
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '-60px',
          width: '120px',
          textAlign: 'center',
          fontSize: '10px',
          color: '#777',
          whiteSpace: 'nowrap'
        }}>
          {thresholdLabel}
        </div>
      </div>
    );
  };

  return (
    <div className="metrics-display" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '14px', color: '#555' }}>Relevance & Recency</span>
        <span style={{ fontSize: '14px', fontWeight: '500', color: getScoreColor(relevanceScore) }}>
          {relevanceScore}%
        </span>
      </div>
      <div style={progressTrackStyle}>
        <div style={progressBarStyle(relevanceScore)}></div>
        {showThresholdLine && <ThresholdLine />}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '14px', color: '#555' }}>Accuracy</span>
        <span style={{ fontSize: '14px', fontWeight: '500', color: getScoreColor(accuracyScore) }}>
          {accuracyScore}%
        </span>
      </div>
      <div style={progressTrackStyle}>
        <div style={progressBarStyle(accuracyScore)}></div>
        {showThresholdLine && <ThresholdLine />}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '14px', color: '#555' }}>Credibility</span>
        <span style={{ fontSize: '14px', fontWeight: '500', color: getScoreColor(credibilityScore) }}>
          {credibilityScore}%
        </span>
      </div>
      <div style={progressTrackStyle}>
        <div style={progressBarStyle(credibilityScore)}></div>
        {showThresholdLine && <ThresholdLine />}
      </div>
      
      {showThresholdLine && (
        <div style={{
          fontSize: '12px',
          color: '#777',
          fontStyle: 'italic',
          marginTop: '10px'
        }}>
          Note: Metrics above 70% indicate higher quality results
        </div>
      )}
    </div>
  );
};

export default MetricsDisplay;
