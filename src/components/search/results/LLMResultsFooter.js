/**
 * LLMResultsFooter.js
 * 
 * Footer component for displaying source attributions and follow-up options
 */
import React from 'react';
import styles from '../LLMResults.module.css';
import { detectLLMResult } from '../../../utils/resultDetection';

/**
 * Component for displaying LLM result footer with sources and follow-up options
 * @param {Object} props Component props
 * @param {Object} props.data LLM data to display
 * @param {Object} props.options Display options
 * @returns {JSX.Element} Rendered component
 */
const LLMResultsFooter = ({ data, options = {} }) => {
  if (!data) {
    return null;
  }
  
  // Ensure data is in the expected format
  const processedData = detectLLMResult(data) ? data : {};
  
  // Get sources if available
  const sources = processedData.sources || processedData.sourceMap || [];
  const followUpQuestions = processedData.followUpQuestions || [];
  const hasValidSources = Array.isArray(sources) && sources.length > 0;
  const hasValidFollowUps = Array.isArray(followUpQuestions) && followUpQuestions.length > 0;
  
  // Don't render if no source or follow-up data is available
  if (!hasValidSources && !hasValidFollowUps && !options.alwaysShowFooter) {
    return null;
  }
  
  return (
    <div className={styles.footer}>
      {hasValidSources && (
        <div className={styles.sources}>
          <h4 className={styles.sourcesTitle}>Sources</h4>
          <ul className={styles.sourceList}>
            {sources.map((source, index) => (
              <li key={`source-${index}`} className={styles.sourceItem}>
                {source.url ? (
                  <a 
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.sourceLink}
                  >
                    {source.title || source.url}
                  </a>
                ) : (
                  <span>{source.title || source}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {hasValidFollowUps && (
        <div className={styles.followUp}>
          <h4 className={styles.followUpTitle}>Follow-up Questions</h4>
          <ul className={styles.followUpList}>
            {followUpQuestions.map((question, index) => (
              <li key={`followup-${index}`} className={styles.followUpItem}>
                <button className={styles.followUpButton}>
                  {question}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {options.customFooter && (
        <div className={styles.customFooter}>
          {options.customFooter}
        </div>
      )}
    </div>
  );
};

export default LLMResultsFooter;
