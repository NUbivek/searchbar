import React, { useState, useEffect } from 'react';
import { extractKeyNumbers, extractKeyPoints } from '../../utils/contentExtractor';

/**
 * ExpandedCategoryContent component
 * Displays the expanded content for a category with structured information,
 * including key data points, bullets, and sources
 * 
 * @param {Object} props Component props
 * @param {Object} props.category The category whose content to display
 * @param {Array} props.content The content items to display
 * @param {Function} props.onClose Callback when the expanded view is closed
 * @returns {JSX.Element} Rendered expanded content
 */
const ExpandedCategoryContent = ({ category, content = [], onClose }) => {
  const [keyPoints, setKeyPoints] = useState([]);
  const [keyNumbers, setKeyNumbers] = useState([]);
  const [sources, setSources] = useState([]);

  useEffect(() => {
    if (!content || !Array.isArray(content) || content.length === 0) return;

    try {
      // Extract key points from content
      const extractedPoints = content.flatMap(item => {
        const itemContent = typeof item.content === 'string' ? item.content : '';
        return extractKeyPoints(itemContent, '', { maxPoints: 8, minLength: 20 });
      }).filter(Boolean).slice(0, 8);

      // Extract key numbers and metrics from content
      const extractedNumbers = content.flatMap(item => {
        const itemContent = typeof item.content === 'string' ? item.content : '';
        return extractKeyNumbers(itemContent, { maxNumbers: 6 });
      }).filter(Boolean).slice(0, 6);

      // Collect unique sources with error handling
      const extractedSources = content
        .filter(item => item.source)
        .map(item => {
          // Handle different source formats
          if (typeof item.source === 'string') {
            return {
              name: item.source,
              url: '',
              type: 'website'
            };
          } else if (typeof item.source === 'object') {
            return {
              name: item.source.name || item.source.title || 'Unknown Source',
              url: item.source.url || item.source.link || '',
              type: item.source.type || 'website'
            };
          }
          return null;
        })
        .filter(Boolean)
        .filter((source, index, self) => 
          index === self.findIndex(s => s.name === source.name)
        )
        .slice(0, 5);

      setKeyPoints(extractedPoints);
      setKeyNumbers(extractedNumbers);
      setSources(extractedSources);
    } catch (err) {
      console.error('Error processing category content:', err);
      // Set fallback data if extraction fails
      setKeyPoints([]);
      setKeyNumbers([]);
      setSources([]);
    }
  }, [content]);

  // Define the content display styles
  const styles = {
    container: {
      backgroundColor: '#ffffff',
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      margin: '1rem 0',
      border: '1px solid #e0e0e0',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
      paddingBottom: '0.75rem',
      borderBottom: '1px solid #f0f0f0',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#333333',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.5rem',
      color: '#666666',
    },
    section: {
      marginBottom: '1.25rem',
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#333333',
      marginBottom: '0.75rem',
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1rem',
    },
    keyPointsList: {
      listStyleType: 'none',
      padding: 0,
      margin: 0,
    },
    keyPoint: {
      padding: '0.5rem 0',
      display: 'flex',
      alignItems: 'flex-start',
    },
    bulletPoint: {
      color: '#4CAF50',
      marginRight: '0.5rem',
      fontSize: '1.25rem',
      lineHeight: '1.25rem',
    },
    keyNumbers: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
    },
    numberCard: {
      backgroundColor: '#f9f9f9',
      borderRadius: '4px',
      padding: '0.75rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    number: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#4CAF50',
      marginBottom: '0.25rem',
    },
    numberLabel: {
      fontSize: '0.875rem',
      color: '#666666',
    },
    sourcesList: {
      listStyleType: 'none',
      padding: 0,
      margin: '0.5rem 0 0 0',
    },
    sourceItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.25rem 0',
    },
    sourceIcon: {
      marginRight: '0.5rem',
      color: '#666666',
    },
    sourceLink: {
      color: '#1976D2',
      textDecoration: 'none',
      fontSize: '0.875rem',
    },
  };

  if (!category) return null;

  const { title } = category;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        <button style={styles.closeButton} onClick={onClose}>×</button>
      </div>
      
      <div style={styles.contentGrid}>
        {/* Key Points Section */}
        {keyPoints.length > 0 && (
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Key Insights</h4>
            <ul style={styles.keyPointsList}>
              {keyPoints.map((point, index) => (
                <li key={index} style={styles.keyPoint}>
                  <span style={styles.bulletPoint}>•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Key Numbers Section */}
        {keyNumbers.length > 0 && (
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Key Data Points</h4>
            <div style={styles.keyNumbers}>
              {keyNumbers.map((item, index) => (
                <div key={index} style={styles.numberCard}>
                  <div style={styles.number}>{item.value}</div>
                  <div style={styles.numberLabel}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Sources Section */}
      {sources.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Sources</h4>
          <ul style={styles.sourcesList}>
            {sources.map((source, index) => (
              <li key={index} style={styles.sourceItem}>
                <span style={styles.sourceIcon}>📄</span>
                {source.url ? (
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.sourceLink}
                  >
                    {source.name}
                  </a>
                ) : (
                  <span>{source.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Main Content Section */}
      {content.length > 0 && (
        <div style={styles.section}>
          <div dangerouslySetInnerHTML={{ 
            __html: content[0]?.content || '' 
          }} />
        </div>
      )}
    </div>
  );
};

export default ExpandedCategoryContent;
