import React from 'react';

/**
 * ScoreVisualizer component
 * Renders a visual representation of search result scoring metrics
 * 
 * @param {Object} props Component props
 * @param {Object} props.metrics The metrics to visualize
 * @param {Object} props.options Additional display options
 * @returns {JSX.Element} Rendered score visualizer
 */
const ScoreVisualizer = ({ metrics = {}, options = {} }) => {
  // Format score for display (ensures percentage format)
  const formatScore = (score) => {
    if (score === undefined || score === null) return 'N/A';
    // If score is already in percentage format (0-100)
    if (score > 1) return Math.round(score);
    // If score is in decimal format (0-1)
    return Math.round(score * 100);
  };
  
  // Determine color based on score value
  const getScoreColor = (score) => {
    if (score === undefined || score === null) return '#9CA3AF'; // Gray for N/A
    
    // Normalize score to 0-100 range
    const normalizedScore = score > 1 ? score : score * 100;
    
    if (normalizedScore >= 80) return '#10B981'; // Green for high
    if (normalizedScore >= 60) return '#3B82F6'; // Blue for good
    if (normalizedScore >= 40) return '#F59E0B'; // Amber for medium
    return '#EF4444'; // Red for low
  };
  
  // Get score label based on value
  const getScoreLabel = (score) => {
    if (score === undefined || score === null) return 'N/A';
    
    // Normalize score to 0-100 range
    const normalizedScore = score > 1 ? score : score * 100;
    
    if (normalizedScore >= 80) return 'High';
    if (normalizedScore >= 60) return 'Good';
    if (normalizedScore >= 40) return 'Fair';
    return 'Low';
  };
  
  // Extract metrics or use defaults
  const {
    relevance = null,
    accuracy = null, 
    credibility = null,
    overall = null
  } = metrics;
  
  // Determine if compact display is needed
  const compact = options.compact || false;
  
  // For compact display
  if (compact) {
    return (
      <div className="score-visualizer-compact" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: getScoreColor(overall),
        color: '#FFFFFF',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
      }}>
        <span>{formatScore(overall)}%</span>
        {options.showLabel && <span>{getScoreLabel(overall)}</span>}
      </div>
    );
  }
  
  // For full display
  return (
    <div className="score-visualizer" style={{
      backgroundColor: '#F9FAFB',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      padding: '12px',
      width: '100%'
    }}>
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Search Relevance Score</h4>
        <div style={{
          backgroundColor: getScoreColor(overall),
          color: '#FFFFFF',
          padding: '3px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
        }}>
          {formatScore(overall)}%
        </div>
      </div>
      
      {/* Progress bars for individual metrics */}
      <div style={{ marginTop: '12px' }}>
        {/* Relevance */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span>Relevance</span>
            <span>{formatScore(relevance)}%</span>
          </div>
          <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${formatScore(relevance)}%`, 
                backgroundColor: getScoreColor(relevance),
                borderRadius: '3px'
              }} 
            />
          </div>
        </div>
        
        {/* Credibility */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span>Credibility</span>
            <span>{formatScore(credibility)}%</span>
          </div>
          <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${formatScore(credibility)}%`, 
                backgroundColor: getScoreColor(credibility),
                borderRadius: '3px'
              }} 
            />
          </div>
        </div>
        
        {/* Accuracy */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span>Accuracy</span>
            <span>{formatScore(accuracy)}%</span>
          </div>
          <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${formatScore(accuracy)}%`, 
                backgroundColor: getScoreColor(accuracy),
                borderRadius: '3px'
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreVisualizer;
