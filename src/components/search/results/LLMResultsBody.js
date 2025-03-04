/**
 * LLMResultsBody.js
 * 
 * Body component for displaying the main content of LLM results
 */
import React from 'react';
import styles from '../LLMResults.module.css';
import { detectLLMResult } from '../../../utils/resultDetection';

/**
 * Component for displaying LLM result content
 * @param {Object} props Component props
 * @param {Object} props.data LLM data to display
 * @param {Object} props.options Display options
 * @returns {JSX.Element} Rendered component
 */
const LLMResultsBody = ({ data, options = {} }) => {
  if (!data) {
    return null;
  }
  
  // Ensure data is in the expected format
  const processedData = detectLLMResult(data) ? data : { content: String(data) };
  const content = processedData.content || processedData.text || JSON.stringify(processedData);
  
  // Handle array content by concatenating
  const displayContent = Array.isArray(content)
    ? content.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('\\n\\n')
    : content;
  
  return (
    <div className={styles.content}>
      <div 
        className={styles.textContent}
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
    </div>
  );
};

export default LLMResultsBody;
