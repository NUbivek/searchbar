/**
 * BusinessMetricsDisplay.js
 * Enhanced display component for business metrics that maintains
 * the standard three-score format with business-specific enhancements
 */

import React from 'react';
import { Tooltip } from 'react-tooltip';
import MetricsCalculator from '../../metrics/MetricsCalculator';

/**
 * BusinessMetricsDisplay component
 * Displays the standard three metrics with business-specific enhancements
 * 
 * @param {Object} props - Component props
 * @param {Object} props.metrics - Metrics object containing relevance, accuracy, credibility
 * @returns {JSX.Element} - Rendered component
 */
const BusinessMetricsDisplay = ({ metrics }) => {
  if (!metrics) return null;

  const { relevance = 0, accuracy = 0, credibility = 0, overall = 0 } = metrics;

  // Ensure all metrics are numbers between 0-100
  const safeRelevance = Math.min(100, Math.max(0, parseInt(relevance) || 0));
  const safeAccuracy = Math.min(100, Math.max(0, parseInt(accuracy) || 0));
  const safeCredibility = Math.min(100, Math.max(0, parseInt(credibility) || 0));
  const safeOverall = Math.min(100, Math.max(0, parseInt(overall) || 0));

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-gray-900">Business Search Quality</h4>
        <div className="flex items-center">
          <div className="text-sm text-gray-500 mr-2">Overall Score:</div>
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
               style={{ backgroundColor: MetricsCalculator.getMetricColor(safeOverall) }}>
            {safeOverall}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Business-enhanced Relevance */}
        <div className="metric-item">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">Business Relevance</span>
              <Tooltip id="relevance-tooltip" />
              <span 
                data-tooltip-id="relevance-tooltip" 
                data-tooltip-content="Measures how well the content matches your business query, including business terminology and market relevance."
                className="ml-1 text-gray-400 text-xs cursor-help">ⓘ</span>
            </div>
            <span className="text-sm font-medium" style={{ color: MetricsCalculator.getMetricColor(safeRelevance) }}>
              {MetricsCalculator.getMetricLabel(safeRelevance)}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full" 
              style={{ 
                width: `${safeRelevance}%`, 
                backgroundColor: MetricsCalculator.getMetricColor(safeRelevance) 
              }}
            ></div>
          </div>
        </div>

        {/* Business-enhanced Accuracy */}
        <div className="metric-item">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">Financial Accuracy</span>
              <Tooltip id="accuracy-tooltip" />
              <span 
                data-tooltip-id="accuracy-tooltip" 
                data-tooltip-content="Evaluates the precision of financial data, statistics, and business facts in the content."
                className="ml-1 text-gray-400 text-xs cursor-help">ⓘ</span>
            </div>
            <span className="text-sm font-medium" style={{ color: MetricsCalculator.getMetricColor(safeAccuracy) }}>
              {MetricsCalculator.getMetricLabel(safeAccuracy)}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full" 
              style={{ 
                width: `${safeAccuracy}%`, 
                backgroundColor: MetricsCalculator.getMetricColor(safeAccuracy) 
              }}
            ></div>
          </div>
        </div>

        {/* Business-enhanced Credibility */}
        <div className="metric-item">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">Source Quality</span>
              <Tooltip id="credibility-tooltip" />
              <span 
                data-tooltip-id="credibility-tooltip" 
                data-tooltip-content="Assesses the reliability of business sources based on reputation, authority, and recency."
                className="ml-1 text-gray-400 text-xs cursor-help">ⓘ</span>
            </div>
            <span className="text-sm font-medium" style={{ color: MetricsCalculator.getMetricColor(safeCredibility) }}>
              {MetricsCalculator.getMetricLabel(safeCredibility)}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full" 
              style={{ 
                width: `${safeCredibility}%`, 
                backgroundColor: MetricsCalculator.getMetricColor(safeCredibility) 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessMetricsDisplay;
