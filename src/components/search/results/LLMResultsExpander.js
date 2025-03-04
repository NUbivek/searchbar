/**
 * LLMResultsExpander.js
 * 
 * Component for expanding and collapsing LLM result sections
 */
import React, { useState, useEffect } from 'react';
import styles from '../LLMResults.module.css';

/**
 * Component for expanding and collapsing LLM result sections
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Content to expand/collapse
 * @param {boolean} props.initialExpanded Whether the section is initially expanded
 * @param {number} props.maxCollapsedHeight Maximum height when collapsed
 * @param {function} props.onToggle Callback when expanded state changes
 * @returns {JSX.Element} Rendered component
 */
const LLMResultsExpander = ({ 
  children, 
  initialExpanded = false,
  maxCollapsedHeight = 300,
  onToggle = () => {}
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [contentHeight, setContentHeight] = useState(0);
  const [contentRef, setContentRef] = useState(null);
  
  // Measure content height for deciding whether to show expander
  useEffect(() => {
    if (contentRef) {
      setContentHeight(contentRef.scrollHeight);
    }
  }, [contentRef, children]);
  
  // Toggle expanded state
  const toggleExpand = () => {
    const newState = !expanded;
    setExpanded(newState);
    onToggle(newState);
  };
  
  // Don't show expander if content is shorter than maxCollapsedHeight
  const showExpander = contentHeight > maxCollapsedHeight;
  
  return (
    <div className={styles.expander}>
      <div 
        className={`${styles.expanderContent} ${expanded ? styles.expanded : ''}`}
        style={{ maxHeight: expanded ? '100%' : `${maxCollapsedHeight}px` }}
        ref={setContentRef}
      >
        {children}
      </div>
      
      {showExpander && (
        <button 
          className={styles.expandButton}
          onClick={toggleExpand}
        >
          {expanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

export default LLMResultsExpander;
