import React from 'react';

/**
 * Component for displaying category content
 * @param {Object} props Component props
 * @param {Object} props.category Category object with content
 * @returns {JSX.Element} Category content component
 */
const CategoryContent = ({ category }) => {
  // Debug log
  console.log("CategoryContent rendering with category:", category);
  
  // If no category is provided, show a message
  if (!category) {
    console.log("CategoryContent: No category provided");
    return (
      <div style={styles.noContent}>
        <p>No category selected</p>
      </div>
    );
  }
  
  // Get the content for this category
  const content = category.content || [];
  
  console.log("CategoryContent: Content for category", { 
    categoryName: category.name,
    contentLength: content.length,
    contentSample: content.length > 0 ? 
      JSON.stringify(content[0]).substring(0, 100) + '...' : 'No content'
  });
  
  // If there's no content, show a message
  if (!Array.isArray(content) || content.length === 0) {
    console.log("CategoryContent: No content for category", category.name);
    return (
      <div style={styles.noContent}>
        <p>No content available for {category.name}</p>
      </div>
    );
  }
  
  // Styles for content display
  const styles = {
    container: {
      padding: '8px 0'
    },
    item: {
      padding: '12px',
      marginBottom: '12px',
      borderRadius: '4px',
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb'
    },
    title: {
      fontWeight: '600',
      marginBottom: '8px',
      fontSize: '16px',
      color: '#111827'
    },
    description: {
      color: '#4b5563',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    relevance: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
    relevanceBar: {
      width: '50px',
      height: '4px',
      backgroundColor: '#e5e7eb',
      borderRadius: '2px',
      marginLeft: '6px',
      position: 'relative'
    },
    relevanceFill: (score) => ({
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      width: `${score}%`,
      backgroundColor: getRelevanceColor(score),
      borderRadius: '2px'
    }),
    noContent: {
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '4px',
      color: '#6b7280',
      textAlign: 'center'
    },
    categoryContent: {
      padding: '16px'
    },
    contentItems: {
      padding: '16px'
    },
    link: {
      color: '#1a56db',
      textDecoration: 'none'
    },
    url: {
      fontSize: '12px',
      color: '#4b5563',
      marginBottom: '6px',
      wordBreak: 'break-all'
    },
    relevanceContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
    relevanceText: {
      fontSize: '12px',
      color: '#6b7280',
      marginLeft: '6px'
    },
    text: {
      fontSize: '14px',
      color: '#4b5563',
      lineHeight: '1.5'
    },
    code: {
      fontSize: '14px',
      color: '#4b5563',
      lineHeight: '1.5',
      padding: '8px',
      backgroundColor: '#f9fafb',
      borderRadius: '4px',
      border: '1px solid #e5e7eb'
    },
    codeLanguage: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '6px'
    },
    image: {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: '4px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
    },
    debug: {
      fontSize: '12px',
      color: '#6b7280',
      padding: '8px',
      backgroundColor: '#f9fafb',
      borderRadius: '4px',
      border: '1px solid #e5e7eb'
    }
  };

  // Helper function to render content item based on type
  const renderContentItem = (item, styles) => {
    console.log("Rendering content item:", item);
    
    // Handle web search results
    if (item.url || item.link) {
      return (
        <div className="search-result-item">
          <h3 style={styles.title}>
            <a href={item.url || item.link} target="_blank" rel="noopener noreferrer" style={styles.link}>
              {item.title || 'Untitled'}
            </a>
          </h3>
          <p style={styles.url}>{item.url || item.link}</p>
          <p style={styles.description}>{item.description || item.snippet || item.content || ''}</p>
          {item.relevanceScore && (
            <div style={styles.relevanceContainer}>
              <div style={styles.relevanceBar(item.relevanceScore)}></div>
              <span style={styles.relevanceText}>{item.relevanceScore}% relevant</span>
            </div>
          )}
        </div>
      );
    }
    
    // Handle text content
    if (item.type === 'text' || typeof item.text === 'string') {
      return (
        <div className="text-content-item">
          {item.title && <h3 style={styles.title}>{item.title}</h3>}
          <p style={styles.text}>{item.text || item.content || ''}</p>
        </div>
      );
    }
    
    // Handle code content
    if (item.type === 'code' || item.language || item.code) {
      return (
        <div className="code-content-item">
          {item.title && <h3 style={styles.title}>{item.title}</h3>}
          <pre style={styles.code}>
            <code>{item.code || item.content || ''}</code>
          </pre>
          {item.language && <p style={styles.codeLanguage}>Language: {item.language}</p>}
        </div>
      );
    }
    
    // Handle image content
    if (item.type === 'image' || item.imageUrl || item.image_url || item.img || item.src) {
      const imageUrl = item.imageUrl || item.image_url || item.img || item.src;
      return (
        <div className="image-content-item">
          {item.title && <h3 style={styles.title}>{item.title}</h3>}
          {imageUrl && <img src={imageUrl} alt={item.title || 'Image'} style={styles.image} />}
          {item.description && <p style={styles.description}>{item.description}</p>}
        </div>
      );
    }
    
    // Default rendering for unknown types
    return (
      <div className="unknown-content-item">
        <pre style={styles.debug}>
          {JSON.stringify(item, null, 2)}
        </pre>
      </div>
    );
  };

  // Render the content based on its type
  return (
    <div style={styles.categoryContent}>
      {/* Debug information */}
      <div style={{
        padding: '10px',
        margin: '10px 0',
        backgroundColor: '#e0f2fe',
        border: '1px solid #7dd3fc',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <p>CategoryContent Debug:</p>
        <p>Category: {category.name}</p>
        <p>Content Items: {content.length}</p>
        <p>Content Types: {[...new Set(content.map(item => item.type || 'unknown'))].join(', ')}</p>
      </div>
      
      {/* Render each content item */}
      <div style={styles.contentItems}>
        {content.map((item, index) => (
          <div key={`content-item-${index}`} style={styles.item}>
            {renderContentItem(item, styles)}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Get color based on relevance score
 * @param {number} score Relevance score (0-100)
 * @returns {string} Color code
 */
const getRelevanceColor = (score) => {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#3b82f6'; // blue
  if (score >= 40) return '#f59e0b'; // yellow
  return '#ef4444'; // red
};

export default CategoryContent;