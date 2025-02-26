import React from 'react';
import LLMSection from './LLMSection';

/**
 * LLMResults component - Displays LLM-generated search results
 */
const LLMResults = ({ answer, expanded = false, onToggleExpand }) => {
  // Skip rendering if no answer
  if (!answer) {
    console.log("LLMResults: No answer provided");
    return null;
  }

  // Debug log
  console.log("LLMResults received answer:", answer);

  // Extract content from answer
  const { summary, content, sources = [] } = answer;
  
  // Handle different content formats
  let displayContent = '';
  
  if (typeof content === 'string') {
    displayContent = content;
  } else if (Array.isArray(content)) {
    displayContent = content.join('\n\n');
  } else if (content && typeof content === 'object') {
    try {
      displayContent = JSON.stringify(content, null, 2);
    } catch (e) {
      console.error("LLMResults: Error stringifying content", e);
      displayContent = 'Unable to display content';
    }
  }

  // If we have no summary but have displayContent, use that as summary
  const displaySummary = summary || displayContent || '';

  // Debug log
  console.log("LLMResults processed content:", { 
    displaySummary: displaySummary.substring(0, 100) + '...',
    displayContent: displayContent ? (displayContent.substring(0, 100) + '...') : 'none',
    sourcesCount: sources.length
  });

  return (
    <div className="bg-white rounded-lg">
      {/* Summary section */}
      {displaySummary && (
        <div className="mb-4">
          <LLMSection 
            title="Summary" 
            content={displaySummary} 
            sources={sources}
          />
        </div>
      )}
      
      {/* Main content - only show if different from summary */}
      {displayContent && displayContent !== displaySummary && (
        <div className="mb-4">
          <LLMSection 
            content={displayContent} 
            sources={sources}
          />
        </div>
      )}
      
      {/* Expand/collapse button */}
      {onToggleExpand && (
        <div className="flex justify-center mt-2">
          <button 
            onClick={onToggleExpand}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-150"
          >
            {expanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LLMResults;
