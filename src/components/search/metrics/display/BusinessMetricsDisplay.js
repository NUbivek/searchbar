import React from 'react';
import MetricsProgressBar from './MetricsProgressBar';

/**
 * Component for displaying business-specific metrics with comprehensive visualization
 * Updated to clearly show the 3-scoring system: Relevance+Recency, Credibility, and Accuracy
 * @param {Object} props Component props
 * @param {Object} props.metrics Metrics object with relevance, credibility, accuracy, and overall scores
 * @param {string} props.title Optional title for the metrics display
 * @param {string} props.className Optional CSS class for styling
 * @param {Object} props.style Optional inline styles
 * @returns {JSX.Element} Business metrics display component
 */
const BusinessMetricsDisplay = ({ metrics, title = 'Content Quality Metrics', className = '', style = {} }) => {
  // Normalize metrics to ensure they're all numbers and within 0-100 range
  const normalizedMetrics = {
    relevance: Math.round(typeof metrics?.relevance === 'number' ? Math.max(0, Math.min(100, metrics.relevance)) : 0),
    credibility: Math.round(typeof metrics?.credibility === 'number' ? Math.max(0, Math.min(100, metrics.credibility)) : 0),
    accuracy: Math.round(typeof metrics?.accuracy === 'number' ? Math.max(0, Math.min(100, metrics.accuracy)) : 0),
    overall: typeof metrics?.overall === 'number' ? 
      Math.max(0, Math.min(100, metrics.overall)) : 
      Math.round((
        (typeof metrics?.relevance === 'number' ? Math.max(0, Math.min(100, metrics.relevance)) : 0) + 
        (typeof metrics?.credibility === 'number' ? Math.max(0, Math.min(100, metrics.credibility)) : 0) + 
        (typeof metrics?.accuracy === 'number' ? Math.max(0, Math.min(100, metrics.accuracy)) : 0)
      ) / 3)
  };

  // Calculate quality level based on overall score
  let qualityLevel = 'Low';
  let qualityColor = '#dc3545'; // Red for low quality
  
  if (normalizedMetrics.overall >= 80) {
    qualityLevel = 'Excellent';
    qualityColor = '#28a745'; // Green for high quality
  } else if (normalizedMetrics.overall >= 70) {
    qualityLevel = 'Very Good';
    qualityColor = '#20c997'; // Teal for very good quality
  } else if (normalizedMetrics.overall >= 60) {
    qualityLevel = 'Good';
    qualityColor = '#17a2b8'; // Blue for good quality
  } else if (normalizedMetrics.overall >= 50) {
    qualityLevel = 'Fair';
    qualityColor = '#fd7e14'; // Orange for fair quality
  } else if (normalizedMetrics.overall >= 40) {
    qualityLevel = 'Moderate';
    qualityColor = '#ffc107'; // Yellow for moderate quality
  }

  return (
    <div className={`metrics-display ${className}`} style={{
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      ...style
    }}>
      {/* Title */}
      {title && (
        <h5 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          marginBottom: '12px',
          color: '#343a40'
        }}>
          {title}
        </h5>
      )}
      
      {/* Overall quality indicator */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '16px',
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '6px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          border: `8px solid ${qualityColor}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <span style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: qualityColor
          }}>
            {normalizedMetrics.overall}
          </span>
          <span style={{ 
            fontSize: '12px', 
            color: '#6c757d',
            marginTop: '-4px' 
          }}>
            /100
          </span>
        </div>
        
        <div style={{ marginLeft: '16px', flex: 1 }}>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: qualityColor,
            marginBottom: '4px'
          }}>
            {qualityLevel} Quality
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: '#6c757d',
            marginBottom: '8px' 
          }}>
            Overall Content Score
          </div>
          <MetricsProgressBar 
            percentage={normalizedMetrics.overall} 
            showLabel={false} 
            height={10}
            gradient={[
              { stop: 0, color: '#dc3545' },
              { stop: 40, color: '#ffc107' },
              { stop: 60, color: '#17a2b8' },
              { stop: 80, color: '#28a745' }
            ]}
          />
        </div>
      </div>
      
      {/* Individual metrics */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px' 
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: '#343a40' 
          }}>
            Relevance & Recency
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: normalizedMetrics.relevance >= 60 ? '#28a745' : 
                  normalizedMetrics.relevance >= 40 ? '#ffc107' : '#dc3545'
          }}>
            {normalizedMetrics.relevance}%
          </div>
        </div>
        <MetricsProgressBar 
          percentage={normalizedMetrics.relevance} 
          showLabel={false} 
          height={8}
          gradient={[
            { stop: 0, color: '#dc3545' },
            { stop: 40, color: '#ffc107' },
            { stop: 70, color: '#28a745' }
          ]}
        />
        <div style={{ 
          fontSize: '12px', 
          color: '#6c757d',
          marginTop: '4px',
          marginBottom: '12px' 
        }}>
          Measures how relevant and recent the content is to the query
        </div>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px' 
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: '#343a40' 
          }}>
            Credibility
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: normalizedMetrics.credibility >= 60 ? '#28a745' : 
                  normalizedMetrics.credibility >= 40 ? '#ffc107' : '#dc3545'
          }}>
            {normalizedMetrics.credibility}%
          </div>
        </div>
        <MetricsProgressBar 
          percentage={normalizedMetrics.credibility} 
          showLabel={false} 
          height={8}
          gradient={[
            { stop: 0, color: '#dc3545' },
            { stop: 40, color: '#ffc107' },
            { stop: 70, color: '#28a745' }
          ]}
        />
        <div style={{ 
          fontSize: '12px', 
          color: '#6c757d',
          marginTop: '4px',
          marginBottom: '12px' 
        }}>
          Assesses the reliability and trustworthiness of the source
        </div>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px' 
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: '#343a40' 
          }}>
            Accuracy
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: normalizedMetrics.accuracy >= 60 ? '#28a745' : 
                  normalizedMetrics.accuracy >= 40 ? '#ffc107' : '#dc3545'
          }}>
            {normalizedMetrics.accuracy}%
          </div>
        </div>
        <MetricsProgressBar 
          percentage={normalizedMetrics.accuracy} 
          showLabel={false} 
          height={8}
          gradient={[
            { stop: 0, color: '#dc3545' },
            { stop: 40, color: '#ffc107' },
            { stop: 70, color: '#28a745' }
          ]}
        />
        <div style={{ 
          fontSize: '12px', 
          color: '#6c757d',
          marginTop: '4px' 
        }}>
          Evaluates the factual correctness of the content
        </div>
      </div>
      
      {/* Metrics legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '16px',
        padding: '8px',
        backgroundColor: 'white',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#6c757d'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            backgroundColor: '#dc3545', 
            borderRadius: '50%',
            marginRight: '4px' 
          }}></div>
          0-40% Low
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            backgroundColor: '#ffc107', 
            borderRadius: '50%',
            marginRight: '4px' 
          }}></div>
          41-60% Med
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '10px', 
            height: '10px', 
            backgroundColor: '#28a745', 
            borderRadius: '50%',
            marginRight: '4px' 
          }}></div>
          61-100% High
        </div>
      </div>
    </div>
  );
};

export default BusinessMetricsDisplay;
