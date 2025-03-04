/**
 * LLMResultsHeader.js
 * 
 * Header component for displaying metadata and controls for LLM results
 */
import React from 'react';
import styles from '../LLMResults.module.css';
import { detectLLMResult } from '../../../utils/resultDetection';

/**
 * Component for displaying LLM result header with metadata
 * @param {Object} props Component props
 * @param {Object} props.data LLM data to display
 * @param {Object} props.options Display options
 * @param {string} props.options.model Model name to display
 * @param {string} props.options.title Custom title to display
 * @returns {JSX.Element} Rendered component
 */
const LLMResultsHeader = ({ data, options = {} }) => {
  if (!data) {
    return null;
  }
  
  // Ensure data is in the expected format
  const processedData = detectLLMResult(data) ? data : {};
  
  // Get model info if available
  const modelInfo = options.model || processedData.model || 'AI Assistant';
  
  // Get title if available
  const title = options.title || processedData.title || 'AI Generated Response';
  
  return (
    <div className={styles.header}>
      <div className={styles.titleContainer}>
        <h3 className={styles.title}>{title}</h3>
        {modelInfo && (
          <div className={styles.modelInfo}>
            <span className={styles.modelLabel}>Model:</span>
            <span className={styles.modelName}>{modelInfo}</span>
          </div>
        )}
      </div>
      
      {options.timestamp && (
        <div className={styles.timestamp}>
          {new Date(options.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default LLMResultsHeader;
