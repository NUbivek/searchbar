import React, { useState, useEffect } from 'react';
import { generateInlineLinks } from './LinkGenerator';
// import { MetricsProgressBar } from '../metrics/display';

/**
 * SearchResultItem component to display a search result with metrics
 * @param {Object} props Component props
 * @param {Object} props.result Result object to display
 * @param {Array} props.sources Source objects 
 * @param {boolean} props.showMetrics Whether to show metrics
 * @param {Object} props.options Additional display options
 * @returns {JSX.Element} Search result item
 */
const SearchResultItem = ({ 
  result, 
  sources = [],
  showMetrics = true,
  options = {} 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [processedContent, setProcessedContent] = useState('');
  
  useEffect(() => {
    // Process content to add hyperlinks if sources are available
    if (result && result.content && sources && sources.length > 0) {
      const processedText = generateInlineLinks(result.content, sources, {
        maxLinks: 5,
        preferBusinessLinks: options.businessContext || false
      });
      
      setProcessedContent(processedText);
    } else {
      setProcessedContent(result?.content || '');
    }
  }, [result, sources, options.businessContext]);
  
  // Handle undefined or invalid result
  if (!result) {
    return null;
  }

  // Extract metrics from result
  const metrics = result._metrics || {};
  const relevance = metrics.relevance || result._relevanceScore || 0;
  const accuracy = metrics.accuracy || result._accuracyScore || 0;
  const credibility = metrics.credibility || result._credibilityScore || 0;
  const overall = metrics.overall || Math.round((relevance + accuracy + credibility) / 3);
  
  // Render a URL if it exists
  const renderUrl = (url) => {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      const displayUrl = `${urlObj.hostname}${urlObj.pathname.substring(0, 15)}${urlObj.pathname.length > 15 ? '...' : ''}`;
      
      return (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="result-url"
        >
          {displayUrl}
        </a>
      );
    } catch (e) {
      return url;
    }
  };
  
  // Handle toggle of expanded state
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Determine if this is a high-quality result (all metrics >= 70)
  const isHighQuality = relevance >= 70 && accuracy >= 70 && credibility >= 70;
  
  // Truncate text for display
  const truncateText = (text, maxLength = 200) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <div className={`search-result-item ${isHighQuality ? 'high-quality' : ''}`}>
      <div className="result-header">
        <h3 className="result-title">
          {result.title}
          {isHighQuality && <span className="quality-indicator">★</span>}
        </h3>
        {result.url && renderUrl(result.url)}
      </div>
      
      <div className="result-content">
        {expanded ? (
          <div 
            className="full-content" 
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        ) : (
          <div className="truncated-content">
            {truncateText(result.content)}
          </div>
        )}
        
        {result.content && result.content.length > 200 && (
          <button 
            className="expand-button" 
            onClick={toggleExpanded}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
      
      {showMetrics && (
        <div className="result-metrics">
          <div className="metrics-container">
            <div className="metric">
              <span className="metric-name">Relevance</span>
              <MetricsProgressBar percentage={relevance} showLabel={true} />
            </div>
            <div className="metric">
              <span className="metric-name">Accuracy</span>
              <MetricsProgressBar percentage={accuracy} showLabel={true} />
            </div>
            <div className="metric">
              <span className="metric-name">Credibility</span>
              <MetricsProgressBar percentage={credibility} showLabel={true} />
            </div>
          </div>
          
          <div className="overall-score" title="Overall Score">
            {overall}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .search-result-item {
          background-color: white;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        
        .high-quality {
          border-left: 3px solid #4caf50;
        }
        
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        
        .result-title {
          margin: 0;
          font-size: 18px;
          color: #1a73e8;
          position: relative;
        }
        
        .quality-indicator {
          color: gold;
          margin-left: 5px;
          text-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
        }
        
        .result-url {
          font-size: 12px;
          color: #5f6368;
          text-decoration: none;
        }
        
        .result-url:hover {
          text-decoration: underline;
        }
        
        .result-content {
          margin-bottom: 12px;
        }
        
        .truncated-content, .full-content {
          line-height: 1.5;
          color: #202124;
        }
        
        .expand-button {
          background: none;
          border: none;
          color: #1a73e8;
          padding: 0;
          cursor: pointer;
          font-size: 14px;
          margin-top: 8px;
        }
        
        .expand-button:hover {
          text-decoration: underline;
        }
        
        .result-metrics {
          margin-top: 12px;
          position: relative;
        }
        
        .metrics-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .metric {
          width: calc(33% - 10px);
        }
        
        .metric-name {
          font-size: 12px;
          color: #5f6368;
          margin-bottom: 4px;
          display: block;
        }
        
        .overall-score {
          position: absolute;
          top: -40px;
          right: 0;
          background-color: #1a73e8;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        
        .inline-source-link {
          color: #1a73e8;
          text-decoration: none;
          border-bottom: 1px dashed #1a73e8;
        }
        
        .inline-source-link:hover {
          text-decoration: none;
          background-color: #f0f7ff;
        }
      `}</style>
    </div>
  );
};

export default SearchResultItem;
