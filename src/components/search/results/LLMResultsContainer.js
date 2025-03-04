/**
 * LLMResultsContainer.js
 * 
 * Container component for displaying LLM results with a header, body, footer, and expandable sections
 */
import React, { useState } from 'react';
import styles from '../LLMResults.module.css';
import { detectLLMResult } from '../../../utils/resultDetection';

/**
 * Container for LLM results with header, body, and footer
 * @param {Object} props Component props
 * @param {Object} props.data LLM data to display
 * @param {Object} props.options Display options
 * @param {React.ReactNode} props.header Optional custom header component
 * @param {React.ReactNode} props.body Optional custom body component
 * @param {React.ReactNode} props.footer Optional custom footer component
 * @returns {JSX.Element} Rendered component
 */
const LLMResultsContainer = ({ 
  data, 
  options = {}, 
  header = null, 
  body = null, 
  footer = null,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Don't render if no valid data is provided
  if (!data || (typeof data !== 'object' && typeof data !== 'string')) {
    return null;
  }
  
  // Ensure data is in the expected format
  const processedData = detectLLMResult(data) ? data : { content: String(data) };
  
  // Toggle expanded state
  const toggleExpand = () => {
    setExpanded(prev => !prev);
  };
  
  return (
    <div className={`${styles.container} ${className} ${expanded ? styles.expanded : ''}`}>
      {header}
      
      <div className={styles.body}>
        {body}
      </div>
      
      {footer}
      
      {options.expandable && (
        <button 
          onClick={toggleExpand} 
          className={styles.expandButton}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

export default LLMResultsContainer;
