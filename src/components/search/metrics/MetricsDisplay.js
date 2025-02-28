/**
 * MetricsDisplay.js
 * Component for displaying metrics with progress bars and labels
 */

import React from 'react';
import styles from './Metrics.module.css';
import MetricsCalculator from './MetricsCalculator';

/**
 * MetricsDisplay component
 * Displays metrics with progress bars and labels
 * 
 * @param {Object} props - Component props
 * @param {Object} props.metrics - Metrics object with relevance, accuracy, credibility, overall
 * @param {boolean} props.showLabels - Whether to show text labels
 * @param {boolean} props.showOverall - Whether to show overall score
 * @param {boolean} props.compact - Whether to use compact display mode
 * @param {string} props.className - Additional CSS class
 */
const MetricsDisplay = ({ 
  metrics, 
  showLabels = true, 
  showOverall = true, 
  compact = false,
  className = ''
}) => {
  if (!metrics) return null;
  
  const { relevance, accuracy, credibility, overall } = metrics;
  
  return (
    <div className={`${styles.metricsContainer} ${compact ? styles.compact : ''} ${className}`}>
      {showOverall && (
        <div className={styles.overallMetric}>
          <div className={styles.metricLabel}>Overall Score</div>
          <div className={`${styles.metricValue} ${styles[MetricsCalculator.getMetricColor(overall)]}`}>
            {overall}%
          </div>
          {showLabels && (
            <div className={styles.metricQuality}>{MetricsCalculator.getMetricLabel(overall)}</div>
          )}
        </div>
      )}
      
      <div className={styles.metricGroup}>
        <MetricBar 
          label="Relevance & Recency" 
          value={relevance} 
          showLabel={showLabels} 
          compact={compact}
        />
        
        <MetricBar 
          label="Accuracy" 
          value={accuracy} 
          showLabel={showLabels} 
          compact={compact}
        />
        
        <MetricBar 
          label="Credibility" 
          value={credibility} 
          showLabel={showLabels} 
          compact={compact}
        />
      </div>
    </div>
  );
};

/**
 * MetricBar component
 * Displays a single metric with progress bar
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Metric label
 * @param {number} props.value - Metric value (0-100)
 * @param {boolean} props.showLabel - Whether to show text label
 * @param {boolean} props.compact - Whether to use compact display mode
 */
const MetricBar = ({ label, value, showLabel = true, compact = false }) => {
  const colorClass = MetricsCalculator.getMetricColor(value);
  const qualityLabel = MetricsCalculator.getMetricLabel(value);
  
  return (
    <div className={`${styles.metricItem} ${compact ? styles.compact : ''}`}>
      <div className={styles.metricHeader}>
        <div className={styles.metricName}>{label}</div>
        <div className={`${styles.metricValue} ${styles[colorClass]}`}>{value}%</div>
      </div>
      
      <div className={styles.progressBarContainer}>
        <div 
          className={`${styles.progressBar} ${styles[colorClass]}`} 
          style={{ width: `${value}%` }}
        />
      </div>
      
      {showLabel && (
        <div className={`${styles.metricQuality} ${styles[colorClass]}`}>
          {qualityLabel}
        </div>
      )}
    </div>
  );
};

export default MetricsDisplay;