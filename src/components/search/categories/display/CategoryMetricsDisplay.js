import React from 'react';
import MetricsProgressBar from '../../metrics/display/MetricsProgressBar';

/**
 * Component for displaying category metrics with enhanced visualization
 * @param {Object} props Component props
 * @param {Object} props.metrics The metrics to display
 * @param {boolean} props.compact Whether to display in compact mode
 * @param {boolean} props.showLabels Whether to show labels
 * @param {string} props.categoryType The type of category (business, technical, etc.)
 * @returns {JSX.Element} Rendered metrics display
 */
const CategoryMetricsDisplay = ({ metrics, compact = false, showLabels = true, categoryType = 'default' }) => {
  if (!metrics) return null;

  // Extract metrics with fallbacks
  const relevance = typeof metrics.relevance === 'number' ? metrics.relevance : 0;
  const accuracy = typeof metrics.accuracy === 'number' ? metrics.accuracy : 0;
  const credibility = typeof metrics.credibility === 'number' ? metrics.credibility : 0;
  
  // Calculate overall score
  const overall = Math.round((relevance + accuracy + credibility) / 3);
  
  // Only show if at least one metric is above 60
  if (relevance < 60 && accuracy < 60 && credibility < 60) {
    return null;
  }
  
  // Helper function to get color based on score
  const getColorForScore = (score) => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 75) return '#8BC34A'; // Light Green
    if (score >= 60) return '#CDDC39'; // Lime
    if (score >= 40) return '#FFC107'; // Amber
    return '#F44336'; // Red
  };
  
  // Get label text based on category type
  const getMetricLabels = () => {
    switch (categoryType.toLowerCase()) {
      case 'business':
      case 'financial':
      case 'market':
      case 'economic':
        return {
          relevance: 'Business Relevance',
          accuracy: 'Financial Accuracy',
          credibility: 'Source Quality'
        };
      case 'technical':
        return {
          relevance: 'Technical Relevance',
          accuracy: 'Technical Accuracy',
          credibility: 'Source Quality'
        };
      case 'academic':
        return {
          relevance: 'Research Relevance',
          accuracy: 'Scientific Accuracy',
          credibility: 'Academic Authority'
        };
      case 'news':
        return {
          relevance: 'News Relevance',
          accuracy: 'Factual Accuracy',
          credibility: 'Source Reliability'
        };
      default:
        return {
          relevance: 'Relevance & Recency',
          accuracy: 'Accuracy',
          credibility: 'Credibility'
        };
    }
  };
  
  const metricLabels = getMetricLabels();
  
  return (
    <div className="category-metrics-display" style={{
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      padding: compact ? '8px 12px' : '12px 16px',
      marginBottom: '16px',
      border: '1px solid #e9ecef'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <h4 style={{
          margin: 0,
          fontSize: compact ? '14px' : '16px',
          color: '#495057'
        }}>
          Quality Metrics
        </h4>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '13px', color: '#6c757d' }}>Overall:</span>
          <div style={{
            backgroundColor: getColorForScore(overall),
            color: '#fff',
            borderRadius: '50%',
            width: compact ? '24px' : '32px',
            height: compact ? '24px' : '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: compact ? '11px' : '13px'
          }}>
            {overall}%
          </div>
        </div>
      </div>
      
      {/* Metrics progress bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Relevance */}
        {relevance >= 60 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showLabels && (
              <div style={{ 
                width: '130px', 
                fontSize: '13px', 
                color: '#495057',
                whiteSpace: 'nowrap'
              }}>
                {metricLabels.relevance}:
              </div>
            )}
            <div style={{ 
              flex: 1, 
              height: compact ? '6px' : '8px', 
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${relevance}%`,
                height: '100%',
                backgroundColor: getColorForScore(relevance),
                borderRadius: '4px'
              }}></div>
            </div>
            <div style={{ 
              width: '36px', 
              textAlign: 'right', 
              fontSize: '13px', 
              fontWeight: '500',
              color: getColorForScore(relevance)
            }}>
              {relevance}%
            </div>
          </div>
        )}
        
        {/* Accuracy */}
        {accuracy >= 60 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showLabels && (
              <div style={{ 
                width: '130px', 
                fontSize: '13px', 
                color: '#495057',
                whiteSpace: 'nowrap'
              }}>
                {metricLabels.accuracy}:
              </div>
            )}
            <div style={{ 
              flex: 1, 
              height: compact ? '6px' : '8px', 
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${accuracy}%`,
                height: '100%',
                backgroundColor: getColorForScore(accuracy),
                borderRadius: '4px'
              }}></div>
            </div>
            <div style={{ 
              width: '36px', 
              textAlign: 'right', 
              fontSize: '13px', 
              fontWeight: '500',
              color: getColorForScore(accuracy)
            }}>
              {accuracy}%
            </div>
          </div>
        )}
        
        {/* Credibility */}
        {credibility >= 60 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showLabels && (
              <div style={{ 
                width: '130px', 
                fontSize: '13px', 
                color: '#495057',
                whiteSpace: 'nowrap'
              }}>
                {metricLabels.credibility}:
              </div>
            )}
            <div style={{ 
              flex: 1, 
              height: compact ? '6px' : '8px', 
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${credibility}%`,
                height: '100%',
                backgroundColor: getColorForScore(credibility),
                borderRadius: '4px'
              }}></div>
            </div>
            <div style={{ 
              width: '36px', 
              textAlign: 'right', 
              fontSize: '13px', 
              fontWeight: '500',
              color: getColorForScore(credibility)
            }}>
              {credibility}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryMetricsDisplay;
